import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProfile } from '@/profile-context';
import { colors, shadow } from '@/theme';

export function EditProfileSheet({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { displayName, defaultServings, updateProfile } = useProfile();
  const [name, setName] = useState(displayName);
  const [servings, setServings] = useState(defaultServings);

  const save = () => {
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 20) {
      Alert.alert('昵称不符合要求', '请输入 1–20 个字符。');
      return;
    }
    updateProfile({ displayName: trimmed, defaultServings: servings });
    onClose();
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modal}>
        <Pressable accessibilityLabel="关闭编辑资料" onPress={onClose} style={styles.backdrop} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View><Text style={styles.eyebrow}>个人资料</Text><Text style={styles.title}>编辑我的资料</Text></View>
            <Pressable accessibilityLabel="关闭" onPress={onClose} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable>
          </View>
          <Pressable onPress={() => Alert.alert('头像功能', '当前页面只演示视觉与交互，图片上传将在接入数据时实现。')} style={styles.avatarRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>虾</Text></View>
            <View><Text style={styles.avatarTitle}>小虾头像</Text><Text style={styles.avatarAction}>更换头像</Text></View>
          </Pressable>
          <View style={styles.field}>
            <Text style={styles.label}>昵称 · 1–20 个字符</Text>
            <View style={styles.inputShell}>
              <TextInput accessibilityLabel="昵称" maxLength={20} onChangeText={setName} style={styles.input} value={name} />
              <Text style={styles.counter}>{name.length} / 20</Text>
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>默认用餐人数</Text>
            <View style={styles.stepperRow}>
              <Text style={styles.stepperLabel}>新建菜单默认人数</Text>
              <View style={styles.stepper}>
                <Pressable accessibilityLabel="减少人数" onPress={() => setServings((value) => Math.max(1, value - 1))} style={styles.stepButton}><Text>−</Text></Pressable>
                <Text style={styles.servings}>{servings}</Text>
                <Pressable accessibilityLabel="增加人数" onPress={() => setServings((value) => Math.min(20, value + 1))} style={styles.stepButton}><Text>＋</Text></Pressable>
              </View>
            </View>
          </View>
          <Pressable accessibilityRole="button" onPress={save} style={styles.save}><Text style={styles.saveText}>保存修改</Text></Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { backgroundColor: 'rgba(68,55,47,0.28)', bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  sheet: { ...shadow, backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, minHeight: 405, paddingHorizontal: 20, paddingTop: 10 },
  handle: { alignSelf: 'center', backgroundColor: '#DED3C8', borderRadius: 99, height: 4, width: 36 },
  header: { alignItems: 'flex-start', flexDirection: 'row', height: 55, justifyContent: 'space-between', paddingTop: 16 },
  eyebrow: { color: colors.muted, fontSize: 9 },
  title: { color: colors.cocoa, fontSize: 20, fontWeight: '700', paddingTop: 4 },
  close: { alignItems: 'center', backgroundColor: colors.paper, borderColor: colors.border, borderRadius: 12, borderWidth: 1, height: 38, justifyContent: 'center', width: 38 },
  closeText: { color: colors.cocoa, fontSize: 18 },
  avatarRow: { alignItems: 'center', backgroundColor: '#F8EFE5', borderRadius: 17, flexDirection: 'row', gap: 12, marginTop: 15, padding: 13 },
  avatar: { alignItems: 'center', backgroundColor: colors.yolk, borderRadius: 18, height: 54, justifyContent: 'center', width: 54 },
  avatarText: { color: colors.tomatoDark, fontSize: 25, fontWeight: '900' },
  avatarTitle: { color: colors.cocoa, fontSize: 12, fontWeight: '700' },
  avatarAction: { color: colors.tomatoDark, fontSize: 9, fontWeight: '700', paddingTop: 4 },
  field: { paddingTop: 14 },
  label: { color: colors.muted, fontSize: 9, paddingLeft: 2 },
  inputShell: { alignItems: 'center', backgroundColor: colors.paper, borderColor: 'rgba(68,55,47,0.13)', borderRadius: 14, borderWidth: 1, flexDirection: 'row', height: 47, marginTop: 6, paddingHorizontal: 13 },
  input: { color: colors.cocoa, flex: 1, fontSize: 12, paddingVertical: 0 },
  counter: { color: colors.muted, fontSize: 9 },
  stepperRow: { alignItems: 'center', backgroundColor: colors.paper, borderColor: 'rgba(68,55,47,0.13)', borderRadius: 14, borderWidth: 1, flexDirection: 'row', height: 47, justifyContent: 'space-between', marginTop: 6, paddingHorizontal: 13 },
  stepperLabel: { color: colors.cocoa, fontSize: 12 },
  stepper: { alignItems: 'center', flexDirection: 'row', gap: 14 },
  stepButton: { alignItems: 'center', backgroundColor: colors.surface, borderColor: 'rgba(68,55,47,0.13)', borderRadius: 9, borderWidth: 1, height: 28, justifyContent: 'center', width: 28 },
  servings: { color: colors.cocoa, fontSize: 12, fontWeight: '700', minWidth: 14, textAlign: 'center' },
  save: { alignItems: 'center', backgroundColor: colors.tomatoDark, borderRadius: 15, height: 49, justifyContent: 'center', marginTop: 13 },
  saveText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
