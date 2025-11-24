'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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
  Star,
  BarChart3,
  Activity,
} from '@stock-analyser/ui';

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

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30 pointer-events-none" />

      {/* Hero Section - Cursor/Linear Style */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Powered by Advanced AI Models
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-balance"
            >
              <span className="text-foreground">Make Smarter</span>
              <br />
              <span className="bg-gradient-to-r from-brand-400 via-accent-400 to-brand-400 bg-clip-text text-transparent">
                Investment Decisions
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10"
            >
              Neural networks analyze millions of data points in real-time,
              delivering actionable insights and predictions for your portfolio.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Link
                href="/app"
                className="group inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-glow hover:shadow-glow-lg active:scale-[0.98]"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center gap-2 border border-border hover:border-brand-500/50 text-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:bg-surface-50"
              >
                Explore Features
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4 fill-warning text-warning"
                  />
                ))}
                <span className="ml-2 font-medium text-foreground">4.9/5</span>
              </div>
              <span className="hidden sm:block">•</span>
              <span>Trusted by 50,000+ investors</span>
            </motion.div>
          </motion.div>

          {/* Dashboard Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16 relative"
          >
            <div className="relative mx-auto max-w-5xl rounded-2xl border border-border bg-card/80 backdrop-blur-sm shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent pointer-events-none" />
              <div className="p-1">
                {/* Fake browser header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-error/60" />
                    <div className="w-3 h-3 rounded-full bg-warning/60" />
                    <div className="w-3 h-3 rounded-full bg-success/60" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 rounded-md bg-surface-50 text-xs text-muted-foreground">
                      app.stockanalyser.ai/dashboard
                    </div>
                  </div>
                </div>
                {/* Dashboard content mockup */}
                <div className="p-6 space-y-4">
                  {/* Top stats */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'AAPL', value: '$178.50', change: '+1.2%', positive: true },
                      { label: 'MSFT', value: '$412.30', change: '-0.5%', positive: false },
                      { label: 'GOOGL', value: '$141.20', change: '+0.8%', positive: true },
                    ].map((stock) => (
                      <div
                        key={stock.label}
                        className="p-4 rounded-lg bg-surface-100 border border-border"
                      >
                        <div className="text-sm text-muted-foreground">{stock.label}</div>
                        <div className="text-xl font-mono font-semibold">{stock.value}</div>
                        <div className={stock.positive ? 'text-bullish text-sm' : 'text-bearish text-sm'}>
                          {stock.change}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Chart placeholder */}
                  <div className="h-48 rounded-lg bg-surface-100 border border-border flex items-center justify-center">
                    <Activity className="h-12 w-12 text-brand-500/30" />
                  </div>
                </div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-brand-500/20 blur-3xl -z-10 rounded-3xl opacity-50" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-border bg-surface-200/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: '$2.4B+', label: 'Assets Analyzed' },
              { value: '94.7%', label: 'Prediction Accuracy' },
              { value: '50K+', label: 'Active Users' },
              { value: '<100ms', label: 'Response Time' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <section id="features" className="py-24 md:py-32">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-sm font-medium mb-4">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need to
              <br />
              <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
                trade smarter
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful AI-driven tools designed to give you the edge in today&apos;s markets.
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large card - AI Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 md:row-span-2 group"
            >
              <div className="h-full p-8 rounded-2xl border border-border bg-card hover:border-brand-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/10">
                <div className="h-12 w-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-6">
                  <Brain className="h-6 w-6 text-brand-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">AI-Powered Analysis</h3>
                <p className="text-muted-foreground mb-6">
                  Our neural networks analyze market trends, news sentiment, technical indicators,
                  and historical patterns to deliver accurate predictions and actionable insights.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="p-4 rounded-lg bg-surface-100">
                    <div className="text-sm text-muted-foreground">Model Accuracy</div>
                    <div className="text-2xl font-bold text-brand-400">94.7%</div>
                  </div>
                  <div className="p-4 rounded-lg bg-surface-100">
                    <div className="text-sm text-muted-foreground">Data Points</div>
                    <div className="text-2xl font-bold text-accent-400">50M+</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Real-Time Data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="h-full p-6 rounded-2xl border border-border bg-card hover:border-accent-500/50 transition-all duration-300">
                <div className="h-10 w-10 rounded-lg bg-accent-500/10 flex items-center justify-center mb-4">
                  <Zap className="h-5 w-5 text-accent-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Real-Time Data</h3>
                <p className="text-sm text-muted-foreground">
                  Live market data with sub-100ms latency. Never miss a market opportunity.
                </p>
              </div>
            </motion.div>

            {/* Smart Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="h-full p-6 rounded-2xl border border-border bg-card hover:border-success/50 transition-all duration-300">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                  <Bell className="h-5 w-5 text-success" />
                </div>
                <h3 className="text-xl font-bold mb-2">Smart Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered notifications for price targets, volume spikes, and market events.
                </p>
              </div>
            </motion.div>

            {/* Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="p-6 rounded-2xl border border-border bg-card hover:border-warning/50 transition-all duration-300">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center mb-4">
                  <Shield className="h-5 w-5 text-warning" />
                </div>
                <h3 className="text-xl font-bold mb-2">Bank-Grade Security</h3>
                <p className="text-sm text-muted-foreground">
                  256-bit encryption, SOC 2 Type II certified, and PCI DSS compliant.
                </p>
              </div>
            </motion.div>

            {/* API Access */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="p-6 rounded-2xl border border-border bg-card hover:border-brand-500/50 transition-all duration-300">
                <div className="h-10 w-10 rounded-lg bg-brand-500/10 flex items-center justify-center mb-4">
                  <Globe className="h-5 w-5 text-brand-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">API Access</h3>
                <p className="text-sm text-muted-foreground">
                  Integrate our analysis engine into your own applications with our REST API.
                </p>
              </div>
            </motion.div>

            {/* Watchlists */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <div className="p-6 rounded-2xl border border-border bg-card hover:border-accent-500/50 transition-all duration-300">
                <div className="h-10 w-10 rounded-lg bg-accent-500/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-5 w-5 text-accent-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Smart Watchlists</h3>
                <p className="text-sm text-muted-foreground">
                  Create unlimited watchlists with automatic tracking and insights.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-surface-200/50 border-y border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-4">
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-bold">
              Start analyzing in
              <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
                {' '}minutes
              </span>
            </h2>
          </motion.div>

          <div className="space-y-12">
            {[
              {
                step: '01',
                title: 'Create Your Account',
                description: 'Sign up in seconds with Google or email. No credit card required to start your free trial.',
                color: 'brand',
              },
              {
                step: '02',
                title: 'Enter a Stock Ticker',
                description: 'Search for any stock symbol. Our AI immediately begins analyzing the latest market data.',
                color: 'accent',
              },
              {
                step: '03',
                title: 'Get AI Insights',
                description: 'Receive comprehensive analysis including recommendations, confidence scores, and key news.',
                color: 'success',
              },
              {
                step: '04',
                title: 'Make Informed Decisions',
                description: 'Use AI-powered insights to build your portfolio with confidence.',
                color: 'warning',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-6"
              >
                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center text-2xl font-bold text-${item.color}-400`}>
                  {item.step}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-lg">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-accent-500/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 max-w-4xl relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Ready to transform your
              <br />
              <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
                investment strategy?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of investors who are already using AI to make smarter decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/app"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-400 hover:to-accent-400 text-white px-10 py-5 rounded-xl text-xl font-semibold transition-all shadow-2xl hover:shadow-glow active:scale-[0.98]"
              >
                Start Your Free Trial
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/pricing"
                className="text-muted-foreground hover:text-foreground text-lg font-medium underline underline-offset-4"
              >
                View Pricing
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
            {[
              '256-bit SSL Encryption',
              'SOC 2 Type II Certified',
              '99.99% Uptime SLA',
              'PCI DSS Compliant',
            ].map((badge, index) => (
              <div key={badge} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>{badge}</span>
                {index < 3 && <span className="hidden sm:block mx-2">•</span>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
