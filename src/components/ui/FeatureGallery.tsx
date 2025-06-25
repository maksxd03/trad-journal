import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Gauge, BellRing } from 'lucide-react';

interface GalleryImage {
  id: number;
  title: string;
  icon: React.ElementType;
  bgColor: string;
  iconColor: string;
}

const FeatureGallery: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const images: GalleryImage[] = [
    {
      id: 1,
      title: 'Calendário de Trading',
      icon: Calendar,
      bgColor: 'bg-primary-100 dark:bg-primary-900/30',
      iconColor: 'text-primary-500 dark:text-primary-400'
    },
    {
      id: 2, 
      title: 'Simulador de Prop Firm',
      icon: Gauge,
      bgColor: 'bg-secondary-100 dark:bg-secondary-900/30',
      iconColor: 'text-secondary-500 dark:text-secondary-400'
    },
    {
      id: 3,
      title: 'Alertas de Drawdown',
      icon: BellRing,
      bgColor: 'bg-loss-100 dark:bg-loss-900/30',
      iconColor: 'text-loss-500 dark:text-loss-400'
    }
  ];

  const nextSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="mb-16">
      <div className="relative mx-auto max-w-4xl">
        {/* Main Image */}
        <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden rounded-xl shadow-md mb-4">
          {images.map((image, index) => {
            const Icon = image.icon;
            return (
              <div
                key={image.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === activeIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <div className={`w-full h-full ${image.bgColor} flex flex-col items-center justify-center p-8`}>
                  <Icon className={`h-16 w-16 ${image.iconColor} mb-4`} />
                  <h3 className="text-xl font-semibold text-neutral-800 dark:text-white">{image.title}</h3>
                  <p className="text-center text-neutral-600 dark:text-neutral-300 max-w-md mt-2">
                    Visualize como o TraderLog Pro ajuda você a otimizar seus resultados com ferramentas intuitivas e poderosas.
                  </p>
                </div>
              </div>
            );
          })}

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-neutral-800/80 rounded-full p-2 text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 transition-colors shadow-sm"
            aria-label="Anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-neutral-800/80 rounded-full p-2 text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 transition-colors shadow-sm"
            aria-label="Próximo"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Thumbnails */}
        <div className="flex justify-center space-x-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === activeIndex
                  ? 'bg-primary-500 dark:bg-primary-400'
                  : 'bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 dark:hover:bg-neutral-500'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureGallery; 