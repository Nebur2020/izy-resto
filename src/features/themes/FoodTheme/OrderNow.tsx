interface IOrderNowProps {
  primaryColor?: string;
  isDarkMode?: boolean;
  discountTitle?: string;
  description?: string;
  buttonText?: string;
}

export default function OrderNow(props: IOrderNowProps) {
  const { primaryColor, isDarkMode, discountTitle, description, buttonText } =
    props;

  return (
    <section className="text-white min-h-[500px] flex items-center relative overflow-hidden">
      <div className="container mx-auto px-4 z-10 text-center">
        <div
          className="text-base font-medium mb-4"
          style={{ color: primaryColor }}
        >
          {discountTitle}
        </div>
        <h1
          className={`text-5xl font-bold max-w-3xl mx-auto mb-8 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          {description}
        </h1>

        <button
          className="px-8 py-3 rounded-full text-lg font-semibold 
          hover:opacity-90 transition-all"
          style={{
            backgroundColor: primaryColor,
            color: isDarkMode ? 'black' : 'white',
          }}
          onClick={() => {
            document
              .getElementById('product-list')
              ?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          {buttonText}
        </button>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-0 opacity-20">
          <div className="bg-white opacity-10 w-32 h-32 rounded-full"></div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-20">
          <div className="bg-white opacity-10 w-48 h-48 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
