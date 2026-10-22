import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, shadow } from './src/theme';

type TestStatus = 'idle' | 'running' | 'passed' | 'failed';
type CapabilityKey = 'library' | 'camera' | 'compression' | 'sharing';
type CapabilityState = { status: TestStatus; detail: string };

const INITIAL_CAPABILITIES: Record<CapabilityKey, CapabilityState> = {
  library: { status: 'idle', detail: '等待测试相册多选' },
  camera: { status: 'idle', detail: '等待测试相机拍摄' },
  compression: { status: 'idle', detail: '选择或拍摄图片后测试' },
  sharing: { status: 'idle', detail: '压缩图片后测试系统分享' },
};

const STATUS_LABEL: Record<TestStatus, string> = {
  idle: '未测试',
  running: '测试中',
  passed: '通过',
  failed: '失败',
};

export default function App() {
  const [assets, setAssets] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [compressedUri, setCompressedUri] = useState<string | null>(null);
  const [capabilities, setCapabilities] =
    useState<Record<CapabilityKey, CapabilityState>>(INITIAL_CAPABILITIES);

  const setCapability = (key: CapabilityKey, status: TestStatus, detail: string) => {
    setCapabilities((current) => ({ ...current, [key]: { status, detail } }));
  };

  const explainError = (error: unknown) =>
    error instanceof Error ? error.message : String(error);

  const askToOpenSettings = (message: string) => {
    Alert.alert('需要系统权限', message, [
      { text: '取消', style: 'cancel' },
      { text: '打开设置', onPress: () => void Linking.openSettings() },
    ]);
  };

  const pickImages = async () => {
    setCapability('library', 'running', '正在请求相册并打开选择器');
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setCapability('library', 'failed', '相册权限未授权');
        askToOpenSettings('请允许小虾食堂能力实验访问照片。');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 1,
      });
      if (result.canceled) {
        setCapability('library', 'idle', '用户取消了本次选择');
        return;
      }

      setAssets(result.assets);
      setCompressedUri(null);
      setCapability('library', 'passed', `成功读取 ${result.assets.length} 张图片`);
      setCapability('compression', 'idle', '图片已就绪，可以测试压缩');
      setCapability('sharing', 'idle', '请先生成压缩图片');
    } catch (error) {
      setCapability('library', 'failed', explainError(error));
    }
  };

  const takePhoto = async () => {
    setCapability('camera', 'running', '正在请求相机并打开拍摄界面');
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setCapability('camera', 'failed', '相机权限未授权');
        askToOpenSettings('请允许小虾食堂能力实验使用相机。');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 1,
      });
      if (result.canceled) {
        setCapability('camera', 'idle', '用户取消了本次拍摄');
        return;
      }

      setAssets(result.assets);
      setCompressedUri(null);
      setCapability('camera', 'passed', '照片已拍摄并返回应用');
      setCapability('compression', 'idle', '照片已就绪，可以测试压缩');
      setCapability('sharing', 'idle', '请先生成压缩图片');
    } catch (error) {
      setCapability('camera', 'failed', explainError(error));
    }
  };

  const compressFirstImage = async () => {
    const source = assets[0];
    if (!source) {
      Alert.alert('还没有图片', '请先从相册选择图片或拍摄照片。');
      return;
    }

    setCapability('compression', 'running', '正在缩放并编码 JPEG');
    try {
      const context = ImageManipulator.manipulate(source.uri, {
        maxWidth: 2048,
        maxHeight: 2048,
      });
      if (source.width > 1600) context.resize({ width: 1600 });

      const renderedImage = await context.renderAsync();
      const result = await renderedImage.saveAsync({
        compress: 0.72,
        format: SaveFormat.JPEG,
      });
      setCompressedUri(result.uri);
      setCapability(
        'compression',
        'passed',
        `生成 ${result.width} × ${result.height} JPEG`,
      );
      setCapability('sharing', 'idle', '压缩图片已就绪，可以测试分享');
    } catch (error) {
      setCapability('compression', 'failed', explainError(error));
    }
  };

  const shareCompressedImage = async () => {
    if (!compressedUri) {
      Alert.alert('还没有压缩图片', '请先运行图片压缩测试。');
      return;
    }

    setCapability('sharing', 'running', '正在检查并打开系统分享面板');
    try {
      if (!(await Sharing.isAvailableAsync())) {
        setCapability('sharing', 'failed', '当前设备不支持系统文件分享');
        return;
      }

      await Sharing.shareAsync(compressedUri, {
        dialogTitle: '分享小虾食堂测试图片',
        mimeType: 'image/jpeg',
        UTI: 'public.jpeg',
      });
      setCapability('sharing', 'passed', '系统分享面板已成功打开');
    } catch (error) {
      setCapability('sharing', 'failed', explainError(error));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>从截图导入菜谱</Text>
          <Text style={styles.title}>先选几张菜谱截图</Text>
          <Text style={styles.subtitle}>
            支持一次选择多张图片。这个页面也用于阶段 0 的真机能力验证。
          </Text>
        </View>

        <View style={styles.actions}>
          <ActionButton label="1. 相册多选" onPress={pickImages} />
          <ActionButton label="2. 相机拍摄" onPress={takePhoto} />
          <ActionButton label="3. 压缩首张图片" onPress={compressFirstImage} />
          <ActionButton label="4. 系统分享压缩图" onPress={shareCompressedImage} />
        </View>

        {assets.length > 0 && (
          <View style={styles.previewCard}>
            <Text style={styles.sectionTitle}>输入预览</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.previewList}
            >
              {assets.map((asset) => (
                <Image
                  key={asset.assetId ?? asset.uri}
                  source={{ uri: asset.uri }}
                  style={styles.previewImage}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {compressedUri && (
          <View style={styles.previewCard}>
            <Text style={styles.sectionTitle}>压缩结果</Text>
            <Image source={{ uri: compressedUri }} style={styles.compressedImage} />
          </View>
        )}

        <View style={styles.results}>
          <Text style={styles.sectionTitle}>测试结果</Text>
          <ResultRow label="相册多选" state={capabilities.library} />
          <ResultRow label="相机拍摄" state={capabilities.camera} />
          <ResultRow label="图片压缩" state={capabilities.compression} />
          <ResultRow label="系统分享" state={capabilities.sharing} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

function ResultRow({ label, state }: { label: string; state: CapabilityState }) {
  return (
    <View style={styles.resultRow}>
      <View style={styles.resultCopy}>
        <Text style={styles.resultLabel}>{label}</Text>
        <Text style={styles.resultDetail}>{state.detail}</Text>
      </View>
      <View style={[styles.badge, styles[`badge_${state.status}`]]}>
        {state.status === 'running' ? (
          <ActivityIndicator color="#6D3B22" size="small" />
        ) : (
          <Text style={styles.badgeText}>{STATUS_LABEL[state.status]}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 20, paddingBottom: 48, gap: 16 },
  hero: { paddingVertical: 12, gap: 7 },
  eyebrow: { color: colors.muted, fontSize: 10, lineHeight: 14 },
  title: { color: colors.cocoa, fontSize: 25, fontWeight: '700', letterSpacing: -0.8, lineHeight: 34 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  actions: { gap: 10 },
  button: {
    alignItems: 'center',
    backgroundColor: colors.tomatoDark,
    borderRadius: 15,
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  buttonPressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  buttonText: { color: colors.surface, fontSize: 15, fontWeight: '700' },
  previewCard: {
    ...shadow,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  sectionTitle: { color: colors.cocoa, fontSize: 18, fontWeight: '700' },
  previewList: { gap: 10 },
  previewImage: {
    width: 112,
    height: 112,
    borderRadius: 14,
    backgroundColor: colors.chip,
  },
  compressedImage: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    backgroundColor: colors.chip,
    resizeMode: 'contain',
  },
  results: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 4,
  },
  resultRow: {
    alignItems: 'center',
    borderBottomColor: colors.chip,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingVertical: 13,
  },
  resultCopy: { flex: 1, gap: 3 },
  resultLabel: { color: colors.cocoa, fontSize: 15, fontWeight: '700' },
  resultDetail: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  badge: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 30,
    minWidth: 62,
    paddingHorizontal: 10,
  },
  badge_idle: { backgroundColor: '#F5EDE4' },
  badge_running: { backgroundColor: colors.yolkSoft },
  badge_passed: { backgroundColor: '#E7EFDF' },
  badge_failed: { backgroundColor: colors.tomatoSoft },
  badgeText: { color: colors.tomatoDark, fontSize: 12, fontWeight: '800' },
});
