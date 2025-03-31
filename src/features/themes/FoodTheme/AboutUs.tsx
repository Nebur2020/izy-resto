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

  return (
    <section className="container mx-auto">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-0 lg:gap-20 py-10 lg:py-20">
        <div>
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
        <div>
          <div className="relative z-10 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px]">
            <div className="bg-[#F5F3EF] rounded-full absolute -z-10 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            <img
              src={image}
              alt="Chef"
              className="w-full h-full rounded-full object-cover shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
