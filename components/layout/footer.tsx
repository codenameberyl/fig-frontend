import { Brain, Github, ExternalLink } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-[#1e1e2e] bg-[#0a0a0f] mt-16">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-md bg-violet-600/20 border border-violet-600/30 flex items-center justify-center">
              <Brain className="h-3.5 w-3.5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">FIG-Loneliness Dashboard</p>
              <p className="text-xs text-slate-600 font-mono">NLP Pipeline · MSc Research Project</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500">
            <a
              href="https://github.com/your-username/fig-loneliness"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              GitHub
            </a>
            <a
              href="https://huggingface.co/datasets/FIG-Loneliness/FIG-Loneliness"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              HuggingFace Dataset
            </a>
            <a
              href="https://your-space.hf.space/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              API Reference
            </a>
            <a
              href="https://ojs.aaai.org/index.php/ICWSM/article/view/19302"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Original Paper
            </a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#1e1e2e] flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <p className="text-[11px] text-slate-700 font-mono">
            Dataset: FIG-Loneliness (Jiang et al., ICWSM 2022) · CC BY-NC 4.0
          </p>
          <p className="text-[11px] text-slate-700 font-mono">
            Reddit posts from r/loneliness · r/lonely · r/youngadults · r/college (2018–2020)
          </p>
        </div>
      </div>
    </footer>
  )
}
