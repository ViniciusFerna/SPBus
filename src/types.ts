export type Linha = { cl: number; lt: string; tl: number; sl: number; tp: string; ts: string; lc: boolean };
export type Parada = { cp: number; np: string; ed?: string; py?: number; px?: number };
export type Veiculo = { p: string | number; t: string; a: boolean };
export type Previsao = { hr: string; p?: { cp: number; np: string; l: { vs: Veiculo[] }[] } };
export type RootStackParams = { Inicio: undefined; Detalhes: { linha: Linha }; Favoritos: undefined };
export const numeroLinha = (linha: Linha) => `${linha.lt}-${linha.tl}`;
export const destinoLinha = (linha: Linha) => linha.sl === 1 ? linha.ts : linha.tp;
