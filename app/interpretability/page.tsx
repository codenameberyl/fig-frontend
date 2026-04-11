"use client"

import { useEffect, useState } from "react"
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Cell,
} from "recharts"
import {
  getInterpretabilitySummary, getLrCoefficients, getAttention, plotUrl,
} from "@/lib/api"
import type { InterpretabilitySummary, LrCoefficients, AttentionData } from "@/lib/types"
import { TOOLTIP_STYLE, REP_COLOURS, repLabel, fmt } from "@/lib/utils"
import {
  PageHeader, SectionCard, PlotImage, EmptyState,
  SkeletonCard, Tag, Callout, RepresentationBadge,
} from "@/components/shared"

const COEFF_TABS = ["linguistic_only", "tfidf", "tfidf_ling"] as const
type CoeffTab = (typeof COEFF_TABS)[number]

const SCORE_DOTS = (score: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`h-2 w-2 rounded-full inline-block mr-0.5 ${i < score ? "bg-violet-500" : "bg-[#1e1e2e]"}`} />
  ))

export default function InterpretabilityPage() {
  const [summary, setSummary] = useState<InterpretabilitySummary | null>(null)
  const [coefficients, setCoefficients] = useState<Record<string, LrCoefficients>>({})
  const [attention, setAttention] = useState<AttentionData | null>(null)
  const [coeffTab, setCoeffTab] = useState<CoeffTab>("linguistic_only")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      getInterpretabilitySummary(),
      getLrCoefficients("linguistic_only"),
      getLrCoefficients("tfidf"),
      getLrCoefficients("tfidf_ling"),
      getAttention(),
    ]).then(([s, lo, tf, tfl, at]) => {
      if (s.status === "fulfilled") setSummary(s.value)
      const coeffs: Record<string, LrCoefficients> = {}
      if (lo.status === "fulfilled") coeffs["linguistic_only"] = lo.value
      if (tf.status === "fulfilled") coeffs["tfidf"] = tf.value
      if (tfl.status === "fulfilled") coeffs["tfidf_ling"] = tfl.value
      setCoefficients(coeffs)
      if (at.status === "fulfilled") setAttention(at.value)
      setLoading(false)
    })
  }, [])

  const scatterData = summary
    ? Object.entries(summary).map(([rep, data]) => ({
        rep,
        x: data.interpretability_score,
        y: data.best_f1,
        model: data.best_model,
        cost: data.computational_cost,
      }))
    : []

  const activeCoeff = coefficients[coeffTab]

  const getCoeffData = () => {
    if (!activeCoeff) return { lonely: [], nonLonely: [] }
    if (activeCoeff.features_ranked) {
      const lonely = activeCoeff.features_ranked.filter(f => f.direction === "lonely").slice(0, 13)
      const nonLonely = activeCoeff.features_ranked.filter(f => f.direction === "non_lonely").slice(0, 13)
      return {
        lonely: lonely.map(f => ({ feature: f.feature, coefficient: Math.abs(f.coefficient) })),
        nonLonely: nonLonely.map(f => ({ feature: f.feature, coefficient: Math.abs(f.coefficient) })),
      }
    }
    return {
      lonely: (activeCoeff.lonely_indicators ?? []).slice(0, 25).map(f => ({ feature: f.feature, coefficient: Math.abs(f.coefficient) })),
      nonLonely: (activeCoeff.non_lonely_indicators ?? []).slice(0, 25).map(f => ({ feature: f.feature, coefficient: Math.abs(f.coefficient) })),
    }
  }

  const { lonely: lonelyCoeffs, nonLonely: nonLonelyCoeffs } = getCoeffData()

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Interpretability Analysis"
        subtitle="RQ4: What trade-offs exist between predictive performance and interpretability across representations?"
        badge="Interpretability"
      />

      <Callout type="info" className="mb-6">
        Interpretability is scored 1–5 (higher = more interpretable). Score 5 means a domain expert can audit every prediction from named feature coefficients. Score 1 means predictions rely on opaque internal representations.
      </Callout>

      {/* Trade-off scatter */}
      <SectionCard title="Performance vs Interpretability Trade-off" description="Each point represents the best model for that representation" className="mb-6">
        {loading ? <SkeletonCard /> : scatterData.length === 0 ? <EmptyState /> : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis
                  type="number" dataKey="x" domain={[0.5, 5.5]}
                  label={{ value: "Interpretability Score →", position: "insideBottom", offset: -10, fill: "#64748b", fontSize: 11 }}
                  stroke="#64748b" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
                  ticks={[1, 2, 3, 4, 5]}
                />
                <YAxis
                  type="number" dataKey="y" domain={[0.85, 1]}
                  label={{ value: "Val F1 →", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 11 }}
                  stroke="#64748b" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
                  tickFormatter={v => fmt(v, 2)}
                />
                <Tooltip
                  {...TOOLTIP_STYLE}
                  content={({ payload }) => {
                    if (!payload?.length) return null
                    const d = payload[0]?.payload
                    return (
                      <div className="bg-[#1e1e2e] border border-[#2e2e3e] rounded-lg p-3 text-xs font-mono">
                        <p className="text-violet-400 font-bold mb-1">{repLabel(d.rep)}</p>
                        <p className="text-slate-300">Interpretability: {d.x}/5</p>
                        <p className="text-slate-300">Best Val F1: {fmt(d.y, 4)}</p>
                        <p className="text-slate-500">Cost: {d.cost}</p>
                      </div>
                    )
                  }}
                />
                <ReferenceLine x={3.5} stroke="#2e2e3e" strokeDasharray="4 4" label={{ value: "High interp.", fill: "#64748b", fontSize: 9 }} />
                <Scatter
                  data={scatterData}
                  fill="#7c3aed"
                  shape={(props: any) => {
                    const { cx, cy, payload } = props
                    const color = REP_COLOURS[payload.rep] ?? "#7c3aed"
                    return (
                      <g>
                        <circle cx={cx} cy={cy} r={10} fill={color} fillOpacity={0.3} stroke={color} strokeWidth={2} />
                        <text x={cx} y={cy - 15} textAnchor="middle" fontSize={9} fill={color} fontFamily="JetBrains Mono">
                          {repLabel(payload.rep).slice(0, 10)}
                        </text>
                      </g>
                    )
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
        <PlotImage src={plotUrl("models", "interp_representation_tradeoff.png")} alt="Trade-off scatter" caption="Static output: interp_representation_tradeoff.png" className="mt-4" />
      </SectionCard>

      {/* Per-rep cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {loading ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={3} />) : !summary ? null :
          Object.entries(summary).map(([rep, data]) => (
            <div key={rep} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <RepresentationBadge rep={rep} />
                <div className="flex items-center gap-0.5">{SCORE_DOTS(data.interpretability_score)}</div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">{data.interpretability_rationale}</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(data.top_lonely_features ?? data.top_lonely_tokens ?? []).slice(0, 4).map(f => (
                  <span key={f} className="text-[10px] font-mono px-1.5 py-0.5 bg-rose-600/10 border border-rose-600/20 text-rose-400 rounded">{f}</span>
                ))}
              </div>
              <p className="text-[10px] font-mono text-slate-700">Cost: {data.computational_cost}</p>
              <p className="text-[10px] font-mono text-emerald-500 mt-0.5">Best F1: {fmt(data.best_f1, 4)} ({data.best_model})</p>
            </div>
          ))
        }
      </div>

      {/* LR Coefficients */}
      <SectionCard title="Logistic Regression Coefficients" description="Feature importances for interpretable representations" className="mb-6">
        <div className="flex gap-2 mb-5">
          {COEFF_TABS.map(t => (
            <button
              key={t}
              onClick={() => setCoeffTab(t)}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                coeffTab === t
                  ? "bg-violet-600/20 border-violet-600/30 text-violet-300"
                  : "border-[#1e1e2e] text-slate-500 hover:text-slate-300"
              }`}
            >
              {repLabel(t)}
            </button>
          ))}
        </div>

        {loading ? <SkeletonCard /> : !activeCoeff ? <EmptyState /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Lonely Indicators", data: lonelyCoeffs, color: "#f43f5e" },
              { label: "Non-Lonely Indicators", data: nonLonelyCoeffs, color: "#4C9BE8" },
            ].map(({ label, data, color }) => (
              <div key={label}>
                <p className="text-xs font-medium text-slate-400 mb-3">{label}</p>
                {data.length === 0 ? <p className="text-xs text-slate-600">No data</p> : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[...data].reverse()}
                        layout="vertical"
                        margin={{ top: 0, right: 20, left: 110, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" horizontal={false} />
                        <XAxis type="number" stroke="#64748b" tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} tickFormatter={v => fmt(v, 3)} />
                        <YAxis type="category" dataKey="feature" stroke="#64748b" tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} width={105} />
                        <Tooltip {...TOOLTIP_STYLE} formatter={(v: any) => typeof v === 'number' ? fmt(v, 6) : v} />
                        <Bar dataKey="coefficient" fill={color} fillOpacity={0.8} radius={[0, 4, 4, 0]} barSize={10} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <PlotImage
          src={plotUrl("models", `interp_${coeffTab}_lr_coefficients.png`)}
          alt="LR coefficients"
          caption={`interp_${coeffTab}_lr_coefficients.png`}
          className="mt-4"
        />
      </SectionCard>

      {/* DistilBERT Attention */}
      <SectionCard title="DistilBERT Attention Weights" description="Average last-layer attention weights per class (indicative, not faithful attribution)">
        <Callout type="warning" className="mb-4">
          {attention?.caveat ?? "Attention ≠ attribution. These show which tokens the model attends to, not necessarily what drives predictions."}
        </Callout>
        {loading ? <SkeletonCard /> : !attention ? <EmptyState /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Lonely Posts", tokens: attention.lonely_top_tokens, color: "#f43f5e" },
              { label: "Non-Lonely Posts", tokens: attention.non_lonely_top_tokens, color: "#4C9BE8" },
            ].map(({ label, tokens, color }) => (
              <div key={label}>
                <p className="text-xs font-medium text-slate-400 mb-3">{label} — top {Math.min(15, tokens.length)} attended tokens</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[...tokens].slice(0, 15).reverse()}
                      layout="vertical"
                      margin={{ top: 0, right: 20, left: 70, bottom: 0 }}
                    >
                      <XAxis type="number" stroke="#64748b" tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} tickFormatter={v => v.toFixed(4)} />
                      <YAxis type="category" dataKey="token" stroke="#64748b" tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} width={65} />
                      <Tooltip {...TOOLTIP_STYLE} formatter={(v: any) => typeof v === 'number' ? fmt(v, 6) : v} />
                      <Bar dataKey="avg_attention" fill={color} fillOpacity={0.8} radius={[0, 4, 4, 0]} barSize={10} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        )}
        <PlotImage src={plotUrl("models", "interp_distilbert_attention.png")} alt="DistilBERT attention" caption="interp_distilbert_attention.png" className="mt-4" />
      </SectionCard>
    </div>
  )
}
