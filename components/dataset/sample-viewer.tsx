"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const sampleData = {
  train: [
    { id: "TR001", text: "I've been feeling so alone lately. Nobody seems to understand what I'm going through...", label: "lonely" },
    { id: "TR002", text: "Had an amazing day with friends! We went hiking and enjoyed the beautiful weather.", label: "non-lonely" },
    { id: "TR003", text: "Sometimes I wonder if anyone would even notice if I disappeared for a while...", label: "lonely" },
    { id: "TR004", text: "Just finished a great book club meeting. Love the discussions we have!", label: "non-lonely" },
    { id: "TR005", text: "It's hard when everyone around you has someone but you're always by yourself...", label: "lonely" },
  ],
  validation: [
    { id: "VA001", text: "The silence in my apartment is deafening. I miss having someone to talk to.", label: "lonely" },
    { id: "VA002", text: "Family dinner was wonderful tonight. Grateful for these moments together.", label: "non-lonely" },
    { id: "VA003", text: "I scroll through my contacts but can't think of anyone to call. That's depressing.", label: "lonely" },
    { id: "VA004", text: "My coworkers are so supportive. We have lunch together every day.", label: "non-lonely" },
    { id: "VA005", text: "Another weekend spent alone. I can't remember the last time I felt connected.", label: "lonely" },
  ],
  test: [
    { id: "TE001", text: "I feel invisible sometimes. Like I could disappear and nobody would care.", label: "lonely" },
    { id: "TE002", text: "Game night with the neighbors was a blast! Can't wait for next week.", label: "non-lonely" },
    { id: "TE003", text: "Everyone seems to have their groups and I'm just... on the outside looking in.", label: "lonely" },
    { id: "TE004", text: "My best friend called today just to check in. It really made my day!", label: "non-lonely" },
    { id: "TE005", text: "The loneliness hits hardest at night when there's no one to share the silence with.", label: "lonely" },
  ],
}

export function SampleViewer() {
  const [selectedSplit, setSelectedSplit] = useState<keyof typeof sampleData>("train")
  const [page, setPage] = useState(1)
  const itemsPerPage = 5

  const samples = sampleData[selectedSplit]
  const totalPages = Math.ceil(samples.length / itemsPerPage)
  const startIndex = (page - 1) * itemsPerPage
  const currentSamples = samples.slice(startIndex, startIndex + itemsPerPage)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Sample Viewer</CardTitle>
            <CardDescription>
              Browse individual samples from the dataset
            </CardDescription>
          </div>
          <Select
            value={selectedSplit}
            onValueChange={(value: keyof typeof sampleData) => {
              setSelectedSplit(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select split" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="train">Training Set</SelectItem>
              <SelectItem value="validation">Validation Set</SelectItem>
              <SelectItem value="test">Test Set</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Post ID</TableHead>
              <TableHead>Text Preview</TableHead>
              <TableHead className="w-[120px] text-right">Label</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentSamples.map((sample) => (
              <TableRow key={sample.id}>
                <TableCell className="font-mono text-xs">{sample.id}</TableCell>
                <TableCell className="max-w-md truncate text-sm">
                  {sample.text}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={sample.label === "lonely" ? "default" : "secondary"}
                    className={
                      sample.label === "lonely"
                        ? "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20"
                        : "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20"
                    }
                  >
                    {sample.label === "lonely" ? "Lonely" : "Non-Lonely"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, samples.length)} of {samples.length} samples
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
