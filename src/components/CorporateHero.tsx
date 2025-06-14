
import { RefObject } from "react";

interface CorporateHeroProps {
  parallaxHeight: number;
  imageOffset: number;
  maxImageOffset: number;
}

const CorporateHero = ({
  parallaxHeight,
  imageOffset,
  maxImageOffset
}: CorporateHeroProps) => (
  <div
    className="w-full z-0 select-none pointer-events-none relative"
    style={{
      height: parallaxHeight,
      transform: `translateY(-${imageOffset}px)`,
      transition: "height 0.3s, transform 0.36s cubic-bezier(.22,1.04,.79,1)",
      overflow: 'hidden',
      maskImage: imageOffset >= maxImageOffset ? 'linear-gradient(to bottom, black 75%, transparent 100%)' : undefined
    }}
    aria-hidden="true"
  >
    <img
      src="/lovable-uploads/9e2e2703-327c-416d-8e04-082ee11225ea.png"
      alt=""
      className="w-full h-full object-cover object-center pointer-events-none"
      style={{
        height: '100%',
        width: '100%',
        display: 'block',
        margin: 0,
        padding: 0,
        filter: 'brightness(0.99)',
        willChange: 'transform',
        userSelect: 'none',
        transition: 'filter 0.2s'
      }}
      draggable={false}
    />
    <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(0,0,0,0.10)" }} />
  </div>
);

export default CorporateHero;
