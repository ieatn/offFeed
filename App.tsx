import React, { useEffect, useState } from 'react';
import { generateDailyBrief } from './services/geminiService';
import { DailyBriefData, GenerationState } from './types';
import { LoadingView } from './components/LoadingView';
import { TopicItem } from './components/TopicItem';
import { RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';

const STORAGE_KEY_PREFIX = 'offfeed_brief_';

const App: React.FC = () => {
  const [data, setData] = useState<DailyBriefData | null>(null);
  const [state, setState] = useState<GenerationState>({ status: 'idle' });

  const getTodayKey = () => `${STORAGE_KEY_PREFIX}${new Date().toLocaleDateString('en-US')}`;

  const loadBrief = async (forceRefresh = false) => {
    setState({ status: 'loading' });
    
    // Check local storage first
    const todayKey = getTodayKey();
    const cachedData = localStorage.getItem(todayKey);

    if (cachedData && !forceRefresh) {
      try {
        const parsed = JSON.parse(cachedData);
        setData(parsed);
        setState({ status: 'success' });
        return;
      } catch (e) {
        localStorage.removeItem(todayKey);
      }
    }

    // Generate new brief
    try {
      const newData = await generateDailyBrief();
      setData(newData);
      localStorage.setItem(todayKey, JSON.stringify(newData));
      setState({ status: 'success' });
    } catch (error: any) {
      setState({ status: 'error', error: error.message });
    }
  };

  useEffect(() => {
    loadBrief();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Header */}
      <header className="w-full text-center mb-12 border-b-2 border-ink-900 pb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
           {/* Simple Logo Icon */}
           <div className="w-8 h-8 bg-ink-900 text-ink-50 flex items-center justify-center font-serif font-bold text-xl rounded-sm">
             O
           </div>
           <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-ink-900">
            OffFeed
          </h1>
        </div>
        <p className="text-ink-600 font-sans text-sm uppercase tracking-widest font-medium">
          {data?.date || new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      {/* Main Content */}
      <main className="w-full flex-grow">
        {state.status === 'loading' && <LoadingView />}

        {state.status === 'error' && (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-red-50 rounded-lg border border-red-100">
            <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
            <h3 className="font-serif text-xl font-medium text-red-900 mb-2">Brief Generation Failed</h3>
            <p className="text-red-700 mb-6 max-w-md">{state.error}</p>
            <button
              onClick={() => loadBrief(true)}
              className="flex items-center px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md transition-colors font-sans text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Generation
            </button>
          </div>
        )}

        {state.status === 'success' && data && (
          <div className="animate-in slide-in-from-bottom-4 duration-700 fade-in">
             <div className="bg-white p-8 sm:p-12 shadow-sm border border-ink-900/5 rounded-sm">
                <div className="space-y-2">
                  {data.topics.map((topic, index) => (
                    <TopicItem key={index} topic={topic} index={index} />
                  ))}
                </div>
            </div>

            {/* Sources / Footnotes */}
            {data.sources.length > 0 && (
              <div className="mt-12 pt-8 border-t border-ink-900/10 text-center">
                <h3 className="font-sans text-xs font-bold text-ink-900/40 uppercase tracking-widest mb-4">
                  Sources Consulted
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {data.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-ink-600 hover:text-ink-900 hover:underline transition-colors bg-white px-2 py-1 rounded border border-ink-900/5"
                    >
                      {source.title}
                      <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-16 text-center">
                <p className="font-serif text-ink-900/40 italic text-sm">
                    "All the news that's fit to generate."
                </p>
            </div>
          </div>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="w-full mt-16 pt-8 border-t border-ink-900/10 flex justify-between items-center text-xs text-ink-400 font-sans">
        <span>© {new Date().getFullYear()} OffFeed</span>
        <div className="flex space-x-4">
           {state.status === 'success' && (
               <button 
                onClick={() => loadBrief(true)}
                className="hover:text-ink-900 transition-colors flex items-center"
               >
                 <RefreshCw className="w-3 h-3 mr-1" />
                 Refresh Brief
               </button>
           )}
        </div>
      </footer>
    </div>
  );
};

export default App;
