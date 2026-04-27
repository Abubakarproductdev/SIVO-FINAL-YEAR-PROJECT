import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Mic, Square, RotateCcw, Gauge } from 'lucide-react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { Video, ResizeMode } from 'expo-av';

import COLORS from '../constants/colors';
import { SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import ActionButton from '../components/ActionButton';
import AnimatedWaveform from '../components/AnimatedWaveform';
import Card from '../components/Card';
import { VideoDictionary } from '../config/VideoDictionary';

const SERVER_URL = 'http://192.168.10.6:5000/speech-to-sign';

// Speed options - lowest is slowest. 1.0 = normal. Below 1.0 = slower.
// User said "slow up to 1.5x" — interpreting as range 0.5x (slow) to 1.5x (fast)
const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5];

export default function SpeechToSignScreen({ navigate }) {
  const [status, setStatus] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [videoSequence, setVideoSequence] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [activePlayer, setActivePlayer] = useState(0); // 0 or 1 — ping-pong

  // Two video refs for seamless transition
  const videoRefA = useRef(null);
  const videoRefB = useRef(null);

  const latestTranscript = useRef('');
  const isTransitioningRef = useRef(false); // prevents double-transition
  const sequenceRef = useRef([]); // stable ref to sequence
  const indexRef = useRef(0); // stable ref to index (avoids stale closure)

  // Keep refs in sync
  useEffect(() => {
    sequenceRef.current = videoSequence;
  }, [videoSequence]);

  useEffect(() => {
    indexRef.current = currentVideoIndex;
  }, [currentVideoIndex]);

  // ==================== Speech Recognition ====================
  useEffect(() => {
    ExpoSpeechRecognitionModule.requestPermissionsAsync();
  }, []);

  useSpeechRecognitionEvent('start', () => setStatus('recording'));

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript || '';
    setTranscript(text);
    latestTranscript.current = text;
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech Recognition Error:', event);
    Alert.alert('Speech Error', 'Could not recognize speech. Please try again.');
    setStatus('idle');
  });

  const startRecording = async () => {
    try {
      setTranscript('');
      latestTranscript.current = '';
      setVideoSequence([]);
      setCurrentVideoIndex(0);
      indexRef.current = 0;
      isTransitioningRef.current = false;

      await ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: false,
      });
    } catch (e) {
      console.error('Start Recording Error:', e);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      await ExpoSpeechRecognitionModule.stop();
      setStatus('processing');

      if (!latestTranscript.current?.trim()) {
        Alert.alert('No speech detected', 'Please try speaking again.');
        setStatus('idle');
        return;
      }
      await processTextToSign(latestTranscript.current);
    } catch (e) {
      console.error('Stop Recording Error:', e);
      setStatus('idle');
    }
  };

  const processTextToSign = async (text) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Server returned ${response.status}`);

      const data = await response.json();

      // Filter out any words for which we don't have a video asset (defensive)
      const validSequence = (data.video_sequence || []).filter(
        (word) => VideoDictionary[word] !== undefined
      );

      if (validSequence.length > 0) {
        sequenceRef.current = validSequence;
        indexRef.current = 0;
        setVideoSequence(validSequence);
        setCurrentVideoIndex(0);
        setActivePlayer(0);
        isTransitioningRef.current = false;
        setStatus('playing');
      } else {
        Alert.alert('No Match', 'No sign language videos matched your words.');
        setStatus('idle');
      }
    } catch (error) {
      console.error('Backend connection failed:', error);
      Alert.alert(
        'Connection Error',
        `Could not connect to backend at ${SERVER_URL}. Check Wi-Fi IP and ensure Flask is running.`
      );
      setStatus('idle');
    }
  };

  // ==================== Seamless Playback (Ping-Pong) ====================
  // The currently-active player plays index N; the inactive player preloads index N+1.
  // When active finishes, we instantly switch to the inactive (already loaded) player.

  const handlePlaybackStatusUpdate = useCallback(
    (playbackStatus, playerId) => {
      if (!playbackStatus.isLoaded) return;
      if (playerId !== activePlayer) return; // ignore preloader events

      if (playbackStatus.didJustFinish && !isTransitioningRef.current) {
        isTransitioningRef.current = true;

        const nextIndex = indexRef.current + 1;

        if (nextIndex < sequenceRef.current.length) {
          // Switch to the other (already-preloaded) player
          indexRef.current = nextIndex;
          setCurrentVideoIndex(nextIndex);
          setActivePlayer((prev) => (prev === 0 ? 1 : 0));

          // Reset transition flag after a tiny delay
          setTimeout(() => {
            isTransitioningRef.current = false;
          }, 50);
        } else {
          setStatus('finished');
          isTransitioningRef.current = false;
        }
      }
    },
    [activePlayer]
  );

  // Apply playback speed whenever it changes or active video changes
  useEffect(() => {
    const applyRate = async () => {
      try {
        const ref = activePlayer === 0 ? videoRefA.current : videoRefB.current;
        if (ref) {
          await ref.setRateAsync(playbackSpeed, true); // shouldCorrectPitch = true
        }
      } catch (e) {
        // Silent fail – rate setting isn't critical
      }
    };
    if (status === 'playing') applyRate();
  }, [playbackSpeed, activePlayer, currentVideoIndex, status]);

  const reset = async () => {
    try {
      if (videoRefA.current) await videoRefA.current.unloadAsync();
      if (videoRefB.current) await videoRefB.current.unloadAsync();
    } catch (e) { }
    setTranscript('');
    latestTranscript.current = '';
    setVideoSequence([]);
    setCurrentVideoIndex(0);
    indexRef.current = 0;
    isTransitioningRef.current = false;
    setActivePlayer(0);
    setStatus('idle');
  };

  const replay = async () => {
    try {
      isTransitioningRef.current = false;
      indexRef.current = 0;
      setCurrentVideoIndex(0);
      setActivePlayer(0);
      // Force reload first video
      if (videoRefA.current) {
        await videoRefA.current.setPositionAsync(0);
        await videoRefA.current.playAsync();
      }
      setStatus('playing');
    } catch (e) {
      console.error('Replay error:', e);
    }
  };

  const cycleSpeed = () => {
    const currentIdx = SPEED_OPTIONS.indexOf(playbackSpeed);
    const nextIdx = (currentIdx + 1) % SPEED_OPTIONS.length;
    setPlaybackSpeed(SPEED_OPTIONS[nextIdx]);
  };

  // ==================== UI ====================

  if (status === 'idle') {
    return (
      <View style={styles.speechScreen} dataSet={{ className: 'sivo-bg-container' }}>
        <View style={styles.ambientGlow} dataSet={{ className: 'sivo-glow' }} />
        <View style={styles.speechContent}>
          <Text style={styles.speechInstruction} dataSet={{ className: 'sivo-status-text' }}>
            Tap the microphone to start{'\n'}recording your voice
          </Text>
        </View>
        <View style={styles.actionContainer}>
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
        <View style={styles.actionContainer}>
          <ActionButton
            title="Stop & Translate"
            IconComponent={Square}
            onPress={stopRecording}
            bgColor={COLORS.bgElevated}
            textColor={COLORS.textPrimary}
          />
        </View>
      </View>
    );
  }

  if (status === 'processing') {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.subText}>Analyzing NLP & fetching sequence...</Text>
        </View>
      </View>
    );
  }

  if (status === 'playing' || status === 'finished') {
    const currentWord = videoSequence[currentVideoIndex];
    const nextWord = videoSequence[currentVideoIndex + 1];

    // Source for active player
    const activeSource = currentWord ? VideoDictionary[currentWord] : null;
    // Source for the OTHER player (preloads next)
    const preloadSource = nextWord ? VideoDictionary[nextWord] : null;

    // Determine which source goes into which Video component
    const sourceA = activePlayer === 0 ? activeSource : preloadSource;
    const sourceB = activePlayer === 1 ? activeSource : preloadSource;

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

        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={replay}
            disabled={status === 'playing'}
          >
            <RotateCcw
              size={24}
              color={status === 'playing' ? COLORS.border : COLORS.textSecondary}
            />
            <Text style={styles.navLabel}>Replay</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={reset}>
            <Mic size={24} color={COLORS.textSecondary} />
            <Text style={styles.navLabel}>New</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.xxl, justifyContent: 'space-between' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  instructionText: {
    fontSize: TYPOGRAPHY.size.header,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  statusTitle: {
    fontSize: TYPOGRAPHY.size.header,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  liveTranscript: {
    fontSize: TYPOGRAPHY.size.title,
    color: COLORS.primary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
  actionContainer: { paddingTop: 20 },
  subText: {
    fontSize: TYPOGRAPHY.size.body,
    color: COLORS.textSecondary,
    marginTop: 20,
  },

  videoWrapper: {
    width: 350,
    height: 480,
    borderRadius: 20,
    backgroundColor: COLORS.bgElevated,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  videoPlayer: { width: '100%', height: '100%' },
  videoOverlay: { position: 'absolute', top: 0, left: 0 },
  progressText: {
    fontSize: TYPOGRAPHY.size.subtitle,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginBottom: SPACING.md,
  },
  speedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.lg,
    gap: 8,
  },
  speedText: {
    fontSize: TYPOGRAPHY.size.body,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginLeft: 6,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.xxl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navItem: { alignItems: 'center', padding: SPACING.md },
  navLabel: {
    fontSize: TYPOGRAPHY.size.small,
    color: COLORS.textSecondary,
    marginTop: 6,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
});