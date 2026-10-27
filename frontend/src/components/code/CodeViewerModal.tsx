import React, { useState } from 'react';
import {
  X,
  FileCode,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface CodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  filePath: string;
  codeSnippet?: string;
  onAskAI?: (filePath: string) => void;
}

export const CodeViewerModal: React.FC<CodeViewerModalProps> = ({
  isOpen,
  onClose,
  fileName,
  filePath,
  codeSnippet,
  onAskAI,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const defaultSnippet = codeSnippet || `# ${fileName}\n# File: ${filePath}\n\n# Safe read-only inspection placeholder.\n# Real-time file content streaming connects to the local filesystem in the upcoming release.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(defaultSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const lines = defaultSnippet.split('\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/85 backdrop-blur-md animate-fadeIn font-sans">
      <div className="w-full max-w-3xl bg-charcoal-900 border border-charcoal-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-charcoal-800 flex items-center justify-between shrink-0 bg-charcoal-900">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 flex items-center justify-center shrink-0">
              <FileCode className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-charcoal-100 font-mono truncate">{fileName}</span>
                <Badge variant="cyan" size="sm">
                  Inspector
                </Badge>
              </div>
              <p className="text-[11px] text-charcoal-400 font-mono truncate">{filePath}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onAskAI && (
              <button
                onClick={() => {
                  onAskAI(filePath);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ask AI to Explain</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-800 transition-colors"
              title="Copy Code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-800 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-charcoal-950 overflow-y-auto flex-1 font-mono text-xs leading-relaxed text-charcoal-200">
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-charcoal-900/60 transition-colors">
                  <td className="w-10 pr-4 text-right text-charcoal-600 select-none text-[11px] align-top">
                    {idx + 1}
                  </td>
                  <td className="whitespace-pre-wrap break-all text-charcoal-300">
                    {line.startsWith('+') ? (
                      <span className="text-emerald-400">{line}</span>
                    ) : line.startsWith('-') ? (
                      <span className="text-rose-400">{line}</span>
                    ) : line.startsWith('@') ? (
                      <span className="text-cyan-400">{line}</span>
                    ) : (
                      line
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-charcoal-900 border-t border-charcoal-800 flex items-center justify-between text-xs text-charcoal-400 font-mono">
          <span>{lines.length} lines</span>
          <span className="text-charcoal-500 font-sans text-[11px]">RepoPilot Read-Only Inspector</span>
        </div>
      </div>
    </div>
  );
};
