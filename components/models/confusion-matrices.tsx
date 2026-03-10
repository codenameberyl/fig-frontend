"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const confusionData = {
  logReg: { tp: 612, fp: 134, fn: 123, tn: 1058 },
  svm: { tp: 634, fp: 118, fn: 101, tn: 1074 },
  rf: { tp: 651, fp: 102, fn: 84, tn: 1090 },
  bert: { tp: 668, fp: 85, fn: 67, tn: 1107 },
}

function ConfusionMatrix({ data }: { data: { tp: number; fp: number; fn: number; tn: number } }) {
  const total = data.tp + data.fp + data.fn + data.tn
  const accuracy = ((data.tp + data.tn) / total * 100).toFixed(1)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-1 text-center text-sm">
        <div></div>
        <div className="rounded-t-lg bg-muted/50 py-2 font-medium">Predicted Lonely</div>
        <div className="rounded-t-lg bg-muted/50 py-2 font-medium">Predicted Non-Lonely</div>
        
        <div className="flex items-center justify-center rounded-l-lg bg-muted/50 px-3 py-4 font-medium">
          Actual Lonely
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg bg-pink-500/20 p-4">
          <span className="text-2xl font-bold text-pink-500">{data.tp}</span>
          <span className="text-xs text-muted-foreground">True Positive</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg bg-red-500/10 p-4">
          <span className="text-2xl font-bold text-red-400">{data.fn}</span>
          <span className="text-xs text-muted-foreground">False Negative</span>
        </div>
        
        <div className="flex items-center justify-center rounded-l-lg bg-muted/50 px-3 py-4 font-medium">
          Actual Non-Lonely
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg bg-orange-500/10 p-4">
          <span className="text-2xl font-bold text-orange-400">{data.fp}</span>
          <span className="text-xs text-muted-foreground">False Positive</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg bg-cyan-500/20 p-4">
          <span className="text-2xl font-bold text-cyan-500">{data.tn}</span>
          <span className="text-xs text-muted-foreground">True Negative</span>
        </div>
      </div>
      
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
        <span className="text-sm text-muted-foreground">Overall Accuracy: </span>
        <span className="font-mono font-bold text-primary">{accuracy}%</span>
      </div>
    </div>
  )
}

export function ConfusionMatrices() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Confusion Matrices</CardTitle>
        <CardDescription>
          Detailed prediction breakdown for each model on the test set
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bert" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="logReg">Log. Regression</TabsTrigger>
            <TabsTrigger value="svm">SVM</TabsTrigger>
            <TabsTrigger value="rf">Random Forest</TabsTrigger>
            <TabsTrigger value="bert">BERT</TabsTrigger>
          </TabsList>
          
          <TabsContent value="logReg" className="mt-6">
            <ConfusionMatrix data={confusionData.logReg} />
          </TabsContent>
          
          <TabsContent value="svm" className="mt-6">
            <ConfusionMatrix data={confusionData.svm} />
          </TabsContent>
          
          <TabsContent value="rf" className="mt-6">
            <ConfusionMatrix data={confusionData.rf} />
          </TabsContent>
          
          <TabsContent value="bert" className="mt-6">
            <ConfusionMatrix data={confusionData.bert} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
