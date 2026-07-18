import { create } from 'zustand';

import { getAnalysisJob, requestPostureAnalysis } from '../api/analysis';
import { AiFailureCode, AnalysisStatus, Feedback } from '../api/types';
import * as analysisJobsDb from '../db/analysisJobs';
import { aiFailureText } from '../lib/aiFailure';
import { delay } from '../lib/delay';

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 30; // ~90s

export type PostureExercise = { code: 'PUSH_UP' | 'SQUAT' | 'LUNGE' | 'PLANK'; label: string };

export const POSTURE_EXERCISES: PostureExercise[] = [
  { code: 'PUSH_UP', label: '푸시업' },
  { code: 'SQUAT', label: '스쿼트' },
  { code: 'LUNGE', label: '런지' },
  { code: 'PLANK', label: '플랭크' },
];

type PostureState = {
  status: 'idle' | 'uploading' | 'polling' | 'done' | 'error';
  jobId: string | null;
  exerciseType: PostureExercise['code'];
  feedback: Feedback[] | null;
  errorMessage: string | null;
  generation: number;

  setExerciseType: (code: PostureExercise['code']) => void;
  reset: () => void;
  submitVideo: (videoUri: string) => Promise<void>;
};

export const usePostureStore = create<PostureState>((set, get) => ({
  status: 'idle',
  jobId: null,
  exerciseType: POSTURE_EXERCISES[0].code,
  feedback: null,
  errorMessage: null,
  generation: 0,

  setExerciseType: (code) => set({ exerciseType: code }),
  reset: () => set({ status: 'idle', jobId: null, feedback: null, errorMessage: null }),

  submitVideo: async (videoUri) => {
    const generation = get().generation + 1;
    const exerciseType = get().exerciseType;
    set({ status: 'uploading', errorMessage: null, generation });

    try {
      const response = await requestPostureAnalysis(exerciseType, videoUri);
      if (get().generation !== generation) return;

      if (isTerminal(response.status)) {
        finish(set, generation, response.status, response.jobId, exerciseType, response.feedback, null, null);
        return;
      }

      set({ status: 'polling', jobId: response.jobId });
      await pollUntilDone(set, get, generation, response.jobId, exerciseType);
    } catch (err) {
      if (get().generation !== generation) return;
      set({ status: 'error', errorMessage: err instanceof Error ? err.message : '자세 분석 요청에 실패했어요' });
    }
  },
}));

async function pollUntilDone(
  set: (partial: Partial<PostureState>) => void,
  get: () => PostureState,
  generation: number,
  jobId: string,
  exerciseType: PostureExercise['code']
) {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await delay(POLL_INTERVAL_MS);
    if (get().generation !== generation) return;

    try {
      const job = await getAnalysisJob(jobId);
      if (isTerminal(job.status)) {
        const result = job.result as { feedback?: Feedback[] } | null;
        finish(set, generation, job.status, jobId, exerciseType, result?.feedback ?? null, job.failureCode, job.failureMessage);
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
  set: (partial: Partial<PostureState>) => void,
  generation: number,
  status: AnalysisStatus,
  jobId: string,
  exerciseType: string,
  feedback: Feedback[] | null,
  failureCode: AiFailureCode | null,
  failureMessage: string | null
) {
  const errorMessage = status === 'COMPLETED' ? null : aiFailureText(failureCode, failureMessage ?? '자세 분석에 실패했어요');

  analysisJobsDb.savePostureAnalysis({
    jobId,
    exerciseType,
    status,
    modelVersion: null,
    feedback,
    failureMessage: errorMessage,
    completedAt: new Date().toISOString(),
  });

  if (status === 'COMPLETED') {
    set({ status: 'done', jobId, feedback, errorMessage: null });
  } else {
    set({ status: 'error', errorMessage });
  }
}

function isTerminal(status: AnalysisStatus): boolean {
  return status === 'COMPLETED' || status === 'FAILED' || status === 'EXPIRED';
}
