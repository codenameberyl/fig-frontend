"use client"

import { useEffect, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from "recharts"
import {
  getClassDistribution, getLengthStats, getLinguisticStats,
  getNgrams, getPosDistribution, plotUrl,
} from "@/lib/api"
import type {
  ClassDistribution, LengthStats, LinguisticStats, NGrams, PosDistribution,
} from "@/lib/types"
import { TOOLTIP_STYLE, LONELY_COLOR, NON_LONELY_COLOR, fmt } from "@/lib/utils"
import {
  PageHeader, SectionCard, PlotImage, EmptyState, SkeletonCard, Tag,
} from "@/components/shared"

const TABS = [
  "Class Distribution",
  "Text Length",
  "Linguistic Features",
  "N-Grams",
  "Word Clouds",
  "POS Distribution",
  "Correlation",
] as const
type Tab = (typeof TABS)[number]

const LING_LABELS: Record<string, string> = {
  pronoun_ratio: "Pronoun Ratio",
  negation_ratio: "Negation Ratio",
  social_word_ratio: "Social Word Ratio",
  emotion_word_ratio: "Emotion Word Ratio",
  noun_ratio: "Noun Ratio",
  verb_ratio: "Verb Ratio",
  adj_ratio: "Adjective Ratio",
  adv_ratio: "Adverb Ratio",
  type_token_ratio: "Type-Token Ratio",
}

export default function EDAPage() {
  const [tab, setTab] = useState<Tab>("Class Distribution")
  const [classDist, setClassDist] = useState<ClassDistribution | null>(null)
  const [lengthStats, setLengthStats] = useState<LengthStats | null>(null)
  const [lingStats, setLingStats] = useState<LinguisticStats | null>(null)
  const [ngrams, setNgrams] = useState<NGrams | null>(null)
  const [posData, setPosData] = useState<PosDistribution | null>(null)
  const [ngramMode, setNgramMode] = useState<"unigrams" | "bigrams">("unigrams")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      getClassDistribution(),
      getLengthStats(),
      getLinguisticStats(),
      getNgrams(),
      getPosDistribution(),
    ]).then(([c, l, li, n, p]) => {
      if (c.status === "fulfilled") setClassDist(c.value)
      if (l.status === "fulfilled") setLengthStats(l.value)
      if (li.status === "fulfilled") setLingStats(li.value)
      if (n.status === "fulfilled") setNgrams(n.value)
      if (p.status === "fulfilled") setPosData(p.value)
      setLoading(false)
    })
  }, [])

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Exploratory Data Analysis"
        subtitle="RQ1: What linguistic and structural characteristics differentiate lonely from non-lonely Reddit posts?"
        badge="EDA"
      />

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-[#111118] border border-[#1e1e2e] rounded-xl mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              tab === t
                ? "bg-violet-600/20 text-violet-300 border border-violet-600/30"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Class Distribution ── */}
      {tab === "Class Distribution" && (
        <div className="space-y-6">
          {loading ? <SkeletonCard lines={4} /> : !classDist ? <EmptyState /> : (
            <>
              <SectionCard title="Class Distribution per Split" description="Counts of lonely vs non-lonely posts across train, validation, and test splits">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={["train", "validation", "test"].map(split => ({
                        split,
                        "Non-Lonely": classDist[split as keyof ClassDistribution].non_lonely,
                        "Lonely": classDist[split as keyof ClassDistribution].lonely,
                        total: classDist[split as keyof ClassDistribution].total,
                        pct: classDist[split as keyof ClassDistribution].lonely_pct,
                      }))}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                      <XAxis dataKey="split" stroke="#64748b" tick={{ fontSize: 12, fontFamily: "JetBrains Mono" }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ color: "#e2e8f0", fontSize: 12 }} />
                      <Bar dataKey="Non-Lonely" fill={NON_LONELY_COLOR} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Lonely" fill={LONELY_COLOR} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(["train", "validation", "test"] as const).map(split => {
                  const s = classDist[split]
                  return (
                    <div key={split} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
                      <p className="text-xs font-mono text-violet-400 capitalize mb-3">{split}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Total</span>
                          <span className="font-mono text-white">{s.total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-rose-400">Lonely</span>
                          <span className="font-mono text-rose-400">{s.lonely.toLocaleString()} ({s.lonely_pct}%)</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-400">Non-Lonely</span>
                          <span className="font-mono text-blue-400">{s.non_lonely.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-[#1e1e2e] rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: `${s.lonely_pct}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <PlotImage src={plotUrl("eda", "eda_class_distribution.png")} alt="Class distribution" caption="Static output: eda_class_distribution.png" />
            </>
          )}
        </div>
      )}

      {/* ── Text Length ── */}
      {tab === "Text Length" && (
        <div className="space-y-6">
          {loading ? <SkeletonCard lines={4} /> : !lengthStats ? <EmptyState /> : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(["word_count", "char_count", "sentence_count"] as const).map(feat => {
                  const s = lengthStats[feat]
                  const label = feat.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
                  return (
                    <SectionCard key={feat} title={label}>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-[#1e1e2e]">
                            <th className="text-left py-1.5 text-slate-600 font-mono">Stat</th>
                            <th className="text-right py-1.5 text-blue-400 font-mono">Non-Lonely</th>
                            <th className="text-right py-1.5 text-rose-400 font-mono">Lonely</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(["mean", "median", "std", "q25", "q75", "max"] as const).map(stat => (
                            <tr key={stat} className="border-b border-[#1e1e2e]/50">
                              <td className="py-1.5 text-slate-500 font-mono capitalize">{stat}</td>
                              <td className="py-1.5 text-right font-mono text-blue-300">{fmt(s.non_lonely[stat], 1)}</td>
                              <td className="py-1.5 text-right font-mono text-rose-300">{fmt(s.lonely[stat], 1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </SectionCard>
                  )
                })}
              </div>
              <SectionCard title="Mean Comparison">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Word Count", nonLonely: lengthStats.word_count.non_lonely.mean, lonely: lengthStats.word_count.lonely.mean },
                        { name: "Char Count / 10", nonLonely: lengthStats.char_count.non_lonely.mean / 10, lonely: lengthStats.char_count.lonely.mean / 10 },
                        { name: "Sentence Count", nonLonely: lengthStats.sentence_count.non_lonely.mean, lonely: lengthStats.sentence_count.lonely.mean },
                      ]}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ color: "#e2e8f0", fontSize: 12 }} />
                      <Bar dataKey="nonLonely" name="Non-Lonely" fill={NON_LONELY_COLOR} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="lonely" name="Lonely" fill={LONELY_COLOR} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
              <PlotImage src={plotUrl("eda", "eda_length_distribution.png")} alt="Length distributions" caption="Static output: eda_length_distribution.png" />
            </>
          )}
        </div>
      )}

      {/* ── Linguistic Features ── */}
      {tab === "Linguistic Features" && (
        <div className="space-y-6">
          {loading ? <SkeletonCard lines={6} /> : !lingStats ? <EmptyState /> : (
            <>
              <SectionCard title="Mean Linguistic Features by Class" description="Ratio features computed per post. Higher values indicate stronger presence of each linguistic dimension.">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(LING_LABELS).map(([key, label]) => ({
                        feature: label.replace(" Ratio", "").replace(" Count", ""),
                        nonLonely: lingStats[key]?.non_lonely?.mean ?? 0,
                        lonely: lingStats[key]?.lonely?.mean ?? 0,
                      }))}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 110, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" horizontal={false} />
                      <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} tickFormatter={v => fmt(v, 3)} />
                      <YAxis type="category" dataKey="feature" stroke="#64748b" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} width={105} />
                      <Tooltip {...TOOLTIP_STYLE} formatter={(v: any) => typeof v === 'number' ? fmt(v, 4) : v} />
                      <Legend wrapperStyle={{ color: "#e2e8f0", fontSize: 12 }} />
                      <Bar dataKey="nonLonely" name="Non-Lonely" fill={NON_LONELY_COLOR} radius={[0, 4, 4, 0]} barSize={10} />
                      <Bar dataKey="lonely" name="Lonely" fill={LONELY_COLOR} radius={[0, 4, 4, 0]} barSize={10} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(LING_LABELS).map(([key, label]) => {
                  const s = lingStats[key]
                  if (!s) return null
                  const diff = s.lonely.mean - s.non_lonely.mean
                  const pct = Math.abs(diff / (s.non_lonely.mean || 0.001) * 100).toFixed(0)
                  return (
                    <div key={key} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
                      <p className="text-xs font-mono text-slate-400 mb-2">{label}</p>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-blue-400 font-mono">{fmt(s.non_lonely.mean, 4)}</p>
                          <p className="text-[10px] text-slate-600">non-lonely</p>
                        </div>
                        <div className={`text-xs font-mono font-bold ${diff > 0 ? "text-rose-400" : "text-blue-400"}`}>
                          {diff > 0 ? "▲" : "▼"} {pct}%
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-rose-400 font-mono">{fmt(s.lonely.mean, 4)}</p>
                          <p className="text-[10px] text-slate-600">lonely</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <PlotImage src={plotUrl("eda", "eda_linguistic_boxplots.png")} alt="Linguistic boxplots" caption="Static output: eda_linguistic_boxplots.png" />
            </>
          )}
        </div>
      )}

      {/* ── N-Grams ── */}
      {tab === "N-Grams" && (
        <div className="space-y-6">
          <div className="flex gap-2">
            {(["unigrams", "bigrams"] as const).map(m => (
              <button
                key={m}
                onClick={() => setNgramMode(m)}
                className={`px-4 py-2 rounded-lg text-xs font-mono border transition-all ${
                  ngramMode === m
                    ? "bg-violet-600/20 border-violet-600/30 text-violet-300"
                    : "bg-[#111118] border-[#1e1e2e] text-slate-500 hover:text-slate-300"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          {loading ? <SkeletonCard lines={5} /> : !ngrams ? <EmptyState /> : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(["non_lonely", "lonely"] as const).map(cls => {
                  const key = `${cls}_${ngramMode}` as keyof NGrams
                  const data = [...(ngrams[key] ?? [])].slice(0, 15).reverse()
                  const color = cls === "lonely" ? LONELY_COLOR : NON_LONELY_COLOR
                  return (
                    <SectionCard
                      key={cls}
                      title={cls === "lonely" ? "Lonely Posts" : "Non-Lonely Posts"}
                      description={`Top 15 ${ngramMode} by frequency`}
                    >
                      <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 90, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" horizontal={false} />
                            <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                            <YAxis type="category" dataKey="term" stroke="#64748b" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} width={85} />
                            <Tooltip {...TOOLTIP_STYLE} />
                            <Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} barSize={12}>
                              {data.map((_, i) => (
                                <Cell key={i} fill={color} fillOpacity={0.6 + 0.4 * (i / data.length)} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </SectionCard>
                  )
                })}
              </div>
              <PlotImage
                src={plotUrl("eda", `eda_${ngramMode}.png`)}
                alt={`${ngramMode} distribution`}
                caption={`Static output: eda_${ngramMode}.png`}
              />
            </>
          )}
        </div>
      )}

      {/* ── Word Clouds ── */}
      {tab === "Word Clouds" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionCard title="Non-Lonely Posts" description="Most frequent tokens (stop words removed)">
            <PlotImage src={plotUrl("eda", "eda_wordcloud_non_lonely.png")} alt="Non-lonely word cloud" />
          </SectionCard>
          <SectionCard title="Lonely Posts" description="Most frequent tokens (stop words removed)">
            <PlotImage src={plotUrl("eda", "eda_wordcloud_lonely.png")} alt="Lonely word cloud" />
          </SectionCard>
        </div>
      )}

      {/* ── POS Distribution ── */}
      {tab === "POS Distribution" && (
        <div className="space-y-6">
          {loading ? <SkeletonCard lines={4} /> : !posData ? <EmptyState /> : (
            <>
              <SectionCard title="Part-of-Speech Tag Distribution" description="Proportion of each POS tag across all tokens, by class">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Array.from(
                        new Set([...Object.keys(posData.non_lonely), ...Object.keys(posData.lonely)])
                      ).map(pos => ({
                        pos,
                        "Non-Lonely": posData.non_lonely[pos] ?? 0,
                        "Lonely": posData.lonely[pos] ?? 0,
                      })).sort((a, b) => (b["Non-Lonely"] + b["Lonely"]) - (a["Non-Lonely"] + a["Lonely"]))}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                      <XAxis dataKey="pos" stroke="#64748b" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                      <Tooltip {...TOOLTIP_STYLE} formatter={(v: any) => typeof v === 'number' ? `${(v * 100).toFixed(2)}%` : v} />
                      <Legend wrapperStyle={{ color: "#e2e8f0", fontSize: 12 }} />
                      <Bar dataKey="Non-Lonely" fill={NON_LONELY_COLOR} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Lonely" fill={LONELY_COLOR} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
              <PlotImage src={plotUrl("eda", "eda_pos_distribution.png")} alt="POS distribution" caption="Static output: eda_pos_distribution.png" />
            </>
          )}
        </div>
      )}

      {/* ── Correlation ── */}
      {tab === "Correlation" && (
        <SectionCard title="Feature Correlation Heatmap" description="Pearson correlation between all linguistic features and the label. Blue = negative correlation, Red = positive.">
          <PlotImage
            src={plotUrl("eda", "eda_correlation_heatmap.png")}
            alt="Correlation heatmap"
            caption="Static output: eda_correlation_heatmap.png"
          />
        </SectionCard>
      )}
    </div>
  )
}
