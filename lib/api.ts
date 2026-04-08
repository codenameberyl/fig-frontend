// FIG-Loneliness API Client
// All data fetched from live API - no mock data

import type {
  StatusResponse,
  DatasetSummary,
  ClassDistribution,
  LengthStats,
  LinguisticStats,
  NGrams,
  PosDistribution,
  PreprocessingSamples,
  PreprocessingSummary,
  ModelResultsResponse,
  ModelResult,
  TestReport,
  ConfusionMatrix,
  RocCurve,
  InterpretabilitySummary,
  LrCoefficients,
  AttentionData,
  ErrorAnalysisSummary,
  ErrorAnalysisDetail,
  ErrorAnalysisKeys,
  PredictResponse,
} from './types'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://your-space.hf.space/api'

// Stable results (revalidate every hour)
const STABLE = { next: { revalidate: 3600 } }
// Dynamic data (no cache)
const DYNAMIC = { cache: 'no-store' as const }

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, opts)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

// Status
export const getStatus = () => apiFetch<StatusResponse>('/status', DYNAMIC)

// EDA Endpoints
export const getDatasetSummary = () => apiFetch<DatasetSummary>('/eda/dataset', STABLE)
export const getClassDistribution = () => apiFetch<ClassDistribution>('/eda/class_distribution', STABLE)
export const getLengthStats = () => apiFetch<LengthStats>('/eda/length_stats', STABLE)
export const getLinguisticStats = () => apiFetch<LinguisticStats>('/eda/linguistic_stats', STABLE)
export const getNgrams = () => apiFetch<NGrams>('/eda/ngrams', STABLE)
export const getPosDistribution = () => apiFetch<PosDistribution>('/eda/pos_distribution', STABLE)

// Preprocessing Endpoints
export const getPreprocessingSamples = (split = 'train', label = 'both', n = 10) =>
  apiFetch<PreprocessingSamples>(`/eda/preprocessing/samples?split=${split}&label=${label}&n=${n}`, STABLE)
export const getPreprocessingSummary = () => apiFetch<PreprocessingSummary>('/eda/preprocessing/summary', STABLE)

// Model Endpoints
export const getModelResults = () => apiFetch<ModelResultsResponse>('/models/results', STABLE)
export const getBestPerRepresentation = () => apiFetch<ModelResult[]>('/models/best_per_representation', STABLE)
export const getTestReport = () => apiFetch<TestReport>('/models/test_report', STABLE)
export const getConfusionMatrix = (key: string) => apiFetch<ConfusionMatrix>(`/models/confusion_matrix/${key}`, STABLE)
export const getRocCurve = (key: string) => apiFetch<RocCurve>(`/models/roc_curve/${key}`, STABLE)
export const getFullReport = (key: string) => apiFetch<TestReport>(`/models/full_report/${key}`, STABLE)

// Interpretability Endpoints
export const getInterpretabilitySummary = () => apiFetch<InterpretabilitySummary>('/models/interpretability/summary', STABLE)
export const getLrCoefficients = (rep: string) => apiFetch<LrCoefficients>(`/models/interpretability/coefficients/${rep}`, STABLE)
export const getAttention = () => apiFetch<AttentionData>('/models/interpretability/attention', STABLE)

// Error Analysis Endpoints
export const getErrorSummary = () => apiFetch<ErrorAnalysisSummary>('/models/error_analysis/summary', STABLE)
export const getErrorDetail = (key: string) => apiFetch<ErrorAnalysisDetail>(`/models/error_analysis/${key}`, STABLE)
export const getErrorKeys = () => apiFetch<ErrorAnalysisKeys>('/models/error_analysis_keys', STABLE)

// Prediction
export async function predict(text: string): Promise<PredictResponse> {
  const res = await fetch(`${API}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
    cache: 'no-store',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? res.statusText)
  }
  return res.json()
}

export async function predictBatch(texts: string[]): Promise<PredictResponse[]> {
  const res = await fetch(`${API}/predict/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(texts),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// Plot URL builder
export function plotUrl(section: 'eda' | 'models', name: string): string {
  return `${API}/${section}/plots/${name}`
}
