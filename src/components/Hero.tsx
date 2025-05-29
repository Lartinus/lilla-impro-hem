
import ServiceBoxes from './ServiceBoxes';

const Hero = () => {
  return (
    <section className="py-16 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-left space-y-8">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight text-white">
            Lilla Improteatern är en plats för dig som vill lära dig, utöva och uppleva Improv Comedy.
          </h1>

          <p className="text-lg md:text-xl leading-relaxed text-white/90 font-light">
            Vi tror på att humor går att träna – och att den blir allra bäst när vi skapar den tillsammans. På vår teater får du utvecklas som improvisatör i trygga, tydliga och inspirerande kursmiljöer, och samtidigt ta del av roliga, smarta och lekfulla föreställningar.
          </p>

          <div className="space-y-6">
            <p className="text-lg text-white font-medium">Här hittar du:</p>
            <ServiceBoxes />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
