import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getWatchlist, removeFromWatchlist, addToWatchlist } from '../services/api';
import type { WatchlistItem } from '../types';
import { BookmarkIcon, SearchIcon } from '../components/icons';

const WatchlistPage: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tickerInput, setTickerInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    try {
      const data = await getWatchlist();
      setWatchlist(data);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const ticker = tickerInput.trim().toUpperCase();
    const company = companyInput.trim();

    if (!ticker || !company) {
      return;
    }

    setAdding(true);
    try {
      await addToWatchlist(ticker, company);
      setTickerInput('');
      setCompanyInput('');
      await loadWatchlist();
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (ticker: string) => {
    try {
      await removeFromWatchlist(ticker);
      await loadWatchlist();
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const handleAnalyze = (ticker: string) => {
    navigate(`/analysis/${ticker}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookmarkIcon className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
              My Watchlist
            </h1>
          </div>
          <p className="text-gray-400">Track your favorite stocks</p>
        </header>

        {/* Add to Watchlist Form */}
        <section className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Add Stock to Watchlist</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value)}
                placeholder="Stock ticker (e.g., AAPL)"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-white placeholder-gray-500"
              />
              <input
                type="text"
                value={companyInput}
                onChange={(e) => setCompanyInput(e.target.value)}
                placeholder="Company name (e.g., Apple Inc.)"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-white placeholder-gray-500"
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {adding ? 'Adding...' : 'Add to Watchlist'}
            </button>
          </form>
        </section>

        {/* Watchlist */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-12 h-12 border-4 border-gray-500 border-t-blue-400 rounded-full animate-spin"></div>
          </div>
        ) : watchlist.length > 0 ? (
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Tracked Stocks</h2>
            <div className="space-y-3">
              {watchlist.map((item) => (
                <div
                  key={item.ticker}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center justify-between hover:border-blue-500/50 transition-all"
                >
                  <div>
                    <h3 className="text-lg font-bold text-white">{item.ticker}</h3>
                    <p className="text-sm text-gray-400">{item.companyName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAnalyze(item.ticker)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                      <SearchIcon className="w-4 h-4" />
                      Analyze
                    </button>
                    <button
                      onClick={() => handleRemove(item.ticker)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center text-gray-500 p-8 border-2 border-dashed border-gray-700 rounded-lg">
            <BookmarkIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p>Your watchlist is empty. Add some stocks to get started!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default WatchlistPage;
