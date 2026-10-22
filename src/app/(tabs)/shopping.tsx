import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, shadow } from '@/theme';

const sections = [
  { title: '蔬菜水果', count: '4 样', items: [
    { name: '番茄', detail: '计划 5 个 · 实际 620g', amount: '¥8.60', checked: true },
    { name: '菜心', detail: '菜谱需要 350g', amount: '', checked: false },
  ] },
  { title: '肉蛋奶', count: '3 样', items: [
    { name: '牛腩', detail: '计划 500g · 实际 620g', amount: '¥42.80', checked: true },
    { name: '鸡蛋', detail: '菜谱需要 2 个', amount: '家里已有', checked: false, atHome: true },
  ] },
];

export default function ShoppingScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader eyebrow="今晚的小餐桌" title="采购清单" onAdd={() => undefined} />
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>已经装进篮子 6 样</Text>
            <Text style={styles.progressCount}>6 / 10</Text>
          </View>
          <View style={styles.track}><View style={styles.progress} /></View>
        </View>
        {sections.map((section) => (
          <View key={section.title}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionCount}>{section.count}</Text>
            </View>
            {section.items.map((item) => (
              <View key={item.name} style={styles.row}>
                <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                  {item.checked && <Text style={styles.check}>✓</Text>}
                </View>
                <View style={styles.rowCopy}>
                  <Text style={[styles.itemName, item.checked && styles.itemDone]}>{item.name}</Text>
                  <Text style={styles.itemDetail}>{item.detail}</Text>
                </View>
                <Text style={[styles.amount, item.atHome && styles.atHome]}>{item.amount}</Text>
              </View>
            ))}
          </View>
        ))}
        <Pressable style={styles.temporary}><Text style={styles.temporaryText}>＋　临时加一样东西</Text></Pressable>
      </ScrollView>
      <View style={styles.checkout}>
        <View><Text style={styles.checkoutLabel}>当前合计</Text><Text style={styles.checkoutAmount}>¥54.30</Text></View>
        <Pressable style={styles.checkoutButton}><Text style={styles.checkoutText}>完成采购</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 180 },
  progressCard: { backgroundColor: '#EDF3E8', borderColor: 'rgba(83,107,74,0.10)', borderRadius: 20, borderWidth: 1, marginTop: 15, paddingHorizontal: 13, paddingVertical: 12 },
  progressHeader: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' },
  progressTitle: { color: colors.cocoa, fontSize: 12, fontWeight: '700' },
  progressCount: { color: '#5E7656', fontSize: 10, fontWeight: '800' },
  track: { backgroundColor: 'rgba(68,55,47,0.09)', borderRadius: 99, height: 6, marginTop: 8, overflow: 'hidden' },
  progress: { backgroundColor: colors.sage, height: 6, width: '60%' },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2, paddingTop: 15 },
  sectionTitle: { color: colors.cocoa, fontSize: 12, fontWeight: '700' },
  sectionCount: { color: colors.muted, fontSize: 9 },
  row: { alignItems: 'center', borderBottomColor: 'rgba(68,55,47,0.09)', borderBottomWidth: 1, flexDirection: 'row', gap: 9, minHeight: 58 },
  checkbox: { borderColor: '#DED3C8', borderRadius: 9, borderWidth: 1, height: 27, width: 27 },
  checkboxChecked: { alignItems: 'center', backgroundColor: colors.sage, borderColor: colors.sage, justifyContent: 'center' },
  check: { color: colors.white, fontSize: 12, fontWeight: '900' },
  rowCopy: { flex: 1 },
  itemName: { color: colors.cocoa, fontSize: 12, fontWeight: '700' },
  itemDone: { color: '#998B82', textDecorationLine: 'line-through' },
  itemDetail: { color: colors.muted, fontSize: 9, paddingTop: 2 },
  amount: { color: colors.cocoa, fontSize: 10 },
  atHome: { backgroundColor: '#E7EFDF', borderRadius: 8, color: '#58704F', fontSize: 8, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 6, paddingVertical: 4 },
  temporary: { borderColor: 'rgba(141,68,54,0.28)', borderRadius: 13, borderStyle: 'dashed', borderWidth: 1, height: 41, justifyContent: 'center', marginTop: 10, paddingHorizontal: 12 },
  temporaryText: { color: colors.tomatoDark, fontSize: 10 },
  checkout: { ...shadow, alignItems: 'center', backgroundColor: 'rgba(255,252,247,0.98)', borderRadius: 21, bottom: 98, flexDirection: 'row', height: 68, justifyContent: 'space-between', left: 13, paddingLeft: 15, paddingRight: 12, position: 'absolute', right: 13 },
  checkoutLabel: { color: colors.muted, fontSize: 8 },
  checkoutAmount: { color: colors.cocoa, fontSize: 18, fontWeight: '700', paddingTop: 3 },
  checkoutButton: { alignItems: 'center', backgroundColor: colors.tomatoDark, borderRadius: 15, height: 44, justifyContent: 'center', paddingHorizontal: 15 },
  checkoutText: { color: colors.white, fontSize: 16 },
});
