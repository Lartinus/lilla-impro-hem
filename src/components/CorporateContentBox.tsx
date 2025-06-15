import React from 'react';

interface CorporateContentBoxProps {
  boxOffset: number;
}

const CorporateContentBox: React.FC<CorporateContentBoxProps> = ({ boxOffset }) => (
  <div
    className="relative z-10 w-full flex justify-center transition-transform duration-500"
    style={{
      transform: `translateY(-${boxOffset}px)`,
      transition: 'transform 0.45s cubic-bezier(.22,1.04,.79,1)',
    }}
  >
    <div className="w-full max-w-4xl px-3 md:px-5">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Välkommen till Lilla Improteatern
        </h1>
        <p className="text-gray-700">
          Vi är en teater som specialiserar oss på improvisationsteater. Hos oss kan du lära dig improvisation, se föreställningar och utvecklas som improvisatör.
        </p>
        <p className="text-gray-700">
          Våra kurser är öppna för alla nivåer, från nybörjare till erfarna improvisatörer. Vi erbjuder även workshops för företag och organisationer.
        </p>
        <p className="text-gray-700">
          Våra föreställningar är alltid unika och oförutsägbara. Vi spelar både klassisk improvisation och experimentella format.
        </p>
        <p className="text-gray-700">
          Välkommen till Lilla Improteatern!
        </p>
      </div>
    </div>
  </div>
);

export default CorporateContentBox;
