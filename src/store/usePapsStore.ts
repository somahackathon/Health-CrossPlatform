import { create } from 'zustand';

import * as papsApi from '../api/paps';
import { Component, PapsMeasurementResult, TestItem, TestItemCode } from '../api/types';
import * as papsRecordsDb from '../db/papsRecords';
import { TEST_ITEM_NAME } from '../lib/paps';
import { useProfileStore } from './useProfileStore';

export type SubmitResult = {
  testItemCode: TestItemCode;
  testItemName: string;
  unit: string;
  value: number;
  grade: number;
  prevGrade: number | null;
  improved: boolean;
  same: boolean;
};

type PapsState = {
  components: Component[];
  testItems: TestItem[];
  // testItems ordered by their component's displayOrder, precomputed on load so
  // selectors can return a stable reference instead of re-sorting every render.
  orderedTestItems: TestItem[];
  referenceLoading: boolean;
  referenceError: string | null;

  records: papsRecordsDb.PapsRecord[];

  selectedTestItemCode: TestItemCode | null;
  inputValue: string;
  submitting: boolean;
  submitError: string | null;
  lastResult: SubmitResult | null;

  loadReference: () => Promise<void>;
  loadRecords: () => void;
  selectItem: (code: TestItemCode) => void;
  setInputValue: (v: string) => void;
  submitRecord: () => Promise<void>;
  closeResult: () => void;
};

export const usePapsStore = create<PapsState>((set, get) => ({
  components: [],
  testItems: [],
  orderedTestItems: [],
  referenceLoading: false,
  referenceError: null,

  records: [],

  selectedTestItemCode: null,
  inputValue: '',
  submitting: false,
  submitError: null,
  lastResult: null,

  loadReference: async () => {
    set({ referenceLoading: true, referenceError: null });
    try {
      const [componentsRes, testItemsRes] = await Promise.all([papsApi.getComponents(), papsApi.getTestItems()]);
      const components = [...componentsRes.components].sort((a, b) => a.displayOrder - b.displayOrder);
      const testItems = testItemsRes.testItems;
      const order = new Map(components.map((c, i) => [c.code, i]));
      const orderedTestItems = [...testItems].sort(
        (a, b) => (order.get(a.componentCode) ?? 0) - (order.get(b.componentCode) ?? 0)
      );
      set({ components, testItems, orderedTestItems, referenceLoading: false });
    } catch (err) {
      set({ referenceLoading: false, referenceError: err instanceof Error ? err.message : '종목 목록을 불러오지 못했어요' });
    }
  },

  loadRecords: () => set({ records: papsRecordsDb.getLatestPapsRecords() }),

  selectItem: (code) =>
    set((state) => ({
      selectedTestItemCode: state.selectedTestItemCode === code ? null : code,
      inputValue: '',
      submitError: null,
    })),

  setInputValue: (v) => set({ inputValue: v }),

  submitRecord: async () => {
    const { selectedTestItemCode, inputValue, records } = get();
    if (!selectedTestItemCode) return;
    const value = parseFloat(inputValue);
    if (Number.isNaN(value)) return;

    const profile = useProfileStore.getState();
    if (!profile.birthDate || !profile.gender || !profile.heightCm || !profile.weightKg || !profile.schoolGrade) {
      set({ submitError: '먼저 내 신체 정보를 입력해 주세요' });
      return;
    }

    set({ submitting: true, submitError: null });
    try {
      const response = await papsApi.evaluatePaps({
        birthDate: profile.birthDate,
        schoolLevel: 'HIGH',
        schoolGrade: profile.schoolGrade,
        gender: profile.gender,
        assessmentDate: todayDate(),
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        measurements: [{ testItemCode: selectedTestItemCode, value }],
      });

      const result: PapsMeasurementResult | undefined = response.measurements[0];
      if (!result) throw new Error('평가 결과를 받지 못했어요');

      const prev = records.find((r) => r.testItemCode === selectedTestItemCode)?.grade ?? null;
      const measuredAt = new Date().toISOString();
      const testItemName = TEST_ITEM_NAME[result.testItemCode] ?? result.testItemName;

      papsRecordsDb.insertPapsRecord({
        testItemCode: result.testItemCode,
        componentCode: result.component,
        testItemName,
        value: result.value,
        unit: result.unit,
        grade: result.grade,
        standardVersionCode: response.standardVersion.code,
        measuredAt,
      });

      set({
        records: papsRecordsDb.getLatestPapsRecords(),
        lastResult: {
          testItemCode: result.testItemCode,
          testItemName,
          unit: result.unit,
          value: result.value,
          grade: result.grade,
          prevGrade: prev,
          improved: prev !== null && result.grade < prev,
          same: prev !== null && result.grade === prev,
        },
        selectedTestItemCode: null,
        inputValue: '',
        submitting: false,
      });
    } catch (err) {
      set({ submitting: false, submitError: err instanceof Error ? err.message : '판정 요청에 실패했어요' });
    }
  },

  closeResult: () => set({ lastResult: null }),
}));

function todayDate(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}
