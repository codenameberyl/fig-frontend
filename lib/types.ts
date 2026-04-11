// ─── Status ───────────────────────────────────────────────────────────────────
export interface PipelineStepState {
  status: "done" | "running" | "error"
  timestamp?: string
  [key: string]: unknown
}

export interface StatusResponse {
  status: "ok"
  title: string
  version: string
  results_available: boolean
  completed_steps: string[]
  pending_steps: string[]
  pipeline_state: Record<string, PipelineStepState>
}

// ─── Dataset ──────────────────────────────────────────────────────────────────
export interface SplitInfo {
  n_samples: number
  columns: string[]
  n_lonely: number
  n_non_lonely: number
}

export interface DatasetSummary {
  splits: {
    train: SplitInfo
    validation: SplitInfo
    test: SplitInfo
  }
  total_samples: number
  label_map: { "0": string; "1": string }
}

// ─── EDA ──────────────────────────────────────────────────────────────────────
export interface ClassDistSplit {
  total: number
  lonely: number
  non_lonely: number
  lonely_pct: number
}

export interface ClassDistribution {
  train: ClassDistSplit
  validation: ClassDistSplit
  test: ClassDistSplit
}

export interface DescStats {
  mean: number
  median: number
  std: number
  min: number
  max: number
  q25: number
  q75: number
}

export interface LengthFeatureStats {
  non_lonely: DescStats
  lonely: DescStats
}

export interface LengthStats {
  word_count: LengthFeatureStats
  char_count: LengthFeatureStats
  sentence_count: LengthFeatureStats
}

export type LinguisticStats = Record<string, LengthFeatureStats>

export interface NGramEntry {
  term: string
  count: number
}

export interface NGrams {
  non_lonely_unigrams: NGramEntry[]
  lonely_unigrams: NGramEntry[]
  non_lonely_bigrams: NGramEntry[]
  lonely_bigrams: NGramEntry[]
}

export interface PosDistribution {
  non_lonely: Record<string, number>
  lonely: Record<string, number>
}

// ─── Preprocessing ────────────────────────────────────────────────────────────
export interface PreprocessedSample {
  idx: number
  unique_id: string
  text: string
  cleaned: string
  word_count: number
  char_count: number
  sentence_count: number
  pronoun_ratio: number
  negation_ratio: number
  social_word_ratio: number
  emotion_word_ratio: number
  label: 0 | 1
  tokens_preview: string[]
  lemmas_preview: string[]
}

export interface PreprocessingSamples {
  split: string
  lonely: PreprocessedSample[]
  non_lonely: PreprocessedSample[]
}

export interface PreprocessingSummary {
  status: string
  timestamp: string
  feature_columns: string[]
  train_size: number
  val_size: number
  test_size: number
}

// ─── Models ───────────────────────────────────────────────────────────────────
export interface ModelResult {
  representation: string
  model: string
  split: string
  accuracy?: number
  precision?: number
  recall?: number
  f1?: number
  roc_auc?: number
  test_accuracy?: number
  test_precision?: number
  test_recall?: number
  test_f1?: number
  test_roc_auc?: number
  runtime?: number
  samples_per_second?: number
  steps_per_second?: number
}

export interface ModelResultsResponse {
  results: ModelResult[]
  best_representation: string
  best_model: string
  best_f1: number
}

export interface ClassMetrics {
  precision: number
  recall: number
  "f1-score": number
  support: number
}

export interface ClassificationReport {
  "Non-Lonely": ClassMetrics
  Lonely: ClassMetrics
  accuracy: number
  "macro avg": ClassMetrics
  "weighted avg": ClassMetrics
}

export interface ConfusionMatrixData {
  model_key: string
  labels: string[]
  matrix: number[][]
  tn: number
  fp: number
  fn: number
  tp: number
  total: number
  accuracy: number
  sensitivity: number
  specificity: number
}

export interface RocCurveData {
  model_key: string
  auc: number
  fpr: number[]
  tpr: number[]
  thresholds: number[]
  optimal_threshold: number
  optimal_fpr: number
  optimal_tpr: number
}

export interface TestReport {
  representation: string
  model: string
  roc_auc: number
  classification_report: ClassificationReport
  confusion_matrix: ConfusionMatrixData
  roc_curve: RocCurveData
}

// ─── Error Analysis ───────────────────────────────────────────────────────────
export interface ErrorFeatures {
  word_count: number
  char_count: number
  sentence_count: number
  avg_sentence_length: number
  type_token_ratio: number
  pronoun_ratio: number
  negation_ratio: number
  social_word_ratio: number
  emotion_word_ratio: number
  noun_ratio: number
  verb_ratio: number
  adj_ratio: number
  adv_ratio: number
}

export interface ErrorExample {
  dataset_idx: number
  unique_id: string
  true_label: 0 | 1
  predicted_label: 0 | 1
  outcome: "FP" | "FN"
  original_text: string
  cleaned_text: string
  word_count: number
  features: ErrorFeatures
}

export interface ErrorModelSummary {
  representation: string
  model: string
  total_test: number
  TP: number
  TN: number
  FP: number
  FN: number
  error_rate: number
  fp_rate: number
  fn_rate: number
  false_positives_avg_features?: Record<string, number>
  false_negatives_avg_features?: Record<string, number>
}

export interface ConfusedPost {
  unique_id: string
  n_models_wrong: number
  models: string[]
}

export interface ErrorAnalysisSummary {
  best_model_key: string
  n_models_analysed: number
  model_summaries: ErrorModelSummary[]
  confusion_overlap: { top_confused_posts: ConfusedPost[] }
  qualitative_patterns: {
    n_fp_analysed: number
    n_fn_analysed: number
    observations: string[]
  }
  error_rate_ranking: ErrorModelSummary[]
}

export interface ErrorAnalysisDetail {
  summary: ErrorModelSummary
  false_positives: ErrorExample[]
  false_negatives: ErrorExample[]
}

// ─── Interpretability ─────────────────────────────────────────────────────────
export interface RepInterpretability {
  representation: string
  interpretability_score: number
  interpretability_rationale: string
  computational_cost: string
  best_f1: number
  best_model: string
  top_lonely_features?: string[]
  top_non_lonely_features?: string[]
  top_lonely_tokens?: string[]
  top_non_lonely_tokens?: string[]
  attention_caveat?: string
}

export type InterpretabilitySummary = Record<string, RepInterpretability>

export interface FeatureCoeff {
  feature: string
  coefficient: number
}

export interface RankedFeature {
  rank: number
  feature: string
  coefficient: number
  direction: string
  abs_rank: number
}

export interface LrCoefficients {
  representation: string
  model: string
  n_features_total: number
  top_n: number
  lonely_indicators?: FeatureCoeff[]
  non_lonely_indicators?: FeatureCoeff[]
  features_ranked?: RankedFeature[]
  n_features?: number
}

export interface TokenAttention {
  token: string
  avg_attention: number
}

export interface AttentionData {
  representation: string
  method: string
  caveat: string
  n_lonely_samples: number
  n_non_lonely_samples: number
  top_n: number
  lonely_top_tokens: TokenAttention[]
  non_lonely_top_tokens: TokenAttention[]
}

// ─── Prediction ───────────────────────────────────────────────────────────────
export interface PredictResponse {
  label: 0 | 1
  label_name: "lonely" | "non_lonely"
  confidence: number
  threshold_used: number
  representation: string
  model: string
  input_text: string
}

export interface BatchPredictItem extends PredictResponse {
  error?: string
}
