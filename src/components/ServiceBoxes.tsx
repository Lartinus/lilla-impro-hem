import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import OptimizedImage from '@/components/OptimizedImage'

interface Service {
  title: string
  subtitle: string
  cta: string
  link: string
  image: string
}

const services: Service[] = [
  {
    title: 'Kurser',
    subtitle: 'För dig som vill utvecklas på scen',
    cta: 'Utforska våra kurser',
    link: '/kurser',
    image: '/uploads/images/kurser_LIT_2024.jpg',
  },
  {
    title: 'Föreställningar',
    subtitle: 'Med stor bredd och mycket skratt',
    cta: 'Kommande föreställningar',
    link: '/shows',
    image: '/uploads/images/Improvision2024.jpg',
  },
  {
    title: 'Underhållning',
    subtitle: 'För företag och privata tillställningar',
    cta: 'Läs mer',
    link: '/anlita-oss',
    image: '/uploads/images/corporate_LIT_2024.jpg',
  },
]

export default function ServiceBoxes() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-[15px] justify-items-center max-w-[930px] mx-auto">
      {services.map((svc, idx) => (
        <div
          key={idx}
          className="group flex flex-col bg-[#E7E7E7] overflow-hidden transition-transform duration-300 w-full max-w-[300px]"
        >
          {/* Bild‐sektion = halva höjden */}
          <div className="relative h-[200px] lg:h-[250px] overflow-hidden">
            <OptimizedImage
              src={svc.image}
              alt={svc.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              preferredSize="medium"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Innehåll */}
          <div className="flex-1 p-6 flex flex-col justify-between text-center bg-[#E7E7E7]">
            <div className="space-y-2">
              <h2 className="font-tanker text-[28px] sm:text-[32px] lg:text-[40px] text-text-gray leading-tight">
                {svc.title}
              </h2>
              <p className="font-satoshi text-[16px] text-text-black leading-relaxed">
                {svc.subtitle}
              </p>
            </div>
            <div className="mt-4 flex justify-center">
              {svc.link.startsWith('/') ? (
                <Button asChild variant="homepage" size="homepage">
                  <Link to={svc.link} className="flex justify-between items-center w-full">
                    <span>{svc.cta}</span>
                    <span>→</span>
                  </Link>
                </Button>
              ) : (
                <Button variant="homepage" size="homepage" className="flex justify-between items-center w-full">
                  <span>{svc.cta}</span>
                  <span>→</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
