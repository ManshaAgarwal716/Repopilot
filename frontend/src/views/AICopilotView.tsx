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
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              RepoPilot AI Code Intelligence
              <Badge variant="indigo" size="sm">
                AI Mode
              </Badge>
            </h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
            Context-aware AI copilot for codebase comprehension, automated test suite synthesis for detected coverage gaps, and pre-PR risk review.
          </p>
        </div>

        {/* AI Provider Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 text-xs">
          <button
            onClick={() => setAiProvider('local')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              aiProvider === 'local'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>Built-in Engine</span>
          </button>
          <button
            onClick={() => setAiProvider('ollama')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              aiProvider === 'ollama'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Ollama Local</span>
          </button>
          <button
            onClick={() => setAiProvider('cloud')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              aiProvider === 'cloud'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Cloud API</span>
          </button>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'chat'
              ? 'bg-slate-100 text-slate-900 border border-slate-200 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Bot className="w-4 h-4 text-blue-600" />
          <span>Repository Copilot Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'tests'
              ? 'bg-slate-100 text-emerald-800 border border-slate-200 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Code2 className="w-4 h-4 text-emerald-600" />
          <span>AI Test Generator</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        </button>

        <button
          onClick={() => setActiveTab('pr-review')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'pr-review'
              ? 'bg-slate-100 text-purple-800 border border-slate-200 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <GitPullRequest className="w-4 h-4 text-purple-600" />
          <span>AI PR Summary & Risk Review</span>
        </button>
      </div>

      {/* Tab 1: AI Copilot Chat */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Stream */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="h-[520px] flex flex-col justify-between shadow-2xs">
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
                      <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`p-3.5 rounded-xl max-w-xl space-y-1.5 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {msg.fileReference && (
                        <div className={`pt-2 border-t flex items-center gap-1.5 text-[11px] font-mono ${
                          msg.role === 'user' ? 'border-blue-500 text-blue-100' : 'border-slate-200 text-blue-700 font-semibold'
                        }`}>
                          <FileCode className="w-3.5 h-3.5" />
                          <span>Referenced: {msg.fileReference}</span>
                        </div>
                      )}

                      <div className={`text-[10px] font-mono text-right ${
                        msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                      }`}>
                        {msg.timestamp}
                      </div>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 flex items-center gap-2 shadow-2xs">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>RepoPilot AI is reasoning over repository context...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-slate-200 bg-slate-50/60">
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
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                  <button
                    type="submit"
                    disabled={!userInput.trim() || isTyping}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
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
                    className="w-full text-left p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 hover:text-slate-900 transition-colors flex items-center justify-between group shadow-2xs"
                  >
                    <span className="truncate">{prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 ml-1 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="p-4 bg-white border-slate-200 text-xs space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Offline Privacy Safe</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
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
                        className={`w-full text-left p-3 rounded-xl border transition-all shadow-2xs ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-300 text-slate-900'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs font-semibold truncate">{file}</span>
                          <Badge variant="amber" size="sm">
                            Gap
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Suggested: <code className="text-blue-700 font-mono font-medium">{DEMO_AI_GENERATED_TESTS[file].suggestedPath}</code>
                        </p>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              {currentTestScaffold && (
                <Card className="p-4 space-y-2 text-xs shadow-2xs">
                  <span className="font-semibold text-slate-900 block">AI Rationale:</span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {currentTestScaffold.rationale}
                  </p>
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Test Cases Generated:</span>
                    <ul className="space-y-1">
                      {currentTestScaffold.testCasesCovered.map((tc, idx) => (
                        <li key={idx} className="text-[11px] text-slate-700 font-mono flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
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
                <Card className="flex flex-col h-full shadow-2xs">
                  <CardHeader
                    title={
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <FileCode className="w-4 h-4 text-emerald-600" />
                        <span className="text-slate-900 font-semibold">{currentTestScaffold.suggestedPath}</span>
                        <Badge variant="emerald" size="sm">
                          {currentTestScaffold.framework}
                        </Badge>
                      </div>
                    }
                    subtitle="Ready-to-use unit test suite covering serialization, immutability, and exceptions"
                    action={
                      <button
                        onClick={handleCopyTestCode}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-medium transition-colors shadow-2xs"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Copied Suite!' : 'Copy Code'}</span>
                      </button>
                    }
                  />
                  <div className="p-4 bg-slate-50 font-mono text-xs overflow-x-auto flex-1 border-t border-slate-200">
                    <pre className="text-slate-800 leading-relaxed whitespace-pre font-mono">
                      {currentTestScaffold.code}
                    </pre>
                  </div>
                  <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
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
            <Card className="p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500 uppercase">PR RISK SCORE</span>
                <Badge variant="emerald" size="md" dot>
                  LOW RISK (Safe to Merge)
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">Executive Summary</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {DEMO_AI_PR_REVIEW.summary}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 shadow-2xs">
                <span className="text-slate-800 font-semibold block">Impact Assessment:</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {DEMO_AI_PR_REVIEW.impactAssessment}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-800 block mb-2">Recommended Reviewer Focus:</span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {DEMO_AI_PR_REVIEW.suggestedReviewFocus.map((focus, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                      <span>{focus}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          {/* Generated Markdown PR Description */}
          <div className="lg:col-span-7">
            <Card className="h-full flex flex-col shadow-2xs">
              <CardHeader
                title="Generated Pull Request Description"
                subtitle="Standard GitHub markdown ready to paste into your pull request"
                action={
                  <button
                    onClick={handleCopyPRMarkdown}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-medium transition-colors shadow-2xs"
                  >
                    {copiedPR ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPR ? 'Copied Markdown!' : 'Copy PR Description'}</span>
                  </button>
                }
              />
              <div className="p-4 bg-slate-50 font-mono text-xs overflow-x-auto flex-1 border-t border-slate-200">
                <pre className="text-slate-800 leading-relaxed whitespace-pre font-mono text-[11px]">
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
