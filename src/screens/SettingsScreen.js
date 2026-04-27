import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  User,
  ArrowLeft,
  ArrowRight,
  Bell,
  Moon,
  LogOut,
  Send,
} from 'lucide-react-native';
import { auth, db, doc, getDoc, updateDoc, setDoc, signOut } from '../config/firebase';
import COLORS from '../constants/colors';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import ActionButton from '../components/ActionButton';
import Card from '../components/Card';

// =============================================
// SETTINGS SCREEN (DEEP SPACE)
// =============================================
function SettingsScreen({ navigate }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof document !== 'undefined') {
      return !document.body.classList.contains('light-mode');
    }
    return true;
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth?.currentUser) {
        setLoading(false);
        return;
      }
      const userRef = doc(db, 'users', auth.currentUser.uid);
      try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Comment out automatic override from firebase to prevent mismatch UI
          // setIsDarkMode(data.isDarkMode ?? true);
          setNotificationsEnabled(data.notificationsEnabled ?? true);
          setName(data.name || '');
          setPhone(data.phone || '');
        } else {
          await setDoc(userRef, {
            email: auth.currentUser.email,
            isDarkMode: isDarkMode,
            notificationsEnabled: true,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.log('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const updateToggle = async (key, value) => {
    if (key === 'isDarkMode') {
      setIsDarkMode(value);
      if (typeof document !== 'undefined' && typeof localStorage !== 'undefined') {
        const isLight = document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
      }
    }
    if (key === 'notificationsEnabled') setNotificationsEnabled(value);
    if (auth?.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      try {
        await updateDoc(userRef, { [key]: value });
      } catch (error) {
        Alert.alert('Error', 'Could not update setting.');
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { name, phone });
      Alert.alert('Success', 'Profile updated successfully! ');
      setEditingProfile(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out.');
    }
  };

  if (editingProfile) {
    return (
      <View style={styles.settingsContainer} dataSet={{ className: 'sivo-bg-container' }}>
        <BlurView intensity={30} tint="dark" style={styles.settingsHeader}>
          <TouchableOpacity
            onPress={() => setEditingProfile(false)}
            style={styles.backBtn}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.settingsHeaderTitle}>Edit Profile</Text>
        </BlurView>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Card style={styles.profileCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.textInput}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                style={styles.textInput}
                keyboardType="phone-pad"
                placeholder="+1 234 567 890"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email (Read-only)</Text>
              <View style={[styles.textInput, styles.readOnlyInput]}>
                <Text style={styles.readOnlyText}>
                  {auth?.currentUser?.email || 'Not logged in'}
                </Text>
              </View>
            </View>
          </Card>
          <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
            <ActionButton
              title={saving ? 'Saving...' : 'Save Changes'}
              IconComponent={Send}
              onPress={handleSaveProfile}
              loading={saving}
              bgColor={COLORS.primaryEnd}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.settingsContainer} dataSet={{ className: 'sivo-bg-container' }}>
      {/* Ambient glow */}
      <View style={styles.glowPrimary} dataSet={{ className: 'sivo-glow' }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.settingsTitleSection}>
          <Text style={styles.settingsTitle}>Settings</Text>
          <Text style={styles.settingsSubtitle}>Manage your preferences</Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primaryEnd}
            style={{ marginTop: 40 }}
          />
        ) : (
          <View style={styles.settingsList}>
            <TouchableOpacity
              onPress={() => setEditingProfile(true)}
              activeOpacity={0.7}
            >
              <BlurView intensity={15} tint="dark" style={styles.settingsItem} dataSet={{ className: 'sivo-card' }}>
                <View style={styles.settingsItemLeft}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.settingsIcon}
                  >
                    <User size={18} color="#FFF" />
                  </LinearGradient>
                  <Text style={styles.settingsItemText}>Account Details</Text>
                </View>
                <ArrowRight size={20} color={COLORS.textMuted} />
              </BlurView>
            </TouchableOpacity>

            <BlurView intensity={15} tint="dark" style={styles.settingsItem} dataSet={{ className: 'sivo-card' }}>
              <View style={styles.settingsItemLeft}>
                <LinearGradient
                  colors={[COLORS.accent, COLORS.accentEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.settingsIcon}
                >
                  <Bell size={18} color="#FFF" />
                </LinearGradient>
                <Text style={styles.settingsItemText}>Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={(val) => updateToggle('notificationsEnabled', val)}
                trackColor={{
                  false: 'rgba(148, 163, 184, 0.4)',
                  true: '#7c3aed'
                }}
                thumbColor={notificationsEnabled ? '#00f5c4' : '#e2e8f0'}
                ios_backgroundColor="rgba(148, 163, 184, 0.4)"
              />
            </BlurView>

            <BlurView intensity={15} tint="dark" style={styles.settingsItem} dataSet={{ className: 'sivo-card' }}>
              <View style={styles.settingsItemLeft}>
                <LinearGradient
                  colors={['#7c3aed', '#a855f7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.settingsIcon}
                >
                  <Moon size={18} color="#FFF" />
                </LinearGradient>
                <Text style={styles.settingsItemText}>Dark Mode</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={(val) => updateToggle('isDarkMode', val)}
                trackColor={{
                  false: 'rgba(148, 163, 184, 0.4)',
                  true: '#7c3aed'
                }}
                thumbColor={isDarkMode ? '#00f5c4' : '#e2e8f0'}
                ios_backgroundColor="rgba(148, 163, 184, 0.4)"
              />
            </BlurView>
          </View>
        )}

        <View style={styles.logoutSection}>
          <ActionButton
            title="Log Out"
            IconComponent={LogOut}
            onPress={handleSignOut}
            isAccent
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  settingsContainer: { flex: 1, backgroundColor: COLORS.bgDark },
  glowPrimary: {
    position: 'absolute', top: -80, left: -80, width: 250, height: 250,
    borderRadius: 125, backgroundColor: COLORS.primary, opacity: 0.1,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm },
  settingsHeaderTitle: { fontFamily: TYPOGRAPHY.fontFamily.heading, fontSize: TYPOGRAPHY.size.header, color: '#FFF', letterSpacing: 1 },
  settingsTitleSection: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xxl, paddingBottom: SPACING.sm },
  settingsTitle: { fontFamily: TYPOGRAPHY.fontFamily.heading, fontSize: TYPOGRAPHY.size.large, color: '#FFF', marginBottom: 8, letterSpacing: 1.5 },
  settingsSubtitle: { fontFamily: TYPOGRAPHY.fontFamily.body, fontSize: TYPOGRAPHY.size.body, color: COLORS.textSecondary },
  settingsList: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, gap: SPACING.md },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    overflow: 'hidden',
  },
  settingsItemLeft: { flexDirection: 'row', alignItems: 'center' },
  settingsIcon: { width: 40, height: 40, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  settingsItemText: { fontFamily: TYPOGRAPHY.fontFamily.bodyMedium, fontSize: TYPOGRAPHY.size.body, color: '#FFF' },
  profileCard: { margin: SPACING.xl },
  inputGroup: { marginBottom: SPACING.xl },
  inputLabel: { fontFamily: TYPOGRAPHY.fontFamily.bodyMedium, fontSize: 13, color: COLORS.textSecondary, marginBottom: 8, letterSpacing: 0.8, textTransform: 'uppercase' },
  textInput: {
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: TYPOGRAPHY.fontFamily.body,
    fontSize: 16,
    color: '#FFF',
  },
  readOnlyInput: { opacity: 0.6, justifyContent: 'center' },
  readOnlyText: { fontFamily: TYPOGRAPHY.fontFamily.body, fontSize: 16, color: COLORS.textMuted },
  logoutSection: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xxxl, paddingBottom: 40 },
});

export default SettingsScreen;
