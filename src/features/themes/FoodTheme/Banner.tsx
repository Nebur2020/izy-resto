import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFoodTheme } from './context/FoodThemeContext';

interface BannerProps {
  images: string[];
  primaryColor?: string;
  secondaryColor?: string;
  buttonText?: string;
  isDarkMode?: boolean;
  slides: Array<{
    title: string;
    subtitle: string;
  }>;
}

export default function Banner(props: BannerProps) {
  const { t } = useTranslation();
  const { images, primaryColor, buttonText, slides } = props;
  const [currentSlide, setCurrentSlide] = useState(0);
  const themeConfig = useFoodTheme();
  const bannerButtonText =
    buttonText || themeConfig.banner.buttonText || t('hero:view-menu');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + images.length) % images.length);
  };

  return (
    <section className="relative h-screen overflow-hidden">
      {images.map((image, index) => (
        <motion.div
          key={index}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${image})`,
            opacity: index === currentSlide ? 1 : 0,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: index === currentSlide ? 1 : 0,
          }}
          transition={{ duration: 0.8 }}
        />
      ))}

      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 container mx-auto h-full flex items-center justify-center text-center overflow-hidden">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.8 }}
          className="text-white max-w-3xl px-4"
        >
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 text-white">
            {slides[currentSlide].title}
          </h1>
          <p className="text-lg md:text-xl mb-8 whitespace-pre-line text-white">
            {slides[currentSlide].subtitle}
          </p>
          <div className="w-full flex justify-center">
            <motion.button
              className="flex justify-center lg:justify-start items-center font-bold text-lg rounded-full mt-4 px-5 lg:px-7 py-4 lg:py-5 mx-auto lg:mx-0"
              style={{ backgroundColor: primaryColor }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              onClick={() => {
                document
                  .getElementById('product-list')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <ShoppingCart color="#fff" />
              <span className="text-white ml-2">{bannerButtonText}</span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 rounded-full p-2 backdrop-blur-sm"
      >
        <ChevronLeft size={24} color="white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 rounded-full p-2 backdrop-blur-sm"
      >
        <ChevronRight size={24} color="white" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
