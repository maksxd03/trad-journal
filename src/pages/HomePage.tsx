import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors duration-200">
      <Navbar />
      
      <main>
        <Hero />
        <Features />
        <Pricing />
      </main>

      <Footer />
    </div>
  );
};

export default HomePage; 