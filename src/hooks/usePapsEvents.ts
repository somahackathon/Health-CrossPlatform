import { TestItem, TestItemCode } from '../api/types';
import { GRADE_TEXT, TEST_ITEM_NAME } from '../lib/paps';
import { usePapsStore } from '../store/usePapsStore';
import { gradeColor } from '../theme/colors';

export type PapsEventVM = {
  id: TestItemCode;
  name: string;
  cat: string;
  unit: string;
  value: number | null;
  grade: number | null;
  gradeText: string;
  fg: string;
  bg: string;
};

const COMPONENT_LABEL: Record<string, string> = {
  CARDIO_ENDURANCE: '심폐지구력',
  FLEXIBILITY: '유연성',
  MUSCULAR_STRENGTH_ENDURANCE: '근력·근지구력',
  POWER: '순발력',
  BODY_COMPOSITION: '비만도',
};

export function usePapsEvents(): PapsEventVM[] {
  const testItems = usePapsStore((s) => s.orderedTestItems);
  const records = usePapsStore((s) => s.records);

  return testItems.map((item: TestItem) => {
    const record = records.find((r) => r.testItemCode === item.code);
    const grade = record?.grade ?? null;
    const { fg, bg } = grade ? gradeColor(grade) : { fg: '#9AA0A6', bg: '#F1F2F4' };
    return {
      id: item.code,
      name: TEST_ITEM_NAME[item.code] ?? item.name,
      cat: COMPONENT_LABEL[item.componentCode] ?? item.componentCode,
      unit: unitLabel(item.unit),
      value: record?.value ?? null,
      grade,
      gradeText: grade ? GRADE_TEXT[grade] : '기록 없음',
      fg,
      bg,
    };
  });
}

function unitLabel(unit: string): string {
  switch (unit) {
    case 'COUNT':
      return '회';
    case 'SECOND':
      return '초';
    case 'CENTIMETER':
      return 'cm';
    case 'KILOGRAM':
      return 'kg';
    case 'PERCENT':
      return '%';
    case 'BMI':
      return 'BMI';
    case 'SCORE':
      return '점';
    default:
      return unit;
  }
}
