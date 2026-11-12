import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams } from '../types';
import { colors } from '../theme';
type Props = NativeStackScreenProps<RootStackParams, 'Inicio'>;
export default function InicioScreen({ navigation }: Props) {
  const [termo, setTermo] = useState('');
  return <View style={styles.container}>
    <Text style={styles.title}>SPBus</Text>
    <Text style={styles.subtitle}>Encontre seu ônibus em São Paulo.</Text>
    <TextInput accessibilityLabel="Pesquisar linha ou destino" style={styles.input} placeholder="Ex.: 8000 ou Lapa" value={termo} onChangeText={setTermo} />
    <Pressable style={styles.button} onPress={() => navigation.navigate('Favoritos')}><Text style={styles.buttonText}>Ver favoritos</Text></Pressable>
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 22, paddingTop: 36, backgroundColor: colors.bg }, title: { fontSize: 32, fontWeight: '800', color: colors.dark }, subtitle: { color: colors.muted, marginVertical: 12 }, input: { backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14 }, info: { color: colors.muted, marginVertical: 24 }, button: { backgroundColor: colors.primary, padding: 15, borderRadius: 12, alignItems: 'center' }, buttonText: { color: 'white', fontWeight: '700' } });
