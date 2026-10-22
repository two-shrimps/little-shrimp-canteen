import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

function TabGlyph({ active }: { active: boolean }) {
  return (
    <View style={[styles.glyph, active && styles.glyphActive]} />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tomatoDark,
        tabBarInactiveTintColor: colors.inactive,
        tabBarLabelStyle: { fontSize: 11, marginTop: 2 },
        tabBarItemStyle: { paddingTop: 9 },
        tabBarStyle: {
          backgroundColor: 'rgba(255,252,247,0.98)',
          borderColor: 'rgba(68,55,47,0.11)',
          borderRadius: 24,
          borderTopWidth: 1,
          bottom: 12,
          elevation: 8,
          height: 76,
          left: 13,
          position: 'absolute',
          right: 13,
          shadowColor: '#5B4435',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.13,
          shadowRadius: 14,
        },
        sceneStyle: { backgroundColor: colors.paper },
      }}
    >
      {(['index', 'recipes', 'shopping', 'ours'] as const).map((name, index) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: ['餐桌', '菜谱', '采购', '我们的'][index],
            tabBarIcon: ({ focused }) => <TabGlyph active={focused} />,
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  glyph: {
    borderColor: colors.inactive,
    borderRadius: 6,
    borderWidth: 1.5,
    height: 18,
    width: 18,
  },
  glyphActive: {
    backgroundColor: '#F6DFD9',
    borderColor: colors.tomatoDark,
  },
});
