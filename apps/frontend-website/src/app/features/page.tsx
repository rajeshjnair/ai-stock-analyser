'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Zap,
  LineChart,
  Bell,
  Shield,
  Globe,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  BellRing,
  BarChart3,
  Eye,
  Target,
  ChevronDown,
} from '@stock-analyser/ui';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Animated Counter Component
function AnimatedCounter({ end, suffix = '', prefix = '', decimals = 0 }: {
  end: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!isInView || hasAnimated) return;

    setHasAnimated(true);
    let startTime: number | null = null;
    const duration = 2000;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * end);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, end, hasAnimated]);

  return (
    <span ref={ref} className="font-bold tabular-nums">
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  );
}

// Animated Progress Bar
function AnimatedProgress({ value, delay = 0 }: { value: number; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="w-full bg-surface-100 rounded-full h-2 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={isInView ? { width: `${value}%` } : { width: 0 }}
        transition={{ duration: 1, delay, ease: [0.0, 0.0, 0.2, 1] }}
        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
      />
    </div>
  );
}

// Live Stock Ticker with simulated updates
function LiveStockTicker() {
  const [stocks, setStocks] = useState([
    { symbol: 'AAPL', price: 178.52, change: 2.4 },
    { symbol: 'MSFT', price: 374.29, change: 1.8 },
    { symbol: 'NVDA', price: 485.20, change: 5.2 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(current =>
        current.map(stock => ({
          ...stock,
          price: stock.price + (Math.random() - 0.5) * 2,
          change: stock.change + (Math.random() - 0.5) * 0.3,
        }))
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-3">
      {stocks.map((stock) => (
        <motion.div
          key={stock.symbol}
          layout
          className="bg-surface-100 p-4 rounded-lg border border-border"
        >
          <div className="flex justify-between mb-1">
            <span className="font-semibold">{stock.symbol}</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={stock.change.toFixed(2)}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className={stock.change > 0 ? 'text-bullish font-medium' : 'text-bearish font-medium'}
              >
                {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
              </motion.span>
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={stock.price.toFixed(2)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold font-mono"
            >
              ${stock.price.toFixed(2)}
            </motion.div>
          </AnimatePresence>
          <div className="text-xs text-muted-foreground mt-1">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Live
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Notification Stack with cycling
function NotificationStack() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const notifications = [
    { title: 'AAPL Price Alert', message: 'Apple reached your target price of $180', type: 'success', time: '2 min ago' },
    { title: 'AI Insight', message: 'NVDA showing strong bullish momentum', type: 'info', time: '5 min ago' },
    { title: 'Earnings Alert', message: 'MSFT reports Q4 earnings tomorrow', type: 'warning', time: '12 min ago' },
    { title: 'Volume Spike', message: 'Unusual volume detected on TSLA', type: 'info', time: '18 min ago' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(i => (i + 1) % notifications.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-44">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="absolute inset-0 bg-surface-100 p-4 rounded-xl border border-border shadow-lg"
        >
          <div className="flex items-start gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              notifications[currentIndex].type === 'success' ? 'bg-success/10 text-success' :
              notifications[currentIndex].type === 'warning' ? 'bg-warning/10 text-warning' :
              'bg-brand-500/10 text-brand-400'
            }`}>
              <BellRing className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-sm truncate">{notifications[currentIndex].title}</div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{notifications[currentIndex].time}</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">{notifications[currentIndex].message}</div>
              <div className="flex gap-2 mt-3">
                <button className="text-xs px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 transition-colors">
                  View Details
                </button>
                <button className="text-xs px-3 py-1.5 rounded-lg bg-surface-200 text-muted-foreground hover:bg-surface-300 transition-colors">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      {/* Stacked cards behind */}
      <div className="absolute inset-x-2 top-3 bottom-0 bg-surface-100/60 rounded-xl border border-border/50 -z-10" />
      <div className="absolute inset-x-4 top-6 bottom-0 bg-surface-100/30 rounded-xl border border-border/30 -z-20" />

      {/* Notification count indicator */}
      <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shadow-lg">
        4
      </div>
    </div>
  );
}

// Typewriter Code Animation
function TypewriterCode() {
  const [displayedCode, setDisplayedCode] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const fullCode = `const analysis = await fetch(
  '/api/analyze/AAPL',
  { method: 'POST' }
);`;

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullCode.length) {
        setDisplayedCode(fullCode.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowResponse(true), 500);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-surface-300 rounded-lg p-4 font-mono text-sm">
        <div className="text-muted-foreground text-xs mb-2">// Request</div>
        <pre className="text-brand-400 whitespace-pre-wrap">
          {displayedCode}
          <span className="animate-pulse">|</span>
        </pre>
      </div>
      <AnimatePresence>
        {showResponse && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface-300 rounded-lg p-4 font-mono text-sm"
          >
            <div className="text-muted-foreground text-xs mb-2">// Response</div>
            <pre className="text-success whitespace-pre-wrap text-xs">
{`{
  "symbol": "AAPL",
  "signal": "bullish",
  "confidence": 94.7,
  "target": "$185.00"
}`}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// AI Analysis Mockup with chart
function AIAnalysisMockup() {
  const [prediction, setPrediction] = useState(94.7);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrediction(p => Math.min(99, Math.max(90, p + (Math.random() - 0.5) * 2)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* Chart visualization */}
      <div className="relative h-40 bg-surface-300/50 rounded-lg overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(11, 165, 236, 0.3)" />
              <stop offset="100%" stopColor="rgba(11, 165, 236, 0)" />
            </linearGradient>
            <linearGradient id="predictionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.4)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
            </linearGradient>
          </defs>
          {/* Historical data line */}
          <path
            d="M0 120 L50 100 L100 110 L150 80 L200 90 L250 60 L280 70"
            fill="none"
            stroke="rgba(11, 165, 236, 0.8)"
            strokeWidth="2"
          />
          {/* Area under historical */}
          <path
            d="M0 120 L50 100 L100 110 L150 80 L200 90 L250 60 L280 70 L280 160 L0 160 Z"
            fill="url(#chartGradient)"
          />
          {/* AI Prediction zone */}
          <path
            d="M280 70 L320 50 L360 55 L400 40"
            fill="none"
            stroke="rgba(139, 92, 246, 0.8)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <path
            d="M280 70 L320 50 L360 55 L400 40 L400 160 L280 160 Z"
            fill="url(#predictionGradient)"
          />
        </svg>
        {/* AI Zone label */}
        <div className="absolute top-2 right-2 bg-accent-500/20 backdrop-blur px-2 py-1 rounded text-xs text-accent-400 border border-accent-500/30">
          AI Prediction Zone
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-100 p-3 rounded-lg text-center">
          <div className="text-xs text-muted-foreground">Confidence</div>
          <div className="text-lg font-bold text-brand-400">
            <AnimatedCounter end={prediction} suffix="%" decimals={1} />
          </div>
        </div>
        <div className="bg-surface-100 p-3 rounded-lg text-center">
          <div className="text-xs text-muted-foreground">Target</div>
          <div className="text-lg font-bold text-success">$185.00</div>
        </div>
        <div className="bg-surface-100 p-3 rounded-lg text-center">
          <div className="text-xs text-muted-foreground">Signal</div>
          <div className="text-lg font-bold text-success">Bullish</div>
        </div>
      </div>

      {/* Floating badge */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute top-4 left-4 bg-success/20 backdrop-blur px-3 py-1.5 rounded-full border border-success/30"
      >
        <span className="text-success font-semibold text-sm flex items-center gap-1">
          <TrendingUp className="h-4 w-4" />
          Strong Bullish
        </span>
      </motion.div>
    </div>
  );
}

// Scroll Indicator
function ScrollIndicator() {
  return (
    <motion.div
      animate={{ y: [0, 10, 0] }}
      transition={{ repeat: Infinity, duration: 2 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2"
    >
      <ChevronDown className="h-8 w-8 text-muted-foreground" />
    </motion.div>
  );
}

export default function FeaturesPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center pt-20 pb-32">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Explore the Platform
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
            >
              <span className="text-foreground">Every Feature</span>
              <br />
              <span className="bg-gradient-to-r from-brand-400 via-accent-400 to-brand-400 bg-clip-text text-transparent">
                Engineered for Precision
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto"
            >
              From real-time data streams to neural network predictions, every tool
              is designed to give you the competitive edge.
            </motion.p>
          </motion.div>
        </div>
        <ScrollIndicator />
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* AI Analysis - Large Card (2x2) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 md:row-span-2 group"
            >
              <div className="h-full p-8 rounded-2xl border border-border bg-card hover:border-brand-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="h-14 w-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6 shadow-glow-sm">
                    <Brain className="h-7 w-7 text-brand-400" />
                  </div>

                  <h3 className="text-2xl font-bold mb-3">AI-Powered Analysis</h3>
                  <p className="text-muted-foreground mb-6">
                    Our neural networks analyze market trends, news sentiment, technical indicators,
                    and historical patterns in real-time to deliver actionable predictions.
                  </p>

                  {/* Interactive AI Mockup */}
                  <div className="relative rounded-xl bg-surface-200 border border-border p-4">
                    <AIAnalysisMockup />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Real-Time Data */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="h-full p-6 rounded-2xl border border-border bg-card hover:border-accent-500/50 transition-all duration-300">
                <div className="h-10 w-10 rounded-lg bg-accent-500/10 flex items-center justify-center mb-4">
                  <Zap className="h-5 w-5 text-accent-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Real-Time Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Live market data with sub-second updates.
                </p>
                <LiveStockTicker />
              </div>
            </motion.div>

            {/* Smart Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="h-full p-6 rounded-2xl border border-border bg-card hover:border-success/50 transition-all duration-300">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center mb-4 relative">
                  <Bell className="h-5 w-5 text-success" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-error rounded-full animate-ping" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-error rounded-full" />
                </div>
                <h3 className="text-xl font-bold mb-2">Smart Alerts</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  AI-powered notifications for price targets and events.
                </p>
                <NotificationStack />
              </div>
            </motion.div>

            {/* Watchlists */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="h-full p-6 rounded-2xl border border-border bg-card hover:border-accent-500/50 transition-all duration-300">
                <div className="h-10 w-10 rounded-lg bg-accent-500/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-5 w-5 text-accent-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Smart Watchlists</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Organize and track unlimited stocks.
                </p>
                <div className="space-y-2">
                  {[
                    { symbol: 'AAPL', price: '$178.52', change: '+2.34%', up: true },
                    { symbol: 'MSFT', price: '$374.29', change: '+1.82%', up: true },
                    { symbol: 'GOOGL', price: '$141.80', change: '-0.45%', up: false },
                    { symbol: 'NVDA', price: '$485.20', change: '+5.21%', up: true },
                  ].map((stock, i) => (
                    <motion.div
                      key={stock.symbol}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface-100 border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${stock.up ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <span className="font-semibold text-sm block">{stock.symbol}</span>
                          <span className="text-xs text-muted-foreground">{stock.price}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Mini sparkline */}
                        <svg className="w-12 h-6" viewBox="0 0 48 24">
                          <path
                            d={stock.up ? "M0 20 L12 16 L24 18 L36 10 L48 6" : "M0 6 L12 10 L24 8 L36 16 L48 18"}
                            fill="none"
                            stroke={stock.up ? "rgb(34 197 94)" : "rgb(239 68 68)"}
                            strokeWidth="2"
                          />
                        </svg>
                        <span className={`text-xs font-medium ${stock.up ? 'text-success' : 'text-error'}`}>
                          {stock.change}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Pattern Detection */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="h-full p-6 rounded-2xl border border-border bg-card hover:border-warning/50 transition-all duration-300">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center mb-4">
                  <Target className="h-5 w-5 text-warning" />
                </div>
                <h3 className="text-xl font-bold mb-2">Pattern Detection</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Automatic chart pattern recognition.
                </p>

                {/* Visual Pattern Preview */}
                <div className="bg-surface-100 rounded-lg p-3 mb-4 border border-border/50">
                  <svg className="w-full h-20" viewBox="0 0 200 80" preserveAspectRatio="none">
                    {/* Bull Flag Pattern */}
                    <path
                      d="M10 60 L40 20 L50 25 L60 22 L70 28 L80 24 L90 30 L100 26"
                      fill="none"
                      stroke="rgb(11 165 236)"
                      strokeWidth="2"
                    />
                    {/* Flag portion */}
                    <path
                      d="M100 26 L120 32 L140 28 L160 34 L180 30"
                      fill="none"
                      stroke="rgb(139 92 246)"
                      strokeWidth="2"
                      strokeDasharray="4,2"
                    />
                    {/* Breakout projection */}
                    <path
                      d="M180 30 L200 15"
                      fill="none"
                      stroke="rgb(34 197 94)"
                      strokeWidth="2"
                      strokeDasharray="4,2"
                    />
                    {/* Pattern area fill */}
                    <path
                      d="M100 26 L120 32 L140 28 L160 34 L180 30 L180 50 L100 50 Z"
                      fill="rgba(139, 92, 246, 0.1)"
                    />
                  </svg>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">Bull Flag</span>
                    <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded">Confirmed</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded bg-surface-100/50">
                    <span className="text-sm">Head & Shoulders</span>
                    <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded">Detected</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-surface-100/50">
                    <span className="text-sm">Double Bottom</span>
                    <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded">Forming</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-surface-100/50">
                    <span className="text-sm">Ascending Triangle</span>
                    <span className="text-xs bg-accent-500/20 text-accent-400 px-2 py-0.5 rounded">Watching</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* API Access - Wide */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="md:col-span-2"
            >
              <div className="p-6 rounded-2xl border border-border bg-card hover:border-brand-500/50 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-brand-400" />
                  </div>
                  <span className="text-xs bg-accent-500/20 text-accent-400 px-2 py-1 rounded-full">
                    REST & WebSocket
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">Powerful API</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Integrate our AI analysis into your own applications with our comprehensive API.
                </p>
                <TypewriterCode />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Deep Dive: AI Analysis */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-4">
                <Brain className="h-4 w-4" />
                AI POWERED
              </span>

              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Neural Networks That
                <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
                  {' '}Think Like Analysts
                </span>
              </h2>

              <p className="text-lg text-muted-foreground mb-8">
                Our models are trained on decades of market data, analyzing over 50 million
                data points daily to identify patterns and predict market movements.
              </p>

              <ul className="space-y-4">
                {[
                  { title: 'Pattern Recognition', desc: 'Identify bullish and bearish patterns automatically' },
                  { title: 'Sentiment Analysis', desc: 'Real-time news and social media sentiment tracking' },
                  { title: 'Price Predictions', desc: 'AI-generated price targets with confidence scores' },
                  { title: 'Risk Assessment', desc: 'Comprehensive volatility and risk metrics' },
                ].map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-6 w-6 text-brand-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-foreground">{feature.title}</strong>
                      <p className="text-muted-foreground text-sm">{feature.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm shadow-2xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-brand-400" />
                    </div>
                    <div>
                      <div className="font-semibold">AI Model v3.2</div>
                      <div className="text-xs text-success flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                        Active
                      </div>
                    </div>
                  </div>
                  <span className="text-xs bg-brand-500/10 text-brand-400 px-2 py-1 rounded-full">
                    Production
                  </span>
                </div>

                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Model Accuracy</span>
                      <span className="text-2xl font-bold text-brand-400">94.7%</span>
                    </div>
                    <div className="w-full bg-surface-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '94.7%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: [0.0, 0.0, 0.2, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-100 rounded-xl p-4 border border-border/50">
                      <div className="text-xs text-muted-foreground mb-1">Data Points</div>
                      <div className="text-2xl font-bold text-accent-400">10M+</div>
                      <div className="text-xs text-success mt-1">Daily analysis</div>
                    </div>
                    <div className="bg-surface-100 rounded-xl p-4 border border-border/50">
                      <div className="text-xs text-muted-foreground mb-1">Training Data</div>
                      <div className="text-2xl font-bold text-success">5+ years</div>
                      <div className="text-xs text-muted-foreground mt-1">Historical market</div>
                    </div>
                  </div>

                  <div className="bg-surface-100 rounded-xl p-4 border border-border/50">
                    <div className="text-xs text-muted-foreground mb-3">Model Performance</div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <div className="text-lg font-bold text-foreground">73%</div>
                        <div className="text-xs text-muted-foreground">Short-term</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-foreground">68%</div>
                        <div className="text-xs text-muted-foreground">Mid-term</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-foreground">82%</div>
                        <div className="text-xs text-muted-foreground">Trend</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/20 to-accent-500/20 blur-3xl -z-10 rounded-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Deep Dive: Real-Time */}
      <section className="py-32 relative overflow-hidden bg-surface-200/50 border-y border-border">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 md:order-1"
            >
              <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm shadow-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold">Live Market Feed</span>
                  <span className="inline-flex items-center gap-1 text-xs text-success">
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    Connected
                  </span>
                </div>
                <LiveStockTicker />
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-accent-500/20 to-brand-500/20 blur-3xl -z-10 rounded-3xl" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-sm font-medium mb-4">
                <Zap className="h-4 w-4" />
                REAL-TIME
              </span>

              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Lightning Fast
                <span className="bg-gradient-to-r from-accent-400 to-brand-400 bg-clip-text text-transparent">
                  {' '}Market Data
                </span>
              </h2>

              <p className="text-lg text-muted-foreground mb-8">
                Direct exchange connections deliver sub-100ms price updates,
                ensuring you never miss a critical market event.
              </p>

              <ul className="space-y-4">
                {[
                  { title: 'Sub-Second Updates', desc: 'Real-time price updates with minimal latency' },
                  { title: 'Level 2 Data', desc: 'Access market depth and order book information' },
                  { title: 'Breaking News', desc: 'Instant news alerts as they happen' },
                ].map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-6 w-6 text-accent-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-foreground">{feature.title}</strong>
                      <p className="text-muted-foreground text-sm">{feature.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-accent-500/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

        <div className="container mx-auto px-4 max-w-4xl relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to Trade
              <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
                {' '}Smarter?
              </span>
            </h2>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join 50,000+ investors already using AI to make better decisions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link
                href="/app"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-400 hover:to-accent-400 text-white px-10 py-5 rounded-xl text-xl font-semibold transition-all shadow-2xl hover:shadow-glow active:scale-[0.98]"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 border border-border hover:border-brand-500/50 text-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:bg-surface-50"
              >
                View Pricing
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              No credit card required &bull; 14-day free trial &bull; Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
