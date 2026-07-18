// Grading itself always comes from the server (POST /api/v1/paps/evaluations).
// This module only holds presentation helpers shared across screens.

import { TestItemCode } from '../api/types';

export const GRADE_TEXT: Record<number, string> = {
  1: '매우 우수',
  2: '우수',
  3: '보통',
  4: '노력 필요',
  5: '주의',
};

// Server returns test item names in English; the app always shows Korean, so
// map by the stable testItemCode instead of trusting server-provided text.
export const TEST_ITEM_NAME: Record<TestItemCode, string> = {
  SHUTTLE_RUN: '왕복오래달리기',
  LONG_RUN_WALK: '오래달리기-걷기',
  STEP_TEST: '스텝검사',
  SIT_AND_REACH: '앉아윗몸앞으로굽히기',
  TOTAL_FLEXIBILITY: '종합유연성검사',
  PUSH_UP: '팔굽혀펴기',
  CURL_UP: '윗몸말아올리기',
  GRIP_STRENGTH: '악력',
  SPRINT_50M: '50m 달리기',
  STANDING_LONG_JUMP: '제자리멀리뛰기',
  BMI: '체질량지수(BMI)',
  BODY_FAT_PERCENTAGE: '체지방률',
};

export function overallGrade(grades: number[]): number | null {
  if (grades.length === 0) return null;
  return Math.round(grades.reduce((a, b) => a + b, 0) / grades.length);
}
