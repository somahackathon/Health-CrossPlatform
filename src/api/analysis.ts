import { apiGet, apiPostJson, apiPostMultipart } from './client';
import { getInstallationId } from '../db/installationId';
import { AnalysisJobResponse, FitnessAnalysisRequest, FitnessAnalysisResponse, PostureAnalysisResponse } from './types';

export function requestFitnessAnalysis(request: FitnessAnalysisRequest): Promise<FitnessAnalysisResponse> {
  return apiPostJson('/api/fitness-analyses', request, { 'X-Installation-Id': getInstallationId() });
}

export function requestPostureAnalysis(exerciseType: string, videoUri: string): Promise<PostureAnalysisResponse> {
  const form = new FormData();
  form.append('video', {
    uri: videoUri,
    name: 'posture.mp4',
    type: 'video/mp4',
  } as unknown as Blob);

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
