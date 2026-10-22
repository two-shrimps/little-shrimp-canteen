import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, shadow } from '@/theme';

export function ProfileCard({
  name,
  detail,
  action,
  onAction,
}: {
  name: string;
  detail: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <LinearGradient
      colors={['#F7DFD8', '#FFF5EA', '#F5E7BA']}
      end={{ x: 1, y: 0.8 }}
      locations={[0, 0.64, 1]}
      start={{ x: 0, y: 0 }}
      style={styles.card}
    >
      <View style={styles.avatar}><Text style={styles.avatarText}>虾</Text></View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>我的食堂</Text>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
      {action && (
        <Pressable onPress={onAction} style={styles.action}><Text style={styles.actionText}>{action}</Text></Pressable>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { ...shadow, alignItems: 'center', borderColor: 'rgba(68,55,47,0.09)', borderRadius: 20, borderWidth: 1, flexDirection: 'row', gap: 13, minHeight: 98, padding: 17 },
  avatar: { alignItems: 'center', backgroundColor: colors.yolk, borderRadius: 21, height: 62, justifyContent: 'center', width: 62 },
  avatarText: { color: colors.tomatoDark, fontSize: 25, fontWeight: '900' },
  copy: { flex: 1 },
  eyebrow: { color: colors.muted, fontSize: 9 },
  name: { color: colors.cocoa, fontSize: 17, fontWeight: '700', paddingVertical: 4 },
  detail: { color: colors.muted, fontSize: 9 },
  action: { alignItems: 'center', backgroundColor: colors.surface, borderColor: 'rgba(141,68,54,0.15)', borderRadius: 11, borderWidth: 1, height: 36, justifyContent: 'center', paddingHorizontal: 10 },
  actionText: { color: colors.tomatoDark, fontSize: 9, fontWeight: '800' },
});
