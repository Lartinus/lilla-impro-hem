// src/pages/Index.tsx
import Header from '@/components/Header';
import ServiceBoxes from '@/components/ServiceBoxes';
import { NewsletterSignupModal } from '@/components/NewsletterSignupModal';
import { ArrowDown } from 'lucide-react';
import { useState } from 'react';

export default function Index() {
  const [newsletterModalOpen, setNewsletterModalOpen] = useState(false);

  return (
    <div className="relative bg-background min-h-screen">
      <Header />

      {/* 1) Statisk hero‐bild */}
      <div
        className="
          absolute inset-x-0
          top-[56px] lg:top-[112px]
          h-[530px]
          bg-[url('/uploads/images/parallax/ParallaxImage1.jpg')]
          bg-cover bg-center
          rounded-b-[10px]
          z-0
        "
      />

      {/* 2) Tagline + pil, centrerat mot box-containern */}
      <div className="relative z-10 mt-[500px] lg:mt-[550px] flex flex-col items-center">
        <h3
          className="
            font-rajdhani text-[16px]
            text-white text-center
            w-[355px] leading-tight
          "
        >
          Vi är en plats för dig som vill lära dig,<br/>
          utöva och uppleva Improv Comedy.
        </h3>

        {/* Pil endast på mobil */}
        <span className="block mt-4 md:hidden">
          <ArrowDown size={24} strokeWidth={2} className="text-white animate-bounce" />
        </span>
      </div>

      {/* 3) Vitt kort med service-boxar */}
      <section className="relative z-10 mt-[580px] px-4 md:px-0">
        <div className="mx-auto max-w-6xl bg-card-background rounded-[10px] p-6 md:p-12 lg:p-16">
          <ServiceBoxes />
        </div>
      </section>

      <NewsletterSignupModal
        open={newsletterModalOpen}
        onOpenChange={setNewsletterModalOpen}
      />
    </div>
  );
}
