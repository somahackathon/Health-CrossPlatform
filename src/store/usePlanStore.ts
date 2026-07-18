import { create } from 'zustand';

import { getAnalysisJob, requestFitnessAnalysis } from '../api/analysis';
import { AnalysisStatus, Recommendation } from '../api/types';
import * as analysisJobsDb from '../db/analysisJobs';
import * as papsRecordsDb from '../db/papsRecords';
import { delay } from '../lib/delay';
import { useProfileStore } from './useProfileStore';

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 30; // ~90s

type PlanState = {
  status: 'idle' | 'requesting' | 'polling' | 'done' | 'error';
  jobId: string | null;
  summary: string | null;
  recommendations: Recommendation[] | null;
  errorMessage: string | null;
  generation: number;

  loadCached: () => void;
  requestAnalysis: () => Promise<void>;
};

export const usePlanStore = create<PlanState>((set, get) => ({
  status: 'idle',
  jobId: null,
  summary: null,
  recommendations: null,
  errorMessage: null,
  generation: 0,

  loadCached: () => {
    const cached = analysisJobsDb.getLatestFitnessAnalysis();
    if (!cached) return;
    set({
      status: cached.status === 'COMPLETED' ? 'done' : 'idle',
      jobId: cached.jobId,
      summary: cached.summary,
      recommendations: cached.recommendations,
    });
  },

  requestAnalysis: async () => {
    const profile = useProfileStore.getState();
    if (!profile.birthDate || !profile.gender || !profile.schoolGrade) {
      set({ status: 'error', errorMessage: '먼저 내 신체 정보를 입력해 주세요' });
      return;
    }
    const records = papsRecordsDb.getLatestPapsRecords();
    if (records.length === 0) {
      set({ status: 'error', errorMessage: 'PAPS 기록을 먼저 입력해 주세요' });
      return;
    }

    const generation = get().generation + 1;
    set({ status: 'requesting', errorMessage: null, generation });

    try {
      const response = await requestFitnessAnalysis({
        profile: {
          birthDate: profile.birthDate,
          gender: profile.gender,
          schoolLevel: 'HIGH',
          schoolGrade: profile.schoolGrade,
          heightCm: profile.heightCm ?? undefined,
          weightKg: profile.weightKg ?? undefined,
        },
        records: records.map((r) => ({
          itemCode: r.testItemCode,
          value: r.value,
          unit: r.unit,
          measuredAt: r.measuredAt,
        })),
      });

      if (isTerminal(response.status)) {
        finish(set, generation, response.status, response.jobId, response.summary, response.recommendations, null);
        return;
      }

      set({ status: 'polling', jobId: response.jobId });
      await pollUntilDone(set, get, generation, response.jobId);
    } catch (err) {
      if (get().generation !== generation) return;
      set({ status: 'error', errorMessage: err instanceof Error ? err.message : 'AI 분석 요청에 실패했어요' });
    }
  },
}));

async function pollUntilDone(
  set: (partial: Partial<PlanState>) => void,
  get: () => PlanState,
  generation: number,
  jobId: string
) {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await delay(POLL_INTERVAL_MS);
    if (get().generation !== generation) return; // superseded by a newer request

    try {
      const job = await getAnalysisJob(jobId);
      if (isTerminal(job.status)) {
        const result = job.result as { summary?: string; recommendations?: Recommendation[] } | null;
        finish(set, generation, job.status, jobId, result?.summary ?? null, result?.recommendations ?? null, job.failureMessage);
        return;
      }
    } catch {
      // transient polling error — keep retrying until MAX_POLL_ATTEMPTS
    }
  }
  if (get().generation !== generation) return;
  set({ status: 'error', errorMessage: '분석이 시간 내에 완료되지 않았어요. 잠시 후 다시 시도해 주세요' });
}

function finish(
  set: (partial: Partial<PlanState>) => void,
  generation: number,
  status: AnalysisStatus,
  jobId: string,
  summary: string | null,
  recommendations: Recommendation[] | null,
  failureMessage: string | null
) {
  analysisJobsDb.saveFitnessAnalysis({
    jobId,
    status,
    modelVersion: null,
    summary,
    recommendations,
    failureMessage,
    completedAt: new Date().toISOString(),
  });

  if (status === 'COMPLETED') {
    set({ status: 'done', jobId, summary, recommendations, errorMessage: null });
  } else {
    set({ status: 'error', errorMessage: failureMessage ?? 'AI 분석에 실패했어요' });
  }
}

function isTerminal(status: AnalysisStatus): boolean {
  return status === 'COMPLETED' || status === 'FAILED' || status === 'EXPIRED';
}
