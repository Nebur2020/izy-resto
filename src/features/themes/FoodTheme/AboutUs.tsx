import { useTranslation } from 'react-i18next';

interface IAboutUsProps {
  primaryColor?: string;
  sectionTitle: string;
  contentTitle: string;
  description: string;
  image: string;
  isDarkMode?: boolean;
}

export default function AboutUs(props: IAboutUsProps) {
  const { primaryColor, sectionTitle, contentTitle, description, image } =
    props;
  const { t } = useTranslation();

  return (
    <section className="container mx-auto px-4 py-16 flex flex-col lg:flex-row items-center">
      <div className="w-full lg:w-1/2 pr-0 lg:pr-12">
        <div className="text-left">
          <p
            className="text-xl font-light mb-4"
            style={{ color: primaryColor }}
          >
            {sectionTitle}
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            {contentTitle}
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 mt-10 lg:mt-0 relative flex justify-center">
        <div className="relative flex justify-center w-full max-w-[500px]">
          <div
            className="absolute -top-6 -right-6 md:-top-10 md:-right-10 z-0 opacity-50 bg-cover"
            style={{
              backgroundSize: 'cover',
              width: '60px',
              height: '60px',
            }}
          />

          <div className="bg-[#F5F3EF] rounded-full absolute -z-10 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />

          {/* Image du chef */}
          <div className="relative z-10 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px]">
            <img
              src={image}
              alt={t('foodtheme:chef-image-alt')}
              className="w-full h-full rounded-full object-cover shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
