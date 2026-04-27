import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { BlurView } from 'expo-blur';
import { User, ArrowLeft } from 'lucide-react-native';
import COLORS from '../constants/colors';
import { RADIUS, TYPOGRAPHY, SPACING } from '../constants/theme';

// =============================================
// TOP BAR (GLASS)
// =============================================
function TopBar({ screen, onBackClick }) {
  const titles = {
    Home: 'SIVO',
    History: 'History',
    Conversation: 'Conversation',
    SpeechToSign: 'Speech → Sign',
    SignToSpeech: 'Sign → Speech',
    Settings: 'Settings',
  };

  const isHomeScreen = screen === 'Home';

  return (
    <BlurView intensity={40} tint="dark" style={styles.topBarWrapper} dataSet={{ className: 'sivo-top-bar' }}>
      <SafeAreaView>
        <View style={styles.topBar}>
          {isHomeScreen ? (
            <View style={styles.topBarIconPlaceholder} />
          ) : (
            <TouchableOpacity onPress={onBackClick} style={styles.topBarIcon} dataSet={{ className: 'sivo-back-btn' }}>
              <ArrowLeft size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}
          <Text style={styles.topBarTitle} dataSet={{ className: 'sivo-top-nav-text' }}>{titles[screen] || 'SIVO'}</Text>
          <TouchableOpacity style={styles.topBarIcon}>
            <View style={styles.topBarAvatar} dataSet={{ className: 'sivo-profile-btn' }}>
              <User size={18} color={COLORS.textPrimary} />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  topBarWrapper: { 
    backgroundColor: 'rgba(0, 0, 0, 0.7)', 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.08)', 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  topBar: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg },
  topBarIcon: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  topBarIconPlaceholder: { width: 44 },
  topBarTitle: { 
    fontFamily: TYPOGRAPHY.fontFamily.heading,
    fontSize: TYPOGRAPHY.size.title, 
    color: '#FFF', 
    letterSpacing: 1.5 
  },
  topBarAvatar: { width: 36, height: 36, borderRadius: RADIUS.md, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
});

export default TopBar;

