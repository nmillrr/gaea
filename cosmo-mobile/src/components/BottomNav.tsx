import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../../App';
import { colors } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type Tab = 'home' | 'upload' | 'profile';

interface BottomNavProps {
  active: Tab;
}

/** Sticky bottom navigation bar: home / upload / profile (per feed.png). */
const BottomNav: React.FC<BottomNavProps> = ({ active }) => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const items: { tab: Tab; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }[] = [
    { tab: 'home', icon: 'home', onPress: () => navigation.navigate('Feed') },
    { tab: 'upload', icon: 'add-circle', onPress: () => navigation.navigate('Capture') },
    { tab: 'profile', icon: 'person', onPress: () => navigation.navigate('Profile', {}) },
  ];

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {items.map(({ tab, icon, onPress }) => (
        <TouchableOpacity key={tab} style={styles.item} onPress={onPress} hitSlop={8}>
          <Ionicons
            name={active === tab ? icon : (`${icon}-outline` as keyof typeof Ionicons.glyphMap)}
            size={26}
            color={active === tab ? colors.textStrong : colors.text}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
});

export default BottomNav;
