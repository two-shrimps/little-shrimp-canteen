import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EditProfileSheet } from '@/components/EditProfileSheet';
import { LogoutSheet } from '@/components/LogoutSheet';
import { ProfileCard } from '@/components/ProfileCard';
import { SettingsHeader } from '@/components/SettingsHeader';
import { useProfile } from '@/profile-context';
import { colors } from '@/theme';

export default function SettingsScreen() {
  const { displayName, defaultServings } = useProfile();
  const [editing, setEditing] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsHeader title="用户与设置" />
        <View style={styles.profileWrap}>
          <ProfileCard action="编辑资料" detail="从 2026 年 10 月开始记录" name={displayName} onAction={() => setEditing(true)} />
        </View>

        <SectionTitle>餐桌设置</SectionTitle>
        <View style={styles.section}>
          <SettingsRow icon="人" iconColor="tomato" subtitle="只影响新建菜单和份量" title="默认用餐人数" trailing={`${defaultServings} 人`} onPress={() => setEditing(true)} />
          <SettingsRow icon="桌" iconColor="sage" subtitle="管理偏好、评分和主厨身份" title="同桌档案" trailing="1 位" onPress={() => router.push('/diners')} />
        </View>

        <SectionTitle>账号信息</SectionTitle>
        <View style={styles.infoSection}>
          <InfoRow label="登录邮箱" value="katrinasayhello@gmail.com" />
          <InfoRow label="登录方式" value="Google" last />
        </View>

        <SectionTitle>关于与支持</SectionTitle>
        <View style={styles.section}>
          <SettingsRow icon="隐" iconColor="tomato" title="隐私说明与用户协议" onPress={() => Alert.alert('内部测试说明', '这是内部原型。正式隐私政策与用户协议将在公开测试前提供。')} />
          <SettingsRow icon="信" iconColor="sage" title="意见反馈" onPress={() => Alert.alert('意见反馈', '支持邮箱尚未配置，接入环境配置后将调用系统邮件。')} />
        </View>

        <Pressable onPress={() => setConfirmingLogout(true)} style={styles.logout}><Text style={styles.logoutText}>退出登录</Text></Pressable>
        <Text style={styles.version}>Little Shrimp Canteen · v0.1.0</Text>
      </ScrollView>
      {editing && <EditProfileSheet onClose={() => setEditing(false)} />}
      <LogoutSheet onClose={() => setConfirmingLogout(false)} visible={confirmingLogout} />
    </SafeAreaView>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function SettingsRow({ icon, iconColor, title, subtitle, trailing, onPress }: { icon: string; iconColor: 'tomato' | 'sage'; title: string; subtitle?: string; trailing?: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.settingsRow}>
      <Text style={[styles.icon, iconColor === 'sage' && styles.iconSage]}>{icon}</Text>
      <View style={styles.rowCopy}><Text style={styles.rowTitle}>{title}</Text>{subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}</View>
      {trailing && <Text style={styles.trailing}>{trailing}</Text>}
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function InfoRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return <View style={[styles.infoRow, last && styles.infoRowLast]}><Text style={styles.infoLabel}>{label}</Text><Text numberOfLines={1} style={styles.infoValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.paper },
  content: { paddingBottom: 28, paddingHorizontal: 18, paddingTop: 5 },
  profileWrap: { paddingTop: 14 },
  sectionTitle: { color: colors.muted, fontSize: 10, fontWeight: '700', paddingLeft: 2, paddingTop: 18 },
  section: { backgroundColor: colors.surface, borderColor: 'rgba(68,55,47,0.09)', borderRadius: 20, borderWidth: 1, marginTop: 8, overflow: 'hidden' },
  settingsRow: { alignItems: 'center', borderBottomColor: 'rgba(68,55,47,0.08)', borderBottomWidth: 1, flexDirection: 'row', gap: 10, minHeight: 57, paddingHorizontal: 13, paddingVertical: 9 },
  icon: { backgroundColor: '#F6E7DF', borderRadius: 10, color: colors.tomatoDark, fontSize: 11, fontWeight: '900', height: 32, lineHeight: 32, overflow: 'hidden', textAlign: 'center', width: 32 },
  iconSage: { backgroundColor: '#E8EFE3', color: '#5C7353' },
  rowCopy: { flex: 1 },
  rowTitle: { color: colors.cocoa, fontSize: 12, fontWeight: '700' },
  rowSubtitle: { color: colors.muted, fontSize: 9, paddingTop: 3 },
  trailing: { color: colors.muted, fontSize: 10 },
  chevron: { color: '#AA9C93', fontSize: 17 },
  infoSection: { backgroundColor: colors.surface, borderColor: 'rgba(68,55,47,0.09)', borderRadius: 20, borderWidth: 1, marginTop: 8, paddingHorizontal: 13 },
  infoRow: { alignItems: 'center', borderBottomColor: 'rgba(68,55,47,0.08)', borderBottomWidth: 1, flexDirection: 'row', height: 50, justifyContent: 'space-between' },
  infoRowLast: { borderBottomWidth: 0 },
  infoLabel: { color: colors.cocoa, fontSize: 11 },
  infoValue: { color: colors.muted, fontSize: 9, fontWeight: '600', maxWidth: 190 },
  logout: { alignItems: 'center', backgroundColor: '#FFF5F1', borderColor: 'rgba(184,92,79,0.18)', borderRadius: 15, borderWidth: 1, height: 48, justifyContent: 'center', marginTop: 17 },
  logoutText: { color: '#B85C4F', fontSize: 16, fontWeight: '700' },
  version: { color: '#A29389', fontSize: 8, paddingTop: 12, textAlign: 'center' },
});
