import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  User,
  Send,
  Code2,
  FileCode,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  GitPullRequest,
  CheckCircle2,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { RepositoryItem } from '../types';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import {
  DEMO_AI_CHAT_HISTORY,
  DEMO_AI_GENERATED_TESTS,
  DEMO_AI_PR_REVIEW,
} from '../data/demoData';

interface AICopilotViewProps {
  activeRepo: RepositoryItem | null;
  onOpenRepoSelector: () => void;
}

export const AICopilotView: React.FC<AICopilotViewProps> = ({
  activeRepo,
  onOpenRepoSelector,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'tests' | 'pr-review'>('chat');
  const [messages, setMessages] = useState(DEMO_AI_CHAT_HISTORY);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedTestFile, setSelectedTestFile] = useState<string>('src/repopilot/models.py');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPR, setCopiedPR] = useState(false);
  const [aiProvider, setAiProvider] = useState<'local' | 'ollama' | 'cloud'>('local');

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || userInput;
    if (!text.trim()) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setUserInput('');
    setIsTyping(true);

    // Simulate AI synthesis based on repo context
    setTimeout(() => {
      let aiResponse = '';
      let fileRef: string | undefined = undefined;

      const lower = text.toLowerCase();
      if (lower.includes('test') || lower.includes('gap')) {
        aiResponse = `I've analyzed the PR Compass report. Two code files currently lack matching test suites:\n\n1. **\`src/repopilot/models.py\`**: Core dataclass serialization.\n2. **\`src/repopilot/report.py\`**: Rich terminal formatting.\n\nYou can switch to the **"AI Test Generator"** tab to view complete, ready-to-use \`pytest\` suites generated for these files!`;
        fileRef = 'src/repopilot/models.py';
      } else if (lower.includes('pr') || lower.includes('review') || lower.includes('risk')) {
        aiResponse = `**PR Risk Assessment for \`${activeRepo?.name || 'repopilot'}\`**:\n\n- **Overall Risk**: 🟢 **LOW RISK**\n- **Impact**: Non-breaking CLI extension. Adds PR Compass command without altering Doctor or Explorer workflows.\n- **Recommended Focus**: Ensure test coverage is added for newly introduced data models before merging.`;
      } else if (lower.includes('doctor') || lower.includes('tool') || lower.includes('pre')) {
        aiResponse = `The **Repository Doctor** checks 4 system binaries: \`git\`, \`python3\`, \`node\`, and \`npm\`. All 4 are currently **Available** on your system. The repository specifies \`pyproject.toml\` with PEP 518/621, meaning standard \`pip install -e .[dev]\` is the recommended setup command.`;
      } else {
        aiResponse = `I've inspected **${activeRepo?.name || 'this repository'}**. The project follows a \`src/\` layout with strict read-only safety guarantees. No arbitrary repository scripts or network requests are executed during scanning. Let me know if you would like me to generate test suites, summarize PR diffs, or explain specific functions!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant' as const,
          content: aiResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fileReference: fileRef,
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  const currentTestScaffold = DEMO_AI_GENERATED_TESTS[selectedTestFile];

  const handleCopyTestCode = () => {
    if (currentTestScaffold) {
      navigator.clipboard.writeText(currentTestScaffold.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1500);
    }
  };

  const handleCopyPRMarkdown = () => {
    navigator.clipboard.writeText(DEMO_AI_PR_REVIEW.generatedMarkdownPR);
    setCopiedPR(true);
    setTimeout(() => setCopiedPR(false), 1500);
  };

  if (!activeRepo) {
    return (
      <EmptyState
        icon={Bot}
        title="No Repository Selected"
        description="Select or connect a repository to run AI codebase analysis, automated test synthesis, and pre-PR risk review."
        actionText="Select Repository"
        onAction={onOpenRepoSelector}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Mode Hero Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-charcoal-900 via-charcoal-900 to-indigo-950/30 border border-indigo-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-charcoal-100 flex items-center gap-2">
              RepoPilot AI Code Intelligence
              <Badge variant="indigo" size="sm">
                AI Mode
              </Badge>
            </h2>
          </div>
          <p className="text-xs text-charcoal-400 leading-relaxed max-w-2xl">
            Context-aware AI copilot for codebase comprehension, automated test suite synthesis for detected coverage gaps, and pre-PR risk review.
          </p>
        </div>

        {/* AI Provider Switcher */}
        <div className="flex items-center gap-2 bg-charcoal-950 p-1 rounded-xl border border-charcoal-800 shrink-0 text-xs">
          <button
            onClick={() => setAiProvider('local')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              aiProvider === 'local'
                ? 'bg-indigo-600/25 text-indigo-300 font-medium border border-indigo-500/40 shadow-sm'
                : 'text-charcoal-400 hover:text-charcoal-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Built-in Engine</span>
          </button>
          <button
            onClick={() => setAiProvider('ollama')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              aiProvider === 'ollama'
                ? 'bg-indigo-600/25 text-indigo-300 font-medium border border-indigo-500/40 shadow-sm'
                : 'text-charcoal-400 hover:text-charcoal-200'
            }`}
          >
            <span>Ollama Local</span>
          </button>
          <button
            onClick={() => setAiProvider('cloud')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              aiProvider === 'cloud'
                ? 'bg-indigo-600/25 text-indigo-300 font-medium border border-indigo-500/40 shadow-sm'
                : 'text-charcoal-400 hover:text-charcoal-200'
            }`}
          >
            <span>Cloud API</span>
          </button>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-charcoal-800 pb-3 text-xs">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'chat'
              ? 'bg-charcoal-800 text-charcoal-100 border border-charcoal-700 shadow-sm'
              : 'text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-850'
          }`}
        >
          <Bot className="w-4 h-4 text-brand-cyan" />
          <span>Repository Copilot Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'tests'
              ? 'bg-charcoal-800 text-emerald-400 border border-charcoal-700 shadow-sm'
              : 'text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-850'
          }`}
        >
          <Code2 className="w-4 h-4 text-emerald-400" />
          <span>AI Test Generator</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        </button>

        <button
          onClick={() => setActiveTab('pr-review')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'pr-review'
              ? 'bg-charcoal-800 text-indigo-400 border border-charcoal-700 shadow-sm'
              : 'text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-850'
          }`}
        >
          <GitPullRequest className="w-4 h-4 text-indigo-400" />
          <span>AI PR Summary & Risk Review</span>
        </button>
      </div>

      {/* Tab 1: AI Copilot Chat */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Stream */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="h-[520px] flex flex-col justify-between">
              {/* Message History */}
              <div className="p-4 overflow-y-auto space-y-4 flex-1">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 text-xs leading-relaxed ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`p-3.5 rounded-xl max-w-xl space-y-1.5 ${
                        msg.role === 'user'
                          ? 'bg-charcoal-800 text-charcoal-100 border border-charcoal-700'
                          : 'bg-charcoal-950 border border-charcoal-800 text-charcoal-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {msg.fileReference && (
                        <div className="pt-2 border-t border-charcoal-800/80 flex items-center gap-1.5 text-[11px] font-mono text-brand-cyan">
                          <FileCode className="w-3.5 h-3.5" />
                          <span>Referenced: {msg.fileReference}</span>
                        </div>
                      )}

                      <div className="text-[10px] text-charcoal-500 font-mono text-right">
                        {msg.timestamp}
                      </div>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-charcoal-800 border border-charcoal-700 text-charcoal-300 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-3 text-xs text-charcoal-400">
                    <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="p-3 bg-charcoal-950 border border-charcoal-800 rounded-xl text-charcoal-400 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-cyan" />
                      <span>RepoPilot AI is reasoning over repository context...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-charcoal-800/80 bg-charcoal-950/50">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask AI anything about architecture, test gaps, entry points, or dependencies..."
                    className="flex-1 bg-charcoal-900 border border-charcoal-750 rounded-xl px-3.5 py-2 text-xs text-charcoal-100 placeholder:text-charcoal-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!userInput.trim() || isTyping}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </Card>
          </div>

          {/* Quick Prompts & Context Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader
                title="Quick Prompt Templates"
                subtitle="One-click code intelligence queries"
              />
              <CardContent className="space-y-2">
                {[
                  'Explain high-level architecture',
                  'What test gaps exist in PR Compass?',
                  'Summarize PR risk & breaking changes',
                  'What runtime tools are verified?',
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="w-full text-left p-2.5 rounded-lg bg-charcoal-950 hover:bg-charcoal-850 border border-charcoal-800 text-xs text-charcoal-300 hover:text-charcoal-100 transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate">{prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-charcoal-500 group-hover:text-brand-cyan shrink-0 ml-1 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="p-4 bg-charcoal-900 border-charcoal-800 text-xs space-y-2">
              <div className="flex items-center gap-2 text-charcoal-200 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Offline Privacy Safe</span>
              </div>
              <p className="text-[11px] text-charcoal-400 leading-relaxed">
                RepoPilot AI analysis runs strictly over localized metadata and syntax structures. Your credentials, .env files, and private keys are never transmitted.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: AI Test Generator */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Target File Selector */}
            <div className="lg:col-span-4 space-y-3">
              <Card>
                <CardHeader
                  title="Files with Detected Test Gaps"
                  subtitle="Select an untested file to generate a test suite scaffold"
                />
                <CardContent className="space-y-2">
                  {Object.keys(DEMO_AI_GENERATED_TESTS).map((file) => {
                    const isSelected = selectedTestFile === file;
                    return (
                      <button
                        key={file}
                        onClick={() => setSelectedTestFile(file)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-emerald-950/20 border-emerald-800/60 text-charcoal-100'
                            : 'bg-charcoal-950 border-charcoal-800 hover:bg-charcoal-850 text-charcoal-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs font-semibold truncate">{file}</span>
                          <Badge variant="amber" size="sm">
                            Gap
                          </Badge>
                        </div>
                        <p className="text-[11px] text-charcoal-400">
                          Suggested: <code className="text-emerald-400 font-mono">{DEMO_AI_GENERATED_TESTS[file].suggestedPath}</code>
                        </p>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              {currentTestScaffold && (
                <Card className="p-4 space-y-2 text-xs">
                  <span className="font-semibold text-charcoal-200 block">AI Rationale:</span>
                  <p className="text-charcoal-400 leading-relaxed text-[11px]">
                    {currentTestScaffold.rationale}
                  </p>
                  <div className="pt-2 border-t border-charcoal-800">
                    <span className="text-[10px] text-charcoal-500 font-mono uppercase block mb-1">Test Cases Generated:</span>
                    <ul className="space-y-1">
                      {currentTestScaffold.testCasesCovered.map((tc, idx) => (
                        <li key={idx} className="text-[11px] text-charcoal-300 font-mono flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{tc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              )}
            </div>

            {/* Code Output Panel */}
            <div className="lg:col-span-8">
              {currentTestScaffold ? (
                <Card className="flex flex-col h-full">
                  <CardHeader
                    title={
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <FileCode className="w-4 h-4 text-emerald-400" />
                        <span>{currentTestScaffold.suggestedPath}</span>
                        <Badge variant="emerald" size="sm">
                          {currentTestScaffold.framework}
                        </Badge>
                      </div>
                    }
                    subtitle="Ready-to-use unit test suite covering serialization, immutability, and exceptions"
                    action={
                      <button
                        onClick={handleCopyTestCode}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Copied Suite!' : 'Copy Code'}</span>
                      </button>
                    }
                  />
                  <div className="p-4 bg-charcoal-950 font-mono text-xs overflow-x-auto flex-1 border-t border-charcoal-800/80">
                    <pre className="text-charcoal-200 leading-relaxed whitespace-pre font-mono">
                      {currentTestScaffold.code}
                    </pre>
                  </div>
                  <div className="p-3 bg-charcoal-900 border-t border-charcoal-800 flex items-center justify-between text-xs text-charcoal-400 font-mono">
                    <span>Save to: {currentTestScaffold.suggestedPath}</span>
                    <span>Run: pytest {currentTestScaffold.suggestedPath}</span>
                  </div>
                </Card>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: AI PR Summary & Risk Review */}
      {activeTab === 'pr-review' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* PR Assessment Overview */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-charcoal-400 uppercase">PR RISK SCORE</span>
                <Badge variant="emerald" size="md" dot>
                  LOW RISK (Safe to Merge)
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-charcoal-100">Executive Summary</h3>
                <p className="text-xs text-charcoal-400 mt-1 leading-relaxed">
                  {DEMO_AI_PR_REVIEW.summary}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 text-xs space-y-1">
                <span className="text-charcoal-300 font-semibold block">Impact Assessment:</span>
                <p className="text-charcoal-400 text-[11px] leading-relaxed">
                  {DEMO_AI_PR_REVIEW.impactAssessment}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-charcoal-200 block mb-2">Recommended Reviewer Focus:</span>
                <ul className="space-y-1.5 text-xs text-charcoal-400">
                  {DEMO_AI_PR_REVIEW.suggestedReviewFocus.map((focus, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan shrink-0 mt-1.5" />
                      <span>{focus}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          {/* Generated Markdown PR Description */}
          <div className="lg:col-span-7">
            <Card className="h-full flex flex-col">
              <CardHeader
                title="Generated Pull Request Description"
                subtitle="Standard GitHub markdown ready to paste into your pull request"
                action={
                  <button
                    onClick={handleCopyPRMarkdown}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors"
                  >
                    {copiedPR ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPR ? 'Copied Markdown!' : 'Copy PR Description'}</span>
                  </button>
                }
              />
              <div className="p-4 bg-charcoal-950 font-mono text-xs overflow-x-auto flex-1 border-t border-charcoal-800">
                <pre className="text-charcoal-200 leading-relaxed whitespace-pre font-mono text-[11px]">
                  {DEMO_AI_PR_REVIEW.generatedMarkdownPR}
                </pre>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
