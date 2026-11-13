import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams, Linha } from '../types';
import LinhaCard from '../components/LinhaCard';
import { buscarLinhas } from '../services/api';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParams, 'Inicio'>;

export default function InicioScreen({ navigation }: Props) {
  const [termo, setTermo] = useState('');
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [pesquisou, setPesquisou] = useState(false);

  async function pesquisar() {
    if (!termo.trim() || carregando) return;
    Keyboard.dismiss(); setCarregando(true); setErro(''); setPesquisou(true); setLinhas([]);
    try { 
      const resultado = await buscarLinhas(termo.trim()); setLinhas(resultado); 
    }
    catch (e) {
       setErro(e instanceof Error ? e.message : 'Não foi possível buscar linhas.'); 
    }
    finally {
       setCarregando(false); 
    }

  }
  return <View style={styles.container}>
    <Text style={styles.title}>SPBus</Text><Text style={styles.subtitle}>Consulte linhas e chegadas de ônibus em São Paulo.</Text>

    <TextInput accessibilityLabel="Pesquisar linha ou destino" style={styles.input} placeholder="Ex.: 8000 ou Lapa" value={termo} onChangeText={setTermo} onSubmitEditing={pesquisar} returnKeyType="search" />

    <Pressable style={styles.button} onPress={pesquisar}>
      <Text style={styles.buttonText}>Buscar linhas</Text>
      </Pressable>
    <Pressable style={styles.secondary} onPress={() => navigation.navigate('Favoritos')}>
      <Text style={styles.link}>★ Meus favoritos</Text>
      </Pressable>
      
    {carregando && <ActivityIndicator size="large" color={colors.primary} />}
    {!!erro && <Text style={styles.error}>{erro}</Text>}
    <FlatList keyboardShouldPersistTaps="handled" data={linhas} keyExtractor={item => String(item.cl)} renderItem={({ item }) => <LinhaCard linha={item} onPress={() => navigation.navigate('Detalhes', { linha: item })} />} ListEmptyComponent={!carregando && !erro ? <Text style={styles.empty}>{pesquisou ? 'Nenhuma linha encontrada.' : 'Digite um número ou destino para começar.'}</Text> : undefined} />
  </View>;
}
const styles = StyleSheet.create({ container: { 
  flex: 1, 
  paddingHorizontal: 18, 
  paddingTop: 22, 
  backgroundColor: colors.bg 
}, 
title: { 
  fontSize: 30, 
  fontWeight: '800', 
  color: colors.dark 
}, 
subtitle: { 
  color: colors.muted, 
  marginVertical: 12 
}, 
input: { 
  backgroundColor: '#fff', 
  borderRadius: 12, 
  borderWidth: 1, 
  borderColor: colors.border, 
  padding: 14 
}, 
button: { 
  backgroundColor: colors.primary, 
  padding: 14, 
  borderRadius: 12, 
  alignItems: 'center', 
  marginTop: 10 
}, 
buttonText: { 
  color: '#fff', 
  fontWeight: '700' 
}, 
secondary: { 
  alignSelf: 'flex-end', 
  paddingVertical: 16 
}, 
link: { 
  color: colors.primary, 
  fontWeight: '700' 
}, 
error: { 
  color: colors.danger, 
  marginBottom: 12 
}, 
empty: { 
  textAlign: 'center', 
  marginTop: 22, 
  color: colors.muted 
} });
