import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { usePizzaTheme } from './context/PizzaThemeContext';

interface PartnerProps {
  logoPartners?: string[];
  isDarkMode?: boolean;
}

export default function Partner({ logoPartners, isDarkMode }: PartnerProps) {
  const { t } = useTranslation('pizzatheme');
  const themeConfig = usePizzaTheme();
  const [logos, setLogos] = useState<string[]>([]);

  // Default to theme context isDarkMode if not provided as prop

  useEffect(() => {
    // Use props if provided, otherwise fall back to theme context values
    setLogos(logoPartners || themeConfig.footer.logoPartners || []);
  }, [logoPartners, themeConfig.footer.logoPartners]);

  // Display nothing if there are no logos
  if (!logos.length) {
    return null;
  }

  return (
    <section
      className={`w-full px-6 py-16 ${isDarkMode ? 'bg-[#1A1A1A]' : ''}`}
    >
      <div className="container mx-auto">
        <div>
          <h2
            className={`text-2xl font-bold text-center mb-10 ${
              isDarkMode ? 'text-white' : ''
            }`}
          >
            {themeConfig.footer.partnerTitle}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 items-center justify-center justify-items-center">
            {logos.map((logo, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-[#1A1A1A] hover:bg-[#1A1A1A] hover:opacity-80'
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                <img
                  src={logo}
                  alt={`Partner ${index + 1}`}
                  className="max-w-[120px] sm:max-w-[150px] md:max-w-[180px] object-contain transition-transform hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
