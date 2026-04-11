import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmt(n: number | undefined | null, decimals = 4): string {
  if (n == null) return "—"
  return n.toFixed(decimals)
}
 
export function fmtPct(n: number | undefined | null, decimals = 1): string {
  if (n == null) return "—"
  return `${(n * 100).toFixed(decimals)}%`
}
 
export function fmtCount(n: number | undefined | null): string {
  if (n == null) return "—"
  return n.toLocaleString()
}
 
export function modelLabel(model: string): string {
  const map: Record<string, string> = {
    logistic_regression: "LR",
    svm: "SVM",
    random_forest: "RF",
    distilbert: "DistilBERT",
  }
  return map[model] ?? model
}
 
export function repLabel(rep: string): string {
  const map: Record<string, string> = {
    linguistic_only: "Linguistic Only",
    tfidf: "TF-IDF",
    tfidf_ling: "TF-IDF + Ling.",
    word2vec: "Word2Vec",
    sbert: "SBERT",
    distilbert: "DistilBERT",
  }
  return map[rep] ?? rep
}
 
export function modelKey(rep: string, model: string): string {
  return `${rep}_${model}`
}
 
export function relativeTime(iso?: string): string {
  if (!iso) return "—"
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return d.toLocaleDateString()
}
 
export const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#1e1e2e",
    border: "1px solid #2e2e3e",
    borderRadius: "8px",
    fontFamily: "'JetBrains Mono', monospace",
  },
  labelStyle: { color: "#e2e8f0", fontSize: 12 },
  itemStyle: { color: "#ffffff", fontSize: 12 },
}
 
export const REP_COLOURS: Record<string, string> = {
  linguistic_only: "#10b981",
  tfidf: "#06b6d4",
  tfidf_ling: "#7c3aed",
  word2vec: "#f59e0b",
  sbert: "#3b82f6",
  distilbert: "#f43f5e",
}
 
export const LONELY_COLOR = "#f43f5e"
export const NON_LONELY_COLOR = "#4C9BE8"
 
export const PIPELINE_STEP_LABELS: Record<string, string> = {
  load_dataset: "Load Dataset",
  preprocess: "Preprocessing",
  eda: "EDA",
  build_features: "Feature Engineering",
  train_models: "Model Training",
  evaluation: "Evaluation",
  error_analysis: "Error Analysis",
  interpretability: "Interpretability",
}
 
export const NAV_STEP_MAP: Record<string, string> = {
  "/": "load_dataset",
  "/preprocessing": "preprocess",
  "/eda": "eda",
  "/models": "train_models",
  "/interpretability": "interpretability",
  "/error-analysis": "error_analysis",
  "/demo": "evaluation",
}
 