import Link from 'next/link'

export default function FeaturesPage() {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-black min-h-screen">
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Powerful Features for Every Investor
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI technology with comprehensive market data
              to give you the edge you need in today's fast-paced markets.
            </p>
          </div>

          {/* AI Analysis Feature */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-blue-600/20 text-blue-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  AI POWERED
                </div>
                <h2 className="text-4xl font-bold mb-6">
                  Advanced AI Analysis
                </h2>
                <p className="text-gray-400 text-lg mb-6">
                  Our proprietary machine learning models analyze millions of data points in real-time,
                  including price movements, trading volumes, news sentiment, and historical patterns
                  to generate accurate predictions and actionable insights.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">✓</span>
                    <div>
                      <strong className="text-white">Pattern Recognition</strong>
                      <p className="text-gray-400">Identify bullish and bearish patterns automatically</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">✓</span>
                    <div>
                      <strong className="text-white">Sentiment Analysis</strong>
                      <p className="text-gray-400">Real-time news and social media sentiment tracking</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">✓</span>
                    <div>
                      <strong className="text-white">Price Predictions</strong>
                      <p className="text-gray-400">AI-generated price targets with confidence scores</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 p-8 rounded-2xl border border-blue-500/30">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-2xl font-bold mb-3">Neural Network Analysis</h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex justify-between items-center">
                    <span>Model Accuracy</span>
                    <span className="text-green-400 font-bold">94.7%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{width: '94.7%'}}></div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span>Data Points Analyzed</span>
                    <span className="text-blue-400 font-bold">10M+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Training Dataset Size</span>
                    <span className="text-purple-400 font-bold">5+ years</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Data Feature */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-gradient-to-br from-green-900/40 to-blue-900/40 p-8 rounded-2xl border border-green-500/30">
                <div className="text-6xl mb-4">⚡</div>
                <h3 className="text-2xl font-bold mb-3">Lightning Fast Updates</h3>
                <div className="space-y-4 text-gray-300">
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">AAPL</span>
                      <span className="text-green-400">+2.4%</span>
                    </div>
                    <div className="text-2xl font-bold">$178.52</div>
                    <div className="text-sm text-gray-500">Updated: 2 seconds ago</div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">MSFT</span>
                      <span className="text-green-400">+1.8%</span>
                    </div>
                    <div className="text-2xl font-bold">$374.29</div>
                    <div className="text-sm text-gray-500">Updated: 1 second ago</div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-block bg-green-600/20 text-green-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  REAL-TIME
                </div>
                <h2 className="text-4xl font-bold mb-6">
                  Live Market Data
                </h2>
                <p className="text-gray-400 text-lg mb-6">
                  Get instant access to real-time stock prices, trading volumes, and market movements.
                  Our direct exchange connections ensure you never miss a critical market event.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <div>
                      <strong className="text-white">Sub-Second Updates</strong>
                      <p className="text-gray-400">Real-time price updates with minimal latency</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <div>
                      <strong className="text-white">Level 2 Data</strong>
                      <p className="text-gray-400">Access market depth and order book information</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <div>
                      <strong className="text-white">News Integration</strong>
                      <p className="text-gray-400">Breaking news alerts as they happen</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Watchlist Feature */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-purple-600/20 text-purple-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  ORGANIZE
                </div>
                <h2 className="text-4xl font-bold mb-6">
                  Smart Watchlists
                </h2>
                <p className="text-gray-400 text-lg mb-6">
                  Create unlimited custom watchlists to track your favorite stocks, sectors, or investment themes.
                  Our intelligent alerts keep you informed of important price movements and opportunities.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-3 mt-1">✓</span>
                    <div>
                      <strong className="text-white">Custom Lists</strong>
                      <p className="text-gray-400">Organize stocks by strategy, sector, or any criteria</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-3 mt-1">✓</span>
                    <div>
                      <strong className="text-white">Smart Alerts</strong>
                      <p className="text-gray-400">Price, volume, and AI-triggered notifications</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-3 mt-1">✓</span>
                    <div>
                      <strong className="text-white">Performance Tracking</strong>
                      <p className="text-gray-400">Monitor portfolio performance and rebalancing suggestions</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 p-8 rounded-2xl border border-purple-500/30">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-2xl font-bold mb-4">My Tech Watchlist</h3>
                <div className="space-y-3">
                  {[
                    { symbol: 'AAPL', name: 'Apple Inc.', change: '+2.4%', positive: true },
                    { symbol: 'MSFT', name: 'Microsoft', change: '+1.8%', positive: true },
                    { symbol: 'GOOGL', name: 'Alphabet', change: '-0.5%', positive: false },
                    { symbol: 'NVDA', name: 'NVIDIA', change: '+5.2%', positive: true },
                  ].map((stock) => (
                    <div key={stock.symbol} className="bg-gray-800/50 p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-bold">{stock.symbol}</div>
                        <div className="text-sm text-gray-400">{stock.name}</div>
                      </div>
                      <div className={stock.positive ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                        {stock.change}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* API Access Feature */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-gradient-to-br from-yellow-900/40 to-orange-900/40 p-8 rounded-2xl border border-yellow-500/30">
                <div className="text-6xl mb-4">🔌</div>
                <h3 className="text-2xl font-bold mb-3">RESTful API</h3>
                <div className="bg-gray-900/80 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="text-gray-500">// Get stock analysis</div>
                  <div className="text-blue-400">const</div> <span className="text-white">response</span> =
                  <div className="text-blue-400 ml-4">await</div> <span className="text-green-400">fetch</span>(
                  <div className="ml-4 text-yellow-300">'api.stockai.com/v1/analyze'</div>,
                  <div className="ml-2">{`{`}</div>
                  <div className="ml-4 text-purple-400">method:</div> <span className="text-yellow-300">'POST'</span>,
                  <div className="ml-4 text-purple-400">body:</div> <span className="text-white">JSON.stringify({`{`}</span>
                  <div className="ml-8 text-green-400">symbol:</div> <span className="text-yellow-300">'AAPL'</span>
                  <div className="ml-4">{`})`}</div>
                  <div className="ml-2">{`})`};</div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-block bg-yellow-600/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  DEVELOPER
                </div>
                <h2 className="text-4xl font-bold mb-6">
                  Powerful API Access
                </h2>
                <p className="text-gray-400 text-lg mb-6">
                  Integrate our AI-powered analysis engine directly into your applications, trading bots,
                  or investment platforms with our comprehensive REST API.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-3 mt-1">✓</span>
                    <div>
                      <strong className="text-white">RESTful Design</strong>
                      <p className="text-gray-400">Clean, well-documented API endpoints</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-3 mt-1">✓</span>
                    <div>
                      <strong className="text-white">Webhook Support</strong>
                      <p className="text-gray-400">Real-time event notifications to your systems</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-3 mt-1">✓</span>
                    <div>
                      <strong className="text-white">Rate Limits</strong>
                      <p className="text-gray-400">Generous rate limits for all subscription tiers</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-12 text-center border border-blue-500/30">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Experience These Features?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Start your 14-day free trial and discover how AI can transform your investment strategy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                Start Free Trial
              </Link>
              <Link
                href="/pricing"
                className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
