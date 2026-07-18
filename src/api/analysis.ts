import { File } from 'expo-file-system';

import { apiGet, apiPostJson, apiPostMultipart } from './client';
import { getInstallationId } from '../db/installationId';
import { AnalysisJobResponse, FitnessAnalysisRequest, FitnessAnalysisResponse, PostureAnalysisResponse } from './types';

export function requestFitnessAnalysis(request: FitnessAnalysisRequest): Promise<FitnessAnalysisResponse> {
  return apiPostJson('/api/fitness-analyses', request, { 'X-Installation-Id': getInstallationId() });
}

export async function requestPostureAnalysis(exerciseType: string, videoUri: string): Promise<PostureAnalysisResponse> {
  // Expo's fetch-based FormData only accepts real Blob/File parts — the classic RN
  // `{ uri, name, type }` shorthand throws "Unsupported FormDataPart implementation".
  const buffer = await new File(videoUri).arrayBuffer();
  const blob = new Blob([buffer], { type: 'video/mp4' });

  const form = new FormData();
  form.append('video', blob, 'posture.mp4');

  return apiPostMultipart(
    '/api/posture-analyses',
    { exerciseType },
    form,
    { 'X-Installation-Id': getInstallationId() }
  );
}

export function getAnalysisJob(publicId: string): Promise<AnalysisJobResponse> {
  return apiGet(`/api/analysis-jobs/${publicId}`, undefined, { 'X-Installation-Id': getInstallationId() });
}
