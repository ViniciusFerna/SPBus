import { Linha, Parada, Previsao } from '../types';

const BASE = process.env.EXPO_PUBLIC_API_URL;

async function get<T>(rota: string): Promise<T> {
  if (!BASE) throw new Error('Configure EXPO_PUBLIC_API_URL no .env da raiz.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch(`${BASE.replace(/\/$/, '')}${rota}`, {
      signal: controller.signal,
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.erro || `Tente novamente`);
    return body as T;
  } catch (error) {
    if (controller.signal.aborted) throw new Error('Tempo de resposta esgotado.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export type ResultadoParadas = {
  paradas: Parada[];
  origem: 'cadastro' | 'previsao' | 'pesquisa';
};

export const buscarLinhas = (termo: string) =>
  get<Linha[]>(`/linhas?busca=${encodeURIComponent(termo)}`);
export const buscarParadas = (codigoLinha: number) =>
  get<ResultadoParadas>(`/paradas?linha=${codigoLinha}`);
export const pesquisarParadas = (termo: string) =>
  get<ResultadoParadas>(`/paradas/buscar?busca=${encodeURIComponent(termo)}`);
export const buscarPrevisao = (codigoLinha: number, codigoParada: number) =>
  get<Previsao>(`/previsao?linha=${codigoLinha}&parada=${codigoParada}`);
