import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingsHeader } from '@/components/SettingsHeader';
import { colors, shadow } from '@/theme';

export default function DinersScreen() {
  const edit = () => Alert.alert('同桌资料', '当前页面先完成 Figma 视觉和入口，编辑表单将在接入数据时实现。');
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <SettingsHeader action="新增" onAction={edit} title="同桌档案" />
        <View style={styles.intro}><Text style={styles.introTitle}>一起吃饭的人，也值得被记住</Text><Text style={styles.introBody}>同桌档案无需注册账号，你可以代录偏好和评分。</Text></View>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.avatar}><Text style={styles.avatarText}>她</Text></View>
            <View style={styles.dinerCopy}><Text style={styles.dinerName}>她</Text><Text style={styles.dinerMeta}>常用同桌 · 18 次共同用餐</Text></View>
            <Pressable onPress={edit}><Text style={styles.edit}>编辑</Text></Pressable>
          </View>
          <View style={styles.tags}>{['少辣', '喜欢番茄', '不爱香菜', '标准食量'].map((tag) => <Text key={tag} style={styles.tag}>{tag}</Text>)}</View>
          <View style={styles.stats}>
            <Stat label="平均评分" value="4.7" /><Stat label="共同喜欢" value="12" /><Stat label="担任主厨" value="7" />
          </View>
        </View>
        <Pressable onPress={edit} style={styles.add}><Text style={styles.addText}>＋ 新增同桌档案</Text></Pressable>
        <Text style={styles.note}>以后邀请好友加入食堂时，可以让对方认领这份档案，并保留已经记录的评分和偏好。</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.paper },
  content: { paddingBottom: 32, paddingHorizontal: 18, paddingTop: 5 },
  intro: { backgroundColor: colors.surface, borderColor: 'rgba(68,55,47,0.09)', borderRadius: 17, borderWidth: 1, marginTop: 14, padding: 15 },
  introTitle: { color: colors.cocoa, fontSize: 15, fontWeight: '700' },
  introBody: { color: colors.muted, fontSize: 9, paddingTop: 5 },
  card: { ...shadow, backgroundColor: colors.surface, borderColor: 'rgba(68,55,47,0.09)', borderRadius: 20, borderWidth: 1, marginTop: 11, padding: 15 },
  cardHeader: { alignItems: 'center', flexDirection: 'row' },
  avatar: { alignItems: 'center', backgroundColor: colors.sage, borderRadius: 15, height: 46, justifyContent: 'center', width: 46 },
  avatarText: { color: colors.surface, fontSize: 13, fontWeight: '800' },
  dinerCopy: { flex: 1, paddingLeft: 11 },
  dinerName: { color: colors.cocoa, fontSize: 13, fontWeight: '700' },
  dinerMeta: { color: colors.muted, fontSize: 9, paddingTop: 3 },
  edit: { color: colors.tomatoDark, fontSize: 10, fontWeight: '700', padding: 6 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingTop: 11 },
  tag: { backgroundColor: '#F5EDE4', borderRadius: 999, color: colors.muted, fontSize: 8, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 6 },
  stats: { borderTopColor: 'rgba(68,55,47,0.08)', borderTopWidth: 1, flexDirection: 'row', marginTop: 12, paddingTop: 11 },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { color: colors.cocoa, fontSize: 12, fontWeight: '700' },
  statLabel: { color: colors.muted, fontSize: 8, paddingTop: 3 },
  add: { alignItems: 'center', borderColor: 'rgba(141,68,54,0.27)', borderRadius: 15, borderStyle: 'dashed', borderWidth: 1, height: 48, justifyContent: 'center', marginTop: 12 },
  addText: { color: colors.tomatoDark, fontSize: 16, fontWeight: '700' },
  note: { backgroundColor: colors.skySoft, borderRadius: 15, color: '#58717B', fontSize: 9, lineHeight: 14, marginTop: 14, overflow: 'hidden', paddingHorizontal: 13, paddingVertical: 12 },
});
