import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Linha, destinoLinha, numeroLinha } from '../types';
import { colors } from '../theme';
type Props = { linha: Linha; onPress: () => void; rightLabel?: string };
export default function LinhaCard({ linha, onPress, rightLabel }: Props) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
    <View style={styles.top}><Text style={styles.number}>{numeroLinha(linha)}</Text>{rightLabel ? <Text style={styles.action}>{rightLabel}</Text> : null}</View>
    <Text style={styles.destination}>Destino: {destinoLinha(linha)}</Text>
    <Text style={styles.small}>Sentido {linha.sl} • {linha.tp} / {linha.ts}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({ card: { backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }, top: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, number: { color: colors.primary, fontWeight: '800', fontSize: 19 }, action: { color: colors.primary, fontWeight: '700' }, destination: { fontWeight: '600', color: colors.dark, marginTop: 8 }, small: { color: colors.muted, marginTop: 5, fontSize: 12 } });
