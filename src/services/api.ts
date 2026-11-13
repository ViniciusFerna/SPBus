import { Linha, Parada, Previsao } from '../types';

const BASE = process.env.EXPO_PUBLIC_API_URL;

async function get<T>(rota: string): Promise<T> {
  if (!BASE) throw new Error('Configure EXPO_PUBLIC_API_URL no arquivo .env do aplicativo.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(`${BASE.replace(/\/$/, '')}${rota}`, { signal: controller.signal });
    const body = await response.json();
    if (!response.ok) throw new Error(body.erro || `Falha HTTP ${response.status}`);
    
    return body as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('Tempo de resposta esgotado. Verifique sua conexão.');
    throw error;
  } finally {
     clearTimeout(timeout); 
  }

}
export const buscarLinhas = (termo: string) => get<Linha[]>(`/linhas?busca=${encodeURIComponent(termo)}`);
export const buscarParadas = (codigoLinha: number) => get<Parada[]>(`/paradas?linha=${codigoLinha}`);
export const buscarPrevisao = (codigoLinha: number, codigoParada: number) => get<Previsao>(`/previsao?linha=${codigoLinha}&parada=${codigoParada}`);
