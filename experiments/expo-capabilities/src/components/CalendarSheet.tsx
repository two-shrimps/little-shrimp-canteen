import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, shadow } from '@/theme';

type CalendarSheetProps = {
  visible: boolean;
  onClose: () => void;
};

type CalendarDay = {
  date: Date;
  day: number;
  inCurrentMonth: boolean;
};

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];
const PLANNED_DATES = new Set(['2026-10-02', '2026-10-06', '2026-10-09', '2026-10-14', '2026-10-17', '2026-10-21', '2026-10-23', '2026-10-25', '2026-10-30']);

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

function buildCalendar(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - mondayOffset);

  const lastDay = new Date(year, month + 1, 0);
  const requiredCells = mondayOffset + lastDay.getDate();
  const cellCount = Math.ceil(requiredCells / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return { date, day: date.getDate(), inCurrentMonth: date.getMonth() === month };
  });
}

export function CalendarSheet({ visible, onClose }: CalendarSheetProps) {
  const insets = useSafeAreaInsets();
  const [visibleMonth, setVisibleMonth] = useState(new Date(2026, 9, 1));
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 9, 21));
  const days = useMemo(
    () => buildCalendar(visibleMonth.getFullYear(), visibleMonth.getMonth()),
    [visibleMonth],
  );

  const moveMonth = (offset: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const selectDay = (day: CalendarDay) => {
    setSelectedDate(day.date);
    if (!day.inCurrentMonth) {
      setVisibleMonth(new Date(day.date.getFullYear(), day.date.getMonth(), 1));
    }
  };

  const selectedHasPlan = PLANNED_DATES.has(dateKey(selectedDate));

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.modal}>
        <Pressable accessibilityLabel="关闭日历" onPress={onClose} style={styles.backdrop} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>看看哪天已经有安排</Text>
              <Text style={styles.monthTitle}>
                {visibleMonth.getFullYear()} 年 {visibleMonth.getMonth() + 1} 月
              </Text>
            </View>
            <View style={styles.controls}>
              <CalendarControl label="上个月" symbol="‹" onPress={() => moveMonth(-1)} />
              <CalendarControl label="下个月" symbol="›" onPress={() => moveMonth(1)} />
              <CalendarControl label="关闭" symbol="×" onPress={onClose} />
            </View>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((weekday) => <Text key={weekday} style={styles.weekday}>{weekday}</Text>)}
          </View>
          <View style={styles.calendarGrid}>
            {days.map((day) => {
              const key = dateKey(day.date);
              const isSelected = key === dateKey(selectedDate);
              const hasPlan = PLANNED_DATES.has(key);
              return (
                <Pressable
                  accessibilityLabel={`${day.date.getMonth() + 1} 月 ${day.day} 日${hasPlan ? '，有安排' : ''}`}
                  key={key}
                  onPress={() => selectDay(day)}
                  style={[styles.day, isSelected && styles.daySelected]}
                >
                  <Text style={[styles.dayText, !day.inCurrentMonth && styles.dayOutside, isSelected && styles.dayTextSelected]}>
                    {day.day}
                  </Text>
                  {hasPlan && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.summary}>
            <View style={[styles.summaryDate, !selectedHasPlan && styles.summaryDateEmpty]}>
              <Text style={styles.summaryDateText}>{selectedDate.getDate()}</Text>
            </View>
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryTitle}>
                {selectedHasPlan ? '今晚 · 番茄牛腩小餐桌' : '这天还没有安排'}
              </Text>
              <Text style={styles.summaryMeta}>
                {selectedHasPlan ? '3 道菜 · 两个人' : '可以从菜谱仓库挑一道'}
              </Text>
            </View>
            <Pressable accessibilityRole="button">
              <Text style={styles.viewAction}>{selectedHasPlan ? '查看' : '安排'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function CalendarControl({ label, symbol, onPress }: { label: string; symbol: string; onPress: () => void }) {
  return (
    <Pressable accessibilityLabel={label} onPress={onPress} style={styles.control}>
      <Text style={styles.controlText}>{symbol}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modal: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { backgroundColor: 'rgba(31,23,18,0.38)', bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  sheet: { ...shadow, backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, minHeight: 430, paddingHorizontal: 20, paddingTop: 10 },
  handle: { alignSelf: 'center', backgroundColor: '#D7CBC1', borderRadius: 99, height: 4, width: 36 },
  header: { alignItems: 'flex-end', flexDirection: 'row', height: 58, justifyContent: 'space-between', paddingTop: 14 },
  eyebrow: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  monthTitle: { color: colors.cocoa, fontSize: 21, fontWeight: '700', lineHeight: 27 },
  controls: { flexDirection: 'row', gap: 7 },
  control: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 14, borderWidth: 1, height: 38, justifyContent: 'center', width: 38 },
  controlText: { color: colors.cocoa, fontSize: 22, lineHeight: 25 },
  weekRow: { flexDirection: 'row', height: 40, paddingTop: 15 },
  weekday: { color: colors.muted, flex: 1, fontSize: 10, textAlign: 'center' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  day: { alignItems: 'center', borderRadius: 13, height: 42, justifyContent: 'center', position: 'relative', width: '14.285714%' },
  daySelected: { backgroundColor: colors.tomatoDark },
  dayText: { color: colors.cocoa, fontSize: 12 },
  dayOutside: { color: '#B9ACA3' },
  dayTextSelected: { color: colors.surface, fontWeight: '800' },
  dot: { backgroundColor: colors.tomato, borderRadius: 2, bottom: 5, height: 4, position: 'absolute', width: 4 },
  dotSelected: { backgroundColor: colors.surface },
  summary: { alignItems: 'center', backgroundColor: '#F6EEE5', borderRadius: 17, flexDirection: 'row', gap: 11, minHeight: 68, paddingHorizontal: 14, paddingVertical: 13 },
  summaryDate: { alignItems: 'center', backgroundColor: colors.sage, borderRadius: 13, height: 42, justifyContent: 'center', width: 42 },
  summaryDateEmpty: { backgroundColor: colors.tomato },
  summaryDateText: { color: colors.surface, fontSize: 15, fontWeight: '800' },
  summaryCopy: { flex: 1 },
  summaryTitle: { color: colors.cocoa, fontSize: 13, fontWeight: '700' },
  summaryMeta: { color: colors.muted, fontSize: 10, paddingTop: 3 },
  viewAction: { color: colors.tomatoDark, fontSize: 12, padding: 6 },
});
