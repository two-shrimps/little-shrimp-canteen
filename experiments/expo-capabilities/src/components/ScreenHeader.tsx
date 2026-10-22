import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, shadow } from '@/theme';

type ScreenHeaderProps = {
  eyebrow: string;
  title: string;
  onAdd?: () => void;
};

export function ScreenHeader({ eyebrow, title, onAdd }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      {onAdd && (
        <Pressable accessibilityLabel="新增" onPress={onAdd} style={styles.addButton}>
          <Text style={styles.addText}>＋</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  eyebrow: { color: colors.muted, fontSize: 10, lineHeight: 14 },
  title: {
    color: colors.cocoa,
    fontSize: 25,
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  addButton: {
    ...shadow,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: 'rgba(68,55,47,0.11)',
    borderRadius: 15,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  addText: { color: colors.cocoa, fontSize: 21, lineHeight: 25 },
});
