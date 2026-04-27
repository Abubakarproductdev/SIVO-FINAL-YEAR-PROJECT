import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  RotateCcw,
  Volume2,
  ArrowRight,
} from 'lucide-react-native';
import { useChat } from '../../ChatContext';
import COLORS from '../constants/colors';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

// =============================================
// LIVE CONVERSATION SCREEN (DEEP SPACE)
// =============================================
function LiveConversationScreen({ navigate }) {
  const { messages, endConversation } = useChat();
  const scrollViewRef = useRef();

  // 1. AUTO-SPEAK LOGIC
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      speakText(lastMsg.text);
    }
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const speakText = (text) => {
    try {
      Speech.stop();
      Speech.speak(text, { language: 'en', rate: 0.9 });
    } catch (e) { console.log("Speech Error:", e); }
  };

  const handleRepeat = () => {
    if (messages.length > 0) speakText(messages[messages.length - 1].text);
  };

  const handleNext = () => {
    if (navigate) navigate('SpeechToSign');
  };

  const handleEndChat = () => {
    Alert.alert("End Chat", "Save conversation?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Save",
        onPress: () => {
          endConversation();
          if (navigate) navigate('History');
        }
      }
    ]);
  };

  return (
    <View style={styles.container} dataSet={{ className: 'sivo-bg-container' }}>
      {/* Ambient glow */}
      <View style={styles.glowAccent} dataSet={{ className: 'sivo-glow' }} />

      {/* HEADER */}
      <BlurView intensity={30} tint="dark" style={styles.header}>
        <Text style={styles.headerTitle}>Live Chat</Text>
        <TouchableOpacity onPress={handleEndChat} style={styles.endButton}>
          <Text style={styles.endButtonText}>End</Text>
        </TouchableOpacity>
      </BlurView>

      {/* CHAT AREA */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, index) => (
          <View key={index} style={styles.messageWrapper}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.messageBubble}
            >
              <Text style={styles.messageText}>{msg.text}</Text>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      {/* FOOTER ACTIONS */}
      <BlurView intensity={30} tint="dark" style={styles.footer}>
        {/* Retry */}
        <TouchableOpacity onPress={handleNext} style={styles.footerAction}>
          <RotateCcw color={COLORS.textSecondary} size={24} />
          <Text style={styles.footerLabel}>Retry</Text>
        </TouchableOpacity>

        {/* Repeat (Primary Action) */}
        <TouchableOpacity onPress={handleRepeat} style={styles.repeatButtonWrapper}>
          <LinearGradient
            colors={[COLORS.accent, COLORS.accentEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.repeatButton}
          >
            <Volume2 color="#FFF" size={32} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Next */}
        <TouchableOpacity onPress={handleNext} style={styles.footerAction}>
          <ArrowRight color={COLORS.primaryEnd} size={28} />
          <Text style={[styles.footerLabel, { color: COLORS.primaryEnd }]}>Next</Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  glowAccent: {
    position: 'absolute', bottom: 100, left: -80, width: 200, height: 200,
    borderRadius: 100, backgroundColor: COLORS.accent, opacity: 0.08,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  headerTitle: { fontFamily: TYPOGRAPHY.fontFamily.heading, color: '#FFF', fontSize: TYPOGRAPHY.size.header, letterSpacing: 1 },
  endButton: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.3)',
  },
  endButtonText: { fontFamily: TYPOGRAPHY.fontFamily.bodyBold, color: COLORS.error, fontSize: TYPOGRAPHY.size.small },
  chatContainer: { flex: 1, paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl },
  chatContent: { paddingBottom: SPACING.xl },
  messageWrapper: { alignItems: 'flex-end', marginBottom: SPACING.lg },
  messageBubble: {
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.sm,
    maxWidth: '85%',
  },
  messageText: { fontFamily: TYPOGRAPHY.fontFamily.body, color: '#FFF', fontSize: TYPOGRAPHY.size.header },
  footer: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingBottom: 20,
  },
  footerAction: { alignItems: 'center', width: 80 },
  footerLabel: { fontFamily: TYPOGRAPHY.fontFamily.body, color: COLORS.textSecondary, fontSize: TYPOGRAPHY.size.small, marginTop: 5 },
  repeatButtonWrapper: { ...SHADOWS.glowAccent },
  repeatButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LiveConversationScreen;
