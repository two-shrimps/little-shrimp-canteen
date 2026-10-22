import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, shadow } from '@/theme';

const recipes = [
  { title: '番茄牛腩', meta: '80 分钟 · 中等\n做过 2 次', note: '共同 4.8 分', image: require('../../../assets/figma/recipe-beef.png') },
  { title: '香煎鸡胸沙拉', meta: '25 分钟 · 简单\n还没做过', note: '她想吃', image: require('../../../assets/figma/recipe-chicken.png') },
  { title: '家常豆腐', meta: '20 分钟 · 简单\n做过 4 次', note: '共同 4.5 分', image: require('../../../assets/figma/recipe-tofu.png') },
  { title: '白灼菜心', meta: '12 分钟 · 简单\n做过 1 次', note: '适合今晚', image: require('../../../assets/figma/recipe-beef.png') },
];

export default function RecipesScreen() {
  const openImport = () => router.push('/capabilities');

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader eyebrow="我们的菜谱" title="今天想做什么？" onAdd={openImport} />
        <View style={styles.search}>
          <View style={styles.searchIcon} />
          <Text style={styles.searchText}>搜索菜名或家里已有的食材</Text>
        </View>
        <View style={styles.filters}>
          {['共同喜欢', '30 分钟', '清淡', '做过'].map((label, index) => (
            <Text key={label} style={[styles.filter, index === 0 && styles.filterActive]}>{label}</Text>
          ))}
        </View>
        <View style={styles.grid}>
          {recipes.map((recipe) => (
            <View key={recipe.title} style={styles.card}>
              <Image source={recipe.image} style={styles.cardImage} />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{recipe.title}</Text>
                <Text style={styles.cardMeta}>{recipe.meta}</Text>
                <View style={styles.cardAction}>
                  <Text style={styles.cardNote}>{recipe.note}</Text>
                  <Pressable style={styles.plus}><Text style={styles.plusText}>＋</Text></Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <Pressable accessibilityRole="button" onPress={openImport} style={styles.importButton}>
        <Text style={styles.importText}>从截图导入菜谱</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 120 },
  search: { alignItems: 'center', backgroundColor: colors.surface, borderColor: 'rgba(68,55,47,0.11)', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 8, height: 44, marginTop: 15, paddingHorizontal: 13 },
  searchIcon: { borderColor: colors.muted, borderRadius: 8, borderWidth: 1.5, height: 15, width: 15 },
  searchText: { color: colors.muted, fontSize: 11 },
  filters: { flexDirection: 'row', gap: 7, height: 38, paddingTop: 11 },
  filter: { backgroundColor: '#F5EDE4', borderRadius: 999, color: colors.muted, fontSize: 9, fontWeight: '700', lineHeight: 27, overflow: 'hidden', paddingHorizontal: 9 },
  filterActive: { backgroundColor: colors.tomatoDark, color: colors.white },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingTop: 13 },
  card: { ...shadow, backgroundColor: colors.surface, borderColor: 'rgba(68,55,47,0.09)', borderRadius: 20, borderWidth: 1, height: 243, overflow: 'hidden', width: '48.5%' },
  cardImage: { height: 128, resizeMode: 'cover', width: '100%' },
  cardBody: { paddingBottom: 12, paddingHorizontal: 11, paddingTop: 11 },
  cardTitle: { color: colors.cocoa, fontSize: 13, fontWeight: '700' },
  cardMeta: { color: colors.muted, fontSize: 9, lineHeight: 13.5, paddingTop: 4 },
  cardAction: { alignItems: 'flex-end', flexDirection: 'row', height: 40, justifyContent: 'space-between', paddingTop: 9 },
  cardNote: { color: colors.tomatoDark, fontSize: 9 },
  plus: { alignItems: 'center', backgroundColor: colors.tomatoDark, borderRadius: 10, height: 31, justifyContent: 'center', width: 31 },
  plusText: { color: colors.white, fontSize: 18 },
  importButton: { ...shadow, alignItems: 'center', backgroundColor: colors.tomatoDark, borderRadius: 14, bottom: 98, height: 44, justifyContent: 'center', paddingHorizontal: 14, position: 'absolute', right: 20 },
  importText: { color: colors.white, fontSize: 11, fontWeight: '700' },
});
