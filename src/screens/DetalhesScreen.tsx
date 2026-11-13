import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams, Parada, Previsao, destinoLinha, numeroLinha } from '../types';
import { buscarParadas, buscarPrevisao } from '../services/api';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParams, 'Detalhes'>;
export default function DetalhesScreen({ route }: Props) {
  const { linha } = route.params;
  const [paradas, setParadas] = useState<Parada[]>([]);
  const [selecionada, setSelecionada] = useState<Parada | null>(null);
  const [previsao, setPrevisao] = useState<Previsao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState('');
  const carregar = useCallback(async () => {
    setCarregando(true); setErro('');
    try { setParadas(await buscarParadas(linha.cl)); }
    catch (e) { setErro(e instanceof Error ? e.message : 'Erro ao carregar paradas.'); }
    finally { setCarregando(false); }
  }, [linha.cl]);

  useEffect(() => { void carregar(); }, [carregar]);
  async function consultar(parada: Parada) {

    setSelecionada(parada); setPrevisao(null); setBuscando(true); setErro('');
    
    try { 
      setPrevisao(await buscarPrevisao(linha.cl, parada.cp)); }
    catch (e) { 
      setErro(e instanceof Error ? e.message : 'Erro ao consultar previsão.'); }
    finally { 
      setBuscando(false); 
    }

  }

  const veiculos = previsao?.p?.l?.flatMap(item => item.vs || []) || [];
  return <View style={styles.container}>
    <Text style={styles.title}>{numeroLinha(linha)} • {destinoLinha(linha)}</Text>
    <Text style={styles.description}>Selecione uma parada para consultar a chegada dos ônibus.</Text>
    {selecionada && <View style={styles.panel}>
      <Text style={styles.heading}>Previsão: {selecionada.np}</Text>
      {buscando ? <ActivityIndicator color={colors.primary} /> : previsao ? <>
        <Text style={styles.small}>Consulta de referência: {previsao.hr}</Text>
        {veiculos.length === 0 ? <Text>Não há chegadas previstas no momento.</Text> : veiculos.map((v, i) => <Text key={`${v.p}-${i}`} style={styles.arrival}>Veículo {v.p}: {v.t} {v.a ? '• Acessível' : ''}</Text>)}
      </> : null}
      <Pressable style={styles.smallButton} onPress={() => consultar(selecionada)}><Text style={styles.buttonText}>Atualizar previsão</Text></Pressable>
    </View>}
    {carregando && <ActivityIndicator color={colors.primary} size="large" />}
    {!!erro && <Text style={styles.error}>{erro}</Text>}
    <FlatList data={paradas} keyExtractor={item => String(item.cp)} 
    ListHeaderComponent={<Text style={styles.heading}>Pontos de parada ({paradas.length})</Text>} 
    ListEmptyComponent={!carregando && !erro ? <Text>Nenhuma parada encontrada para esta linha.</Text> : undefined} 
    renderItem={({ item }) => <Pressable style={styles.parada} onPress={() => consultar(item)}>
      <Text style={styles.paradaName}>{item.np}</Text>
      <Text style={styles.small}>{item.ed || 'Toque para consultar previsão'}</Text></Pressable>} />
  </View>;
}
const styles = StyleSheet.create({ 
  container: { flex: 1,
   padding: 16,
  backgroundColor: colors.bg 
}, 
title: { 
  fontSize: 21, 
  fontWeight: '800', 
  color: colors.dark 
}, 
description: { 
  color: colors.muted, 
  marginVertical: 10 
}, 
  heading: { fontSize: 16, 
    fontWeight: '800', 
    color: colors.dark, 
    marginBottom: 10 
}, 
panel: { backgroundColor: '#E7F1FC', 
  padding: 14, 
  borderRadius: 12, 
  marginBottom: 16 
}, 
small: { fontSize: 12, 
  color: colors.muted, 
  marginTop: 5 
}, 
arrival: { color: colors.dark, 
  marginTop: 8, 
  fontWeight: '600' 
}, 
smallButton: { backgroundColor: colors.primary, 
  alignSelf: 'flex-start', 
  marginTop: 12, 
  borderRadius: 8, 
  padding: 10 
}, 
buttonText: { color: '#fff', 
  fontWeight: '700'
}, 
parada: { backgroundColor: '#fff', 
  borderColor: colors.border, 
  borderWidth: 1, 
  padding: 14, 
  borderRadius: 12, 
  marginBottom: 9 
}, 
paradaName: { color: colors.dark, 
  fontWeight: '700' 
}, 
error: { color: colors.danger, 
  marginBottom: 12 
} });
