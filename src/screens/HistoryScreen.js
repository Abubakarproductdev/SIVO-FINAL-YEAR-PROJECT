import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useChat } from '../../ChatContext';
import COLORS from '../constants/colors';
import { SPACING, RADIUS, TYPOGRAPHY } from '../constants/theme';
import Card from '../components/Card';

// =============================================
// HISTORY SCREEN (DEEP SPACE)
// =============================================
function HistoryScreen({ navigate }) {
  const { history } = useChat();

  return (
    <View style={styles.historyBg} dataSet={{ className: 'sivo-bg-container' }}>
      {/* Ambient glow */}
      <View style={styles.glow} dataSet={{ className: 'sivo-glow' }} />

      <ScrollView
        style={styles.historyContainer}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {history.length === 0 ? (
          <View style={{ marginTop: 80, alignItems: 'center' }}>
            <Text style={styles.emptyText}>No saved conversations yet.</Text>
            <Text style={styles.emptySubtext}>Start a session and save it to history.</Text>
          </View>
        ) : (
          history.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.9}
              onPress={() => navigate('HistoryDetail', item)}
            >
              <Card style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.historyTag}
                  >
                    <Text style={styles.historyTagText}>{item.type}</Text>
                  </LinearGradient>
                  <Text style={styles.historyTime}>{item.date}</Text>
                </View>
                <Text style={styles.historyText} numberOfLines={2}>
                  {item.previewText}...
                </Text>
                <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <Text style={styles.viewLink}>Tap to view full chat →</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  historyBg: { flex: 1, backgroundColor: COLORS.bgDark },
  glow: {
    position: 'absolute', top: -60, right: -60, width: 220, height: 220,
    borderRadius: 110, backgroundColor: COLORS.primary, opacity: 0.1,
  },
  historyContainer: { flex: 1, padding: SPACING.xl },
  emptyText: { fontFamily: TYPOGRAPHY.fontFamily.bodyBold, color: COLORS.textSecondary, fontSize: 17, marginBottom: 8 },
  emptySubtext: { fontFamily: TYPOGRAPHY.fontFamily.body, color: COLORS.textMuted, fontSize: 14 },
  historyCard: { marginBottom: 14 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  historyTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.xxl },
  historyTagText: { fontFamily: TYPOGRAPHY.fontFamily.bodyBold, fontSize: TYPOGRAPHY.size.small, color: '#FFF', letterSpacing: 0.5 },
  historyTime: { fontFamily: TYPOGRAPHY.fontFamily.body, fontSize: TYPOGRAPHY.size.small, color: COLORS.textMuted },
  historyText: { fontFamily: TYPOGRAPHY.fontFamily.body, fontSize: TYPOGRAPHY.size.body, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 14 },
  viewLink: { fontFamily: TYPOGRAPHY.fontFamily.bodyMedium, fontSize: 12, color: COLORS.primaryEnd },
});

export default HistoryScreen;
