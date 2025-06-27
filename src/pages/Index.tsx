import Header from '@/components/Header';
import ServiceBoxes from '@/components/ServiceBoxes';
const Index = () => {
  return <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <Header />
      <section className="min-h-screen flex flex-col justify-center px-0.5 relative overflow-hidden py-0 md:px-0">
        <div className="flex items-center justify-center min-h-screen my-[30px] py-[20px]">
          {/* Mobil: mt-12, desktop: mt-20 för luft till header */}
          <div className="mt-12 md:mt-20 p-4 md:p-12 lg:p-16 text-left space-y-4 bg-white mx-3 md:mx-0 md:max-w-5xl md:mx-auto">
            
            {/* Beskrivning */}
            <div className="max-w-4xl space-y-2 pb-1">
              <h1 className="my-[5px]">
                Lilla Improteatern är en plats för dig som vill lära dig, utöva och uppleva Improv Comedy.
              </h1>
              <p className="text-base md:text-lg font-light leading-tight py-[10px]">
                Vi tror på att humor går att träna – och att den blir allra bäst när vi skapar den tillsammans. 
                På vår teater får du utvecklas som improvisatör i trygga och inspirerande kursmiljöer, 
                och ta del av roliga, smarta och lekfulla föreställningar.
              </p>
            </div>
            {/* Tjänster/Service-sektionen */}
            <div className="space-y-4">
              <ServiceBoxes />
            </div>
            <div className="bg-white">
            <p>
                Vi bygger med kvalitet, nyfikenhet och ett stort fokus på att göra improvisatörerna bättre och publiken gladare – och på att skapa ett community där du som elev, improvisatör och publik blir en del av något större. Välkommen till ett nytt hem för Improv Comedy i Stockholm.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>;
};
export default Index;