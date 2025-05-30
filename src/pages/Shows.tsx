
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const Shows = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const shows = [
    {
      id: 1,
      title: "Lilla improteaterns ensemble",
      date: "27 oktober 19.00",
      location: "Metropole",
      slug: "ensemble-27-oktober",
      image: "/lovable-uploads/82e4b7c8-bf74-423f-a1d4-d94f33f7ae8b.png"
    },
    {
      id: 2,
      title: "Improviserad komedi",
      date: "15 november 20.00", 
      location: "Teater Galeasen",
      slug: "improkomedi-15-november",
      image: "/lovable-uploads/1287edaf-8412-4d2b-b6e4-b6fb8426185d.png"
    },
    {
      id: 3,
      title: "Julspecial - Improkomedi",
      date: "8 december 18.30",
      location: "Södra Teatern",
      slug: "julspecial-8-december",
      image: "/lovable-uploads/4ab70355-63ab-4d68-bfd3-3a2659550888.png"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      
      {/* Hero */}
      <section className="px-0.5 md:px-4 mt-20 py-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-theatre-light tracking-normal mb-4">
            Föreställningar
          </h1>
        </div>
      </section>

      {/* Shows Grid */}
      <section className="py-2 px-0.5 md:px-4 pb-8 animate-fade-in">
        <div className="grid gap-6 mb-6 mx-[12px] md:mx-0 md:max-w-4xl md:mx-auto">
          {shows.map((show) => (
            <Link key={show.id} to={`/shows/${show.slug}`} className="block">
              <div className="border-4 border-white bg-white rounded-none p-0 hover:shadow-lg transition-all duration-300 group flex">
                <div className="flex-1 p-6">
                  <h2 className="text-blue-500 font-bold text-lg mb-1">
                    {show.title} {show.date}
                  </h2>
                  <div className="flex items-center mb-3">
                    <MapPin size={16} className="text-gray-600 mr-2" />
                    <p className="text-gray-600">{show.location}</p>
                  </div>
                  <div className="text-blue-500 group-hover:text-blue-700 transition-colors">
                    <span className="text-sm">Läs mer →</span>
                  </div>
                </div>
                <div className="w-64 flex-shrink-0">
                  <img 
                    src={show.image} 
                    alt={show.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Shows;
