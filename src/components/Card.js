import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import COLORS from '../constants/colors';
import { RADIUS, SPACING } from '../constants/theme';

// =============================================
// CARD COMPONENT (GLASS)
// =============================================
function Card({ children, style, ...props }) {
  // Use a fallback View if expo-blur isn't fully supported, but normally it is.
  return (
    <BlurView intensity={20} tint="dark" style={[styles.card, style]} dataSet={{ className: 'sivo-card' }} {...props}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: { 
    backgroundColor: COLORS.bgCard, 
    borderRadius: RADIUS.xl, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    padding: SPACING.xl,
    overflow: 'hidden', // to ensure blur respects border radius
  },
});

export default Card;

