"use client"

import { useEffect, useState } from "react"
import { getPreprocessingSummary, getPreprocessingSamples } from "@/lib/api"
import type { PreprocessingSummary, PreprocessingSamples, PreprocessedSample } from "@/lib/types"
import { relativeTime, fmt } from "@/lib/utils"
import {
  PageHeader, SectionCard, EmptyState, SkeletonCard, Tag, Callout,
} from "@/components/shared"
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react"

const PIPELINE_STEPS = [
  { n: 1, title: "Unicode Normalisation", tool: "ftfy + NFKC", desc: "Fix encoding artefacts and normalise to NFKC form. Handles mojibake, smart quotes, and non-standard whitespace." },
  { n: 2, title: "HTML Stripping", tool: "bleach", desc: "Remove all HTML tags while preserving the underlying text content. Reddit posts sometimes contain markdown-encoded HTML." },
  { n: 3, title: "Noise Removal", tool: "regex + emoji", desc: "Remove URLs (http/https), Reddit mentions (@user), subreddit references (r/sub), hashtags, and emoji characters." },
  { n: 4, title: "Text Normalisation", tool: "regex", desc: "Lowercase all text and collapse runs of 3+ repeated characters to 2 (e.g. 'sooooo' → 'soo'). Normalise all whitespace." },
  { n: 5, title: "Tokenisation & Tagging", tool: "spaCy en_core_web_sm", desc: "Sentence segmentation, word tokenisation, part-of-speech tagging, and lemmatisation. NER and dependency parsing are disabled for speed." },
  { n: 6, title: "Stopword Removal", tool: "spaCy + custom", desc: "Remove stopwords from the spaCy list. Negations (not, never, n't, etc.) are explicitly preserved as they carry semantic signal." },
  { n: 7, title: "Token Filtering", tool: "custom", desc: "Discard tokens that are non-alphabetic or fewer than 2 characters. Retain only meaningful lexical tokens." },
  { n: 8, title: "Linguistic Feature Extraction", tool: "custom", desc: "Compute 13 surface and psycholinguistic features per post: word count, char count, sentence count, avg sentence length, type-token ratio, pronoun/negation/social/emotion/noun/verb/adj/adv ratios." },
]

const FEATURE_TABLE = [
  ["word_count", "Total token count (all alpha tokens ≥ 2 chars)", "Post length proxy"],
  ["char_count", "Character count of cleaned text", "Verbosity indicator"],
  ["sentence_count", "Sentence count (spaCy sentencizer)", "Structural complexity"],
  ["avg_sentence_length", "word_count / sentence_count", "Prose density"],
  ["type_token_ratio", "unique_tokens / total_tokens", "Lexical diversity"],
  ["pronoun_ratio", "First-person pronouns / total (I, me, my, mine, myself)", "Self-focus"],
  ["negation_ratio", "Negation words / total (not, never, n't, etc.)", "Negative framing"],
  ["social_word_ratio", "Social vocabulary / total (friend, alone, isolated, etc.)", "Relational content"],
  ["emotion_word_ratio", "Emotion vocabulary / total (sad, empty, hopeless, etc.)", "Affective content"],
  ["noun_ratio", "NOUN tokens / total", "Referential density"],
  ["verb_ratio", "VERB tokens / total", "Action/state density"],
  ["adj_ratio", "ADJ tokens / total", "Descriptive density"],
  ["adv_ratio", "ADV tokens / total", "Modification density"],
]

