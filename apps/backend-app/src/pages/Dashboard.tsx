import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MajorStocksTicker from '../components/MajorStocksTicker';
import { SearchIcon } from '../components/icons';
import { getRecentAnalyses } from '../services/api';
import type { StockAnalysis } from '../types';

const MAJOR_STOCKS = [
  { ticker: 'AAPL', name: 'Apple' },
  { ticker: 'MSFT', name: 'Microsoft' },
  { ticker: 'GOOGL', name: 'Alphabet' },
  { ticker: 'AMZN', name: 'Amazon' },
  { ticker: 'NVDA', name: 'NVIDIA' },
  { ticker: 'TSLA', name: 'Tesla' },
];

const Dashboard: React.FC = () => {
  const [tickerInput, setTickerInput] = useState('');
  const [recentAnalyses, setRecentAnalyses] = useState<StockAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecentAnalyses();
  }, []);

  const loadRecentAnalyses = async () => {
    try {
      const analyses = await getRecentAnalyses();
      setRecentAnalyses(analyses);
    } catch (error) {
      console.error('Error loading recent analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const ticker = tickerInput.trim().toUpperCase();
    if (ticker) {
      navigate(`/analysis/${ticker}`);
    }
  };

  const handleMajorStockClick = (ticker: string) => {
    navigate(`/analysis/${ticker}`);
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
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            Stock Analysis Dashboard
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            AI-powered daily stock predictions and news analysis
          </p>
        </header>

        <form onSubmit={handleSearch} className="mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="relative">
            <input
              type="text"
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value)}
              placeholder="Enter stock ticker (e.g., GOOGL, TSLA)"
              aria-label="Stock Ticker Input"
              className="w-full pl-4 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-white placeholder-gray-500"
            />
            <button
              type="submit"
              aria-label="Search Stock"
              className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-gray-400 hover:text-blue-400 transition-colors"
            >
              <SearchIcon className="w-6 h-6" />
            </button>
          </div>
        </form>

        <div className="space-y-8">
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <MajorStocksTicker stocks={MAJOR_STOCKS} onSelectStock={handleMajorStockClick} />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-12 h-12 border-4 border-gray-500 border-t-blue-400 rounded-full animate-spin"></div>
            </div>
          ) : recentAnalyses.length > 0 ? (
            <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-2xl font-bold mb-4 text-white">Recent Analyses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentAnalyses.map((analysis) => (
                  <button
                    key={analysis.ticker}
                    onClick={() => navigate(`/analysis/${analysis.ticker}`)}
                    className="text-left bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-blue-500 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-white">{analysis.ticker}</h3>
                        <p className="text-sm text-gray-400">{analysis.companyName}</p>
                      </div>
                      <span className="text-xl font-bold text-white">{analysis.currentPrice}</span>
                    </div>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getRecommendationClass(analysis.recommendation)}`}>
                      {analysis.recommendation}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <div className="text-center text-gray-500 p-8 border-2 border-dashed border-gray-700 rounded-lg">
              <p>Enter a stock ticker or select one from the live list above to begin your analysis.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
