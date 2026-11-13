import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linha } from '../types';
const CHAVE = '@spbus:favoritos:v1';
export async function listarFavoritos(): Promise<Linha[]> {
  const salvo = await AsyncStorage.getItem(CHAVE);
  if (!salvo) return [];
  try { const itens: unknown = JSON.parse(salvo); return Array.isArray(itens) ? itens as Linha[] : []; }
  catch { return []; }
}
export async function alternarFavorito(linha: Linha): Promise<boolean> {
  const atuais = await listarFavoritos();
  const jaExiste = atuais.some(item => item.cl === linha.cl);
  const atualizados = jaExiste ? atuais.filter(item => item.cl !== linha.cl) : [...atuais, linha];
  await AsyncStorage.setItem(CHAVE, JSON.stringify(atualizados));
  return !jaExiste;
}
