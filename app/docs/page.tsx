'use client'

import { useState } from 'react'
import { Metadata } from 'next'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'dataset', label: 'Dataset' },
  { id: 'preprocessing', label: 'Preprocessing' },
  { id: 'representations', label: 'Representations' },
  { id: 'models', label: 'Models' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'api', label: 'API Reference' },
  { id: 'deployment', label: 'Deployment' },
  { id: 'limitations', label: 'Limitations' },
  { id: 'citation', label: 'Citation' },
]

const linguisticFeatures = [
  { name: 'word_count', description: 'Total number of words in the post' },
  { name: 'char_count', description: 'Total number of characters' },
  { name: 'sentence_count', description: 'Number of sentences' },
  { name: 'avg_word_length', description: 'Average word length in characters' },
  { name: 'pronoun_ratio', description: 'Ratio of pronouns to total words' },
  { name: 'first_person_ratio', description: 'Ratio of first-person pronouns (I, me, my)' },
  { name: 'emotion_word_ratio', description: 'Ratio of emotion-related words' },
  { name: 'negation_ratio', description: 'Ratio of negation words (not, never, no)' },
  { name: 'question_ratio', description: 'Ratio of sentences ending in question marks' },
  { name: 'exclamation_ratio', description: 'Ratio of sentences ending in exclamation marks' },
  { name: 'hedge_ratio', description: 'Ratio of hedging words (maybe, perhaps, might)' },
  { name: 'certainty_ratio', description: 'Ratio of certainty words (definitely, always, never)' },
  { name: 'social_word_ratio', description: 'Ratio of social/relationship words (friend, family)' },
]

const representations = [
  { name: 'Linguistic Only', type: 'Sparse', dim: '13', notes: 'Hand-crafted features with full interpretability' },
  { name: 'TF-IDF', type: 'Sparse', dim: '~15,000', notes: 'Unigram + bigram n-grams, max_df=0.9, min_df=5' },
  { name: 'TF-IDF + Linguistic', type: 'Sparse', dim: '~15,013', notes: 'Combined sparse features' },
  { name: 'Word2Vec', type: 'Dense', dim: '200', notes: 'Averaged pre-trained token embeddings' },
  { name: 'Sentence-BERT', type: 'Dense', dim: '384', notes: 'all-MiniLM-L6-v2 sentence embeddings' },
  { name: 'DistilBERT', type: 'Dense', dim: '768', notes: 'Fine-tuned distilbert-base-uncased' },
]

const models = [
  { name: 'Logistic Regression', reps: 'All sparse & dense', notes: 'L2 regularization, balanced class weights' },
  { name: 'Random Forest', reps: 'All sparse & dense', notes: '100 estimators, balanced class weights' },
  { name: 'SVM', reps: 'All sparse & dense', notes: 'RBF kernel, balanced class weights' },
  { name: 'Fine-tuned DistilBERT', reps: 'DistilBERT only', notes: 'End-to-end training, 3 epochs' },
]

const apiEndpoints = [
  { method: 'GET', path: '/api/status', description: 'Get pipeline status and available results' },
  { method: 'GET', path: '/api/eda/dataset', description: 'Get dataset summary statistics' },
  { method: 'GET', path: '/api/eda/class_distribution', description: 'Get class distribution by split' },
  { method: 'GET', path: '/api/eda/length_stats', description: 'Get text length statistics' },
  { method: 'GET', path: '/api/eda/linguistic_stats', description: 'Get linguistic feature statistics' },
  { method: 'GET', path: '/api/eda/ngrams', description: 'Get n-gram frequencies' },
  { method: 'GET', path: '/api/eda/pos_distribution', description: 'Get POS tag distribution' },
  { method: 'GET', path: '/api/models/results', description: 'Get all model results' },
  { method: 'GET', path: '/api/models/best_per_representation', description: 'Get best model per representation' },
  { method: 'GET', path: '/api/models/confusion_matrix/{model_key}', description: 'Get confusion matrix for a model' },
  { method: 'GET', path: '/api/models/roc_curve/{model_key}', description: 'Get ROC curve data for a model' },
  { method: 'GET', path: '/api/models/full_report/{model_key}', description: 'Get full classification report' },
  { method: 'GET', path: '/api/models/interpretability/summary', description: 'Get interpretability summary' },
  { method: 'GET', path: '/api/models/interpretability/coefficients/{rep}', description: 'Get LR coefficients' },
  { method: 'GET', path: '/api/models/error_analysis/summary', description: 'Get error analysis summary' },
  { method: 'GET', path: '/api/models/error_analysis/{model_key}', description: 'Get error examples for a model' },
  { method: 'POST', path: '/api/predict', description: 'Classify text for loneliness' },
]

