"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getDatasetSummary, getModelResults, API } from "@/lib/api"
import type { DatasetSummary, ModelResultsResponse } from "@/lib/types"
import { repLabel, modelLabel, fmt } from "@/lib/utils"
import { PageHeader, SectionCard, Tag, Callout } from "@/components/shared"
import { Copy, Check, ExternalLink, Github } from "lucide-react"

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative bg-[#0d1117] border border-[#1e1e2e] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e1e2e]">
        <span className="text-[10px] font-mono text-slate-600">{lang}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-400 transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed">{code}</pre>
    </div>
  )
}

const SECTIONS = [
  "Project Overview", "Dataset", "Preprocessing",
  "Text Representations", "Models & Training",
  "Evaluation", "API Reference", "Deployment", "Limitations", "Citation",
]

const REPR_TABLE = [
  ["Linguistic Only", "Sparse / Handcrafted", "13-d", "spaCy", "Fully interpretable; direct coefficient attribution"],
  ["TF-IDF", "Sparse / BoW", "≤15,000-d", "scikit-learn", "Readable n-gram tokens; large vocabulary"],
  ["TF-IDF + Linguistic", "Sparse / Combined", "≤15,013-d", "scikit-learn", "Best of both sparse approaches"],
  ["Word2Vec", "Dense / Averaged", "200-d", "gensim", "Context-aware token semantics; no direct interpretation"],
  ["Sentence-BERT", "Dense / Contextual", "384-d", "sentence-transformers", "Whole-sentence semantics; near-SOTA without fine-tuning"],
  ["DistilBERT", "Neural / End-to-end", "—", "Hugging Face", "Best performance; GPU required; attention-based"],
]

const ENDPOINTS = [
  ["GET", "/api/status", "Pipeline completion status and results availability"],
  ["GET", "/api/eda/dataset", "Dataset split sizes and class balance"],
  ["GET", "/api/eda/class_distribution", "Class counts per split"],
  ["GET", "/api/eda/length_stats", "Word/char/sentence count statistics"],
  ["GET", "/api/eda/linguistic_stats", "13 linguistic feature statistics"],
  ["GET", "/api/eda/ngrams", "Top-20 unigrams and bigrams by class"],
  ["GET", "/api/eda/pos_distribution", "POS tag proportions by class"],
  ["GET", "/api/eda/plots/{name}", "Serve EDA plot PNG by filename"],
  ["GET", "/api/eda/preprocessing/samples", "Sample preprocessed posts (split, label, n params)"],
  ["GET", "/api/models/results", "All 16 experiment results (val + test metrics)"],
  ["GET", "/api/models/best_per_representation", "Best model per representation"],
  ["GET", "/api/models/test_report", "Full test report for the best overall model"],
  ["GET", "/api/models/confusion_matrix/{key}", "Confusion matrix JSON for a model"],
  ["GET", "/api/models/roc_curve/{key}", "ROC curve data for a model"],
  ["GET", "/api/models/interpretability/summary", "Cross-representation interpretability summary"],
  ["GET", "/api/models/interpretability/coefficients/{rep}", "LR coefficients for linguistic_only / tfidf / tfidf_ling"],
  ["GET", "/api/models/interpretability/attention", "DistilBERT attention weights"],
  ["GET", "/api/models/error_analysis/summary", "Aggregated FP/FN analysis across all models"],
  ["GET", "/api/models/error_analysis/{key}", "Detailed FP/FN examples for a model"],
  ["GET", "/api/models/plots/{name}", "Serve evaluation or interpretability PNG"],
  ["POST", "/api/predict", "Classify a single text { text: string }"],
  ["POST", "/api/predict/batch", "Classify up to 100 texts string[]"],
]