function SampleCard({ sample, expanded, onToggle }: {
  sample: PreprocessedSample
  expanded: boolean
  onToggle: () => void
}) {
  const isLonely = sample.label === 1
  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      isLonely ? "border-rose-600/20" : "border-blue-600/20"
    }`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between ${
        isLonely ? "bg-rose-600/5" : "bg-blue-600/5"
      }`}>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
            isLonely
              ? "bg-rose-600/10 border-rose-600/20 text-rose-400"
              : "bg-blue-600/10 border-blue-600/20 text-blue-400"
          }`}>
            {isLonely ? "LONELY" : "NOT LONELY"}
          </span>
          <span className="text-xs font-mono text-slate-600">{sample.unique_id}</span>
        </div>
        <button onClick={onToggle} className="text-slate-600 hover:text-slate-400 transition-colors">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1e1e2e]">
        {/* Original text */}
        <div className="p-4">
          <p className="text-[10px] text-slate-600 font-mono uppercase mb-2">Original</p>
          <p className="text-xs text-slate-300 leading-relaxed">
            {expanded ? sample.text : sample.text.slice(0, 200) + (sample.text.length > 200 ? "…" : "")}
          </p>
        </div>

        {/* Preprocessed */}
        <div className="p-4">
          <p className="text-[10px] text-slate-600 font-mono uppercase mb-2">After Preprocessing</p>
          <p className="text-xs text-slate-500 leading-relaxed font-mono">
            {expanded ? sample.cleaned : sample.cleaned.slice(0, 200) + (sample.cleaned.length > 200 ? "…" : "")}
          </p>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#1e1e2e] p-4 bg-[#0a0a0f]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { k: "word_count", v: sample.word_count, label: "Words" },
              { k: "char_count", v: sample.char_count, label: "Chars" },
              { k: "sentence_count", v: sample.sentence_count, label: "Sentences" },
              { k: "pronoun_ratio", v: fmt(sample.pronoun_ratio, 4), label: "Pronoun Ratio" },
              { k: "negation_ratio", v: fmt(sample.negation_ratio, 4), label: "Negation Ratio" },
              { k: "social_word_ratio", v: fmt(sample.social_word_ratio, 4), label: "Social Ratio" },
              { k: "emotion_word_ratio", v: fmt(sample.emotion_word_ratio, 4), label: "Emotion Ratio" },
            ].map(({ k, v, label }) => (
              <div key={k} className="bg-[#111118] rounded-lg p-2.5">
                <p className="text-[10px] text-slate-600 font-mono">{label}</p>
                <p className="text-sm font-mono font-bold text-slate-200">{v}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10px] text-slate-600 font-mono uppercase mb-1.5">Token Preview (first 15)</p>
            <div className="flex flex-wrap gap-1">
              {sample.tokens_preview.slice(0, 15).map((t, i) => (
                <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 bg-[#1e1e2e] text-slate-400 rounded">{t}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const ITEMS_PER_PAGE = 5

export default function PreprocessingPage() {
  const [summary, setSummary] = useState<PreprocessingSummary | null>(null)
  const [samples, setSamples] = useState<PreprocessingSamples | null>(null)
  const [split, setSplit] = useState("train")
  const [labelFilter, setLabelFilter] = useState<"both" | "lonely" | "non_lonely">("both")
  const [n, setN] = useState(20)
  const [loading, setLoading] = useState(true)
  const [samplesLoading, setSamplesLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    getPreprocessingSummary().then(setSummary).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setSamplesLoading(true)
    setPage(0)
    getPreprocessingSamples(split, labelFilter, n)
      .then(setSamples)
      .finally(() => setSamplesLoading(false))
  }, [split, labelFilter, n])

  const allSamples: PreprocessedSample[] = samples
    ? labelFilter === "lonely"
      ? samples.lonely ?? []
      : labelFilter === "non_lonely"
      ? samples.non_lonely ?? []
      : [...(samples.lonely ?? []), ...(samples.non_lonely ?? [])]
    : []

  const pageItems = allSamples.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)
  const totalPages = Math.ceil(allSamples.length / ITEMS_PER_PAGE)

  const toggleExpand = (id: string) => {
    const next = new Set(expanded)
    next.has(id) ? next.delete(id) : next.add(id)
    setExpanded(next)
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Preprocessing Pipeline"
        subtitle="Text normalisation, tokenisation, linguistic feature extraction, and stop word removal with negation preservation"
        badge="Preprocessing"
      />

      {/* Pipeline status */}
      {!loading && summary && (
        <SectionCard className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Status</p>
              <span className={`text-xs font-mono px-2 py-1 rounded-full border ${
                summary.status === "done"
                  ? "bg-emerald-600/10 border-emerald-600/20 text-emerald-400"
                  : "bg-amber-600/10 border-amber-600/20 text-amber-400"
              }`}>{summary.status}</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Completed</p>
              <p className="text-xs font-mono text-slate-300">{relativeTime(summary.timestamp)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Train / Val / Test</p>
              <p className="text-xs font-mono text-slate-300">
                {summary.train_size?.toLocaleString()} / {summary.val_size?.toLocaleString()} / {summary.test_size?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Feature Columns</p>
              <p className="text-xs font-mono text-violet-400">{summary.feature_columns?.length ?? 13}</p>
            </div>
          </div>
          {summary.feature_columns && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {summary.feature_columns.map(f => (
                <Tag key={f} color="violet">{f}</Tag>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* Pipeline steps */}
      <SectionCard title="Pipeline Steps" description="Applied in sequence to every post in all splits" className="mb-6">
        <div className="space-y-3">
          {PIPELINE_STEPS.map(({ n: num, title, tool, desc }) => (
            <div key={num} className="flex gap-4">
              <div className="flex-shrink-0 h-7 w-7 rounded-lg bg-violet-600/15 border border-violet-600/20 flex items-center justify-center">
                <span className="text-xs font-mono font-bold text-violet-400">{num}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-white">{title}</p>
                  <Tag color="amber">{tool}</Tag>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Feature table */}
      <SectionCard title="Extracted Linguistic Features" description="13 features computed per post after preprocessing" className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
                <th className="text-left py-2 px-3 text-slate-500 font-mono">Feature</th>
                <th className="text-left py-2 px-3 text-slate-500 font-mono">Description</th>
                <th className="text-left py-2 px-3 text-slate-500 font-mono">Psycholinguistic Relevance</th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_TABLE.map(([feat, desc, relevance]) => (
                <tr key={feat} className="border-b border-[#1e1e2e]/50 hover:bg-white/2">
                  <td className="py-2 px-3"><Tag color="violet">{feat}</Tag></td>
                  <td className="py-2 px-3 text-slate-400">{desc}</td>
                  <td className="py-2 px-3 text-slate-600">{relevance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Sample explorer */}
      <SectionCard title="Sample Post Explorer" description="Browse preprocessed examples from the dataset. See the full preprocessing pipeline output for each post.">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-5 pb-4 border-b border-[#1e1e2e]">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Split</label>
            <select
              value={split}
              onChange={e => setSplit(e.target.value)}
              className="bg-[#111118] border border-[#1e1e2e] rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-violet-600/50"
            >
              {["train", "validation", "test"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Class Filter</label>
            <select
              value={labelFilter}
              onChange={e => setLabelFilter(e.target.value as any)}
              className="bg-[#111118] border border-[#1e1e2e] rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-violet-600/50"
            >
              <option value="both">Both</option>
              <option value="lonely">Lonely only</option>
              <option value="non_lonely">Non-Lonely only</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Samples</label>
            <select
              value={n}
              onChange={e => setN(Number(e.target.value))}
              className="bg-[#111118] border border-[#1e1e2e] rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-violet-600/50"
            >
              {[10, 20, 50].map(v => (
                <option key={v} value={v}>{v} per class</option>
              ))}
            </select>
          </div>
          <div className="ml-auto">
            <p className="text-xs text-slate-600 font-mono">{allSamples.length} total · page {page + 1}/{totalPages || 1}</p>
          </div>
        </div>

        {samplesLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
          </div>
        ) : allSamples.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="space-y-3">
              {pageItems.map(sample => (
                <SampleCard
                  key={sample.unique_id}
                  sample={sample}
                  expanded={expanded.has(sample.unique_id)}
                  onToggle={() => toggleExpand(sample.unique_id)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-5">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs border border-[#1e1e2e] rounded-lg text-slate-400 hover:text-slate-200 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="h-3 w-3" /> Prev
                </button>
                <span className="text-xs font-mono text-slate-600">{page + 1} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs border border-[#1e1e2e] rounded-lg text-slate-400 hover:text-slate-200 disabled:opacity-30 transition-all"
                >
                  Next <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </>
        )}
      </SectionCard>
    </div>
  )
}
