import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import {
  Home,
  MessageSquare,
  History,
  Settings,
} from 'lucide-react-native';
import COLORS from '../constants/colors';
import { RADIUS, TYPOGRAPHY, SPACING } from '../constants/theme';

// =============================================
// BOTTOM TAB BAR (GLASS)
// =============================================
function BottomTabBar({ currentScreen, navigate }) {
  const tabs = [
    { name: 'Home', icon: Home, screen: 'Home' },
    { name: 'Chat', icon: MessageSquare, screen: 'Conversation' },
    { name: 'History', icon: History, screen: 'History' },
    { name: 'Settings', icon: Settings, screen: 'Settings' },
  ];

  return (
    <BlurView intensity={40} tint="dark" style={styles.tabBarWrapper} dataSet={{ className: 'sivo-bottom-bar' }}>
      <SafeAreaView>
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isActive = currentScreen === tab.screen;
            return (
              <TouchableOpacity
                key={tab.name}
                onPress={() => navigate(tab.screen)}
                style={styles.tabItem}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.tabIconWrapper,
                    isActive && styles.tabIconActive,
                  ]}
                >
                  <tab.icon
                    size={22}
                    color={isActive ? COLORS.success : COLORS.textMuted} // Success is Cyan, looks great for active
                    className={isActive ? 'sivo-bottom-icon-active' : 'sivo-bottom-icon-inactive'}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isActive ? COLORS.success : COLORS.textMuted },
                  ]}
                  dataSet={{ className: isActive ? 'sivo-bottom-icon-active' : 'sivo-bottom-label' }}
                >
                  {tab.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: { 
    backgroundColor: 'rgba(0, 0, 0, 0.7)', 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.08)' 
  },
  tabBar: {  
    height: 80, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-around', 
    paddingBottom: 25, 
    paddingTop: 15 
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.sm },
  tabIconWrapper: { width: 44, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: RADIUS.md },
  tabIconActive: { backgroundColor: 'rgba(6, 182, 212, 0.15)' }, // Cyan low opacity
  tabLabel: { 
    fontFamily: TYPOGRAPHY.fontFamily.bodyMedium,
    fontSize: TYPOGRAPHY.size.tiny, 
    marginTop: 4 
  },
});

export default BottomTabBar;

