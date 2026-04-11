"use client"

import { useState } from "react"
import { predict, predictBatch } from "@/lib/api"
import type { PredictResponse } from "@/lib/types"
import { repLabel, modelLabel, fmt } from "@/lib/utils"
import { PageHeader, SectionCard, Callout } from "@/components/shared"
import {
  MessageSquare, Plus, Trash2, Send, AlertCircle,
  CheckCircle, Loader2, ChevronDown, ChevronUp,
} from "lucide-react"

const EXAMPLES = [
  {
    label: "Subtle loneliness",
    text: "I've been struggling lately with the feeling that no matter how many people are around me, I still feel completely alone. It's like I'm watching everyone else connect so effortlessly while I'm standing behind glass, unable to join in. Does anyone else feel this way?",
  },
  {
    label: "Non-lonely (advice seeking)",
    text: "Hey everyone! Just transferred to this university and wondering if anyone has tips for finding study groups for computer science courses? I know community college was different but hoping to get involved here. Any advice on the best spots to meet people on campus?",
  },
  {
    label: "Ambiguous post",
    text: "Spent another weekend mostly at home. I did go for a walk and the weather was nice. Sometimes I wonder what other people do on weekends. Anyway, back to work tomorrow. Hope everyone had a good one.",
  },
]

function ConfidenceBar({ confidence, label }: { confidence: number; label: string }) {
  const isLonely = label === "lonely"
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500">Confidence</span>
        <span className={`text-sm font-mono font-bold ${isLonely ? "text-rose-400" : "text-blue-400"}`}>
          {(confidence * 100).toFixed(1)}%
        </span>
      </div>
      <div className="h-2 bg-[#1e1e2e] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${isLonely ? "bg-rose-500" : "bg-blue-500"}`}
          style={{ width: `${confidence * 100}%` }}
        />
      </div>
    </div>
  )
}

