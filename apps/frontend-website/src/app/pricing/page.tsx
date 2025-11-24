import Link from 'next/link'

export default function PricingPage() {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-black min-h-screen">
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Choose the plan that fits your investment needs. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Free Tier */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 hover:border-gray-500 transition-all">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
                <p className="text-gray-400">Perfect for getting started</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">Up to 5 watchlist stocks</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">Basic stock analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">15-minute delayed data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">Email alerts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-600 mr-2">✗</span>
                  <span className="text-gray-500">AI predictions</span>
                </li>
              </ul>

              <Link
                href="/signup?plan=free"
                className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Basic Tier */}
            <div className="bg-gray-800/50 border border-blue-500 rounded-xl p-8 hover:border-blue-400 transition-all shadow-lg shadow-blue-500/20">
              <div className="mb-6">
                <div className="inline-block bg-blue-600 text-white text-sm px-3 py-1 rounded-full mb-3">
                  POPULAR
                </div>
                <h3 className="text-2xl font-bold mb-2">Basic</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-5xl font-bold">$9.99</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
                <p className="text-gray-400">For individual investors</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">Up to 25 watchlist stocks</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">Advanced AI analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">Real-time data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">SMS & email alerts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">AI price predictions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">Technical indicators</span>
                </li>
              </ul>

              <Link
                href="/signup?plan=basic"
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all shadow-lg"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-gray-800/50 border border-purple-500 rounded-xl p-8 hover:border-purple-400 transition-all shadow-lg shadow-purple-500/20">
              <div className="mb-6">
                <div className="inline-block bg-purple-600 text-white text-sm px-3 py-1 rounded-full mb-3">
                  BEST VALUE
                </div>
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-5xl font-bold">$29.99</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
                <p className="text-gray-400">For serious traders</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">Unlimited watchlists</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">Advanced AI models</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">Real-time data & news</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">Priority alerts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">Portfolio optimization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">API access (100 calls/day)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">Export reports</span>
                </li>
              </ul>

              <Link
                href="/signup?plan=pro"
                className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-all shadow-lg"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 hover:border-gray-500 transition-all">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-5xl font-bold">Custom</span>
                </div>
                <p className="text-gray-400">For institutions & teams</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">Everything in Pro</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">Unlimited API calls</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">Multi-user accounts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">Custom AI models</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">Dedicated support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">SLA guarantee</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">White-label options</span>
                </li>
              </ul>

              <Link
                href="/contact"
                className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-all"
              >
                Contact Sales
              </Link>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div className="bg-gray-800/30 rounded-xl p-8 border border-gray-700">
            <h2 className="text-3xl font-bold mb-8 text-center">Feature Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 font-semibold">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold">Free</th>
                    <th className="text-center py-4 px-4 font-semibold">Basic</th>
                    <th className="text-center py-4 px-4 font-semibold">Pro</th>
                    <th className="text-center py-4 px-4 font-semibold">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-4">Watchlist Stocks</td>
                    <td className="text-center py-4 px-4">5</td>
                    <td className="text-center py-4 px-4">25</td>
                    <td className="text-center py-4 px-4">Unlimited</td>
                    <td className="text-center py-4 px-4">Unlimited</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-4">Data Updates</td>
                    <td className="text-center py-4 px-4">15-min delay</td>
                    <td className="text-center py-4 px-4">Real-time</td>
                    <td className="text-center py-4 px-4">Real-time</td>
                    <td className="text-center py-4 px-4">Real-time</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-4">AI Predictions</td>
                    <td className="text-center py-4 px-4 text-gray-600">✗</td>
                    <td className="text-center py-4 px-4 text-green-500">✓</td>
                    <td className="text-center py-4 px-4 text-green-500">✓</td>
                    <td className="text-center py-4 px-4 text-green-500">✓</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-4">API Access</td>
                    <td className="text-center py-4 px-4 text-gray-600">✗</td>
                    <td className="text-center py-4 px-4 text-gray-600">✗</td>
                    <td className="text-center py-4 px-4">100/day</td>
                    <td className="text-center py-4 px-4">Unlimited</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-4">Portfolio Optimization</td>
                    <td className="text-center py-4 px-4 text-gray-600">✗</td>
                    <td className="text-center py-4 px-4 text-gray-600">✗</td>
                    <td className="text-center py-4 px-4 text-green-500">✓</td>
                    <td className="text-center py-4 px-4 text-green-500">✓</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4">Support</td>
                    <td className="text-center py-4 px-4">Community</td>
                    <td className="text-center py-4 px-4">Email</td>
                    <td className="text-center py-4 px-4">Priority</td>
                    <td className="text-center py-4 px-4">Dedicated</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
            <p className="text-gray-400 mb-6">
              Check out our FAQ or contact our sales team for more information.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
