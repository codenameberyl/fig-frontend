// FIG-Loneliness API Types
// Exact shapes from FastAPI backend - no mock data

// GET /api/status
export interface StatusResponse {
  status: 'ok'
  title: string
  version: string
  results_available: boolean
  completed_steps: string[]
  pending_steps: string[]
  pipeline_state: Record<string, { status: string; timestamp?: string } & Record<string, unknown>>
}

// GET /api/eda/dataset
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
  label_map: { '0': string; '1': string }
}

// GET /api/eda/class_distribution
export interface ClassDistributionSplit {
  total: number
  lonely: number
  non_lonely: number
  lonely_pct: number
}

export interface ClassDistribution {
  train: ClassDistributionSplit
  validation: ClassDistributionSplit
  test: ClassDistributionSplit
}

// GET /api/eda/length_stats
export interface DescStats {
  mean: number
  median: number
  std: number
  min: number
  max: number
  q25: number
  q75: number
}

export interface LengthStats {
  word_count: { non_lonely: DescStats; lonely: DescStats }
  char_count: { non_lonely: DescStats; lonely: DescStats }
  sentence_count: { non_lonely: DescStats; lonely: DescStats }
}

// GET /api/eda/linguistic_stats
export interface LinguisticStats {
  [feature: string]: { non_lonely: DescStats; lonely: DescStats }
}

// GET /api/eda/ngrams
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

// GET /api/eda/pos_distribution
export interface PosDistribution {
  non_lonely: Record<string, number>
  lonely: Record<string, number>
}

// GET /api/eda/preprocessing/samples
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

// GET /api/eda/preprocessing/summary
export interface PreprocessingSummary {
  status: string
  timestamp: string
  feature_columns: string[]
  train_size: number
  val_size: number
  test_size: number
}

// GET /api/models/results
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

// GET /api/models/test_report
export interface ClassificationReportClass {
  precision: number
  recall: number
  'f1-score': number
  support: number
}

export interface ClassificationReport {
  'Non-Lonely': ClassificationReportClass
  'Lonely': ClassificationReportClass
  accuracy: number
  'macro avg': ClassificationReportClass
  'weighted avg': ClassificationReportClass
}

export interface ConfusionMatrix {
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

export interface RocCurve {
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
  confusion_matrix: ConfusionMatrix
  roc_curve: RocCurve
}

// GET /api/models/error_analysis/summary
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

export interface ErrorAnalysisSummary {
  best_model_key: string
  n_models_analysed: number
  model_summaries: ErrorModelSummary[]
  confusion_overlap: { 
    top_confused_posts: { 
      unique_id: string
      n_models_wrong: number
      models: string[] 
    }[] 
  }
  qualitative_patterns: { 
    n_fp_analysed: number
    n_fn_analysed: number
    observations: string[] 
  }
  error_rate_ranking: ErrorModelSummary[]
}

// GET /api/models/error_analysis/{modelKey}
export interface ErrorExampleFeatures {
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
  outcome: 'FP' | 'FN'
  original_text: string
  cleaned_text: string
  word_count: number
  features: ErrorExampleFeatures
}

export interface ErrorAnalysisDetail {
  summary: ErrorModelSummary
  false_positives: ErrorExample[]
  false_negatives: ErrorExample[]
}

// GET /api/models/error_analysis_keys
export interface ErrorAnalysisKeys {
  keys: string[]
}

// GET /api/models/interpretability/summary
export interface InterpretabilityItem {
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

export interface InterpretabilitySummary {
  [representation: string]: InterpretabilityItem
}

// GET /api/models/interpretability/coefficients/{representation}
export interface FeatureRanked {
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
  lonely_indicators: { feature: string; coefficient: number }[]
  non_lonely_indicators: { feature: string; coefficient: number }[]
  features_ranked?: FeatureRanked[]
}

// GET /api/models/interpretability/attention
export interface AttentionData {
  representation: string
  method: string
  caveat: string
  n_lonely_samples: number
  n_non_lonely_samples: number
  top_n: number
  lonely_top_tokens: { token: string; avg_attention: number }[]
  non_lonely_top_tokens: { token: string; avg_attention: number }[]
}

// POST /api/predict
export interface PredictResponse {
  label: 0 | 1
  label_name: 'lonely' | 'non_lonely'
  confidence: number
  threshold_used: number
  representation: string
  model: string
  input_text: string
}

// Helper types for components
export interface RocPoint {
  fpr: number
  tpr: number
  threshold?: number
}

export type ConfusionMatrixData = ConfusionMatrix

