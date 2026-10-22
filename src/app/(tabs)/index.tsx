import { useState } from 'react';
import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, shadow } from '@/theme';
import { CalendarSheet } from '@/components/CalendarSheet';

const tablePhoto = require('../../../assets/figma/home-table.png');

export default function HomeScreen() {
  const [calendarVisible, setCalendarVisible] = useState(false);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.date}>10 月 21 日 · 星期三</Text>
            <Text style={styles.greeting}>晚上好，今晚也要好好吃饭。</Text>
          </View>
          <Pressable accessibilityLabel="打开用户与设置" onPress={() => router.push('/settings')} style={styles.avatar}>
            <Text style={styles.avatarText}>虾</Text>
          </Pressable>
        </View>

        <View style={styles.dateTabs}>
          <DateChip active label="今晚" />
          <DateChip label="明天" />
          <DateChip label="更多日期" onPress={() => setCalendarVisible(true)} />
        </View>

        <View style={styles.menuCard}>
          <View style={styles.menuHero}>
            <Image source={tablePhoto} style={styles.menuImage} />
            <View style={styles.overlay} />
            <Text style={styles.peopleChip}>今晚 · 2 人</Text>
            <View style={styles.menuTitleBlock}>
              <Text style={styles.menuTitle}>番茄牛腩小餐桌</Text>
              <Text style={styles.menuMeta}>预计 45 分钟 · 约 680 kcal / 人</Text>
            </View>
          </View>
          <View style={styles.menuFooter}>
            <View style={styles.dishes}>
              {['番茄牛腩', '白灼菜心', '米饭'].map((dish) => (
                <Text key={dish} style={styles.dishChip}>{dish}</Text>
              ))}
            </View>
            <Text style={styles.adjust}>调整菜单</Text>
          </View>
        </View>

        <Pressable style={styles.aiCard}>
          <View style={styles.potIcon}><View style={styles.potBody} /></View>
          <View style={styles.aiCopy}>
            <Text style={styles.aiTitle}>这顿搭配刚刚好</Text>
            <Text style={styles.aiBody}>蔬菜和蛋白质都照顾到了，可以准备采购啦。</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <View style={styles.nextHeader}>
          <Text style={styles.nextTitle}>接下来</Text>
          <Text style={styles.nextMeta}>一个账号轻松完成</Text>
        </View>
        <View style={styles.nextCards}>
          <TaskCard background={colors.tomatoSoft} eyebrow="采购清单" title="还有 6 样待买" meta="预计约 ¥86" />
          <TaskCard background={colors.skySoft} eyebrow="菜谱仓库" title="找一道新菜" meta="本周收藏了 3 道" />
        </View>
      </ScrollView>
      <CalendarSheet visible={calendarVisible} onClose={() => setCalendarVisible(false)} />
    </SafeAreaView>
  );
}

function DateChip({ label, active = false, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable accessibilityRole={onPress ? 'button' : undefined} onPress={onPress}>
      <Text style={[styles.dateChip, active && styles.dateChipActive]}>{label}</Text>
    </Pressable>
  );
}

function TaskCard({ background, eyebrow, title, meta }: { background: string; eyebrow: string; title: string; meta: string }) {
  return (
    <View style={[styles.taskCard, { backgroundColor: background }]}>
      <Text style={styles.taskEyebrow}>{eyebrow}</Text>
      <Text style={styles.taskTitle}>{title}</Text>
      <Text style={styles.taskMeta}>{meta}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 118 },
  header: { flexDirection: 'row', justifyContent: 'space-between', minHeight: 92 },
  headerCopy: { width: 255 },
  date: { color: colors.muted, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  greeting: { color: colors.cocoa, fontSize: 27, fontWeight: '700', letterSpacing: -0.8, lineHeight: 35, paddingTop: 5 },
  avatar: { alignItems: 'center', backgroundColor: colors.yolk, borderColor: 'rgba(68,55,47,0.12)', borderRadius: 23, borderWidth: 1, height: 46, justifyContent: 'center', width: 46 },
  avatarText: { color: colors.tomatoDark, fontSize: 16, fontWeight: '800' },
  dateTabs: { flexDirection: 'row', gap: 8, height: 58, paddingTop: 22 },
  dateChip: { backgroundColor: 'rgba(255,255,255,0.54)', borderColor: 'rgba(68,55,47,0.08)', borderRadius: 999, borderWidth: 1, color: colors.muted, fontSize: 13, lineHeight: 18, overflow: 'hidden', paddingHorizontal: 13, paddingVertical: 8 },
  dateChipActive: { backgroundColor: colors.tomatoDark, borderColor: colors.tomatoDark, color: colors.surface },
  menuCard: { ...shadow, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 24, borderWidth: 1, height: 297, overflow: 'hidden', marginTop: 16 },
  menuHero: { height: 230, justifyContent: 'flex-end', overflow: 'hidden' },
  menuImage: { bottom: 0, height: 230, left: 0, position: 'absolute', resizeMode: 'cover', right: 0, top: 0, width: '100%' },
  overlay: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0, backgroundColor: 'rgba(45,31,23,0.24)' },
  peopleChip: { backgroundColor: 'rgba(255,252,247,0.90)', borderRadius: 999, color: colors.cocoa, fontSize: 12, left: 16, overflow: 'hidden', paddingHorizontal: 11, paddingVertical: 8, position: 'absolute', top: 16 },
  menuTitleBlock: { paddingBottom: 18, paddingHorizontal: 18 },
  menuTitle: { color: colors.white, fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  menuMeta: { color: colors.white, fontSize: 13, marginTop: 4, opacity: 0.88 },
  menuFooter: { alignItems: 'center', flexDirection: 'row', height: 65, justifyContent: 'space-between', paddingHorizontal: 18 },
  dishes: { flexDirection: 'row', gap: 7 },
  dishChip: { backgroundColor: colors.chip, borderRadius: 999, color: colors.cocoa, fontSize: 11, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 7 },
  adjust: { color: colors.tomatoDark, fontSize: 12 },
  aiCard: { alignItems: 'center', backgroundColor: colors.sageSoft, borderColor: 'rgba(83,111,74,0.12)', borderRadius: 20, borderWidth: 1, flexDirection: 'row', gap: 12, marginTop: 14, minHeight: 89, padding: 14 },
  potIcon: { alignItems: 'center', backgroundColor: colors.sage, borderRadius: 15, height: 46, justifyContent: 'center', width: 46 },
  potBody: { backgroundColor: '#FFFAF2', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, borderTopLeftRadius: 4, borderTopRightRadius: 4, height: 13, width: 20 },
  aiCopy: { flex: 1 },
  aiTitle: { color: colors.cocoa, fontSize: 15, fontWeight: '700', lineHeight: 21 },
  aiBody: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  chevron: { color: colors.tomatoDark, fontSize: 21 },
  nextHeader: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 1, paddingTop: 21 },
  nextTitle: { color: colors.cocoa, fontSize: 18, fontWeight: '700' },
  nextMeta: { color: colors.muted, fontSize: 12 },
  nextCards: { flexDirection: 'row', gap: 10, paddingTop: 12 },
  taskCard: { borderColor: 'rgba(68,55,47,0.09)', borderRadius: 19, borderWidth: 1, flex: 1, minHeight: 99, padding: 14 },
  taskEyebrow: { color: colors.muted, fontSize: 12 },
  taskTitle: { color: colors.cocoa, fontSize: 16, fontWeight: '700', paddingTop: 8 },
  taskMeta: { color: colors.muted, fontSize: 11, paddingTop: 4 },
});
