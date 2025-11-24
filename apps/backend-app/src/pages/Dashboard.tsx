import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  StockCard,
  PageHeader,
  Container,
  EmptyState,
  LoadingSkeleton,
  Search,
  TrendingUp,
  Sparkles,
} from '@stock-analyser/ui';
import Navbar from '../components/Navbar';
import MajorStocksTicker from '../components/MajorStocksTicker';
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

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

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

  const getRecommendationType = (recommendation: StockAnalysis['recommendation']) => {
    switch (recommendation) {
      case 'Buy':
        return 'buy' as const;
      case 'Sell':
        return 'sell' as const;
      case 'Hold':
        return 'hold' as const;
      default:
        return 'hold' as const;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main content with top padding for fixed navbar */}
      <main className="pt-16">
        <Container size="lg" className="py-8">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {/* Header */}
            <motion.div variants={fadeInUp} className="mb-8">
              <PageHeader
                title="Dashboard"
                description="AI-powered stock analysis and real-time market insights"
                badge={
                  <Badge variant="accent" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    AI Powered
                  </Badge>
                }
                gradient
              />
            </motion.div>

            {/* Search */}
            <motion.form
              variants={fadeInUp}
              onSubmit={handleSearch}
              className="mb-8 max-w-2xl"
            >
              <Input
                type="text"
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value)}
                placeholder="Search for a stock ticker (e.g., AAPL, MSFT)"
                icon={<Search className="h-5 w-5" />}
                className="h-12"
              />
            </motion.form>

            {/* Major Stocks Ticker */}
            <motion.div variants={fadeInUp} className="mb-8">
              <MajorStocksTicker
                stocks={MAJOR_STOCKS}
                onSelectStock={handleMajorStockClick}
              />
            </motion.div>

            {/* Recent Analyses Section */}
            <motion.section variants={fadeInUp}>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-brand-400" />
                <h2 className="text-xl font-bold text-foreground">
                  Recent Analyses
                </h2>
              </div>

              {loading ? (
                <LoadingSkeleton variant="stock-card" count={6} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
              ) : recentAnalyses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentAnalyses.map((analysis, index) => (
                    <motion.div
                      key={analysis.ticker}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <StockCard
                        ticker={analysis.ticker}
                        companyName={analysis.companyName}
                        price={parseFloat(analysis.currentPrice.replace(/[^0-9.]/g, '')) || 0}
                        recommendation={getRecommendationType(analysis.recommendation)}
                        confidenceScore={analysis.confidenceScore}
                        onClick={() => navigate(`/analysis/${analysis.ticker}`)}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  variant="search"
                  title="No analyses yet"
                  description="Enter a stock ticker above or select from the major stocks to get your first AI analysis."
                  action={{
                    label: 'Analyze AAPL',
                    onClick: () => navigate('/analysis/AAPL'),
                  }}
                />
              )}
            </motion.section>
          </motion.div>
        </Container>
      </main>
    </div>
  );
};

export default Dashboard;
