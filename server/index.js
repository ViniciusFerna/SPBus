import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors()); // Apenas para desenvolvimento local.

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
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const resposta = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (resposta.status === 401 || resposta.status === 403) {
      throw new Error('Acesso negado pela APILIB. Confira o Bearer Token e a assinatura da API.');
    }
    if (!resposta.ok) {
      throw new Error(`APILIB respondeu HTTP ${resposta.status}.`);
    }

    const tipo = resposta.headers.get('content-type') || '';
    if (!tipo.includes('json')) {
      throw new Error('A APILIB retornou uma resposta que não é JSON.');
    }
    return await resposta.json();
  } catch (erro) {
    if (erro instanceof Error && erro.name === 'AbortError') {
      throw new Error('Tempo de resposta da APILIB esgotado.');
    }
    throw erro;
  } finally {
    clearTimeout(timeout);
  }
}

function rota(endpoint, parametro, campo) {
  return async (req, res) => {
    const valor = req.query[parametro];
    if (typeof valor !== 'string' || !valor.trim() || valor.length > 120) {
      return res.status(400).json({ erro: 'Parâmetro inválido.' });
    }
    if (campo !== 'termosBusca' && !/^\d+$/.test(valor)) {
      return res.status(400).json({ erro: 'Código inválido.' });
    }
    try {
      return res.json(await consultar(endpoint, { [campo]: valor.trim() }));
    } catch (erro) {
      console.error(erro);
      return res.status(502).json({ erro: erro instanceof Error ? erro.message : 'Falha ao consultar a APILIB.' });
    }
  };
}

app.get('/saude', (_, res) => res.json({ ok: true }));
app.get('/linhas', rota('/Linha/Buscar', 'busca', 'termosBusca'));
app.get('/paradas', rota('/Parada/BuscarParadasPorLinha', 'linha', 'codigoLinha'));

app.get('/previsao', async (req, res) => {
  const { linha, parada } = req.query;
  if (typeof linha !== 'string' || !/^\d+$/.test(linha) ||
      typeof parada !== 'string' || !/^\d+$/.test(parada)) {
    return res.status(400).json({ erro: 'Códigos inválidos.' });
  }
  try {
    return res.json(await consultar('/Previsao', {
      codigoLinha: linha,
      codigoParada: parada,
    }));
  } catch (erro) {
    console.error(erro);
    return res.status(502).json({ erro: erro instanceof Error ? erro.message : 'Falha ao consultar a APILIB.' });
  }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Servidor SPBus iniciado na porta ${PORT}`));
