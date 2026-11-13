import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());

const BASE = 'https://gateway.apilib.prefeitura.sp.gov.br/sptrans/olhovivo/v2.1';
const TOKEN = process.env.APILIB_TOKEN?.trim();
const PORT = Number(process.env.PORT || 3333);

if (!TOKEN || TOKEN === 'COLE_SEU_BEARER_TOKEN_AQUI') {
  console.error('Configure APILIB_TOKEN no arquivo server/.env');
  process.exit(1);
}

async function consultar(endpoint, parametros = {}) {
  const url = new URL(`${BASE}${endpoint}`);
  for (const [chave, valor] of Object.entries(parametros)) {
    url.searchParams.set(chave, String(valor));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const resposta = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
      signal: controller.signal,
    });

    if (resposta.status === 401 || resposta.status === 403) {
      throw new Error('Acesso negado pela APILIB. Verifique o token e a assinatura da API.');
    }
    if (!resposta.ok) {
      throw new Error(`Tente novamente`);
    }

    const conteudo = await resposta.text();
    try {
      return JSON.parse(conteudo);
    } catch {
      throw new Error(`Tente novamente`);
    }
  } catch (erro) {
    if (controller.signal.aborted) {
      throw new Error(`Tente novamente`);
    }
    throw erro;
  } finally {
    clearTimeout(timeout);
  }
}


function normalizarParada(item) {
  if (!item || typeof item !== 'object') return null;
  const cp = Number(item.cp ?? item.CodigoParada);
  const np = item.np ?? item.Nome;
  if (!Number.isSafeInteger(cp) || cp <= 0 || typeof np !== 'string' || !np.trim()) {
    return null;
  }
  const py = Number(item.py ?? item.Latitude);
  const px = Number(item.px ?? item.Longitude);
  return {
    cp,
    np: np.trim(),
    ed: String(item.ed ?? item.Endereco ?? ''),
    ...(Number.isFinite(py) && py !== 0 ? { py } : {}),
    ...(Number.isFinite(px) && px !== 0 ? { px } : {}),
  };
}

function listaParadas(dados) {

  const itens = Array.isArray(dados) ? dados :
    Array.isArray(dados?.data) ? dados.data :
    Array.isArray(dados?.content) ? dados.content : null;
  if (!itens) {
    throw new Error('Formato inesperado no retorno de paradas da APILIB.');
  }
  const unicas = new Map();
  for (const item of itens) {
    const parada = normalizarParada(item);
    if (parada) unicas.set(parada.cp, parada);
  }
  return [...unicas.values()];
}

function codigo(val) {
  return typeof val === 'string' && /^\d+$/.test(val) && Number.isSafeInteger(Number(val)) && Number(val) > 0;
}
function erroResposta(res, erro) {
  console.error('[SPBus]', erro);
  return res.status(502).json({ erro: erro instanceof Error ? erro.message : 'Falha ao consultar a APILIB.' });
}

app.get('/saude', (_, res) => res.json({ ok: true }));

app.get('/linhas', async (req, res) => {
  const busca = req.query.busca;
  if (typeof busca !== 'string' || !busca.trim() || busca.length > 120) {
    return res.status(400).json({ erro: 'Informe uma linha ou destino válido.' });
  }
  try {
    return res.json(await consultar('/Linha/Buscar', { termosBusca: busca.trim() }));
  } catch (erro) { return erroResposta(res, erro); }
});

app.get('/paradas', async (req, res) => {
  const linha = req.query.linha;
  if (!codigo(linha)) return res.status(400).json({ erro: 'Código da linha inválido.' });
  try {
    const paradas = listaParadas(await consultar('/Parada/BuscarParadasPorLinha', { codigoLinha: linha }));
    if (paradas.length > 0) return res.json({ paradas, origem: 'cadastro' });

    // Fallback: a API de paradas cobre principalmente corredores.
    // Previsao/Linha pode fornecer os pontos com previsão para a linha,
    // mas NÃO é a lista completa e pode vir vazia fora do horário de operação.
    try {
      const previsao = await consultar('/Previsao/Linha', { codigoLinha: linha });
      const pontos = Array.isArray(previsao?.ps) ? previsao.ps : [];
      return res.json({ paradas: listaParadas(pontos), origem: 'previsao' });
    } catch (erroPrevisao) {
      console.warn('Consulta alternativa de paradas indisponível:', erroPrevisao);
      return res.json({ paradas: [], origem: 'previsao' });
    }
  } catch (erro) { return erroResposta(res, erro); }
});

app.get('/paradas/buscar', async (req, res) => {
  const busca = req.query.busca;
  if (typeof busca !== 'string' || busca.trim().length < 2 || busca.length > 120) {
    return res.status(400).json({ erro: 'Digite pelo menos 2 caracteres do nome ou endereço da parada.' });
  }
  try {
    const dados = await consultar('/Parada/Buscar', { termosBusca: busca.trim() });
    return res.json({ paradas: listaParadas(dados), origem: 'pesquisa' });
  } catch (erro) { return erroResposta(res, erro); }
});

app.get('/previsao', async (req, res) => {
  const { linha, parada } = req.query;
  if (!codigo(linha) || !codigo(parada)) {
    return res.status(400).json({ erro: 'Códigos de linha e parada inválidos.' });
  }
  try {
    return res.json(await consultar('/Previsao', { codigoLinha: linha, codigoParada: parada }));
  } catch (erro) { return erroResposta(res, erro); }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Servidor SPBus iniciado na porta ${PORT}`));
