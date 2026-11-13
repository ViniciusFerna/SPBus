import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinhaCard from '../components/LinhaCard';
import { Linha, RootStackParams } from '../types';
import { listarFavoritos } from '../services/favoritos';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParams, 'Favoritos'>;

export default function FavoritosScreen({ navigation }: Props) {
  const [favoritos, setFavoritos] = useState<Linha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  
  useFocusEffect(useCallback(() => {
    let ativo = true;
    setCarregando(true);
    listarFavoritos().then(itens => { if (ativo) { setFavoritos(itens); setErro(''); } })
      .catch(() => { if (ativo) setErro('Não foi possível carregar os favoritos.'); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []));

  return <View style={styles.container}>
    <Text style={styles.title}>Linhas favoritas ★</Text>
    {carregando ? <ActivityIndicator color={colors.primary} /> : null}
    {!!erro && <Text style={styles.error}>{erro}</Text>}
    <FlatList data={favoritos} keyExtractor={item => String(item.cl)} renderItem={({ item }) => <LinhaCard linha={item} rightLabel="Ver detalhes" onPress={() => navigation.navigate('Detalhes', { linha: item })} />} ListEmptyComponent={!carregando && !erro ? 
        <Text style={styles.empty}>Você ainda não adicionou nenhuma linha aos favoritos.</Text> : undefined} />
  </View>;
}
const styles = StyleSheet.create({ container: { 
    flex: 1, 
    backgroundColor: colors.bg, 
    padding: 18 
}, 
title: { fontSize: 24, 
    fontWeight: '800', 
    color: colors.dark, 
    marginBottom: 20 
}, 
empty: { 
    color: colors.muted, 
    marginTop: 18, 
    textAlign: 'center' 
}, 
error: { 
    color: colors.danger 
} 
});
