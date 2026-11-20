/* eslint-disable @typescript-eslint/no-require-imports */
import { useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { deferComponent } from '@/components/common/deferComponent';
import routes from '@/navigation/routes';
import type { NavigationProp } from '@/navigation/types';
import type { Enrollment } from '../my-classes/types';
import { attendanceRange, type AttendancePeriod } from './attendance.service';
import { useAttendance, useAttendanceClasses } from './useAttendance';

const Classes = deferComponent(
  () =>
    (require('./AttendanceScreens') as typeof import('./AttendanceScreens'))
      .AttendanceClassesScreen
);
const History = deferComponent(
  () =>
    (require('./AttendanceScreens') as typeof import('./AttendanceScreens'))
      .AttendanceHistoryScreen
);

function ClassHistory({
  selected,
  active,
  onBack,
}: {
  selected: Enrollment;
  active: boolean;
  onBack: () => void;
}) {
  const [filter, setFilter] = useState(() => ({
    period: 'ALL' as AttendancePeriod,
    range: attendanceRange('ALL'),
  }));
  const data = useAttendance(selected.classId, filter.range, active);
  return (
    <History
      {...data}
      className={selected.className}
      courseTitle={selected.courseTitle}
      period={filter.period}
      onPeriod={(period) =>
        setFilter({ period, range: attendanceRange(period) })
      }
      onBack={onBack}
    />
  );
}

export function AttendanceRoute() {
  const navigation = useNavigation<NavigationProp>();
  const active = useIsFocused();
  const [selected, setSelected] = useState<Enrollment | null>(null);
  const classes = useAttendanceClasses(active && !selected);
  useEffect(() => {
    if (!active || !selected) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setSelected(null);
      return true;
    });
    return () => sub.remove();
  }, [active, selected]);
  return (
    <View className="flex-1 bg-canvas">
      <View className={selected ? 'hidden' : 'flex-1'}>
        <Classes
          {...classes}
          onOpen={setSelected}
          onBack={() => navigation.goBack()}
          onExplore={() => navigation.navigate(routes.courses)}
        />
      </View>
      {selected && (
        <ClassHistory
          key={selected.classId}
          selected={selected}
          active={active}
          onBack={() => setSelected(null)}
        />
      )}
    </View>
  );
}
