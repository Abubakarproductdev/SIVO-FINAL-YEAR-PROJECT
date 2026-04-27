import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Mic,
  Square,
  RotateCcw,
  ArrowRight,
  User,
} from 'lucide-react-native';
import COLORS from '../constants/colors';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import ActionButton from '../components/ActionButton';
import AnimatedWaveform from '../components/AnimatedWaveform';
import Card from '../components/Card';

// =============================================
// SPEECH TO SIGN SCREEN (DEEP SPACE)
// =============================================
function SpeechToSignScreen({ navigate }) {
  const [status, setStatus] = useState('idle');

  const startRecording = () => {
    setStatus('recording');
    setTimeout(() => {
      setStatus('converting');
    }, 3000);
  };

  const stopRecording = () => {
    setStatus('converting');
  };

  const reset = () => {
    setStatus('idle');
  };

  if (status === 'idle') {
    return (
      <View style={styles.speechScreen} dataSet={{ className: 'sivo-bg-container' }}>
        <View style={styles.ambientGlow} dataSet={{ className: 'sivo-glow' }} />
        <View style={styles.speechContent}>
          <Text style={styles.speechInstruction} dataSet={{ className: 'sivo-status-text' }}>
            Tap the microphone to start{'\n'}recording your voice
          </Text>
          <View style={styles.waveformPreview}>
            {[35, 50, 25, 60, 40].map((height, i) => (
              <View
                key={i}
                style={[
                  styles.waveformBar,
                  { height, backgroundColor: COLORS.bgElevated },
                ]}
              />
            ))}
          </View>
        </View>
        <View style={styles.speechActions}>
          <ActionButton
            title="Start Recording"
            IconComponent={Mic}
            onPress={startRecording}
            bgColor={COLORS.primary}
          />
        </View>
      </View>
    );
  }

  if (status === 'recording') {
    return (
      <View style={styles.speechScreen} dataSet={{ className: 'sivo-bg-container' }}>
        <View style={styles.ambientGlowAccent} dataSet={{ className: 'sivo-glow' }} />
        <View style={styles.speechContent}>
          <Text style={styles.speechStatusText} dataSet={{ className: 'sivo-status-text' }}>Recording in progress...</Text>
          <View style={styles.recIndicator}>
            <View style={styles.recDot} />
            <Text style={styles.recText}>REC</Text>
          </View>
          <View style={{ marginVertical: 40 }}>
            <AnimatedWaveform color={COLORS.coral} />
          </View>
        </View>
        <View style={styles.speechActions}>
          <ActionButton
            title="Stop Recording"
            IconComponent={Square}
            onPress={stopRecording}
            bgColor={COLORS.bgElevated}
            textColor={COLORS.textPrimary}
          />
        </View>
      </View>
    );
  }

  if (status === 'converting') {
    return (
      <View style={styles.speechScreen} dataSet={{ className: 'sivo-bg-container' }}>
        <View style={styles.ambientGlow} dataSet={{ className: 'sivo-glow' }} />
        <View style={styles.speechContent}>
          <Text style={styles.speechSubtext}>Converting to sign language</Text>
          <Card style={styles.convertedTextCard}>
            <Text style={styles.convertedText}>
              Hello, how can I help you today?
            </Text>
          </Card>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.avatarCircle, SHADOWS.glowPrimary]}
          >
            <User size={64} color="rgba(255,255,255,0.8)" />
          </LinearGradient>
          <Text style={styles.completeText}>Sign complete ✦</Text>
        </View>
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.actionBarItem}
            onPress={() => setStatus('converting')}
          >
            <RotateCcw size={24} color={COLORS.textSecondary} />
            <Text style={styles.actionBarLabel}>Repeat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBarItem} onPress={reset}>
            <Mic size={24} color={COLORS.textSecondary} />
            <Text style={styles.actionBarLabel}>Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBarItem}
            onPress={() => navigate('SignToSpeech')}
          >
            <ArrowRight size={24} color={COLORS.primaryEnd} />
            <Text style={[styles.actionBarLabel, { color: COLORS.primaryEnd }]}>Go to Sign</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  speechScreen: { flex: 1, backgroundColor: COLORS.bgDark, padding: SPACING.xxl, justifyContent: 'space-between' },
  ambientGlow: {
    position: 'absolute', top: -60, right: -60, width: 200, height: 200,
    borderRadius: 100, backgroundColor: COLORS.primary, opacity: 0.12,
  },
  ambientGlowAccent: {
    position: 'absolute', top: -60, left: -60, width: 200, height: 200,
    borderRadius: 100, backgroundColor: COLORS.accent, opacity: 0.10,
  },
  speechContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  speechInstruction: { fontFamily: TYPOGRAPHY.fontFamily.body, fontSize: TYPOGRAPHY.size.header, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 28 },
  speechStatusText: { fontFamily: TYPOGRAPHY.fontFamily.bodyBold, fontSize: TYPOGRAPHY.size.header, color: '#FFF', marginBottom: SPACING.lg },
  recIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(244, 63, 94, 0.15)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.xxl, borderWidth: 1, borderColor: 'rgba(244,63,94,0.25)' },
  recDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.error, marginRight: 8 },
  recText: { fontFamily: TYPOGRAPHY.fontFamily.bodyBold, fontSize: 14, color: COLORS.error },
  speechActions: { paddingTop: 20 },
  speechSubtext: { fontFamily: TYPOGRAPHY.fontFamily.body, fontSize: TYPOGRAPHY.size.body, color: COLORS.textSecondary, marginBottom: SPACING.xxl },
  convertedTextCard: { width: '100%', marginBottom: SPACING.xxxl },
  convertedText: { fontFamily: TYPOGRAPHY.fontFamily.bodyBold, fontSize: TYPOGRAPHY.size.title, color: '#FFF', textAlign: 'center' },
  avatarCircle: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xxl },
  completeText: { fontFamily: TYPOGRAPHY.fontFamily.bodyBold, fontSize: TYPOGRAPHY.size.subtitle, color: COLORS.primaryEnd },
  actionBar: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: SPACING.xxl, borderTopWidth: 1, borderTopColor: COLORS.border },
  actionBarItem: { alignItems: 'center', padding: SPACING.md },
  actionBarLabel: { fontFamily: TYPOGRAPHY.fontFamily.body, fontSize: TYPOGRAPHY.size.small, color: COLORS.textSecondary, marginTop: 6 },
  waveformPreview: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 70, marginTop: SPACING.xxxl },
  waveformBar: { width: 6, borderRadius: 3 },
});

export default SpeechToSignScreen;
