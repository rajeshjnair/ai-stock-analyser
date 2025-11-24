import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SkeletonLoader from '../components/SkeletonLoader';
import RealtimeTrades from '../components/RealtimeTrades';
import { getAnalysis, requestAnalysis } from '../services/api';
import type { StockAnalysis } from '../types';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, ClockIcon, SparklesIcon, SunIcon, TrendingUpIcon } from '../components/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AnalysisPage: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ticker) {
      loadAnalysis(ticker);
    }
  }, [ticker]);

  const loadAnalysis = async (tickerSymbol: string) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // Try to get cached analysis first
      const cachedAnalysis = await getAnalysis(tickerSymbol);
      setAnalysis(cachedAnalysis);
    } catch (err) {
      // If no cached analysis, request new one
      try {
        await requestAnalysis(tickerSymbol);
        // Poll for the result (you might want to use WebSocket for this in production)
        let attempts = 0;
        const maxAttempts = 30;
        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const result = await getAnalysis(tickerSymbol);
            setAnalysis(result);
            clearInterval(pollInterval);
          } catch (error) {
            if (attempts >= maxAttempts) {
              clearInterval(pollInterval);
              setError('Analysis request timed out. Please try again.');
            }
          }
        }, 2000);
      } catch (error) {
        console.error('Error requesting analysis:', error);
        setError('Failed to request analysis. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPredictionIcon = (prediction: StockAnalysis['prediction']) => {
    switch (prediction) {
      case 'Bullish': return <ArrowUpIcon className="w-8 h-8 text-green-400" />;
      case 'Bearish': return <ArrowDownIcon className="w-8 h-8 text-red-400" />;
      case 'Neutral': return <MinusIcon className="w-8 h-8 text-gray-400" />;
      default: return null;
    }
  };

  const getRecommendationClass = (recommendation: StockAnalysis['recommendation']) => {
    switch (recommendation) {
      case 'Buy': return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'Sell': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'Hold': return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-blue-400 hover:text-blue-300 transition-colors"
        >
          ← Back to Dashboard
        </button>

        {error && (
          <div role="alert" className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center animate-fade-in mb-8">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <SkeletonLoader />
        ) : analysis ? (
          <div className="space-y-8 animate-slide-up">
            {/* Header */}
            <section className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white">{analysis.companyName}</h2>
                  <p className="text-xl text-gray-400">{analysis.ticker}</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-white">{analysis.currentPrice}</p>
                  <div className={`mt-2 flex items-center justify-end gap-2 text-lg font-semibold ${analysis.prediction === 'Bullish' ? 'text-green-400' : analysis.prediction === 'Bearish' ? 'text-red-400' : 'text-gray-400'}`}>
                    {getPredictionIcon(analysis.prediction)}
                    <span>{analysis.prediction} Trend</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Recommendation */}
            <section className={`border rounded-xl p-6 text-center ${getRecommendationClass(analysis.recommendation)}`}>
              <p className="text-lg font-medium opacity-80">Recommendation</p>
              <p className="text-5xl font-extrabold my-2">{analysis.recommendation.toUpperCase()}</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-full bg-gray-700/50 rounded-full h-2.5">
                  <div className="bg-current h-2.5 rounded-full" style={{ width: `${analysis.confidenceScore * 10}%` }}></div>
                </div>
                <span className="font-semibold">{analysis.confidenceScore}/10</span>
              </div>
              <p className="text-sm mt-2 opacity-70">Confidence Score</p>
            </section>

            {/* Today's Snapshot */}
            <section className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-500/10 rounded-lg">
                            <SunIcon className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Today's Start Price</p>
                            <p className="text-xl font-bold text-white">{analysis.dailyStats.todaysOpen}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-lg">
                            <TrendingUpIcon className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Today's Top Price</p>
                            <p className="text-xl font-bold text-white">{analysis.dailyStats.todaysHigh}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Realtime Trades */}
            <RealtimeTrades ticker={analysis.ticker} />

            {/* Price Timeline */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Historical Prices */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <ClockIcon className="w-6 h-6 text-cyan-400" />
                        <h3 className="text-xl font-bold text-white">Historical Prices</h3>
                    </div>
                    <div className="space-y-3 text-gray-300">
                        <div className="flex justify-between items-baseline">
                            <span>Yesterday</span>
                            <span className="font-mono text-lg text-white">{analysis.historicalPrices.yesterday}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span>1 Week Ago</span>
                            <span className="font-mono text-lg text-white">{analysis.historicalPrices.week_ago}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span>1 Month Ago</span>
                            <span className="font-mono text-lg text-white">{analysis.historicalPrices.month_ago}</span>
                        </div>
                    </div>
                </div>
                {/* Future Predictions */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <SparklesIcon className="w-6 h-6 text-purple-400" />
                        <h3 className="text-xl font-bold text-white">AI Price Predictions</h3>
                    </div>
                    <div className="space-y-3 text-gray-300">
                        <div className="flex justify-between items-baseline">
                            <span>Tomorrow</span>
                            <span className="font-mono text-lg text-white">{analysis.futurePredictions.tomorrow}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span>1 Month After</span>
                            <span className="font-mono text-lg text-white">{analysis.futurePredictions.month_after}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Analysis Summary */}
            <section className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-4 text-white">Analysis Summary</h3>
              <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none">
                 <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis.analysisSummary}</ReactMarkdown>
              </div>
            </section>

            {/* Key News */}
            <section>
              <h3 className="text-2xl font-bold mb-4 text-white">Key News & Developments</h3>
              <div className="space-y-4">
                {analysis.keyNews.map((newsItem, index) => (
                  <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 transition-all hover:border-blue-500/50">
                    <h4 className="font-semibold text-lg text-blue-400">{newsItem.title}</h4>
                    <p className="text-gray-400 mt-1">{newsItem.summary}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="text-center text-gray-500 p-8 border-2 border-dashed border-gray-700 rounded-lg">
            <p>No analysis available for this ticker.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalysisPage;
