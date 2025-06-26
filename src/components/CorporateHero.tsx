
interface CorporateHeroProps {
  parallaxHeight: number;
  imageOffset: number;
  maxImageOffset: number;
}

const CorporateHero = ({ parallaxHeight }: CorporateHeroProps) => {
  return (
    <div
      className="w-full z-0 select-none pointer-events-none relative"
      style={{
        height: parallaxHeight,
        overflow: 'hidden',
      }}
    >
      <img
        src="/lovable-uploads/87ee64a5-46e8-4910-9307-369d9a2071bb.png"
        alt=""
        className="w-full h-full object-cover object-center pointer-events-none"
        style={{
          height: '100%',
          width: '100%',
          display: 'block',
          margin: 0,
          padding: 0,
          filter: 'brightness(0.97)',
          userSelect: 'none',
        }}
        draggable={false}
      />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(0,0,0,0.10)" }} />
    </div>
  );
};

export default CorporateHero;
