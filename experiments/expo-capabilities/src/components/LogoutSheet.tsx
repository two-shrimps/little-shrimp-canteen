import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, shadow } from '@/theme';

export function LogoutSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const logout = () => {
    onClose();
    Alert.alert('前端页面已完成', '当前未接认证服务，因此没有清除真实登录会话。');
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.modal}>
        <Pressable accessibilityLabel="关闭退出确认" onPress={onClose} style={styles.backdrop} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.handle} />
          <View style={styles.icon}><Text style={styles.iconText}>↗</Text></View>
          <Text style={styles.title}>要退出登录吗？</Text>
          <Text style={styles.body}>只会结束这台设备上的登录。你的云端菜谱、食堂和历史记录都不会删除。</Text>
          <View style={styles.safeState}><Text style={styles.safeText}>✓ 当前没有未同步的采购变更、图片上传或草稿，可以安全退出。</Text></View>
          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.secondary}><Text style={styles.secondaryText}>继续使用</Text></Pressable>
            <Pressable onPress={logout} style={styles.danger}><Text style={styles.dangerText}>退出登录</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { backgroundColor: 'rgba(68,55,47,0.28)', bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  sheet: { ...shadow, alignItems: 'center', backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, minHeight: 304, paddingHorizontal: 20, paddingTop: 13 },
  handle: { backgroundColor: '#DED3C8', borderRadius: 99, height: 4, width: 36 },
  icon: { alignItems: 'center', backgroundColor: '#F8E4DD', borderRadius: 19, height: 58, justifyContent: 'center', marginTop: 16, width: 58 },
  iconText: { color: '#B85C4F', fontSize: 24 },
  title: { color: colors.cocoa, fontSize: 20, fontWeight: '700', paddingTop: 12 },
  body: { color: colors.muted, fontSize: 10, lineHeight: 16, paddingTop: 7, textAlign: 'center', width: 290 },
  safeState: { alignSelf: 'stretch', backgroundColor: '#EDF3E8', borderRadius: 14, marginTop: 16, paddingHorizontal: 12, paddingVertical: 11 },
  safeText: { color: '#5C7353', fontSize: 9, lineHeight: 13 },
  actions: { alignSelf: 'stretch', flexDirection: 'row', gap: 8, paddingTop: 14 },
  secondary: { alignItems: 'center', backgroundColor: colors.surface, borderColor: 'rgba(68,55,47,0.14)', borderRadius: 14, borderWidth: 1, flex: 1, height: 48, justifyContent: 'center' },
  secondaryText: { color: colors.cocoa, fontSize: 16, fontWeight: '700' },
  danger: { alignItems: 'center', backgroundColor: '#B85C4F', borderRadius: 14, flex: 1, height: 48, justifyContent: 'center' },
  dangerText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
