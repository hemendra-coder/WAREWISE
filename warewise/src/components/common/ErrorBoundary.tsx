import React, { ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Copy, Check, Terminal, Bug, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  sectionName?: string;
  fallback?: ReactNode;
  onReset?: () => void;
  key?: React.Key;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
  showDetails: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State;
  public props: Props;
  public setState!: (
    state: Partial<State> | ((prevState: State) => Partial<State>),
    callback?: () => void
  ) => void;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Store bug telemetry in localStorage for developer audit & export
    try {
      const existingLogs = JSON.parse(localStorage.getItem('warewise_bug_telemetry') || '[]');
      const newLog = {
        id: `ERR-${Date.now()}`,
        timestamp: new Date().toISOString(),
        section: this.props.sectionName || 'Global Application Root',
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
      };
      const updatedLogs = [newLog, ...existingLogs].slice(0, 50); // Keep last 50 error events
      localStorage.setItem('warewise_bug_telemetry', JSON.stringify(updatedLogs));
    } catch {
      // Ignore storage quota errors
    }

    console.error('[WareWise Enhanced Bug Boundary Intercepted Error]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleCopyDiagnostic = () => {
    const payload = {
      section: this.props.sectionName || 'Global Application Root',
      timestamp: new Date().toISOString(),
      error: this.state.error?.toString(),
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      screenResolution: `${window.innerWidth}x${window.innerHeight}`,
    };

    navigator.clipboard.writeText(JSON.stringify(payload, null, 2)).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isSectionLevel = Boolean(this.props.sectionName);

      return (
        <div
          role="alert"
          aria-live="assertive"
          className={`rounded-2xl border border-amber-300 dark:border-amber-800/60 bg-[#F8F7F4] dark:bg-[#1A1816] text-[#1C1917] dark:text-[#E7E5E0] shadow-xl overflow-hidden transition-all ${
            isSectionLevel ? 'p-6 my-4' : 'p-8 max-w-4xl mx-auto my-12'
          }`}
        >
          {/* Header Banner */}
          <div className="flex items-start justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-[#E27B58] flex items-center justify-center shrink-0 border border-amber-500/20">
                <ShieldAlert className="w-5 h-5 text-[#E27B58]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#E27B58] font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    BUG BOUNDARY INTERCEPTED
                  </span>
                  <span className="text-xs text-stone-500 font-mono">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 font-serif mt-1">
                  {isSectionLevel
                    ? `Fault isolated in ${this.props.sectionName}`
                    : 'System Operational Fault Intercepted'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={this.handleCopyDiagnostic}
                className="px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                title="Copy telemetry payload to clipboard"
              >
                {this.state.copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Copied Log</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Telemetry</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-1.5 rounded-lg bg-[#E27B58] hover:bg-[#d66a46] active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recover Component</span>
              </button>
            </div>
          </div>

          {/* Error Message Context */}
          <div className="mt-4 space-y-3">
            <p className="text-sm text-stone-700 dark:text-stone-300">
              An isolated execution fault occurred within this module component. WareWise&apos;s
              enhanced bug boundary contained the exception to prevent full application crash.
            </p>

            <div className="p-3.5 rounded-xl bg-stone-900 text-amber-300 font-mono text-xs overflow-x-auto border border-stone-800">
              <div className="text-[10px] text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Bug className="w-3 h-3 text-amber-400" />
                <span>Error Exception Message</span>
              </div>
              <div>{this.state.error?.message || 'Unknown execution error'}</div>
            </div>

            {/* Expandable Stack Trace */}
            <div>
              <button
                type="button"
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="text-xs font-mono text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline flex items-center gap-1 cursor-pointer py-1"
              >
                <Terminal className="w-3 h-3" />
                <span>
                  {this.state.showDetails ? 'Hide Stack Trace & Diagnostics' : 'Show Developer Stack Trace & Diagnostics'}
                </span>
              </button>

              {this.state.showDetails && (
                <div className="mt-2 p-3.5 rounded-xl bg-stone-950 text-stone-300 font-mono text-[11px] space-y-2 max-h-60 overflow-y-auto border border-stone-800 leading-relaxed">
                  <div className="text-stone-400 font-semibold border-b border-stone-800 pb-1">
                    Component Stack Trace:
                  </div>
                  <pre className="whitespace-pre-wrap text-stone-400">
                    {this.state.errorInfo?.componentStack || this.state.error?.stack || 'No component stack available'}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Footer controls */}
          <div className="mt-5 pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 font-mono">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-3.5 h-3.5 text-amber-500" />
              <span>Isolated Execution Container • Operational Telemetry Logged</span>
            </div>
            {!isSectionLevel && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="hover:underline text-stone-700 dark:text-stone-300 cursor-pointer"
              >
                Reload Whole App
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
