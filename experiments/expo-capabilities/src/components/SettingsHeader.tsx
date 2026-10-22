import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';

export function SettingsHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityLabel="返回" onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>‹</Text>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} style={styles.action}><Text style={styles.actionText}>{action}</Text></Pressable>
      ) : <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', height: 45, justifyContent: 'space-between' },
  back: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 14, borderWidth: 1, height: 42, justifyContent: 'center', width: 42 },
  backText: { color: colors.cocoa, fontSize: 21, lineHeight: 24 },
  title: { color: colors.cocoa, fontSize: 18, fontWeight: '700' },
  action: { alignItems: 'center', height: 42, justifyContent: 'center', width: 42 },
  actionText: { color: colors.tomatoDark, fontSize: 11, fontWeight: '700' },
  spacer: { height: 42, width: 42 },
});
