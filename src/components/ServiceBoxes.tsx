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
    title: 'Föreställningar',
    subtitle: 'Med stor bredd och mycket skratt',
    cta: 'Kommande',
    link: '/forestallningar',
    image: '/uploads/images/Improvision2024.jpg',
  },
  {
    title: 'Kurser',
    subtitle: 'För dig som vill utvecklas på scen',
    cta: 'Utforska våra kurser',
    link: '/kurser',
    image: '/uploads/images/kurser_LIT_2024.jpg',
  },
  {
    title: 'Underhållning',
    subtitle: 'För företag och privata tillställningar',
    cta: 'Läs mer',
    link: '/boka-oss',
    image: '/uploads/images/corporate_LIT_2024.jpg',
  },
]

export default function ServiceBoxes() {
  return (
    <div className="grid grid-cols-1 min-[690px]:grid-cols-3 gap-[15px] justify-items-center max-w-[930px] mx-auto">
      {services.map((svc, idx) => (
        <Link
          key={idx}
          to={svc.link}
          className="group flex flex-col bg-[#E7E7E7] overflow-hidden transition-transform duration-300 w-full cursor-pointer"
        >
          {/* Bild‐sektion = halva höjden */}
          <div className="relative h-[200px] lg:h-[250px] overflow-hidden aspect-[4/3]">
            <OptimizedImage
              src={svc.image}
              alt={svc.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              preferredSize="medium"
              responsive={true}
              sizes="(min-width: 690px) 33vw, 100vw"
              priority={false}
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Innehåll */}
          <div className="flex-1 px-4 py-6 flex flex-col justify-between text-center bg-[#E7E7E7]">
            <div className="space-y-2">
              <h1 className="text-center whitespace-nowrap">
                {svc.title}
              </h1>
              <p className="font-satoshi text-[16px] text-text-black leading-relaxed">
                {svc.subtitle}
              </p>
            </div>
            <div className="mt-4 mx-[10px]">
              <Button variant="homepage" size="homepage" className="flex justify-between items-center w-full pointer-events-none">
                <span className="leading-[1.0]">{svc.cta}</span>
                <span className="text-2xl font-bold">→</span>
              </Button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
