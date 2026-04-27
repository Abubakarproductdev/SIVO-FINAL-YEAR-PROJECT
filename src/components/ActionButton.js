import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../constants/colors';
import { RADIUS, TYPOGRAPHY, SPACING, SHADOWS } from '../constants/theme';

// =============================================
// ANIMATED BUTTON COMPONENT (DEEP SPACE)
// =============================================
function ActionButton({ title, IconComponent, onPress, style, bgColor, loading, textColor, isAccent }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.6)).current;

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 1, duration: 200, useNativeDriver: true })
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0.6, duration: 200, useNativeDriver: true })
    ]).start();
  };

  const colors = isAccent 
    ? [COLORS.accent, COLORS.accentEnd] 
    : bgColor 
      ? [bgColor, bgColor] // Fallback if solid color is strictly requested
      : [COLORS.primary, COLORS.primaryEnd];

  const shadowProvider = isAccent ? SHADOWS.glowAccent : SHADOWS.glowPrimary;

  return (
    <Animated.View style={[
      styles.wrapper, 
      { transform: [{ scale: scaleAnim }], opacity: glowAnim },
      shadowProvider,
      style
    ]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        disabled={loading}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.actionButton}
          dataSet={{ className: 'sivo-action-btn' }}
        >
          {loading ? (
            <ActivityIndicator color={textColor || '#FFF'} />
          ) : (
            <View style={styles.actionButtonContent}>
              <Text style={[styles.actionButtonText, { color: textColor || '#FFF' }]}>
                {title}
              </Text>
              {IconComponent && (
                <IconComponent size={20} color={textColor || '#FFF'} style={styles.icon} />
              )}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { 
    width: '100%',
    borderRadius: RADIUS.lg,
  },
  actionButton: { 
    borderRadius: RADIUS.lg, 
    paddingVertical: SPACING.lg, 
    paddingHorizontal: SPACING.xxl, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  actionButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionButtonText: { 
    fontFamily: TYPOGRAPHY.fontFamily.bodyBold,
    fontSize: TYPOGRAPHY.size.subtitle, 
    letterSpacing: 0.5,
  },
  icon: { marginLeft: 10 },
});

export default ActionButton;
