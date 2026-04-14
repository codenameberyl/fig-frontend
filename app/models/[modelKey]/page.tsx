"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Dot,
} from "recharts"
import { getFullReport, plotUrl } from "@/lib/api"
import type { TestReport } from "@/lib/types"
import { TOOLTIP_STYLE, repLabel, modelLabel, fmt } from "@/lib/utils"
import {
  PageHeader, SectionCard, PlotImage, EmptyState,
  SkeletonCard, MetricCard, MetricCardSkeleton, RepresentationBadge,
} from "@/components/shared"
import { ChevronLeft } from "lucide-react"

export default function ModelDetailPage() {
  const { modelKey } = useParams<{ modelKey: string }>()
  const [report, setReport] = useState<TestReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!modelKey) return
    getFullReport(modelKey)
      .then(setReport)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [modelKey])

  const parts = modelKey?.split("_") ?? []
  const repPart = parts.slice(0, -1).join("_")
  const modelPart = parts[parts.length - 1]

  const cm = report?.confusion_matrix
  const roc = report?.roc_curve
  const cr = report?.classification_report

  const rocData = roc ? roc.fpr.map((fpr, i) => ({
    fpr: parseFloat(fpr.toFixed(4)),
    tpr: parseFloat(roc.tpr[i].toFixed(4)),
  })) : []

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/models" className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors">
          <ChevronLeft className="h-3 w-3" /> Models
        </Link>
        <span className="text-slate-700">/</span>
        <RepresentationBadge rep={repPart} />
        <span className="text-slate-700">/</span>
        <span className="text-xs font-mono text-slate-400">{modelLabel(modelPart)}</span>
      </div>

      <PageHeader
        title={`${repLabel(repPart)} · ${modelLabel(modelPart)}`}
        subtitle="Full test-set evaluation: confusion matrix, ROC curve, and classification report"
        badge="Model Detail"
      />

      {error && <p className="text-rose-400 text-sm mb-6">{error}</p>}

      {/* Metric summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {loading ? (
          <>
            <MetricCardSkeleton /><MetricCardSkeleton /><MetricCardSkeleton /><MetricCardSkeleton />
          </>
        ) : cr ? (
          <>
            <MetricCard label="Accuracy" value={fmt(cr.accuracy, 4)} accentColor="#06b6d4" />
            <MetricCard label="Precision (Lonely)" value={fmt(cr["Lonely"].precision, 4)} accentColor="#7c3aed" />
            <MetricCard label="Recall (Lonely)" value={fmt(cr["Lonely"].recall, 4)} accentColor="#f43f5e" />
            <MetricCard label="F1 (Lonely)" value={fmt(cr["Lonely"]["f1-score"], 4)} accentColor="#10b981" />
          </>
        ) : null}
      </div>

      {/* Confusion Matrix + ROC */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Confusion Matrix */}
        <SectionCard title="Confusion Matrix" description="Test set predictions vs ground truth labels">
          {loading ? <SkeletonCard /> : !cm ? <EmptyState /> : (
            <>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: "True Positive", value: cm.tp, color: "#10b981", bg: "bg-emerald-600/10", border: "border-emerald-600/20", desc: "Correctly classified lonely" },
                  { label: "False Positive", value: cm.fp, color: "#f43f5e", bg: "bg-rose-600/10", border: "border-rose-600/20", desc: "Non-lonely classified as lonely" },
                  { label: "False Negative", value: cm.fn, color: "#f43f5e", bg: "bg-rose-600/10", border: "border-rose-600/20", desc: "Lonely classified as non-lonely" },
                  { label: "True Negative", value: cm.tn, color: "#4C9BE8", bg: "bg-blue-600/10", border: "border-blue-600/20", desc: "Correctly classified non-lonely" },
                ].map(({ label, value, color, bg, border, desc }) => (
                  <div key={label} className={`${bg} border ${border} rounded-xl p-4`}>
                    <p className="text-xs text-slate-500 mb-1">{label}</p>
                    <p className="text-2xl font-mono font-bold" style={{ color }}>{value}</p>
                    <p className="text-[10px] text-slate-600 mt-1">{desc}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#1e1e2e] rounded-lg p-3">
                  <p className="text-slate-500 mb-1">Sensitivity (Recall)</p>
                  <p className="font-mono text-emerald-400 text-lg font-bold">{fmt(cm.sensitivity, 4)}</p>
                </div>
                <div className="bg-[#1e1e2e] rounded-lg p-3">
                  <p className="text-slate-500 mb-1">Specificity</p>
                  <p className="font-mono text-blue-400 text-lg font-bold">{fmt(cm.specificity, 4)}</p>
                </div>
              </div>
              <PlotImage
                src={plotUrl("models", `eval_confusion_${modelKey}.png`)}
                alt="Confusion matrix"
                caption={`eval_confusion_${modelKey}.png`}
                className="mt-4"
              />
            </>
          )}
        </SectionCard>

        {/* ROC Curve */}
        <SectionCard title="ROC Curve" description="Receiver Operating Characteristic — test set">
          {loading ? <SkeletonCard /> : !roc ? <EmptyState /> : (
            <>
              <div className="text-center mb-3">
                <span className="text-3xl font-mono font-bold text-violet-400">{fmt(roc.auc, 4)}</span>
                <p className="text-xs text-slate-500">AUC</p>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rocData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                    <XAxis dataKey="fpr" type="number" domain={[0, 1]} stroke="#64748b" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} tickFormatter={(v: number) => v.toFixed(1)} label={{ value: "FPR", position: "insideBottom", offset: -5, fill: "#64748b", fontSize: 10 }} />
                    <YAxis type="number" domain={[0, 1]} stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v: number) => v.toFixed(1)} label={{ value: "TPR", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 10 }} />
                    <Tooltip {...TOOLTIP_STYLE} formatter={(v: any) => typeof v === 'number' ? fmt(v, 4) : v} />
                    <ReferenceLine x={0} y={0} stroke="#2e2e3e" strokeDasharray="4 4" />
                    <Line
                      type="linear"
                      dataKey="tpr"
                      stroke="#7c3aed"
                      strokeWidth={2}
                      dot={false}
                      name="TPR"
                    />
                    {/* Diagonal baseline */}
                    <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }] as any} stroke="#2e2e3e" strokeDasharray="4 4" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="text-slate-500">Optimal Threshold</p>
                  <p className="font-mono text-violet-400">{fmt(roc.optimal_threshold, 4)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Optimal FPR</p>
                  <p className="font-mono text-slate-300">{fmt(roc.optimal_fpr, 4)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Optimal TPR</p>
                  <p className="font-mono text-slate-300">{fmt(roc.optimal_tpr, 4)}</p>
                </div>
              </div>
              <PlotImage
                src={plotUrl("models", `eval_roc_${modelKey}.png`)}
                alt="ROC curve"
                caption={`eval_roc_${modelKey}.png`}
                className="mt-4"
              />
            </>
          )}
        </SectionCard>
      </div>

      {/* Classification Report */}
      <SectionCard title="Classification Report" description="Full per-class metrics on the test set">
        {loading ? <SkeletonCard /> : !cr ? <EmptyState /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
                {["Class", "Precision", "Recall", "F1-Score", "Support"].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs text-slate-500 font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(["Non-Lonely", "Lonely", "macro avg", "weighted avg"] as const).map(cls => {
                const row = cr[cls]
                const isLonely = cls === "Lonely"
                return (
                  <tr key={cls} className={`border-b border-[#1e1e2e]/50 ${isLonely ? "bg-rose-600/5" : ""}`}>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-mono ${isLonely ? "text-rose-400" : cls === "Non-Lonely" ? "text-blue-400" : "text-slate-400"}`}>
                        {cls}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-xs text-slate-300">{fmt(row.precision, 4)}</td>
                    <td className="py-2.5 px-3 font-mono text-xs text-slate-300">{fmt(row.recall, 4)}</td>
                    <td className="py-2.5 px-3 font-mono text-xs text-slate-300">{fmt(row["f1-score"], 4)}</td>
                    <td className="py-2.5 px-3 font-mono text-xs text-slate-500">{row.support}</td>
                  </tr>
                )
              })}
              <tr>
                <td className="py-2.5 px-3 font-mono text-xs text-slate-400">accuracy</td>
                <td colSpan={3} className="py-2.5 px-3" />
                <td className="py-2.5 px-3 font-mono text-xs font-bold text-violet-400">{fmt(cr.accuracy, 4)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </SectionCard>
    </div>
  )
}
