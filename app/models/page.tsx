"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { getModelResults, getBestPerRep, plotUrl } from "@/lib/api"
import type { ModelResult, ModelResultsResponse } from "@/lib/types"
import {
  TOOLTIP_STYLE, REP_COLOURS, fmt, repLabel, modelLabel,
} from "@/lib/utils"
import {
  PageHeader, SectionCard, PlotImage, EmptyState,
  SkeletonCard, RepresentationBadge,
} from "@/components/shared"
import { ArrowUpDown, Trophy } from "lucide-react"

const REP_INFO = [
  { key: "linguistic_only", dim: "13-d", type: "Sparse", kind: "Classical", desc: "Handcrafted psycholinguistic features" },
  { key: "tfidf", dim: "15,000-d", type: "Sparse", kind: "Classical", desc: "TF-IDF unigram + bigram bag-of-words" },
  { key: "tfidf_ling", dim: "15,013-d", type: "Sparse", kind: "Classical", desc: "TF-IDF combined with 13 linguistic features" },
  { key: "word2vec", dim: "200-d", type: "Dense", kind: "Classical", desc: "Averaged Word2Vec token embeddings" },
  { key: "sbert", dim: "384-d", type: "Dense", kind: "Classical", desc: "Sentence-BERT contextual embeddings (all-MiniLM-L6-v2)" },
  { key: "distilbert", dim: "—", type: "Neural", kind: "Fine-tuned", desc: "End-to-end DistilBERT fine-tuning" },
]

type SortKey = keyof Pick<ModelResult, "f1" | "roc_auc" | "accuracy" | "test_f1" | "test_roc_auc">