function PredictResultCard({ result }: { result: PredictResponse }) {
  const isLonely = result.label === 1
  return (
    <div className={`rounded-xl border p-5 ${
      isLonely
        ? "bg-rose-600/5 border-rose-600/20"
        : "bg-blue-600/5 border-blue-600/20"
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`px-4 py-2 rounded-full text-sm font-bold font-mono ${
            isLonely
              ? "bg-rose-600/20 text-rose-300 border border-rose-600/30"
              : "bg-blue-600/20 text-blue-300 border border-blue-600/30"
          }`}
        >
          {isLonely ? "LONELY" : "NOT LONELY"}
        </div>
        {isLonely
          ? <AlertCircle className="h-5 w-5 text-rose-400" />
          : <CheckCircle className="h-5 w-5 text-blue-400" />
        }
      </div>
      <ConfidenceBar confidence={result.confidence} label={result.label_name} />
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="bg-[#111118] rounded-lg p-3">
          <p className="text-slate-500 mb-1">Threshold (ROC-optimised)</p>
          <p className="font-mono text-slate-300">{fmt(result.threshold_used, 4)}</p>
        </div>
        <div className="bg-[#111118] rounded-lg p-3">
          <p className="text-slate-500 mb-1">Model used</p>
          <p className="font-mono text-slate-300">{repLabel(result.representation)} / {modelLabel(result.model)}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Single Post Demo ─────────────────────────────────────────────────────────
function SinglePostDemo() {
  const [text, setText] = useState("")
  const [result, setResult] = useState<PredictResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!text.trim() || text.trim().length < 10) {
      setError("Please enter at least 10 characters.")
      return
    }
    setError("")
    setLoading(true)
    setResult(null)
    try {
      const res = await predict(text)
      setResult(res)
    } catch (e: any) {
      setError(e.message ?? "Prediction failed")
    } finally {
      setLoading(false)
    }
  }

  const fillExample = (t: string) => {
    setText(t)
    setResult(null)
    setError("")
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste a Reddit post here to classify it for loneliness self-disclosure..."
          className="w-full h-40 bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 text-sm text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none focus:border-violet-600/50 focus:ring-1 focus:ring-violet-600/20 transition-all font-mono"
          maxLength={2000}
        />
        <div className="absolute bottom-3 right-3 text-xs text-slate-600 font-mono">
          {text.length}/2000
        </div>
      </div>

      {error && (
        <p className="text-xs text-rose-400 flex items-center gap-1.5">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !text.trim()}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Classifying...</>
        ) : (
          <><Send className="h-4 w-4" /> Classify Post</>
        )}
      </button>

      {/* Examples */}
      <div>
        <p className="text-xs text-slate-600 mb-2">Try an example:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(ex => (
            <button
              key={ex.label}
              onClick={() => fillExample(ex.text)}
              className="text-xs px-3 py-1.5 bg-[#111118] border border-[#1e1e2e] rounded-lg text-slate-400 hover:text-slate-200 hover:border-[#2e2e3e] transition-all font-mono"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div className="animate-fade-in">
          <PredictResultCard result={result} />
        </div>
      )}
    </div>
  )
}

// ─── Batch Demo ───────────────────────────────────────────────────────────────
function BatchPostDemo() {
  const [posts, setPosts] = useState<string[]>(["", ""])
  const [results, setResults] = useState<(PredictResponse | { error: string })[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [expanded, setExpanded] = useState<number | null>(null)

  const addPost = () => {
    if (posts.length >= 20) return
    setPosts([...posts, ""])
    setResults([])
  }

  const removePost = (i: number) => {
    const next = posts.filter((_, idx) => idx !== i)
    setPosts(next.length === 0 ? [""] : next)
    setResults([])
  }

  const updatePost = (i: number, val: string) => {
    const next = [...posts]
    next[i] = val
    setPosts(next)
    if (results.length) setResults([])
  }

  const handleBatch = async () => {
    const valid = posts.filter(p => p.trim().length >= 10)
    if (valid.length === 0) {
      setError("Add at least one post with 10+ characters.")
      return
    }
    setError("")
    setLoading(true)
    try {
      const res = await predictBatch(valid)
      setResults(res)
    } catch (e: any) {
      setError(e.message ?? "Batch prediction failed")
    } finally {
      setLoading(false)
    }
  }

  const validPosts = posts.filter(p => p.trim().length >= 10)

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {posts.map((post, i) => (
          <div key={i} className="flex gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono text-slate-600">Post {i + 1}</span>
                {results[i] && !("error" in results[i]) && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    (results[i] as PredictResponse).label === 1
                      ? "bg-rose-600/10 border-rose-600/20 text-rose-400"
                      : "bg-blue-600/10 border-blue-600/20 text-blue-400"
                  }`}>
                    {(results[i] as PredictResponse).label === 1 ? "LONELY" : "NOT LONELY"} · {((results[i] as PredictResponse).confidence * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <textarea
                value={post}
                onChange={e => updatePost(i, e.target.value)}
                placeholder={`Enter Reddit post ${i + 1} here...`}
                rows={3}
                maxLength={2000}
                className="w-full bg-[#111118] border border-[#1e1e2e] rounded-lg p-3 text-xs text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none focus:border-violet-600/50 transition-all font-mono"
              />
              {results[i] && (
                <div className="mt-2">
                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
                  >
                    {expanded === i ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {expanded === i ? "Hide" : "Show"} full result
                  </button>
                  {expanded === i && !("error" in results[i]) && (
                    <div className="mt-2 animate-fade-in">
                      <PredictResultCard result={results[i] as PredictResponse} />
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => removePost(i)}
              disabled={posts.length === 1}
              className="mt-5 h-8 w-8 flex items-center justify-center rounded-lg border border-[#1e1e2e] text-slate-600 hover:text-rose-400 hover:border-rose-600/20 transition-all disabled:opacity-30"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={addPost}
          disabled={posts.length >= 20}
          className="flex items-center gap-1.5 px-3 py-2 text-xs border border-[#1e1e2e] rounded-lg text-slate-400 hover:text-slate-200 hover:border-[#2e2e3e] transition-all disabled:opacity-30"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Post ({posts.length}/20)
        </button>
        <button
          onClick={handleBatch}
          disabled={loading || validPosts.length === 0}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
        >
          {loading ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Classifying {validPosts.length} posts...</>
          ) : (
            <><Send className="h-3.5 w-3.5" /> Classify {validPosts.length} Post{validPosts.length !== 1 ? "s" : ""}</>
          )}
        </button>
      </div>

      {error && (
        <p className="text-xs text-rose-400 flex items-center gap-1.5">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}

      {results.length > 0 && (
        <div className="animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1e1e2e]">
                  <th className="text-left py-2 px-3 text-slate-500 font-mono">#</th>
                  <th className="text-left py-2 px-3 text-slate-500 font-mono">Preview</th>
                  <th className="text-left py-2 px-3 text-slate-500 font-mono">Label</th>
                  <th className="text-left py-2 px-3 text-slate-500 font-mono">Confidence</th>
                  <th className="text-left py-2 px-3 text-slate-500 font-mono">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  if ("error" in r) {
                    return (
                      <tr key={i} className="border-b border-[#1e1e2e]/50">
                        <td className="py-2 px-3 font-mono">{i + 1}</td>
                        <td className="py-2 px-3 text-slate-600" colSpan={4}>{r.error}</td>
                      </tr>
                    )
                  }
                  const pr = r as PredictResponse
                  return (
                    <tr key={i} className={`border-b border-[#1e1e2e]/50 ${pr.label === 1 ? "bg-rose-600/3" : ""}`}>
                      <td className="py-2 px-3 font-mono text-slate-600">{i + 1}</td>
                      <td className="py-2 px-3 text-slate-400 max-w-xs truncate font-mono">{pr.input_text.slice(0, 60)}…</td>
                      <td className="py-2 px-3">
                        <span className={`font-mono font-bold ${pr.label === 1 ? "text-rose-400" : "text-blue-400"}`}>
                          {pr.label === 1 ? "LONELY" : "NOT LONELY"}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-300">{(pr.confidence * 100).toFixed(1)}%</td>
                      <td className="py-2 px-3 font-mono text-slate-500">{fmt(pr.threshold_used, 4)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DemoPage() {
  const [mode, setMode] = useState<"single" | "batch">("single")

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Live Inference Demo"
        subtitle="Classify Reddit posts for loneliness self-disclosure using the best-trained model"
        badge="Demo"
      />

      <Callout type="info" className="mb-6">
        Predictions run on the HuggingFace Spaces CPU instance using the best-performing model from the pipeline.
        The decision threshold is ROC-optimised (Youden J statistic) rather than the default 0.5.
      </Callout>

      {/* Mode toggle */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex gap-1 p-1 bg-[#111118] border border-[#1e1e2e] rounded-xl">
          <button
            onClick={() => setMode("single")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
              mode === "single"
                ? "bg-violet-600/20 text-violet-300 border border-violet-600/30"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Single Post
          </button>
          <button
            onClick={() => setMode("batch")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
              mode === "batch"
                ? "bg-violet-600/20 text-violet-300 border border-violet-600/30"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Plus className="h-4 w-4" />
            Batch (up to 20 posts)
          </button>
        </div>
      </div>

      <SectionCard
        title={mode === "single" ? "Single Post Classification" : "Batch Classification"}
        description={
          mode === "single"
            ? "Enter one Reddit post to classify"
            : "Add multiple posts individually — each gets its own text input and result"
        }
        className="max-w-3xl"
      >
        {mode === "single" ? <SinglePostDemo /> : <BatchPostDemo />}
      </SectionCard>

      <div className="mt-6 max-w-3xl">
        <SectionCard title="How it works">
          <ol className="space-y-2 text-xs text-slate-400 font-mono list-none">
            {[
              "Text is cleaned: URL removal, lowercasing, emoji removal, normalisation",
              "Cleaned text is tokenised and lemmatised with spaCy (en_core_web_sm)",
              "The best-performing representation is applied (e.g. SBERT encoding or TF-IDF)",
              "The trained classifier produces a probability score for the Lonely class",
              "The ROC-derived optimal threshold is applied instead of the default 0.5",
              "Result: label (0/1), confidence, and threshold are returned",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-violet-500 flex-shrink-0">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </SectionCard>
      </div>
    </div>
  )
}
