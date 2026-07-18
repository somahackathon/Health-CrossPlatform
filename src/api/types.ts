// Mirrors Health-Server's OpenAPI schema (GET /v3/api-docs). Keep in sync with
// team.soma.teto.health.reference/evaluation/analysis DTOs.

export type Gender = 'MALE' | 'FEMALE';

export type SchoolLevel = 'ELEMENTARY' | 'MIDDLE' | 'HIGH';

export type ComponentCode =
  | 'CARDIO_ENDURANCE'
  | 'FLEXIBILITY'
  | 'MUSCULAR_STRENGTH_ENDURANCE'
  | 'POWER'
  | 'BODY_COMPOSITION';

export type TestItemCode =
  | 'SHUTTLE_RUN'
  | 'LONG_RUN_WALK'
  | 'STEP_TEST'
  | 'SIT_AND_REACH'
  | 'TOTAL_FLEXIBILITY'
  | 'PUSH_UP'
  | 'CURL_UP'
  | 'GRIP_STRENGTH'
  | 'SPRINT_50M'
  | 'STANDING_LONG_JUMP'
  | 'BMI'
  | 'BODY_FAT_PERCENTAGE';

export type MeasurementUnit = 'COUNT' | 'SECOND' | 'CENTIMETER' | 'KILOGRAM' | 'PERCENT' | 'BMI' | 'SCORE';

export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';

export type AnalysisType = 'FITNESS' | 'POSTURE';

export type AiFailureCode =
  | 'AI_SERVER_ERROR'
  | 'AI_TIMEOUT'
  | 'INVALID_AI_RESPONSE'
  | 'VIDEO_PROCESSING_FAILED'
  | 'TEMPORARY_FILE_ERROR'
  | 'UNKNOWN';

export type ApiEnvelope<T> = {
  success: boolean;
  data: T | null;
  error: { code: string; message: string; details?: { field: string; reason: string }[] } | null;
  timestamp: string;
};

// --- Reference data ---

export type Component = {
  code: ComponentCode;
  name: string;
  description: string;
  displayOrder: number;
};

export type TestItem = {
  componentCode: ComponentCode;
  code: TestItemCode;
  name: string;
  unit: MeasurementUnit;
  valueType: string;
  betterDirection: string;
  minimumInput: number;
  maximumInput: number;
  decimalScale: number;
};

export type PapsStandardVersion = {
  code: string;
  name: string;
  sourceType: string;
  sourceName: string;
  sourceUrl: string;
  official: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
};

// --- PAPS evaluation ---

export type PapsMeasurementRequest = {
  testItemCode: TestItemCode;
  value: number;
};

export type PapsEvaluationRequest = {
  birthDate: string;
  gender: Gender;
  schoolLevel: SchoolLevel;
  schoolGrade: 1 | 2 | 3;
  assessmentDate: string;
  heightCm: number;
  weightKg: number;
  measurements: PapsMeasurementRequest[];
};

export type PapsMeasurementResult = {
  component: ComponentCode;
  testItemCode: TestItemCode;
  testItemName: string;
  value: number;
  unit: MeasurementUnit;
  grade: number;
};

export type PapsEvaluationResponse = {
  standardVersion: { code: string; name: string; official: boolean };
  profile: {
    age: number;
    schoolLevel: string;
    schoolGrade: number;
    gender: Gender;
    heightCm: number;
    weightKg: number;
    bmi: number;
  };
  completeness: {
    evaluatedComponentCount: number;
    requiredComponentCount: number;
    complete: boolean;
    missingComponents: string[];
  };
  measurements: PapsMeasurementResult[];
};

// --- Fitness AI analysis ---

export type FitnessAnalysisRequest = {
  profile: {
    birthDate: string;
    gender: Gender;
    schoolLevel: SchoolLevel;
    schoolGrade: 1 | 2 | 3;
    heightCm?: number;
    weightKg?: number;
  };
  records: { itemCode: TestItemCode; value: number; unit: MeasurementUnit; measuredAt: string }[];
};

export type Recommendation = { title: string; description: string };

export type FitnessAnalysisResponse = {
  jobId: string;
  status: AnalysisStatus;
  modelVersion: string | null;
  summary: string | null;
  recommendations: Recommendation[] | null;
};

// --- Posture AI analysis ---

export type Feedback = { code: string; message: string; severity: string };

export type PostureAnalysisResponse = {
  jobId: string;
  status: AnalysisStatus;
  modelVersion: string | null;
  feedback: Feedback[] | null;
};

// --- Job polling ---

export type AnalysisJobResponse = {
  jobId: string;
  analysisType: AnalysisType;
  status: AnalysisStatus;
  modelVersion: string | null;
  result: unknown;
  failureCode: AiFailureCode | null;
  failureMessage: string | null;
  expiresAt: string | null;
  completedAt: string | null;
};
