"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"

const modelData = [
  { model: "Logistic Regression", accuracy: 0.842, precision: 0.821, recall: 0.856, f1: 0.838, best: false },
  { model: "Linear SVM", accuracy: 0.856, precision: 0.843, recall: 0.862, f1: 0.852, best: false },
  { model: "Random Forest", accuracy: 0.871, precision: 0.859, recall: 0.878, f1: 0.868, best: false },
  { model: "BERT Transformer", accuracy: 0.894, precision: 0.887, recall: 0.896, f1: 0.891, best: true },
]

export function ModelComparisonTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Comparison</CardTitle>
        <CardDescription>
          Performance metrics across all evaluated classifiers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead className="text-right">Accuracy</TableHead>
              <TableHead className="text-right">Precision</TableHead>
              <TableHead className="text-right">Recall</TableHead>
              <TableHead className="text-right">F1 Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modelData.map((row) => (
              <TableRow key={row.model} className={row.best ? "bg-primary/5" : ""}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{row.model}</span>
                    {row.best && (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                        <Trophy className="mr-1 size-3" />
                        Best
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {(row.accuracy * 100).toFixed(1)}%
                </TableCell>
                <TableCell className="text-right font-mono">
                  {row.precision.toFixed(3)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {row.recall.toFixed(3)}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold text-primary">
                  {row.f1.toFixed(3)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
