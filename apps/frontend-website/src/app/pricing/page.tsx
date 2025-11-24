'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  Sparkles,
  Shield,
  Zap,
  TrendingUp,
  Building2,
  ChevronDown,
  Star,
  Users,
  ArrowRight,
  Clock,
  CreditCard,
  Lock,
} from 'lucide-react';
import {
  Button,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@stock-analyser/ui';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// Animated counter for stats
function AnimatedStat({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// Pricing plans data
const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Zap,
    color: 'gray',
    features: [
      { name: 'Up to 5 watchlist stocks', included: true },
      { name: 'Basic stock analysis', included: true },
      { name: '15-minute delayed data', included: true },
      { name: 'Email alerts', included: true },
      { name: 'AI predictions', included: false },
      { name: 'Real-time data', included: false },
    ],
    cta: 'Get Started',
    href: '/signup?plan=free',
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'For individual investors',
    monthlyPrice: 9.99,
    yearlyPrice: 7.99,
    icon: TrendingUp,
    color: 'brand',
    badge: 'MOST POPULAR',
    featured: true,
    features: [
      { name: 'Up to 25 watchlist stocks', included: true },
      { name: 'Advanced AI analysis', included: true },
      { name: 'Real-time data', included: true },
      { name: 'SMS & email alerts', included: true },
      { name: 'AI price predictions', included: true },
      { name: 'Technical indicators', included: true },
    ],
    cta: 'Start Free Trial',
    href: '/signup?plan=basic',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious traders',
    monthlyPrice: 29.99,
    yearlyPrice: 23.99,
    icon: Sparkles,
    color: 'accent',
    badge: 'BEST VALUE',
    features: [
      { name: 'Unlimited watchlists', included: true },
      { name: 'Advanced AI models', included: true },
      { name: 'Real-time data & news', included: true },
      { name: 'Priority alerts', included: true },
      { name: 'Portfolio optimization', included: true },
      { name: 'API access (100 calls/day)', included: true },
      { name: 'Export reports', included: true },
    ],
    cta: 'Start Free Trial',
    href: '/signup?plan=pro',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For institutions & teams',
    monthlyPrice: null,
    yearlyPrice: null,
    icon: Building2,
    color: 'gray',
    features: [
      { name: 'Everything in Pro', included: true },
      { name: 'Unlimited API calls', included: true },
      { name: 'Multi-user accounts', included: true },
      { name: 'Custom AI models', included: true },
      { name: 'Dedicated support', included: true },
      { name: 'SLA guarantee', included: true },
      { name: 'White-label options', included: true },
    ],
    cta: 'Contact Sales',
    href: '/contact',
  },
];

// FAQ data
const faqs = [
  {
    question: 'How accurate are the AI predictions?',
    answer:
      'Our AI models have demonstrated an average accuracy rate of 73% for short-term predictions (1-7 days) and 68% for medium-term predictions (1-3 months). However, past performance does not guarantee future results. We recommend using our predictions as one of many factors in your investment decisions.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      "Yes, you can cancel your subscription at any time with no cancellation fees. Your access will continue until the end of your current billing period. If you're on an annual plan, you can request a prorated refund within the first 30 days.",
  },
  {
    question: 'Is my financial data secure?',
    answer:
      'Absolutely. We use bank-level 256-bit SSL encryption for all data transmission. We never store your brokerage credentials - we use read-only API connections. Our infrastructure is SOC 2 Type II certified and we undergo regular security audits.',
  },
  {
    question: 'What markets and exchanges do you support?',
    answer:
      'We support all major US exchanges (NYSE, NASDAQ, AMEX) and provide analysis for over 8,000 stocks, ETFs, and ADRs. Pro and Enterprise plans also include international markets including LSE, TSE, and major European exchanges.',
  },
  {
    question: 'How does the free trial work?',
    answer:
      "Start with a 14-day free trial of any paid plan - no credit card required. You'll have full access to all features during the trial period. At the end of the trial, you can choose to subscribe or your account will automatically convert to the Free plan.",
  },
  {
    question: 'Do you offer refunds?',
    answer:
      "We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied with our service, contact support within 30 days of your purchase for a full refund. Annual plan refunds are prorated after the 30-day period.",
  },
];

// Company logos for social proof
const companyLogos = [
  { name: 'Goldman Sachs', abbr: 'GS' },
  { name: 'Morgan Stanley', abbr: 'MS' },
  { name: 'BlackRock', abbr: 'BLK' },
  { name: 'Fidelity', abbr: 'FID' },
  { name: 'Vanguard', abbr: 'VAN' },
  { name: 'Charles Schwab', abbr: 'CS' },
];

// Testimonials
const testimonials = [
  {
    quote:
      "The AI predictions have completely transformed how I approach trading. I've seen a 40% improvement in my win rate since switching to the Pro plan.",
    author: 'Michael Chen',
    role: 'Day Trader',
    avatar: 'MC',
    rating: 5,
  },
  {
    quote:
      'As a financial advisor, I need reliable tools. AI Stock Analyser gives me the edge to provide better recommendations to my clients.',
    author: 'Sarah Williams',
    role: 'Financial Advisor',
    avatar: 'SW',
    rating: 5,
  },
  {
    quote:
      "The real-time alerts alone have paid for my subscription many times over. I caught a major dip that I would've missed otherwise.",
    author: 'David Park',
    role: 'Retail Investor',
    avatar: 'DP',
    rating: 5,
  },
];

// Feature comparison data
const comparisonFeatures = [
  { name: 'Watchlist Stocks', free: '5', basic: '25', pro: 'Unlimited', enterprise: 'Unlimited' },
  {
    name: 'Data Updates',
    free: '15-min delay',
    basic: 'Real-time',
    pro: 'Real-time',
    enterprise: 'Real-time',
  },
  { name: 'AI Predictions', free: false, basic: true, pro: true, enterprise: true },
  { name: 'Technical Indicators', free: 'Basic', basic: 'Advanced', pro: 'Advanced+', enterprise: 'Custom' },
  { name: 'API Access', free: false, basic: false, pro: '100/day', enterprise: 'Unlimited' },
  { name: 'Portfolio Optimization', free: false, basic: false, pro: true, enterprise: true },
  { name: 'Export Reports', free: false, basic: false, pro: true, enterprise: true },
  { name: 'Multi-user Accounts', free: false, basic: false, pro: false, enterprise: true },
  { name: 'Support', free: 'Community', basic: 'Email', pro: 'Priority', enterprise: 'Dedicated' },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getPrice = (plan: (typeof plans)[0]) => {
    if (plan.monthlyPrice === null) return 'Custom';
    if (plan.monthlyPrice === 0) return '$0';
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    return `$${price?.toFixed(2)}`;
  };

  const getSavings = (plan: (typeof plans)[0]) => {
    if (!plan.monthlyPrice || !plan.yearlyPrice) return null;
    const yearlySavings = (plan.monthlyPrice - plan.yearlyPrice) * 12;
    return yearlySavings > 0 ? yearlySavings.toFixed(0) : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface-900 via-surface-950 to-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-500/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                14-day free trial on all paid plans
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent"
            >
              Simple, Transparent
              <br />
              <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
                Pricing
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Choose the plan that fits your investment needs. No hidden fees, no surprises. Cancel
              anytime.
            </motion.p>

            {/* Billing Toggle */}
            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-sm font-medium ${!isYearly ? 'text-white' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
                  isYearly ? 'bg-brand-500' : 'bg-surface-700'
                }`}
              >
                <motion.div
                  className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                  animate={{ left: isYearly ? '2.25rem' : '0.25rem' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-sm font-medium ${isYearly ? 'text-white' : 'text-gray-500'}`}>
                Yearly
              </span>
              <AnimatePresence mode="wait">
                {isYearly && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium"
                  >
                    <Sparkles className="w-3 h-3" />
                    Save 20%
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              const isFeatured = plan.featured;
              const savings = getSavings(plan);

              return (
                <motion.div
                  key={plan.id}
                  variants={scaleIn}
                  className={`relative rounded-2xl p-6 transition-all duration-300 ${
                    isFeatured
                      ? 'bg-gradient-to-b from-brand-500/20 to-surface-800/80 border-2 border-brand-500/50 shadow-2xl shadow-brand-500/20 scale-105 z-10'
                      : 'bg-surface-800/50 border border-surface-700 hover:border-surface-600'
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${
                        isFeatured ? 'bg-brand-500 text-white' : 'bg-accent-500 text-white'
                      }`}
                    >
                      {plan.badge}
                    </div>
                  )}

                  {/* Icon & Name */}
                  <div className="mb-4">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                        plan.color === 'brand'
                          ? 'bg-brand-500/20 text-brand-400'
                          : plan.color === 'accent'
                            ? 'bg-accent-500/20 text-accent-400'
                            : 'bg-surface-700 text-gray-400'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    <p className="text-gray-400 text-sm">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">{getPrice(plan)}</span>
                      {plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
                        <span className="text-gray-500">/month</span>
                      )}
                    </div>
                    {isYearly && savings && (
                      <p className="text-sm text-green-400 mt-1">Save ${savings}/year</p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-gray-300' : 'text-gray-600'}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    href={plan.href}
                    className={`block w-full text-center py-3 rounded-xl font-semibold transition-all duration-300 ${
                      isFeatured
                        ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40'
                        : plan.color === 'accent'
                          ? 'bg-accent-500/20 hover:bg-accent-500/30 text-accent-400 border border-accent-500/30'
                          : 'bg-surface-700 hover:bg-surface-600 text-white'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Social Proof - Stats */}
      <section className="py-16 border-y border-surface-800">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                <AnimatedStat value={50000} suffix="+" />
              </div>
              <p className="text-gray-400">Active Users</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                <AnimatedStat value={2} suffix="M+" />
              </div>
              <p className="text-gray-400">Predictions Made</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-brand-400 mb-2">
                <AnimatedStat value={73} suffix="%" />
              </div>
              <p className="text-gray-400">Prediction Accuracy</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                <AnimatedStat value={4.9} />
              </div>
              <p className="text-gray-400">User Rating</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-sm text-gray-500 uppercase tracking-wider">
              Trusted by traders at leading institutions
            </p>
          </motion.div>
          <motion.div
            className="flex flex-wrap justify-center items-center gap-8 md:gap-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {companyLogos.map((company, index) => (
              <div
                key={company.name}
                className="flex items-center justify-center w-24 h-12 rounded-lg bg-surface-800/50 border border-surface-700 text-gray-500 font-bold text-lg hover:text-gray-300 hover:border-surface-600 transition-colors"
              >
                {company.abbr}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-surface-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Loved by Traders Worldwide
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Join thousands of investors who trust AI Stock Analyser for their trading decisions.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-surface-800/50 border border-surface-700 rounded-2xl p-8 md:p-12"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <blockquote className="text-xl md:text-2xl text-white mb-8 leading-relaxed">
                  "{testimonials[activeTestimonial].quote}"
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold">
                    {testimonials[activeTestimonial].avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {testimonials[activeTestimonial].author}
                    </p>
                    <p className="text-gray-400 text-sm">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeTestimonial ? 'bg-brand-500 w-6' : 'bg-surface-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Compare All Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              See exactly what's included in each plan to make the right choice for your needs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto bg-surface-800/30 rounded-2xl border border-surface-700 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-700 bg-surface-800/50">
                    <th className="text-left py-4 px-6 font-semibold text-white">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-400">Free</th>
                    <th className="text-center py-4 px-4 font-semibold text-brand-400">Basic</th>
                    <th className="text-center py-4 px-4 font-semibold text-accent-400">Pro</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-400">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {comparisonFeatures.map((feature, index) => (
                    <tr
                      key={feature.name}
                      className={`border-b border-surface-700/50 ${index % 2 === 0 ? 'bg-surface-800/20' : ''}`}
                    >
                      <td className="py-4 px-6 font-medium text-white">{feature.name}</td>
                      <td className="text-center py-4 px-4">
                        {typeof feature.free === 'boolean' ? (
                          feature.free ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-600 mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-400">{feature.free}</span>
                        )}
                      </td>
                      <td className="text-center py-4 px-4">
                        {typeof feature.basic === 'boolean' ? (
                          feature.basic ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-600 mx-auto" />
                          )
                        ) : (
                          <span className="text-brand-400">{feature.basic}</span>
                        )}
                      </td>
                      <td className="text-center py-4 px-4">
                        {typeof feature.pro === 'boolean' ? (
                          feature.pro ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-600 mx-auto" />
                          )
                        ) : (
                          <span className="text-accent-400">{feature.pro}</span>
                        )}
                      </td>
                      <td className="text-center py-4 px-4">
                        {typeof feature.enterprise === 'boolean' ? (
                          feature.enterprise ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-600 mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-300">{feature.enterprise}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-surface-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Got questions? We've got answers. If you can't find what you're looking for, feel free
              to contact us.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="bg-surface-800/50 border border-surface-700 rounded-xl px-6 overflow-hidden"
                >
                  <AccordionTrigger className="text-left text-white hover:text-brand-400">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-400">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 border-t border-surface-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center items-center gap-8 md:gap-16"
          >
            <div className="flex items-center gap-3 text-gray-400">
              <Shield className="w-8 h-8 text-green-500" />
              <div>
                <p className="font-semibold text-white">Bank-Level Security</p>
                <p className="text-sm">256-bit SSL Encryption</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <Lock className="w-8 h-8 text-brand-500" />
              <div>
                <p className="font-semibold text-white">SOC 2 Certified</p>
                <p className="text-sm">Enterprise-grade compliance</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <CreditCard className="w-8 h-8 text-accent-500" />
              <div>
                <p className="font-semibold text-white">30-Day Guarantee</p>
                <p className="text-sm">Full money-back promise</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="font-semibold text-white">Cancel Anytime</p>
                <p className="text-sm">No long-term contracts</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 via-accent-500/10 to-brand-500/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Trading?
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Join 50,000+ investors who trust AI Stock Analyser. Start your free trial today — no
              credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup?plan=basic"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-300"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-surface-800 hover:bg-surface-700 text-white font-semibold rounded-xl border border-surface-700 transition-all duration-300"
              >
                Contact Sales
              </Link>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