export default function DocsPage() {
  const [dataset, setDataset] = useState<DatasetSummary | null>(null)
  const [models, setModels] = useState<ModelResultsResponse | null>(null)
  const [activeSection, setActiveSection] = useState("Project Overview")

  useEffect(() => {
    Promise.allSettled([getDatasetSummary(), getModelResults()]).then(([d, m]) => {
      if (d.status === "fulfilled") setDataset(d.value)
      if (m.status === "fulfilled") setModels(m.value)
    })
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    setActiveSection(id)
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Documentation" subtitle="Technical reference for the FIG-Loneliness NLP Pipeline" badge="Docs" />

      <div className="flex gap-8">
        {/* Sidebar nav */}
        <aside className="hidden lg:block w-48 flex-shrink-0">
          <div className="sticky top-8">
            <p className="text-[10px] text-slate-600 uppercase tracking-wider font-mono mb-3">Contents</p>
            <nav className="space-y-1">
              {SECTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => scrollTo(s)}
                  className={`block w-full text-left text-xs px-3 py-1.5 rounded-lg transition-all ${
                    activeSection === s
                      ? "bg-violet-600/15 text-violet-300"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 space-y-10 max-w-3xl">
          {/* Project Overview */}
          <section id="Project Overview">
            <h2 className="text-lg font-bold text-white mb-4">Project Overview</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              This project builds and evaluates an NLP pipeline for detecting loneliness self-disclosure in Reddit posts
              using the FIG-Loneliness dataset. Loneliness self-disclosure is often subtle and indirect — expressed
              through linguistic markers of social disconnection and relational dissatisfaction rather than direct
              statements. The pipeline compares five text representations and three classical classifiers, plus a
              fine-tuned DistilBERT model.
            </p>
            <div className="flex gap-3">
              <a href="https://github.com/your-username/fig-loneliness" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-[#1e1e2e] rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:border-[#2e2e3e] transition-all">
                <Github className="h-4 w-4" /> GitHub
              </a>
              <a href="https://huggingface.co/datasets/FIG-Loneliness/FIG-Loneliness" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-[#1e1e2e] rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-all">
                <ExternalLink className="h-4 w-4" /> HuggingFace Dataset
              </a>
              <a href={`${API.replace("/api", "")}/docs`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-[#1e1e2e] rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-all">
                <ExternalLink className="h-4 w-4" /> API Swagger UI
              </a>
            </div>
          </section>

          {/* Dataset */}
          <section id="Dataset">
            <h2 className="text-lg font-bold text-white mb-4">Dataset</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              FIG-Loneliness contains 5,633 Reddit posts annotated for loneliness self-disclosure by trained
              undergraduate research assistants and MTurk workers. Posts were collected from four subreddits
              (r/loneliness, r/lonely, r/youngadults, r/college) between 2018–2020 using the Pushshift API.
            </p>
            {dataset ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-[#1e1e2e] rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-[#111118] border-b border-[#1e1e2e]">
                      <th className="text-left py-3 px-4 text-xs text-slate-500 font-mono">Split</th>
                      <th className="text-left py-3 px-4 text-xs text-slate-500 font-mono">Total</th>
                      <th className="text-left py-3 px-4 text-xs text-slate-500 font-mono">Lonely</th>
                      <th className="text-left py-3 px-4 text-xs text-slate-500 font-mono">Non-Lonely</th>
                      <th className="text-left py-3 px-4 text-xs text-slate-500 font-mono">Lonely %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(["train", "validation", "test"] as const).map(s => {
                      const d = dataset.splits[s]
                      return (
                        <tr key={s} className="border-b border-[#1e1e2e]/50">
                          <td className="py-3 px-4 font-mono text-xs text-violet-400 capitalize">{s}</td>
                          <td className="py-3 px-4 font-mono text-xs text-white">{d.n_samples.toLocaleString()}</td>
                          <td className="py-3 px-4 font-mono text-xs text-rose-400">{d.n_lonely.toLocaleString()}</td>
                          <td className="py-3 px-4 font-mono text-xs text-blue-400">{d.n_non_lonely.toLocaleString()}</td>
                          <td className="py-3 px-4 font-mono text-xs text-slate-400">{((d.n_lonely / d.n_samples) * 100).toFixed(1)}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-24 bg-[#111118] border border-[#1e1e2e] rounded-xl animate-pulse" />
            )}
          </section>

          {/* Preprocessing */}
          <section id="Preprocessing">
            <h2 className="text-lg font-bold text-white mb-4">Preprocessing</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              All posts pass through a reproducible 8-step preprocessing pipeline before feature extraction.
              Preprocessing choices are kept minimal to avoid removing loneliness-relevant linguistic cues.
            </p>
            <CodeBlock lang="python" code={`# Core preprocessing steps
text = ftfy.fix_text(raw_text)                  # 1. Unicode normalisation
text = unicodedata.normalize("NFKC", text)
text = bleach.clean(text, tags=[], strip=True)  # 2. HTML stripping
text = URL_PATTERN.sub(" ", text)               # 3. URL removal
text = MENTION_PATTERN.sub(" ", text)           # 3. Reddit mention removal
text = emoji.replace_emoji(text, " ")           # 3. Emoji removal
text = text.lower()                             # 4. Lowercasing
text = REPEATED_PATTERN.sub(r"\\1\\1", text)   # 4. Char normalisation
doc = nlp(text)                                 # 5. spaCy tokenisation
tokens_no_stop = [                              # 6. Stopword removal
    t.lemma_ for t in doc
    if not t.is_stop or t.text in NEGATIONS     # preserve negations!
]`} />
            <Link href="/preprocessing" className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 mt-3 transition-colors">
              → Explore the preprocessing pipeline and sample posts
            </Link>
          </section>

          {/* Text Representations */}
          <section id="Text Representations">
            <h2 className="text-lg font-bold text-white mb-4">Text Representations</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1e1e2e]">
                    {["Representation", "Type", "Dimensions", "Library", "Notes"].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-slate-500 font-mono">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {REPR_TABLE.map(([rep, type, dim, lib, note]) => (
                    <tr key={rep} className="border-b border-[#1e1e2e]/50">
                      <td className="py-2.5 px-3"><Tag color="violet">{rep}</Tag></td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{type}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{dim}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{lib}</td>
                      <td className="py-2.5 px-3 text-slate-500">{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Models */}
          <section id="Models & Training">
            <h2 className="text-lg font-bold text-white mb-4">Models & Training</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Classical classifiers (LR, SVM, RF) were trained on each of the 5 non-neural representations,
              yielding 15 classical experiments. DistilBERT was fine-tuned end-to-end for 3 epochs with early
              stopping (patience=2) on validation F1.
            </p>
            {models && (
              <Callout type="success">
                Best model: <strong>{repLabel(models.best_representation)}</strong> / <strong>{modelLabel(models.best_model)}</strong> —
                Validation F1: <strong className="font-mono">{fmt(models.best_f1, 4)}</strong>
              </Callout>
            )}
            <CodeBlock lang="python" code={`# DistilBERT fine-tuning
training_args = TrainingArguments(
    eval_strategy="epoch",
    save_strategy="epoch",
    num_train_epochs=3,
    learning_rate=2e-5,
    weight_decay=0.01,
    load_best_model_at_end=True,
    metric_for_best_model="f1",
)
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized["train"],
    eval_dataset=tokenized["validation"],
    compute_metrics=compute_metrics,
    callbacks=[EarlyStoppingCallback(patience=2)],
)`} />
          </section>

          {/* Evaluation */}
          <section id="Evaluation">
            <h2 className="text-lg font-bold text-white mb-4">Evaluation</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              All models are evaluated using Precision, Recall, F1-Score, Accuracy, and ROC-AUC. The binary
              task targets the Lonely class (label=1). The optimal classification threshold is derived from
              the Youden J statistic (maximises TPR − FPR on the validation ROC curve) and applied at inference.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Precision", def: "TP / (TP + FP) — what fraction of predicted-lonely posts are truly lonely" },
                { label: "Recall", def: "TP / (TP + FN) — what fraction of truly lonely posts are identified" },
                { label: "F1-Score", def: "Harmonic mean of Precision and Recall" },
                { label: "ROC-AUC", def: "Area under the ROC curve — model discrimination ability across all thresholds" },
              ].map(({ label, def }) => (
                <div key={label} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4">
                  <p className="text-xs font-mono font-bold text-violet-400 mb-1">{label}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{def}</p>
                </div>
              ))}
            </div>
          </section>

          {/* API Reference */}
          <section id="API Reference">
            <h2 className="text-lg font-bold text-white mb-4">API Reference</h2>
            <p className="text-sm text-slate-400 mb-4">
              The FastAPI backend is a read-only results server. All endpoints return pre-computed results from the pipeline.
              The API base URL is <code className="font-mono text-violet-400 text-xs bg-violet-600/10 px-1.5 py-0.5 rounded">{API}</code>.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1e1e2e]">
                    <th className="text-left py-2 px-3 text-slate-500 font-mono">Method</th>
                    <th className="text-left py-2 px-3 text-slate-500 font-mono">Path</th>
                    <th className="text-left py-2 px-3 text-slate-500 font-mono">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {ENDPOINTS.map(([method, path, desc]) => (
                    <tr key={path} className="border-b border-[#1e1e2e]/40 hover:bg-white/2">
                      <td className="py-2 px-3">
                        <span className={`font-mono font-bold text-xs ${method === "POST" ? "text-amber-400" : "text-emerald-400"}`}>
                          {method}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-400 text-[11px]">{path}</td>
                      <td className="py-2 px-3 text-slate-500">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Deployment */}
          <section id="Deployment">
            <h2 className="text-lg font-bold text-white mb-4">Deployment</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              The pipeline must run once offline (on a machine with GPU access for DistilBERT). Results are then
              uploaded to HuggingFace Spaces which serves the FastAPI backend. This Next.js app connects to that API.
            </p>
            <CodeBlock lang="bash" code={`# 1. Clone the Space repository
!git clone https://huggingface.co/spaces/your-username/fig-loneliness
%cd fig-loneliness

# 2. Install dependencies
!pip install -r requirements.txt

# 3. Run the full pipeline (requires T4 GPU for DistilBERT)
!python run_pipeline.py

# 4. Commit results back to the Space
!git add results/
!git commit -m "Add pipeline results"
!git push`} />
            <Callout type="warning" className="mt-4">
              DistilBERT fine-tuning requires ~30 minutes on a T4 GPU. The pipeline caches all intermediate results
              to disk, so individual stages can be re-run independently.
            </Callout>
          </section>

          {/* Limitations */}
          <section id="Limitations">
            <h2 className="text-lg font-bold text-white mb-4">Limitations</h2>
            <ul className="space-y-2">
              {[
                "English-only: all models and features are trained on English Reddit text",
                "Reddit-specific: vocabulary, style, and discourse patterns may not generalise to other platforms",
                "Temporal: data covers 2018–2020 only; language patterns may have shifted",
                "Construct overlap: loneliness shares linguistic features with depression and anxiety",
                "No demographic data: fairness analysis across subgroups is not possible",
                "GPU dependency: DistilBERT fine-tuning requires a GPU; CPU inference is very slow",
                "Annotation noise: some posts have ambiguous loneliness status (majority vote used)",
              ].map(l => (
                <li key={l} className="flex gap-2 text-xs text-slate-400">
                  <span className="text-rose-500 flex-shrink-0">—</span>
                  {l}
                </li>
              ))}
            </ul>
          </section>

          {/* Citation */}
          <section id="Citation">
            <h2 className="text-lg font-bold text-white mb-4">Citation</h2>
            <div className="bg-[#0d1117] border border-[#1e1e2e] rounded-xl p-5">
              <p className="text-xs font-mono text-slate-400 leading-loose">
                Jiang, Y., Jiang, Y., Leqi, L., & Winkielman, P. (2022).{"\n"}
                Many Ways to Be Lonely: Fine-Grained Characterization of Loneliness{"\n"}
                and Its Potential Changes in COVID-19.{"\n"}
                <em>Proceedings of the International AAAI Conference on Web and Social Media</em>, 16(1), 405–416.{"\n"}
                <a
                  href="https://ojs.aaai.org/index.php/ICWSM/article/view/19302"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 underline"
                >
                  https://ojs.aaai.org/index.php/ICWSM/article/view/19302
                </a>
              </p>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-mono">Dataset licence: CC BY-NC 4.0</p>
          </section>
        </div>
      </div>
    </div>
  )
}
