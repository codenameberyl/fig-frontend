"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const frontendStack = [
  { name: "Next.js 16", description: "React framework with App Router" },
  { name: "React 19", description: "UI component library" },
  { name: "Tailwind CSS", description: "Utility-first CSS framework" },
  { name: "Recharts", description: "Data visualization library" },
  { name: "shadcn/ui", description: "Component library" },
  { name: "TypeScript", description: "Type-safe JavaScript" },
]

const backendStack = [
  { name: "Django 5.0", description: "Python web framework" },
  { name: "Django REST Framework", description: "API toolkit" },
  { name: "HuggingFace Datasets", description: "Dataset management" },
  { name: "spaCy", description: "NLP processing pipeline" },
  { name: "Scikit-learn", description: "Classical ML models" },
  { name: "PyTorch", description: "Deep learning framework" },
  { name: "Transformers", description: "BERT model implementation" },
]

const infrastructure = [
  { name: "Vercel", description: "Frontend hosting and deployment" },
  { name: "Docker", description: "Container orchestration" },
  { name: "PostgreSQL", description: "Relational database" },
  { name: "Redis", description: "Caching layer" },
]

export function StackOverview() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
              <span className="text-lg">⚛️</span>
            </div>
            <div>
              <CardTitle className="text-lg">Frontend Stack</CardTitle>
              <CardDescription>User interface technologies</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {frontendStack.map((tech) => (
              <div
                key={tech.name}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {tech.name}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">{tech.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <span className="text-lg">🐍</span>
            </div>
            <div>
              <CardTitle className="text-lg">Backend Stack</CardTitle>
              <CardDescription>API and ML technologies</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backendStack.map((tech) => (
              <div
                key={tech.name}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {tech.name}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">{tech.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10">
              <span className="text-lg">☁️</span>
            </div>
            <div>
              <CardTitle className="text-lg">Infrastructure</CardTitle>
              <CardDescription>Deployment and data services</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {infrastructure.map((tech) => (
              <div
                key={tech.name}
                className="flex flex-col items-center rounded-lg border border-border bg-muted/30 p-4 text-center"
              >
                <Badge variant="outline" className="mb-2 font-mono">
                  {tech.name}
                </Badge>
                <span className="text-sm text-muted-foreground">{tech.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">API Endpoints</CardTitle>
          <CardDescription>Available Django REST Framework endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 text-left font-medium text-muted-foreground">Method</th>
                  <th className="py-2 text-left font-medium text-muted-foreground">Endpoint</th>
                  <th className="py-2 text-left font-medium text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2">
                    <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">GET</Badge>
                  </td>
                  <td className="py-2 font-mono text-xs">/api/v1/dataset/</td>
                  <td className="py-2 text-muted-foreground">Retrieve dataset samples and statistics</td>
                </tr>
                <tr>
                  <td className="py-2">
                    <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">GET</Badge>
                  </td>
                  <td className="py-2 font-mono text-xs">/api/v1/eda/</td>
                  <td className="py-2 text-muted-foreground">Get exploratory data analysis results</td>
                </tr>
                <tr>
                  <td className="py-2">
                    <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">GET</Badge>
                  </td>
                  <td className="py-2 font-mono text-xs">/api/v1/models/</td>
                  <td className="py-2 text-muted-foreground">Retrieve model performance metrics</td>
                </tr>
                <tr>
                  <td className="py-2">
                    <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">POST</Badge>
                  </td>
                  <td className="py-2 font-mono text-xs">/api/v1/analyze/</td>
                  <td className="py-2 text-muted-foreground">Submit text for loneliness analysis</td>
                </tr>
                <tr>
                  <td className="py-2">
                    <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">POST</Badge>
                  </td>
                  <td className="py-2 font-mono text-xs">/api/v1/preprocess/</td>
                  <td className="py-2 text-muted-foreground">Preview text preprocessing steps</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
