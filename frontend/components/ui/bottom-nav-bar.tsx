import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';

interface TabItem {
  name: string;
  icon: string;
  route: string;
  label: string;
}

const tabs: TabItem[] = [
  {
    name: 'home',
    icon: '□',
    route: '/home',
    label: 'Home'
  },
  {
    name: 'risk-check',
    icon: '◇',
    route: '/risk-check',
    label: 'Risk Check'
  },
  {
    name: 'symptom',
    icon: '○',
    route: '/symptom-analyzer',
    label: 'Symptoms'
  },
  {
    name: 'summary',
    icon: '△',
    route: '/health-summary',
    label: 'Summary'
  },
  {
    name: 'chat',
    icon: '◐',
    route: '/chat-bot',
    label: 'AI Chat'
  }
];

export function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Use app theme colors
  const backgroundColor = useThemeColor({ light: '#ffffff', dark: '#1a1a1a' }, 'background');
  const borderColor = useThemeColor({ light: '#e1e1e1', dark: '#333333' }, 'icon');
  const tintColor = useThemeColor({ light: '#2f95dc', dark: '#007AFF' }, 'tint');
  const inactiveColor = useThemeColor({ light: '#8e8e93', dark: '#8e8e93' }, 'tabIconDefault');
  const textColor = useThemeColor({ light: '#000000', dark: '#ffffff' }, 'text');

  const handleTabPress = (route: string) => {
    router.push(route as any);
  };

  const isTabActive = (route: string) => {
    return pathname === route;
  };

  return (
    <View style={[styles.container, { backgroundColor, borderTopColor: borderColor }]}>
      {/* Top Border */}
      <View style={[styles.topBorder, { backgroundColor: borderColor }]} />
      
      {/* Tab Container */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => {
          const isActive = isTabActive(tab.route);
          
          return (
            <TouchableOpacity
              key={tab.name}
              style={[
                styles.tab, 
                isActive && { backgroundColor: tintColor + '10' }
              ]}
              onPress={() => handleTabPress(tab.route)}
              activeOpacity={0.7}
            >
              {/* Icon with Active Indicator */}
              <View style={styles.iconContainer}>
                <Text style={[
                  styles.icon,
                  { color: isActive ? tintColor : inactiveColor },
                  isActive && styles.activeIcon
                ]}>
                  {tab.icon}
                </Text>
                {isActive && (
                  <View style={[styles.activeIndicator, { backgroundColor: tintColor }]} />
                )}
              </View>
              
              {/* Label */}
              <Text style={[
                styles.label,
                { color: isActive ? tintColor : inactiveColor },
                isActive && styles.activeLabel
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Safe Area for devices with home indicator */}
      <View style={[styles.safeArea, { backgroundColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 12,
  },
  topBorder: {
    height: 0.5,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 16,
    minHeight: 60,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    position: 'relative',
    height: 28,
    width: 28,
  },
  icon: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeIcon: {
    transform: [{ scale: 1.15 }],
    fontWeight: 'bold',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 6,
    height: 2,
    borderRadius: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  activeLabel: {
    fontWeight: '700',
  },
  safeArea: {
    height: Platform.OS === 'ios' ? 24 : 12,
  },
});