import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, Menu, X, Moon, Sun } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#1E1E2F]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#004E64] to-[#FF7F50] dark:from-[#00E5FF] dark:to-[#004E64] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1F2937] dark:text-[#E0E0E0]">
                TraderLog Pro
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
                Professional Trading Journal
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-[#E0E0E0]" />
              ) : (
                <Moon className="w-5 h-5 text-[#1F2937]" />
              )}
            </button>
            
            <Link
              href="/login"
              className="px-4 py-2 text-[#1F2937] dark:text-[#E0E0E0] hover:text-[#004E64] dark:hover:text-[#00E5FF] transition-colors font-medium"
            >
              Login
            </Link>
            
            <Link
              href="/app"
              className="px-6 py-2 bg-gradient-to-r from-[#004E64] to-[#FF7F50] dark:from-[#00E5FF] dark:to-[#004E64] text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
            >
              Começar
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-[#E0E0E0]" />
              ) : (
                <Moon className="w-5 h-5 text-[#1F2937]" />
              )}
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-[#1F2937] dark:text-[#E0E0E0]" />
              ) : (
                <Menu className="w-6 h-6 text-[#1F2937] dark:text-[#E0E0E0]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col space-y-3">
              <Link
                href="/login"
                className="px-4 py-2 text-[#1F2937] dark:text-[#E0E0E0] hover:text-[#004E64] dark:hover:text-[#00E5FF] transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              
              <Link
                href="/app"
                className="mx-4 px-6 py-3 bg-gradient-to-r from-[#004E64] to-[#FF7F50] dark:from-[#00E5FF] dark:to-[#004E64] text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Começar
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;