
import Header from '@/components/Header';
import ServiceBoxes from '@/components/ServiceBoxes';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-theatre-secondary to-theatre-tertiary">
      <Header />

      <section className="min-h-screen flex flex-col justify-center px-0.5 relative overflow-hidden py-0 md:px-0">
        <div className="flex items-center justify-center min-h-screen my-[30px] py-[20px]">
          <div className="mt-12 md:mt-20 p-4 md:p-12 lg:p-16 text-left md:text-center space-y-4 bg-white mx-3 md:mx-0 md:max-w-5xl md:mx-auto">
            
            {/* Inledning */}
            <div className="mx-3 md:mx-0 md:max-w-6xl lg:max-w-7xl pb-1">
              <h1 className="mt-[10px] mb-[25px] md:mb-[30px]">
                Lilla improteatern är en plats för dig som vill lära dig, utöva och uppleva Improv&nbsp;Comedy.
              </h1>
              <div className="border-t border-gray-400 pt-[25px] md:pt-[10px] w-full lg:w-[90%] lg:mx-auto">
                <p className="text-base md:text-lg md:my-8">
                  Vi tror på att humor går att träna och att den blir allra bäst när vi skapar den tillsammans. 
                  På vår teater får du utvecklas som improvisatör i inspirerande kursmiljöer 
                  och ta del av roliga, smarta och lekfulla föreställningar.
                </p>
              </div>
            </div>

            {/* Tjänster/Service-sektionen */}
            <div className="space-y-4">
              <ServiceBoxes />
            </div>

            {/* Avslutande text */}
            <div className="bg-white text-left md:text-center">
              <div className="mx-3 md:mx-0 md:max-w-6xl lg:max-w-7xl py-[10px] pt-4">
                <p className="text-base md:text-lg">
                  Vi bygger med kvalitet, nyfikenhet och ett stort fokus på att göra improvisatörerna bättre och publiken gladare – och på att skapa ett community där du som elev, improvisatör och publik blir en del av något större. Välkommen till ett nytt hem för Improv Comedy i Stockholm.
                </p>
              </div>
            </div>

            {/* Mobil-only logotyp längst ner med vit bakgrund och mer avstånd */}
            <div className="block md:hidden absolute left-4 bottom-[-120px]">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <a href="/om-oss">
                  <img
                    src="/uploads/LIT_BoW_large.png"
                    alt="Lilla Improteatern logotyp"
                    className="h-[200px] cursor-pointer"
                    />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
