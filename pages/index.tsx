import React from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Head>
        <title>TraderLog Pro - Seu Trading Journal Inteligente</title>
        <meta name="description" content="Journal de trading profissional com simulador de prop firm, alertas de drawdown e métricas de disciplina para traders de Forex." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-[rgb(245,247,250)] dark:bg-[#1E1E2F] transition-colors duration-300">
        <Navbar />
        <main>
          <Hero />
          <Features />
          <Pricing />
        </main>
        <Footer />
      </div>
    </>
  );
}