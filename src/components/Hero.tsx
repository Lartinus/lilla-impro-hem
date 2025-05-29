
import ServiceBoxes from './ServiceBoxes';

const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col justify-center py-20 px-6 relative overflow-hidden">
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>
      
      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="text-left space-y-16">
          {/* Main heading */}
          <div className="space-y-8">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-normal leading-tight text-theatre-light tracking-normal">
              Lilla Improteatern är en plats för dig som vill lära dig, utöva och uppleva Improv Comedy.
            </h1>
          </div>

          {/* Description */}
          <div className="max-w-4xl space-y-6">
            <p className="text-lg md:text-xl leading-relaxed text-theatre-light/90 font-light">
              Vi tror på att humor går att träna – och att den blir allra bäst när vi skapar den tillsammans. 
              På vår teater får du utvecklas som improvisatör i trygga, tydliga och inspirerande kursmiljöer, 
              och samtidigt ta del av roliga, smarta och lekfulla föreställningar.
            </p>
          </div>

          {/* Services section */}
          <div className="space-y-12">
            <ServiceBoxes />
          </div>

          {/* Mission statement */}
          <div className="max-w-4xl space-y-8 pt-16">
            <p className="text-lg md:text-xl leading-relaxed text-theatre-light/90 font-light">
              Vi bygger långsamt, med kvalitet, nyfikenhet och ett stort fokus på att göra 
              improvisatörerna bättre och publiken gladare – och på att skapa ett community 
              där du som elev, improvisatör och publik blir en del av något större.
            </p>
            <p className="text-lg md:text-xl leading-relaxed text-theatre-light/90 font-light">
              Välkommen till ett nytt hem för Improv Comedy i Stockholm.
            </p>
          </div>

          {/* Video section */}
          <div className="max-w-4xl space-y-12 pt-20">
            <div className="text-center space-y-4">
              <h3 className="text-3xl md:text-4xl font-medium text-theatre-light">
                Vad är improv comedy egentligen?
              </h3>
              <p className="text-lg text-theatre-light/80 font-light max-w-2xl mx-auto">
                Upptäck konstformen som bygger på spontanitet, kreativitet och samarbete.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((video) => (
                <div key={video} className="group">
                  <div className="bg-theatre-light/10 backdrop-blur-sm border border-theatre-light/20 rounded-2xl p-6 hover:bg-theatre-light/15 transition-all duration-500 hover:border-theatre-light/30 hover:transform hover:scale-105 aspect-video flex items-center justify-center">
                    <div className="text-centre space-y-4">
                      <div className="w-16 h-16 bg-theatre-light/20 rounded-full flex items-center justify-center mx-auto">
                        <div className="w-0 h-0 border-l-[12px] border-l-theatre-light border-y-[8px] border-y-transparent ml-1"></div>
                      </div>
                      <p className="text-theatre-light/80 text-sm font-light">
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
  );
};

export default Hero;
