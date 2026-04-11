// FIG-Loneliness API Client
// All data fetched from live API - no mock data

import type {
  AttentionData,
  ClassDistribution,
  DatasetSummary,
  ErrorAnalysisDetail,
  ErrorAnalysisSummary,
  InterpretabilitySummary,
  LengthStats,
  LinguisticStats,
  LrCoefficients,
  ModelResult,
  ModelResultsResponse,
  NGrams,
  PosDistribution,
  PreprocessingSamples,
  PreprocessingSummary,
  PredictResponse,
  StatusResponse,
  TestReport,
} from './types'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://codenameberyl-fig-lone.hf.space/api'

// Stable results (revalidate every hour)
const STABLE = { next: { revalidate: 3600 } }
// Dynamic data (no cache)
const DYNAMIC = { cache: 'no-store' as const }

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, opts)
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText} (${path})`)
  }
  return res.json() as Promise<T>
}
 
// ─── Status ───────────────────────────────────────────────────────────────────
export const getStatus = () =>
  apiFetch<StatusResponse>("/status", DYNAMIC)
 
// ─── Dataset / EDA ────────────────────────────────────────────────────────────
export const getDatasetSummary = () =>
  apiFetch<DatasetSummary>("/eda/dataset", STABLE)
 
export const getClassDistribution = () =>
  apiFetch<ClassDistribution>("/eda/class_distribution", STABLE)
 
export const getLengthStats = () =>
  apiFetch<LengthStats>("/eda/length_stats", STABLE)
 
export const getLinguisticStats = () =>
  apiFetch<LinguisticStats>("/eda/linguistic_stats", STABLE)
 
export const getNgrams = () =>
  apiFetch<NGrams>("/eda/ngrams", STABLE)
 
export const getPosDistribution = () =>
  apiFetch<PosDistribution>("/eda/pos_distribution", STABLE)
 
export const getPreprocessingSamples = (
  split = "train",
  label = "both",
  n = 10
) =>
  apiFetch<PreprocessingSamples>(
    `/eda/preprocessing/samples?split=${split}&label=${label}&n=${n}`,
    STABLE
  )
 
export const getPreprocessingSummary = () =>
  apiFetch<PreprocessingSummary>("/eda/preprocessing/summary", STABLE)
 
// ─── Models ───────────────────────────────────────────────────────────────────
export const getModelResults = () =>
  apiFetch<ModelResultsResponse>("/models/results", STABLE)
 
export const getBestPerRep = () =>
  apiFetch<ModelResult[]>("/models/best_per_representation", STABLE)
 
export const getTestReport = () =>
  apiFetch<TestReport>("/models/test_report", STABLE)
 
export const getFeaturesMetadata = () =>
  apiFetch<Record<string, { n_features: number; available: boolean }>>(
    "/models/features_metadata",
    STABLE
  )
 
export const getConfusionMatrix = (key: string) =>
  apiFetch<TestReport["confusion_matrix"]>(
    `/models/confusion_matrix/${key}`,
    STABLE
  )
 
export const getRocCurve = (key: string) =>
  apiFetch<TestReport["roc_curve"]>(`/models/roc_curve/${key}`, STABLE)
 
export const getFullReport = (key: string) =>
  apiFetch<TestReport>(`/models/full_report/${key}`, STABLE)
 
export const getConfusionMatrixKeys = () =>
  apiFetch<{ keys: string[] }>("/models/confusion_matrix_keys", STABLE)
 
export const getRocCurveKeys = () =>
  apiFetch<{ keys: string[] }>("/models/roc_curve_keys", STABLE)
 
// ─── Interpretability ─────────────────────────────────────────────────────────
export const getInterpretabilitySummary = () =>
  apiFetch<InterpretabilitySummary>(
    "/models/interpretability/summary",
    STABLE
  )
 
export const getLrCoefficients = (rep: string) =>
  apiFetch<LrCoefficients>(
    `/models/interpretability/coefficients/${rep}`,
    STABLE
  )
 
export const getAttention = () =>
  apiFetch<AttentionData>("/models/interpretability/attention", STABLE)
 
// ─── Error Analysis ───────────────────────────────────────────────────────────
export const getErrorSummary = () =>
  apiFetch<ErrorAnalysisSummary>("/models/error_analysis/summary", STABLE)
 
export const getErrorDetail = (key: string) =>
  apiFetch<ErrorAnalysisDetail>(`/models/error_analysis/${key}`, STABLE)
 
export const getErrorKeys = () =>
  apiFetch<{ keys: string[] }>("/models/error_analysis_keys", STABLE)
 
// ─── Prediction ───────────────────────────────────────────────────────────────
export async function predict(text: string): Promise<PredictResponse> {
  const res = await fetch(`${API}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    cache: "no-store",
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(
      (err as { detail?: string }).detail ?? res.statusText
    )
  }
  return res.json() as Promise<PredictResponse>
}
 
export async function predictBatch(
  texts: string[]
): Promise<PredictResponse[]> {
  const res = await fetch(`${API}/predict/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(texts),
    cache: "no-store",
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(
      (err as { detail?: string }).detail ?? res.statusText
    )
  }
  return res.json() as Promise<PredictResponse[]>
}
 
// ─── Plot URLs ────────────────────────────────────────────────────────────────
export function plotUrl(
  section: "eda" | "models",
  name: string
): string {
  return `${API}/${section}/plots/${name}`
}
 
export { API }
 