function CodeBlock({ children, language = 'python' }: { children: string; language?: string }) {
  return (
    <pre className="bg-muted/50 border border-border rounded-lg p-4 overflow-x-auto">
      <code className="text-sm font-mono text-foreground">{children}</code>
    </pre>
  )
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview')

  const scrollToSection = (id: string) => {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Documentation"
        subtitle="Technical documentation for the FIG-Loneliness NLP project"
      />

      <div className="flex-1 flex">
        {/* In-page Navigation */}
        <aside className="hidden lg:block w-56 shrink-0 border-r border-border p-4 sticky top-0 h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors',
                  activeSection === section.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 p-6 max-w-4xl">
          <div className="space-y-12">
            {/* Overview */}
            <section id="overview" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold mb-4">Project Overview</h2>
              <div className="prose prose-invert max-w-none space-y-4 text-muted-foreground">
                <p>
                  The FIG-Loneliness project is a comprehensive NLP pipeline for detecting loneliness 
                  self-disclosure in Reddit posts. Using the FIG-Loneliness dataset (Jiang et al., 2022), 
                  we evaluate multiple text representations and classification models to understand 
                  how computational methods can identify expressions of loneliness in social media text.
                </p>
                <p>
                  This dashboard provides interactive visualizations of the entire pipeline, from 
                  exploratory data analysis through model evaluation, interpretability analysis, and 
                  live inference.
                </p>
                <h3 className="text-lg font-medium text-foreground mt-6">Research Questions</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>RQ1:</strong> What linguistic and structural characteristics differentiate lonely vs non-lonely posts?</li>
                  <li><strong>RQ2:</strong> How well can baseline structural text classification models detect loneliness self-disclosure?</li>
                  <li><strong>RQ3:</strong> How do text representations affect predictive performance?</li>
                  <li><strong>RQ4:</strong> What trade-offs exist between performance and interpretability?</li>
                </ul>
              </div>
            </section>

            {/* Architecture */}
            <section id="architecture" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold mb-4">Architecture</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-mono">
                    {['Reddit Data', 'Preprocessing', 'EDA', 'Feature Extraction', 'Model Training', 'Evaluation', 'Error Analysis', 'Interpretability', 'API', 'Frontend'].map((step, idx, arr) => (
                      <div key={step} className="flex items-center gap-2">
                        <Badge variant="outline" className="px-3 py-1">{step}</Badge>
                        {idx < arr.length - 1 && <span className="text-muted-foreground">→</span>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Dataset */}
            <section id="dataset" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold mb-4">Dataset</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  The FIG-Loneliness dataset contains 5,633 Reddit posts labeled for loneliness 
                  self-disclosure. Posts were collected from loneliness-related subreddits 
                  (r/loneliness, r/lonely) and general subreddits (r/youngadults, r/college).
                </p>
                <Card>
                  <CardContent className="p-0">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left font-medium px-4 py-3">Split</th>
                          <th className="text-right font-medium px-4 py-3">Total</th>
                          <th className="text-right font-medium px-4 py-3">Lonely</th>
                          <th className="text-right font-medium px-4 py-3">Non-Lonely</th>
                          <th className="text-right font-medium px-4 py-3">Lonely %</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border">
                          <td className="px-4 py-3 font-medium">Train</td>
                          <td className="px-4 py-3 text-right font-mono">4,506</td>
                          <td className="px-4 py-3 text-right font-mono">2,106</td>
                          <td className="px-4 py-3 text-right font-mono">2,400</td>
                          <td className="px-4 py-3 text-right font-mono">46.7%</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="px-4 py-3 font-medium">Validation</td>
                          <td className="px-4 py-3 text-right font-mono">563</td>
                          <td className="px-4 py-3 text-right font-mono">263</td>
                          <td className="px-4 py-3 text-right font-mono">300</td>
                          <td className="px-4 py-3 text-right font-mono">46.7%</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-medium">Test</td>
                          <td className="px-4 py-3 text-right font-mono">564</td>
                          <td className="px-4 py-3 text-right font-mono">264</td>
                          <td className="px-4 py-3 text-right font-mono">300</td>
                          <td className="px-4 py-3 text-right font-mono">46.8%</td>
                        </tr>
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Preprocessing */}
            <section id="preprocessing" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold mb-4">Preprocessing Pipeline</h2>
              <div className="space-y-4">
                <ol className="list-decimal pl-6 space-y-3 text-muted-foreground">
                  <li><strong>Unicode normalization</strong> — ftfy + NFKC normalization</li>
                  <li><strong>HTML stripping</strong> — bleach library for HTML entity removal</li>
                  <li><strong>URL/mention/hashtag/emoji removal</strong> — regex-based cleaning</li>
                  <li><strong>Lowercasing + repeated character normalization</strong> — e.g., &quot;soooo&quot; → &quot;soo&quot;</li>
                  <li><strong>spaCy tokenization, lemmatization, POS tagging</strong> — en_core_web_sm model</li>
                  <li><strong>Stopword removal</strong> — preserving negations (not, never, no)</li>
                  <li><strong>Linguistic feature extraction</strong> — 13 features (see table below)</li>
                </ol>

                <h3 className="text-lg font-medium text-foreground mt-6">Linguistic Features</h3>
                <Card>
                  <CardContent className="p-0">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left font-medium px-4 py-3">Feature</th>
                          <th className="text-left font-medium px-4 py-3">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {linguisticFeatures.map((f) => (
                          <tr key={f.name} className="border-b border-border last:border-b-0">
                            <td className="px-4 py-2 font-mono text-xs">{f.name}</td>
                            <td className="px-4 py-2 text-muted-foreground">{f.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Representations */}
            <section id="representations" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold mb-4">Text Representations</h2>
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left font-medium px-4 py-3">Representation</th>
                        <th className="text-left font-medium px-4 py-3">Type</th>
                        <th className="text-left font-medium px-4 py-3">Dimensionality</th>
                        <th className="text-left font-medium px-4 py-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {representations.map((r) => (
                        <tr key={r.name} className="border-b border-border last:border-b-0">
                          <td className="px-4 py-3 font-medium">{r.name}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline">{r.type}</Badge>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs">{r.dim}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{r.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </section>

            {/* Models */}
            <section id="models" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold mb-4">Models</h2>
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left font-medium px-4 py-3">Model</th>
                        <th className="text-left font-medium px-4 py-3">Representations</th>
                        <th className="text-left font-medium px-4 py-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {models.map((m) => (
                        <tr key={m.name} className="border-b border-border last:border-b-0">
                          <td className="px-4 py-3 font-medium">{m.name}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{m.reps}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{m.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </section>

            {/* Metrics */}
            <section id="metrics" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold mb-4">Evaluation Metrics</h2>
              <div className="space-y-4 text-muted-foreground">
                <ul className="space-y-3">
                  <li><strong>Precision:</strong> The ratio of true positives to all predicted positives. Measures how many predicted lonely posts are actually lonely.</li>
                  <li><strong>Recall:</strong> The ratio of true positives to all actual positives. Measures how many actual lonely posts are correctly identified.</li>
                  <li><strong>F1 Score:</strong> The harmonic mean of precision and recall. Provides a balanced measure of model performance.</li>
                  <li><strong>ROC-AUC:</strong> Area under the Receiver Operating Characteristic curve. Measures the model&apos;s ability to discriminate between classes at various thresholds.</li>
                </ul>
                <p className="text-sm">
                  All models use balanced class weights to handle the slight class imbalance (46.7% lonely, 53.3% non-lonely).
                </p>
              </div>
            </section>

            {/* API Reference */}
            <section id="api" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold mb-4">API Reference</h2>
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left font-medium px-4 py-3 w-20">Method</th>
                        <th className="text-left font-medium px-4 py-3">Path</th>
                        <th className="text-left font-medium px-4 py-3">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiEndpoints.map((e) => (
                        <tr key={e.path} className="border-b border-border last:border-b-0">
                          <td className="px-4 py-2">
                            <Badge variant={e.method === 'POST' ? 'default' : 'secondary'} className="font-mono text-xs">
                              {e.method}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 font-mono text-xs">{e.path}</td>
                          <td className="px-4 py-2 text-muted-foreground text-xs">{e.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </section>

            {/* Deployment */}
            <section id="deployment" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold mb-4">Deployment</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  The pipeline can be run on Google Colab, with results uploaded to HuggingFace Spaces 
                  for API serving. The FastAPI backend serves model predictions and cached results.
                </p>
                <CodeBlock>{`# Clone the repository
!git clone https://huggingface.co/spaces/your-username/fig-loneliness
%cd fig-loneliness

# Install dependencies
!pip install -r requirements.txt

# Run the full pipeline
!python run_pipeline.py --eval_on_test --skip_bert=False`}</CodeBlock>
              </div>
            </section>

            {/* Limitations */}
            <section id="limitations" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold mb-4">Limitations</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>English-only:</strong> The model is trained on English text and may not generalize to other languages.</li>
                <li><strong>Reddit-specific:</strong> Training data comes from Reddit, which has specific linguistic patterns and user demographics.</li>
                <li><strong>Loneliness overlap:</strong> Loneliness expressions may overlap with depression, anxiety, and other mental health conditions.</li>
                <li><strong>No demographic data:</strong> The dataset does not include user demographics, limiting analysis of potential biases.</li>
                <li><strong>GPU required:</strong> DistilBERT fine-tuning requires GPU resources (Colab T4 or better recommended).</li>
                <li><strong>Temporal effects:</strong> Language patterns around loneliness may change over time, potentially affecting model performance.</li>
              </ul>
            </section>

            {/* Citation */}
            <section id="citation" className="scroll-mt-8">
              <h2 className="text-2xl font-semibold mb-4">Citation</h2>
              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <pre className="text-sm font-mono whitespace-pre-wrap text-muted-foreground">
{`@inproceedings{jiang2022understanding,
  title={Understanding Loneliness Self-Disclosure on Social Media: 
         A Study of Reddit Posts during COVID-19},
  author={Jiang, Huimin and others},
  booktitle={Proceedings of the International AAAI Conference on 
             Web and Social Media (ICWSM)},
  year={2022}
}`}
                  </pre>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
