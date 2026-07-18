import { apiGet, apiPostJson } from './client';
import {
  Component,
  ComponentCode,
  PapsEvaluationRequest,
  PapsEvaluationResponse,
  PapsStandardVersion,
  TestItem,
} from './types';

export function getComponents(): Promise<{ components: Component[] }> {
  return apiGet('/api/v1/paps/components');
}

export function getTestItems(component?: ComponentCode): Promise<{ testItems: TestItem[] }> {
  return apiGet('/api/v1/paps/test-items', { component });
}

export function getCurrentStandardVersion(): Promise<PapsStandardVersion> {
  return apiGet('/api/v1/paps/standards/current');
}

export function evaluatePaps(request: PapsEvaluationRequest): Promise<PapsEvaluationResponse> {
  return apiPostJson('/api/v1/paps/evaluations', request);
}
