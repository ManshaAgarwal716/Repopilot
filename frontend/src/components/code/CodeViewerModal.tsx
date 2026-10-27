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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <FileCode className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 font-mono truncate">{fileName}</span>
                <Badge variant="cyan" size="sm">
                  Inspector
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate">{filePath}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onAskAI && (
              <button
                onClick={() => {
                  onAskAI(filePath);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-medium transition-colors shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Ask AI to Explain</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Copy Code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-50 overflow-y-auto flex-1 font-mono text-xs leading-relaxed text-slate-800">
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-100/70 transition-colors">
                  <td className="w-10 pr-4 text-right text-slate-400 select-none text-[11px] align-top">
                    {idx + 1}
                  </td>
                  <td className="whitespace-pre-wrap break-all text-slate-800">
                    {line.startsWith('+') ? (
                      <span className="text-emerald-700 bg-emerald-50 px-1 rounded">{line}</span>
                    ) : line.startsWith('-') ? (
                      <span className="text-rose-700 bg-rose-50 px-1 rounded">{line}</span>
                    ) : line.startsWith('@') ? (
                      <span className="text-blue-700 font-semibold">{line}</span>
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
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>{lines.length} lines</span>
          <span className="text-slate-400 font-sans text-[11px]">RepoPilot Read-Only Inspector</span>
        </div>
      </div>
    </div>
  );
};
