import React, { useState } from 'react';
import { Copy, Check, FileCode, Terminal } from 'lucide-react';

interface MarkdownFormatterProps {
  content: string;
}

export const MarkdownFormatter: React.FC<MarkdownFormatterProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Basic regex block splitter
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 leading-relaxed text-xs md:text-sm text-slate-200 font-sans">
      {parts.map((part, index) => {
        // Code Block
        if (part.startsWith('```')) {
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const lang = match ? match[1] : 'code';
          const code = match ? match[2] : part.slice(3, -3);
          const blockIndex = index;

          return (
            <div key={blockIndex} className="my-4 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden font-mono text-xs">
              {/* Header bar */}
              <div className="flex justify-between items-center px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-400">
                <span className="flex items-center text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  <Terminal className="h-3.5 w-3.5 text-purple-400 mr-1.5" />
                  {lang || 'source code'}
                </span>
                <button
                  onClick={() => handleCopyCode(code, blockIndex)}
                  className="flex items-center space-x-1 hover:text-white transition py-1 px-2 rounded-lg bg-slate-950/60 border border-slate-800"
                >
                  {copiedIndex === blockIndex ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-[10px]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code print */}
              <pre className="p-4 overflow-x-auto text-slate-300 font-mono text-xs leading-relaxed max-h-80">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Standard text parser (headings, lines, bullet points)
        const lines = part.split('\n');
        return (
          <div key={index} className="space-y-2">
            {lines.map((line, lineIdx) => {
              const lineKey = `${index}-${lineIdx}`;

              // Headings
              if (line.startsWith('### ')) {
                return <h3 key={lineKey} className="text-sm font-bold text-slate-100 pt-3">{line.replace('### ', '')}</h3>;
              }
              if (line.startsWith('## ')) {
                return <h2 key={lineKey} className="text-base font-extrabold text-slate-100 pt-4 pb-1 border-b border-slate-800/40">{line.replace('## ', '')}</h2>;
              }
              if (line.startsWith('# ')) {
                return <h1 key={lineKey} className="text-lg font-extrabold text-slate-50 pt-5 pb-1">{line.replace('# ', '')}</h1>;
              }

              // Bullet points
              if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                const cleanLine = line.replace(/^[\s\s]*- /, '').replace(/^[\s\s]*\* /, '');
                return (
                  <p key={lineKey} className="pl-4 flex items-start text-slate-300">
                    <span className="text-purple-400 mr-2 font-mono">•</span>
                    <span>{parseInline(cleanLine)}</span>
                  </p>
                );
              }

              // Quotes
              if (line.startsWith('> ')) {
                return (
                  <blockquote key={lineKey} className="pl-4 border-l-2 border-purple-500 text-slate-400 my-2 italic py-1 bg-slate-900/10 rounded-r-xl">
                    {parseInline(line.replace('> ', ''))}
                  </blockquote>
                );
              }

              // Normal text line
              if (!line.trim()) return <div key={lineKey} className="h-2" />;
              return <p key={lineKey} className="leading-relaxed text-slate-300">{parseInline(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};

// Simple helper to bold variables or inline code blocks
function parseInline(text: string): React.ReactNode[] {
  // Regex split on ** or `
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-extrabold text-slate-100">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-purple-400 rounded-md font-mono text-[11px]">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}
