import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal as TerminalIcon,
  X,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Trash2,
  Play,
} from 'lucide-react';
import { TERMINAL_OUTPUTS } from '../../data/demoData';

interface TerminalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCommand?: string;
}

export const TerminalDrawer: React.FC<TerminalDrawerProps> = ({
  isOpen,
  onClose,
  activeCommand = 'repopilot doctor .',
}) => {
  const [activeTab, setActiveTab] = useState<'doctor' | 'explore' | 'pr-check' | 'interactive'>('doctor');
  const [isMaximized, setIsMaximized] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [inputVal, setInputVal] = useState('');
  const [copied, setCopied] = useState(false);
  const [interactiveLogs, setInteractiveLogs] = useState<Array<{ cmd: string; out: string; time: string }>>([
    {
      cmd: 'repopilot --version',
      out: 'RepoPilot version 0.1.0\nReady for local repository analysis.',
      time: '12:00:01',
    },
  ]);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Sync activeCommand when passed
  useEffect(() => {
    if (activeCommand.includes('doctor')) setActiveTab('doctor');
    else if (activeCommand.includes('explore')) setActiveTab('explore');
    else if (activeCommand.includes('pr-check')) setActiveTab('pr-check');
  }, [activeCommand]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interactiveLogs, activeTab]);

  if (!isOpen) return null;

  const getPresetOutput = () => {
    switch (activeTab) {
      case 'doctor':
        return {
          cmd: 'repopilot doctor .',
          out: TERMINAL_OUTPUTS['repopilot doctor .'],
        };
      case 'explore':
        return {
          cmd: 'repopilot explore . --depth 2',
          out: TERMINAL_OUTPUTS['repopilot explore . --depth 2'],
        };
      case 'pr-check':
        return {
          cmd: 'repopilot pr-check --base main',
          out: TERMINAL_OUTPUTS['repopilot pr-check --base main'],
        };
      case 'interactive':
      default:
        return null;
    }
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    const time = new Date().toLocaleTimeString();
    let response = '';

    if (trimmed === 'clear') {
      setInteractiveLogs([]);
      setInputVal('');
      return;
    } else if (trimmed === 'help' || trimmed === '--help') {
      response = `Available commands in RepoPilot Terminal:\n  repopilot doctor [path]       - Audit project types and tools\n  repopilot explore [path]      - Traverse directory tree and entry points\n  repopilot pr-check [--base]   - Audit branch changes & test coverage\n  repopilot --version           - Show version\n  pytest -v                     - Run unit tests\n  clear                         - Clear terminal output`;
    } else if (trimmed.includes('doctor')) {
      response = TERMINAL_OUTPUTS['repopilot doctor .'];
    } else if (trimmed.includes('explore')) {
      response = TERMINAL_OUTPUTS['repopilot explore . --depth 2'];
    } else if (trimmed.includes('pr-check')) {
      response = TERMINAL_OUTPUTS['repopilot pr-check --base main'];
    } else {
      response = `zsh: command simulated: ${trimmed}\n(Run 'repopilot doctor', 'repopilot explore', or 'repopilot pr-check' to see full outputs)`;
    }

    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
    setInteractiveLogs((prev) => [...prev, { cmd: trimmed, out: response, time }]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInputVal(history[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= history.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx]);
      }
    }
  };

  const currentPreset = getPresetOutput();

  const handleCopyCurrent = () => {
    const textToCopy = currentPreset
      ? `$ ${currentPreset.cmd}\n${currentPreset.out}`
      : interactiveLogs.map((l) => `$ ${l.cmd}\n${l.out}`).join('\n\n');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-charcoal-950/95 backdrop-blur-md border-t border-charcoal-750/90 shadow-2xl transition-all duration-200 flex flex-col font-mono ${
        isMaximized ? 'h-[85vh]' : 'h-80'
      }`}
    >
      {/* Terminal Title Bar & Tabs */}
      <div className="h-10 px-3 bg-charcoal-900 border-b border-charcoal-800 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <div className="flex items-center gap-2 pr-3 border-r border-charcoal-800 text-xs text-charcoal-300 font-sans font-semibold">
            <TerminalIcon className="w-4 h-4 text-brand-cyan" />
            <span className="hidden sm:inline">RepoPilot Terminal</span>
          </div>

          {/* Preset Command Tabs */}
          <button
            onClick={() => setActiveTab('doctor')}
            className={`px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1.5 ${
              activeTab === 'doctor'
                ? 'bg-charcoal-800 text-emerald-400 font-semibold'
                : 'text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-850'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>doctor</span>
          </button>

          <button
            onClick={() => setActiveTab('explore')}
            className={`px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1.5 ${
              activeTab === 'explore'
                ? 'bg-charcoal-800 text-cyan-400 font-semibold'
                : 'text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-850'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>explore</span>
          </button>

          <button
            onClick={() => setActiveTab('pr-check')}
            className={`px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1.5 ${
              activeTab === 'pr-check'
                ? 'bg-charcoal-800 text-indigo-400 font-semibold'
                : 'text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-850'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>pr-check</span>
          </button>

          <button
            onClick={() => setActiveTab('interactive')}
            className={`px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1.5 ${
              activeTab === 'interactive'
                ? 'bg-charcoal-800 text-amber-400 font-semibold'
                : 'text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-850'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>interactive shell</span>
          </button>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1 shrink-0 text-charcoal-400">
          <button
            onClick={handleCopyCurrent}
            className="p-1 rounded hover:bg-charcoal-800 hover:text-charcoal-200 transition-colors"
            title="Copy Terminal Output"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 rounded hover:bg-charcoal-800 hover:text-charcoal-200 transition-colors"
            title={isMaximized ? 'Restore Height' : 'Maximize Terminal'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-charcoal-800 hover:text-charcoal-200 transition-colors"
            title="Close Terminal (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 overflow-y-auto p-4 text-xs leading-relaxed space-y-3 font-mono selection:bg-brand-cyan/30">
        {activeTab !== 'interactive' && currentPreset && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-charcoal-400">
              <span className="text-emerald-400 font-bold">$</span>
              <span className="text-charcoal-100 font-semibold">{currentPreset.cmd}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 rounded">
                Exit Code 0
              </span>
            </div>
            <pre className="text-charcoal-200 whitespace-pre-wrap font-mono text-[11px] leading-tight overflow-x-auto bg-charcoal-900/40 p-3 rounded-lg border border-charcoal-800/60">
              {currentPreset.out}
            </pre>
          </div>
        )}

        {activeTab === 'interactive' && (
          <div className="space-y-3">
            <div className="text-[11px] text-charcoal-500 border-b border-charcoal-800/80 pb-2 flex items-center justify-between">
              <span>RepoPilot Virtual Terminal Session • Type commands below (e.g. `repopilot doctor`, `pytest -v`, `help`, `clear`)</span>
              {interactiveLogs.length > 0 && (
                <button
                  onClick={() => setInteractiveLogs([])}
                  className="text-charcoal-500 hover:text-charcoal-300 flex items-center gap-1 text-[10px]"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            {interactiveLogs.map((log, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center gap-2 text-charcoal-300">
                  <span className="text-brand-cyan font-bold">➜</span>
                  <span className="text-charcoal-400 text-[10px]">repopilot git:(main)</span>
                  <span className="text-emerald-400 font-bold">$</span>
                  <span className="text-charcoal-100 font-semibold">{log.cmd}</span>
                </div>
                <pre className="text-charcoal-300 whitespace-pre-wrap text-[11px] pl-4 border-l-2 border-charcoal-800 leading-normal">
                  {log.out}
                </pre>
              </div>
            ))}

            <div ref={logsEndRef} />
          </div>
        )}
      </div>

      {/* Terminal Interactive Prompt (when in interactive tab) */}
      {activeTab === 'interactive' && (
        <form
          onSubmit={handleCommandSubmit}
          className="h-10 px-3 bg-charcoal-900 border-t border-charcoal-800 flex items-center gap-2 shrink-0"
        >
          <span className="text-brand-cyan font-bold text-xs">➜</span>
          <span className="text-emerald-400 font-bold text-xs">$</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type command (e.g. repopilot doctor, repopilot explore, pytest -v, help)..."
            className="flex-1 bg-transparent text-charcoal-100 text-xs font-mono placeholder:text-charcoal-600 focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            className="px-2.5 py-1 bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-200 text-[11px] rounded transition-colors flex items-center gap-1"
          >
            <Play className="w-2.5 h-2.5 fill-current" />
            Run
          </button>
        </form>
      )}

      {/* Quick Launch Buttons on Bottom for Preset Tabs */}
      {activeTab !== 'interactive' && (
        <div className="h-9 px-4 bg-charcoal-900/90 border-t border-charcoal-800 flex items-center justify-between text-[11px] text-charcoal-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-charcoal-500">Quick run:</span>
            <button
              onClick={() => setActiveTab('doctor')}
              className="text-brand-cyan hover:underline"
            >
              doctor
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('explore')}
              className="text-brand-cyan hover:underline"
            >
              explore --depth 2
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('pr-check')}
              className="text-brand-cyan hover:underline"
            >
              pr-check --base main
            </button>
          </div>
          <span className="text-charcoal-500 font-sans text-[10px]">Local CLI v0.1.0 Ready</span>
        </div>
      )}
    </div>
  );
};
