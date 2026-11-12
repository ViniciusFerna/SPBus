import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParams, numeroLinha } from '../types';
import { colors } from '../theme';
type Props = NativeStackScreenProps<RootStackParams, 'Detalhes'>;
export default function DetalhesScreen({ route }: Props) {
  return <View style={styles.container}>
    <Text style={styles.heading}>Linha {numeroLinha(route.params.linha)}</Text>
    </View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bg, padding: 20 }, heading: { color: colors.dark, fontSize: 24, fontWeight: '800', marginBottom: 16 } });
