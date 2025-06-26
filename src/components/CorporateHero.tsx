const CorporateHero = () => {
  return (
    <div className="w-full relative overflow-hidden select-none pointer-events-none h-[400px] md:h-[620px] lg:h-[750px]">
      <img
        src="/lovable-uploads/87ee64a5-46e8-4910-9307-369d9a2071bb.png"
        alt=""
        className="w-full h-full object-cover object-center brightness-[0.97] select-none pointer-events-none"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
    </div>
  );
};

export default CorporateHero;
