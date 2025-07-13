"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FiTrendingUp, FiUsers, FiPackage, FiDollarSign, FiShield, FiZap, FiCheck, FiArrowRight } from "react-icons/fi";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-400">Business Tracker</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-blue-400 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-blue-400 transition-colors">Pricing</a>
              <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Track Your Business
                <br />
                <span className="text-white">Like Never Before</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Streamline your business operations with our comprehensive tracking system. 
                Manage lessees, inventory, payments, and records all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/login" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                <button className="border border-gray-600 hover:border-blue-400 text-gray-300 hover:text-blue-400 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300">
                  Watch Demo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">10K+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">$2M+</div>
              <div className="text-gray-400">Revenue Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-400 mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to
              <span className="text-blue-400"> Succeed</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Powerful features designed to streamline your business operations and boost productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-neutral-900/50 p-8 rounded-xl border border-neutral-800 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                <FiUsers className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Lessee Management</h3>
              <p className="text-gray-400">
                Track all your lessees in one centralized system. Manage contracts, payments, and communication efficiently.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-neutral-900/50 p-8 rounded-xl border border-neutral-800 hover:border-purple-500 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-6">
                <FiPackage className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Inventory Tracking</h3>
              <p className="text-gray-400">
                Monitor your inventory levels in real-time. Get alerts when stock is low and track item movements.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-neutral-900/50 p-8 rounded-xl border border-neutral-800 hover:border-pink-500 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-6">
                <FiDollarSign className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Payment History</h3>
              <p className="text-gray-400">
                Complete payment tracking and history. Generate reports and insights for better financial management.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-neutral-900/50 p-8 rounded-xl border border-neutral-800 hover:border-green-500 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-6">
                <FiTrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Analytics Dashboard</h3>
              <p className="text-gray-400">
                Powerful analytics and insights to help you make data-driven decisions for your business growth.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-neutral-900/50 p-8 rounded-xl border border-neutral-800 hover:border-yellow-500 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-6">
                <FiShield className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Secure & Reliable</h3>
              <p className="text-gray-400">
                Enterprise-grade security with 99.9% uptime. Your data is protected with bank-level encryption.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-neutral-900/50 p-8 rounded-xl border border-neutral-800 hover:border-red-500 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-6">
                <FiZap className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Lightning Fast</h3>
              <p className="text-gray-400">
                Optimized for speed and performance. Get instant access to your data with our fast-loading interface.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of businesses already using Business Tracker to streamline their operations.
          </p>
          <Link 
            href="/login" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2"
          >
            Get Started Today
            <FiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-blue-400 mb-4">Business Tracker</h3>
              <p className="text-gray-400">
                Streamline your business operations with our comprehensive tracking system.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-neutral-800 text-center text-gray-400">
            <p>&copy; 2024 Business Tracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
