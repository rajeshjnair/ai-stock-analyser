import Link from 'next/link'

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-black">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI-Powered Stock Analysis
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Make smarter investment decisions with advanced artificial intelligence.
            Get real-time insights, predictive analytics, and comprehensive market data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
            >
              Start Free Trial
            </Link>
            <Link
              href="/features"
              className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Powerful Features for Smart Investors
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold mb-3">AI Analysis</h3>
              <p className="text-gray-400">
                Advanced machine learning algorithms analyze market trends, patterns, and historical data to provide accurate predictions.
              </p>
            </div>

            <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-3">Real-Time Data</h3>
              <p className="text-gray-400">
                Access live market data, instant price updates, and real-time news feeds to stay ahead of market movements.
              </p>
            </div>

            <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 hover:border-pink-500 transition-all hover:shadow-lg hover:shadow-pink-500/20">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-3">Smart Watchlists</h3>
              <p className="text-gray-400">
                Create custom watchlists with intelligent alerts and automated tracking of your favorite stocks and portfolios.
              </p>
            </div>

            <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 hover:border-green-500 transition-all hover:shadow-lg hover:shadow-green-500/20">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-2xl font-bold mb-3">Technical Indicators</h3>
              <p className="text-gray-400">
                Comprehensive technical analysis tools including RSI, MACD, moving averages, and custom indicator combinations.
              </p>
            </div>

            <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 hover:border-yellow-500 transition-all hover:shadow-lg hover:shadow-yellow-500/20">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-2xl font-bold mb-3">Smart Alerts</h3>
              <p className="text-gray-400">
                Set up intelligent price alerts, volume triggers, and AI-powered notifications for market opportunities.
              </p>
            </div>

            <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 hover:border-indigo-500 transition-all hover:shadow-lg hover:shadow-indigo-500/20">
              <div className="text-4xl mb-4">🔌</div>
              <h3 className="text-2xl font-bold mb-3">API Access</h3>
              <p className="text-gray-400">
                Integrate our powerful analysis engine into your own applications with our comprehensive REST API.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            How It Works
          </h2>
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Connect Your Data</h3>
                <p className="text-gray-400 text-lg">
                  Link your brokerage account or manually input your portfolio. Our platform supports all major exchanges and thousands of stocks.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0 w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">AI Analysis</h3>
                <p className="text-gray-400 text-lg">
                  Our AI engine analyzes millions of data points, market trends, news sentiment, and technical indicators in real-time.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0 w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Get Insights</h3>
                <p className="text-gray-400 text-lg">
                  Receive actionable insights, buy/sell recommendations, and risk assessments tailored to your investment strategy.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-2xl font-bold">
                4
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Make Informed Decisions</h3>
                <p className="text-gray-400 text-lg">
                  Execute trades with confidence backed by data-driven analysis and comprehensive market intelligence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Investment Strategy?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of investors who are already using AI to make smarter decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/signup"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 rounded-lg text-xl font-semibold transition-all transform hover:scale-105 shadow-2xl"
            >
              Start Your Free Trial
            </Link>
            <Link
              href="/pricing"
              className="text-gray-300 hover:text-white text-xl font-semibold underline"
            >
              View Pricing
            </Link>
          </div>
          <p className="text-gray-500 mt-6">
            No credit card required. 14-day free trial.
          </p>
        </div>
      </section>
    </div>
  )
}