export default function ModelsPage() {
  const [results, setResults] = useState<ModelResultsResponse | null>(null)
  const [bestPerRep, setBestPerRep] = useState<ModelResult[]>([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>("f1")
  const [sortDesc, setSortDesc] = useState(true)
  const [metricMode, setMetricMode] = useState<"val" | "test">("val")

  useEffect(() => {
    Promise.allSettled([getModelResults(), getBestPerRep()]).then(([r, b]) => {
      if (r.status === "fulfilled") setResults(r.value)
      if (b.status === "fulfilled") setBestPerRep(b.value)
      setLoading(false)
    })
  }, [])

  const sorted = useMemo(() => {
    if (!results?.results) return []
    return [...results.results].sort((a, b) => {
      const av = (a[sortKey] ?? 0) as number
      const bv = (b[sortKey] ?? 0) as number
      return sortDesc ? bv - av : av - bv
    })
  }, [results, sortKey, sortDesc])

  const toggle = (key: SortKey) => {
    if (sortKey === key) setSortDesc(!sortDesc)
    else { setSortKey(key); setSortDesc(true) }
  }

  const colLabel = (k: string) => {
    if (k.startsWith("test_")) return k.replace("test_", "").toUpperCase()
    return k === "roc_auc" ? "AUC" : k.toUpperCase()
  }

  const valCols: SortKey[] = ["f1", "roc_auc", "accuracy"]
  const testCols: SortKey[] = ["test_f1", "test_roc_auc", "test_accuracy"]
  const activeCols = metricMode === "val" ? valCols : testCols

  const radarData = bestPerRep.map(r => ({
    rep: repLabel(r.representation),
    F1: (r.f1 ?? 0),
    AUC: (r.roc_auc ?? 0),
    Precision: (r.precision ?? 0),
    Recall: (r.recall ?? 0),
  }))

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Model Comparison"
        subtitle="RQ2 & RQ3: How well do baseline and advanced representations detect loneliness self-disclosure?"
        badge="Models"
      />

      {/* Representation info */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {REP_INFO.map(({ key, dim, type, kind, desc }) => (
          <div key={key} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <RepresentationBadge rep={key} />
              <div className="flex gap-1">
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                  type === "Dense" ? "bg-amber-600/10 border-amber-600/20 text-amber-400"
                  : type === "Neural" ? "bg-rose-600/10 border-rose-600/20 text-rose-400"
                  : "bg-blue-600/10 border-blue-600/20 text-blue-400"
                }`}>{type}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">{desc}</p>
            <p className="text-[10px] font-mono text-slate-600 mt-1">{dim} · {kind}</p>
          </div>
        ))}
      </div>

      {/* Metric mode toggle */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-slate-500">Show metrics:</span>
        {(["val", "test"] as const).map(m => (
          <button
            key={m}
            onClick={() => setMetricMode(m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              metricMode === m
                ? "bg-violet-600/20 border-violet-600/30 text-violet-300"
                : "border-[#1e1e2e] text-slate-500 hover:text-slate-300"
            }`}
          >
            {m === "val" ? "Validation" : "Test"}
          </button>
        ))}
      </div>

      {/* Results table */}
      <SectionCard className="mb-6 overflow-x-auto">
        {loading ? <SkeletonCard lines={5} /> : !results ? <EmptyState /> : (
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
                <th className="text-left py-2.5 px-3 text-xs text-slate-500 font-medium">Representation</th>
                <th className="text-left py-2.5 px-3 text-xs text-slate-500 font-medium">Model</th>
                {activeCols.map(col => (
                  <th key={col} className="py-2.5 px-3 text-xs text-slate-500 font-medium">
                    <button
                      onClick={() => toggle(col)}
                      className="flex items-center gap-1 hover:text-slate-300 transition-colors font-mono"
                    >
                      {colLabel(col)}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                ))}
                <th className="py-2.5 px-3 text-xs text-slate-500 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => {
                const isBest = r.representation === results.best_representation && r.model === results.best_model
                return (
                  <tr
                    key={i}
                    className={`border-b border-[#1e1e2e]/50 transition-colors ${
                      isBest ? "bg-violet-600/5 border-l-2 border-l-violet-500" : "hover:bg-white/2"
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <RepresentationBadge rep={r.representation} />
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        {isBest && <Trophy className="h-3 w-3 text-amber-400" />}
                        <span className="text-xs font-mono text-slate-300">{modelLabel(r.model)}</span>
                      </div>
                    </td>
                    {activeCols.map(col => {
                      const v = r[col] as number | undefined
                      const isF1 = col.includes("f1")
                      const color = v && v > 0.95 ? "text-emerald-400" : v && v > 0.9 ? "text-blue-400" : "text-slate-300"
                      return (
                        <td key={col} className={`py-2.5 px-3 font-mono text-xs ${color}`}>
                          {v != null ? fmt(v, 4) : "—"}
                        </td>
                      )
                    })}
                    <td className="py-2.5 px-3">
                      <Link
                        href={`/models/${r.representation}_${r.model}`}
                        className="text-xs text-violet-400 hover:text-violet-300 font-mono transition-colors"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </SectionCard>

      {/* Best per rep chart */}
      <SectionCard title="Best Model per Representation" description="F1, Precision, Recall, and ROC-AUC for the best-performing model per representation (validation set)" className="mb-6">
        {loading ? <SkeletonCard lines={3} /> : radarData.length === 0 ? <EmptyState /> : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={radarData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="rep" stroke="#64748b" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
                <YAxis stroke="#64748b" domain={[0.8, 1]} tick={{ fontSize: 10 }} tickFormatter={v => fmt(v, 2)} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => fmt(v, 4)} />
                <Legend wrapperStyle={{ color: "#e2e8f0", fontSize: 11 }} />
                <Bar dataKey="F1" fill="#7c3aed" radius={[4, 4, 0, 0]}>
                  {radarData.map((r, i) => (
                    <Bar.Rectangle key={i} fill={REP_COLOURS[bestPerRep[i]?.representation ?? ""] ?? "#7c3aed"} />
                  ))}
                </Bar>
                <Bar dataKey="AUC" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Precision" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Recall" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionCard>

      <PlotImage src={plotUrl("models", "eval_model_comparison.png")} alt="Model comparison" caption="Static output: eval_model_comparison.png" className="mb-4" />
      <PlotImage src={plotUrl("models", "eval_representation_comparison.png")} alt="Representation comparison" caption="Static output: eval_representation_comparison.png" />
    </div>
  )
}
