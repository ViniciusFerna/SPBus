import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams, Parada, Previsao, destinoLinha, numeroLinha } from '../types';
import { buscarParadas, buscarPrevisao, pesquisarParadas, ResultadoParadas } from '../services/api';
import { alternarFavorito, listarFavoritos } from '../services/favoritos';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParams, 'Detalhes'>;

export default function DetalhesScreen({ route }: Props) {
  const { linha } = route.params;
  const [resultado, setResultado] = useState<ResultadoParadas>({ paradas: [], origem: 'cadastro' });
  const [termoParada, setTermoParada] = useState('');
  const [selecionada, setSelecionada] = useState<Parada | null>(null);
  const [previsao, setPrevisao] = useState<Previsao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState('');
  const [favorita, setFavorita] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setResultado(await buscarParadas(linha.cl));
    } catch (e) {
      setResultado({ paradas: [], origem: 'cadastro' });
      setErro(e instanceof Error ? e.message : 'Erro ao carregar paradas.');
    } finally {
      setCarregando(false);
    }
  }, [linha.cl]);

  useEffect(() => { void carregar(); }, [carregar]);
  useEffect(() => {
    let ativo = true;
    listarFavoritos().then(itens => {
      if (ativo) setFavorita(itens.some(item => item.cl === linha.cl));
    }).catch(() => {});
    return () => { ativo = false; };
  }, [linha.cl]);

  async function favoritar() {
    try { setFavorita(await alternarFavorito(linha)); }
    catch { setErro('Não foi possível salvar o favorito.'); }
  }

  async function pesquisar() {
    if (termoParada.trim().length < 2 || carregando) return;
    setCarregando(true);
    setErro('');
    try {
      setResultado(await pesquisarParadas(termoParada.trim()));
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível pesquisar paradas.');
    } finally { setCarregando(false); }
  }

  async function consultar(parada: Parada) {
    setSelecionada(parada);
    setPrevisao(null);
    setBuscando(true);
    setErro('');
    try {
      setPrevisao(await buscarPrevisao(linha.cl, parada.cp));
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao consultar previsão.');
    } finally { setBuscando(false); }
  }

  const veiculos = previsao?.p?.l?.flatMap(item => item.vs || []) || [];
  const informacao = resultado.origem === 'previsao'
      ? 'Resultados da busca pelo nome ou endereço. Nem toda parada atende à linha selecionada.'
      : 'Pontos cadastrados para esta linha. A base de paradas da SPTrans prioriza corredores.';

  return <View style={styles.container}>
    <Text style={styles.title}>{numeroLinha(linha)} • {destinoLinha(linha)}</Text>
    <Pressable onPress={favoritar} style={styles.favorite}>
      <Text style={styles.favoriteText}>{favorita ? '★ Remover dos favoritos' : '☆ Adicionar aos favoritos'}</Text>
    </Pressable>

    <Text style={styles.description}>Selecione uma parada para consultar a previsão.</Text>
    {selecionada && <View style={styles.panel}>
      <Text style={styles.heading}>Previsão: {selecionada.np}</Text>
      {buscando ? <ActivityIndicator color={colors.primary} /> : previsao ? <>
        <Text style={styles.small}>Horário de referência: {previsao.hr}</Text>
        {veiculos.length === 0 ? <Text>Não há chegadas previstas para esta linha neste ponto no momento.</Text>
          : veiculos.map((v, i) => <Text key={`${v.p}-${i}`} style={styles.arrival}>Veículo {v.p}: {v.t} {v.a ? '• Acessível' : ''}</Text>)}
      </> : null}
      <Pressable style={styles.smallButton} onPress={() => consultar(selecionada)}>
        <Text style={styles.buttonText}>Atualizar previsão</Text>
      </Pressable>
    </View>}

    <View style={styles.row}>
      <TextInput
        style={styles.input}
        placeholder="Buscar parada por nome ou endereço"
        value={termoParada}
        onChangeText={setTermoParada}
        onSubmitEditing={pesquisar}
        returnKeyType="search"
      />
      <Pressable onPress={pesquisar} style={styles.searchButton}><Text style={styles.buttonText}>Buscar</Text></Pressable>
    </View>
    <Pressable onPress={() => { setTermoParada(''); void carregar(); }} style={styles.reload}>
      <Text style={styles.favoriteText}>Ver pontos da linha novamente</Text>
    </Pressable>

    {carregando && <ActivityIndicator color={colors.primary} size="large" />}
    {!!erro && <Text style={styles.error}>{erro}</Text>}
    <FlatList
      data={resultado.paradas}
      keyboardShouldPersistTaps="handled"
      keyExtractor={item => String(item.cp)}
      ListHeaderComponent={<View>
        <Text style={styles.heading}>Pontos de parada ({resultado.paradas.length})</Text>
        <Text style={styles.note}>{informacao}</Text>
      </View>}
      ListEmptyComponent={!carregando && !erro
        ? <Text style={styles.note}>Nenhum ponto disponível nesta consulta. Pesquise pelo nome da parada acima.</Text>
        : undefined}
      renderItem={({ item }) => <Pressable style={styles.parada} onPress={() => consultar(item)}>
        <Text style={styles.paradaName}>{item.np}</Text>
        <Text style={styles.small}>{item.ed || 'Toque para consultar a previsão'}</Text>
      </Pressable>}
    />
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.bg },
  title: { fontSize: 21, fontWeight: '800', color: colors.dark },
  description: { color: colors.muted, marginVertical: 10 },
  favorite: { backgroundColor: '#E7F1FC', padding: 12, borderRadius: 10, alignSelf: 'flex-start', marginTop: 10 },
  favoriteText: { color: colors.primary, fontWeight: '800' },
  heading: { fontSize: 16, fontWeight: '800', color: colors.dark, marginBottom: 10 },
  panel: { backgroundColor: '#E7F1FC', padding: 14, borderRadius: 12, marginBottom: 16 },
  small: { fontSize: 12, color: colors.muted, marginTop: 5 },
  note: { fontSize: 12, color: colors.muted, marginBottom: 12 },
  arrival: { color: colors.dark, marginTop: 8, fontWeight: '600' },
  smallButton: { backgroundColor: colors.primary, alignSelf: 'flex-start', marginTop: 12, borderRadius: 8, padding: 10 },
  buttonText: { color: '#fff', fontWeight: '700' },
  parada: { backgroundColor: '#fff', borderColor: colors.border, borderWidth: 1, padding: 14, borderRadius: 12, marginBottom: 9 },
  paradaName: { color: colors.dark, fontWeight: '700' },
  error: { color: colors.danger, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: 6 },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 10 },
  searchButton: { justifyContent: 'center', paddingHorizontal: 12, borderRadius: 10, backgroundColor: colors.primary },
  reload: { alignSelf: 'flex-start', paddingVertical: 10 },
});
