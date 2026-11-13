import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';
export default function FavoritosScreen() { return <View style={styles.container}>
    <Text style={styles.heading}>Meus favoritos</Text>
</View>; }

const styles = StyleSheet.create({ 
    container: { flex: 1, 
    backgroundColor: colors.bg, 
    padding: 20 
}, 
    heading: { color: colors.dark, 
    fontSize: 24, 
    fontWeight: '800', 
    marginBottom: 16 
} });
