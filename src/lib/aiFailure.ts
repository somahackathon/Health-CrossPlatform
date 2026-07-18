import { AiFailureCode } from '../api/types';

// The server's failureMessage is often just the raw AiFailureCode string (English),
// so prefer this Korean mapping over displaying it directly.
export const AI_FAILURE_MESSAGE: Record<AiFailureCode, string> = {
  AI_SERVER_ERROR: 'AI 분석 서버에 문제가 발생했어요. 잠시 후 다시 시도해 주세요',
  AI_TIMEOUT: 'AI 분석이 시간 내에 끝나지 않았어요. 다시 시도해 주세요',
  INVALID_AI_RESPONSE: 'AI가 올바른 분석 결과를 주지 않았어요. 다시 시도해 주세요',
  VIDEO_PROCESSING_FAILED: '영상을 처리하지 못했어요. 전신이 잘 보이도록 밝은 곳에서 다시 촬영해 주세요',
  TEMPORARY_FILE_ERROR: '영상 저장 중 오류가 발생했어요. 다시 시도해 주세요',
  UNKNOWN: '분석에 실패했어요. 다시 시도해 주세요',
};

export function aiFailureText(failureCode: AiFailureCode | null, fallback: string): string {
  if (failureCode && AI_FAILURE_MESSAGE[failureCode]) return AI_FAILURE_MESSAGE[failureCode];
  return fallback;
}
