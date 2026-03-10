"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ProjectSummary() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Project Summary</CardTitle>
            <CardDescription>
              Research objectives and methodology
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">NLP</Badge>
            <Badge variant="secondary">ML</Badge>
            <Badge variant="secondary">Mental Health</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Research Goal</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              This project aims to develop and evaluate NLP-based models for
              automatically detecting loneliness self-disclosure in social media
              posts. By identifying linguistic patterns associated with loneliness,
              we can potentially enable early intervention and support systems.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">NLP Pipeline</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Our preprocessing pipeline includes text cleaning, tokenization,
              linguistic feature extraction (first-person pronouns, social words,
              sentiment), and TF-IDF vectorization. Features are engineered to
              capture both surface-level and semantic patterns of loneliness expression.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">ML Comparison</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We compare traditional ML classifiers (Logistic Regression, SVM,
              Random Forest) with transformer-based models (BERT). Our evaluation
              includes accuracy, precision, recall, F1 score, and ROC-AUC across
              different model architectures.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Real-World Impact</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Automated loneliness detection can support mental health platforms,
              enable targeted outreach programs, and help researchers understand
              the linguistic markers of social isolation. This work contributes
              to computational approaches for mental health monitoring.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
