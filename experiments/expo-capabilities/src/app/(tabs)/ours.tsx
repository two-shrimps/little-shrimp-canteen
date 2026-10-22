import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme';

const photo = require('../../../assets/figma/cooking-record.png');

export default function OursScreen() {
  return (
    <SafeAreaView edges={[]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image source={photo} style={styles.heroImage} />
          <View style={styles.overlay} />
          <Pressable accessibilityLabel="打开用户与设置" onPress={() => router.push('/settings')} style={styles.settingsButton}>
            <Text style={styles.settingsText}>设置</Text>
          </Pressable>
          <View style={styles.heroCopy}>
            <Text style={styles.date}>10 月 21 日 · 周三晚餐</Text>
            <Text style={styles.title}>番茄牛腩 · 第 3 次</Text>
          </View>
        </View>
        <View style={styles.body}>
          <Text style={styles.chef}>主厨：我 · 协作：她 · 实际用时 58 分钟</Text>
          <View style={styles.ratings}>
            <Rating avatar="我" label="我的评分" value="4.5" color={colors.tomato} stars="★★★★" />
            <Rating avatar="她" label="她的评分" value="5.0" color={colors.sage} stars="★★★★★" />
          </View>
          <Text style={styles.quote}>“这次牛腩终于够软了，汤汁特别适合拌饭。”</Text>
          <Text style={styles.reminder}><Text style={styles.reminderLead}>下次记得：</Text>糖再少一点，番茄晚十分钟放。</Text>
          <View style={styles.stats}>
            <Stat value="58 分钟" label="实际用时" />
            <Stat value="¥54.30" label="本餐采购" />
            <Stat value="愿意" label="再次复做" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Rating({ avatar, label, value, color, stars }: { avatar: string; label: string; value: string; color: string; stars: string }) {
  return (
    <View style={styles.rating}>
      <View style={styles.ratingHeader}><Text style={[styles.ratingAvatar, { backgroundColor: color }]}>{avatar}</Text><Text style={styles.ratingLabel}>{label}</Text></View>
      <Text style={styles.ratingValue}>{value} <Text style={styles.stars}>{stars}</Text></Text>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  content: { paddingBottom: 112 },
  hero: { height: 284, justifyContent: 'flex-end' },
  heroImage: { bottom: 0, height: 284, left: 0, position: 'absolute', resizeMode: 'cover', right: 0, top: 0, width: '100%' },
  overlay: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0, backgroundColor: 'rgba(40,25,18,0.23)' },
  heroCopy: { paddingBottom: 20, paddingHorizontal: 19 },
  settingsButton: { alignItems: 'center', backgroundColor: 'rgba(255,252,247,0.9)', borderRadius: 18, height: 38, justifyContent: 'center', position: 'absolute', right: 18, top: 48, width: 48 },
  settingsText: { color: colors.cocoa, fontSize: 10, fontWeight: '700' },
  date: { color: colors.white, fontSize: 9, opacity: 0.88 },
  title: { color: colors.white, fontSize: 24, fontWeight: '700', paddingTop: 5 },
  body: { paddingHorizontal: 18, paddingTop: 16 },
  chef: { color: colors.muted, fontSize: 9 },
  ratings: { flexDirection: 'row', gap: 9, paddingTop: 12 },
  rating: { backgroundColor: colors.surface, borderColor: 'rgba(68,55,47,0.09)', borderRadius: 20, borderWidth: 1, flex: 1, height: 81, paddingHorizontal: 12, paddingVertical: 11 },
  ratingHeader: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  ratingAvatar: { borderRadius: 13, color: colors.cocoa, fontSize: 8, fontWeight: '800', height: 25, lineHeight: 25, overflow: 'hidden', textAlign: 'center', width: 25 },
  ratingLabel: { color: colors.cocoa, fontSize: 10 },
  ratingValue: { color: colors.cocoa, fontSize: 17, paddingTop: 7 },
  stars: { color: colors.tomato, fontSize: 10, letterSpacing: 1 },
  quote: { backgroundColor: '#F7EEE5', borderRadius: 14, color: colors.cocoa, fontSize: 10, lineHeight: 15, marginTop: 10, overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 11 },
  reminder: { backgroundColor: colors.yolkSoft, borderRadius: 14, color: colors.cocoa, fontSize: 10, lineHeight: 15, marginTop: 10, overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 11 },
  reminderLead: { color: colors.tomatoDark, fontWeight: '700' },
  stats: { flexDirection: 'row', gap: 8, paddingTop: 10 },
  stat: { alignItems: 'center', backgroundColor: '#F5EDE4', borderRadius: 11, flex: 1, padding: 8 },
  statValue: { color: colors.cocoa, fontSize: 11, fontWeight: '700' },
  statLabel: { color: colors.muted, fontSize: 8, paddingTop: 2 },
});
