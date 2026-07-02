import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-8">
          <div className="max-w-md text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Terjadi Kesalahan</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Maaf, terjadi kesalahan yang tidak terduga. Silakan muat ulang halaman.</p>
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-md">
              Muat Ulang Halaman
            </button>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">Detail Teknis</summary>
                <pre className="mt-2 text-xs text-red-500 bg-slate-100 dark:bg-slate-800 p-3 rounded-lg overflow-auto max-h-40">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
