
import ServiceBoxes from './ServiceBoxes';

const Hero = () => {
  return (
    <>
      <section className="min-h-screen flex flex-col justify-center py-12 px-0.5 md:px-4 relative overflow-hidden">
        {/* Noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        ></div>
        
        <div className="relative z-10">
          {/* Hero heading outside the box */}
          <section className="px-0.5 md:px-4 mt-20 py-6">
            <div className="text-center">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-theatre-light tracking-normal mb-4">
                Lilla Improteatern är en plats för dig som vill lära dig, utöva och uppleva Improv Comedy.
              </h1>
            </div>
          </section>

          <div className="text-left space-y-4 p-12 md:p-16 lg:p-20 bg-white mx-3 md:mx-0 md:max-w-5xl md:mx-auto">
            {/* Description */}
            <div className="max-w-4xl space-y-2">
              <p className="text-sm md:text-lg leading-relaxed text-gray-700 font-light">
                Vi tror på att humor går att träna – och att den blir allra bäst när vi skapar den tillsammans. 
                På vår teater får du utvecklas som improvisatör i trygga, tydliga och inspirerande kursmiljöer, 
                och samtidigt ta del av roliga, smarta och lekfulla föreställningar.
              </p>
            </div>

            {/* Services section */}
            <div className="space-y-4">
              <ServiceBoxes />
            </div>

            {/* Mission statement */}
            <div className="max-w-4xl space-y-3 pt-4">
              <p className="text-sm md:text-lg leading-relaxed text-gray-700 font-light">
                Vi bygger långsamt, med kvalitet, nyfikenhet och ett stort fokus på att göra 
                improvisatörerna bättre och publiken gladare – och på att skapa ett community 
                där du som elev, improvisatör och publik blir en del av något större.
              </p>
              <p className="text-sm md:text-lg leading-relaxed text-gray-700 font-light">
                Välkommen till ett nytt hem för Improv Comedy i Stockholm.
              </p>
            </div>
          </div>

          {/* Video section moved back to red background */}
          <div className="mt-8 mx-3 md:mx-0 md:max-w-5xl md:mx-auto">
            <div className="space-y-8 border-4 border-white p-8 md:p-6 lg:p-12 bg-white">
              <div className="text-center space-y-4">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-gray-800 tracking-normal mb-4">
                  Vad är improv comedy egentligen?
                </h1>
                <h3 className="text-theatre-secondary font-medium mb-4 max-w-2xl mx-auto">
                  Upptäck konstformen som bygger på spontanitet, kreativitet och samarbete.
                </h3>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((video) => (
                  <div key={video} className="group">
                    <div className="bg-red-700 backdrop-blur-sm border border-theatre-primary/20 rounded-2xl p-6 hover:bg-red-800 transition-all duration-500 hover:border-theatre-primary/30 hover:transform hover:scale-105 aspect-video flex items-center justify-center">
                      <div className="text-centre space-y-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                          <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
                        </div>
                        <p className="text-white text-sm font-light">
                          Video {video}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
