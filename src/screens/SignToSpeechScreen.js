import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Video,
  Square,
  ArrowLeft,
} from 'lucide-react-native';
import { useChat } from '../../ChatContext';
import COLORS from '../constants/colors';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';

// =============================================
// SIGN TO SPEECH SCREEN (DEEP SPACE)
// =============================================
function SignToSpeechScreen({ navigate }) {
  const [status, setStatus] = useState('idle');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState(null);
  const [audioPermission, setAudioPermission] = useState(null);

  const { addMessage } = useChat();
  const SERVER_URL = "https://online-production-e372.up.railway.app/predict_sentence";

  // Auto-Reset on mount
  useEffect(() => {
    setStatus('idle');
  }, []);

  // Permissions
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setAudioPermission(status === 'granted');
      } catch (e) { console.log(e); }
    })();
  }, []);

  const startRecording = async () => {
    if (cameraRef) {
      setStatus('recording');
      try {
        const video = await cameraRef.recordAsync({ maxDuration: 10, mute: true, quality: '480p' });
        handleVideoUpload(video.uri);
      } catch (e) { setStatus('idle'); }
    }
  };

  const stopRecording = () => {
    if (cameraRef && status === 'recording') cameraRef.stopRecording();
  };

  const handleVideoUpload = async (uri) => {
    setStatus('translating');

    try {
      const formData = new FormData();
      formData.append('video', { uri: uri, type: 'video/mp4', name: 'sign_video.mp4' });

      const response = await fetch(SERVER_URL, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = await response.json();

      setStatus('idle');

      if (data.sentence && data.sentence.trim() !== "") {
        addMessage(data.sentence);
        if (navigate) {
          navigate('Conversation');
        }
      } else {
        Alert.alert("No Signs Detected", "Please try again.");
      }

    } catch (error) {
      console.error("Upload Error:", error);
      setStatus('idle');
      Alert.alert("Connection Error", "Check server.");
    }
  };

  if (status === 'translating') {
    return (
      <View style={styles.loadingContainer} dataSet={{ className: 'sivo-bg-container' }}>
        <View style={styles.loadingGlow} dataSet={{ className: 'sivo-glow' }} />
        <ActivityIndicator size="large" color={COLORS.primaryEnd} />
        <Text style={styles.loadingText} dataSet={{ className: 'sivo-status-text' }}>Processing...</Text>
      </View>
    );
  }

  if (!cameraPermission || !cameraPermission.granted || !audioPermission) {
    return (
      <View style={styles.permissionContainer} dataSet={{ className: 'sivo-bg-container' }}>
        <Text style={styles.permissionText} dataSet={{ className: 'sivo-status-text' }}>Permissions needed.</Text>
        <TouchableOpacity onPress={requestCameraPermission}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.permissionButton}
          >
            <Text style={styles.permissionButtonText}>Grant Permissions</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container} dataSet={{ className: 'sivo-bg-container' }}>
      {/* CAMERA VIEWPORT */}
      <View style={styles.cameraWrapper}>
        <CameraView style={{ flex: 1 }} facing="back" mode="video" ref={(ref) => setCameraRef(ref)}>
          {status === 'recording' && (
            <View style={styles.recBadge}>
              <Text style={styles.recText}>● REC</Text>
            </View>
          )}
        </CameraView>
      </View>

      {/* CONTROLS */}
      <View style={[styles.controls, { backgroundColor: '#E5E7EB' }]}>
        {status === 'idle' ? (
          <TouchableOpacity onPress={startRecording} style={styles.controlButtonWrapper}>
            <LinearGradient
              colors={[COLORS.accent, COLORS.accentEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.controlButton}
            >
              <Video color="#FFF" size={24} />
              <Text style={styles.controlButtonText}>Record</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={stopRecording} style={styles.controlButtonWrapper}>
            <LinearGradient
              colors={[COLORS.error, '#ff6b6b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.controlButton}
            >
              <Square color="#FFF" size={24} />
              <Text style={styles.controlButtonText}>Stop</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  loadingContainer: { flex: 1, backgroundColor: COLORS.bgDark, justifyContent: 'center', alignItems: 'center' },
  loadingGlow: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: COLORS.primary, opacity: 0.1,
  },
  loadingText: { fontFamily: TYPOGRAPHY.fontFamily.body, color: COLORS.textSecondary, marginTop: SPACING.xl },
  permissionContainer: { flex: 1, backgroundColor: COLORS.bgDark, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  permissionText: { fontFamily: TYPOGRAPHY.fontFamily.body, color: '#FFF', marginBottom: SPACING.xl, textAlign: 'center', fontSize: 16 },
  permissionButton: { padding: SPACING.lg, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.xxxl },
  permissionButtonText: { fontFamily: TYPOGRAPHY.fontFamily.bodyBold, color: '#FFF', fontSize: 15 },
  cameraWrapper: {
    flex: 1,
    margin: SPACING.xl,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.3)',
  }, controls: { height: 120, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  recText: { fontFamily: TYPOGRAPHY.fontFamily.bodyBold, color: COLORS.error, fontSize: 12 },

  controlButtonWrapper: { ...SHADOWS.glowPrimary, borderRadius: RADIUS.round },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: RADIUS.round,
  },
  controlButtonText: { fontFamily: TYPOGRAPHY.fontFamily.bodyBold, color: '#FFF', marginLeft: 10, fontSize: 15 },
});

export default SignToSpeechScreen;
