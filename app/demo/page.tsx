import { Metadata } from 'next'
import { Info } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { PredictForm } from '@/components/demo/predict-form'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Live Demo',
  description: 'Test the loneliness detection model with your own text',
}

export default function DemoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Live Inference Demo"
        subtitle="Test the loneliness detection model with your own text"
      />

      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Info Callout */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex gap-3 pt-6">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p>
                  Using the best-performing model (<span className="font-mono text-foreground">distilbert/fine_tuned</span>) 
                  loaded from pre-computed weights. Predictions run on the HuggingFace Spaces CPU instance.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Predict Form */}
          <PredictForm />
        </div>
      </div>
    </div>
  )
}
