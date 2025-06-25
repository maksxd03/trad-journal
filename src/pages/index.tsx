import React from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors duration-200">
      <Head>
        <title>TraderLog Pro - Seu Diário de Trading Inteligente</title>
        <meta name="description" content="Potencialize seus resultados no trading com o TraderLog Pro. Journal inteligente, métricas avançadas, alertas de drawdown e feedback de IA." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

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

export default Home; 