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

const splitData = [
  { split: "Training", samples: 8993, percentage: 70.0, lonely: 3437, nonLonely: 5556 },
  { split: "Validation", samples: 1927, percentage: 15.0, lonely: 736, nonLonely: 1191 },
  { split: "Test", samples: 1927, percentage: 15.0, lonely: 735, nonLonely: 1192 },
]

export function SplitSummaryTable() {
  const totalSamples = splitData.reduce((acc, row) => acc + row.samples, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dataset Split Summary</CardTitle>
        <CardDescription>
          Overview of training, validation, and test set distributions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Split</TableHead>
              <TableHead className="text-right">Samples</TableHead>
              <TableHead className="text-right">% of Dataset</TableHead>
              <TableHead className="text-right">Lonely</TableHead>
              <TableHead className="text-right">Non-Lonely</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {splitData.map((row) => (
              <TableRow key={row.split}>
                <TableCell>
                  <Badge variant="outline">{row.split}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {row.samples.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {row.percentage.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right font-mono text-pink-500">
                  {row.lonely.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono text-cyan-500">
                  {row.nonLonely.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2">
              <TableCell>
                <Badge>Total</Badge>
              </TableCell>
              <TableCell className="text-right font-mono font-semibold">
                {totalSamples.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-mono font-semibold">
                100%
              </TableCell>
              <TableCell className="text-right font-mono font-semibold text-pink-500">
                {splitData.reduce((acc, row) => acc + row.lonely, 0).toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-mono font-semibold text-cyan-500">
                {splitData.reduce((acc, row) => acc + row.nonLonely, 0).toLocaleString()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
