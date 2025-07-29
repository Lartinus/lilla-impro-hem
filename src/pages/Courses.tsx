// src/pages/Courses.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseGrid from '@/components/CourseGrid';
import CourseCardSkeleton from '@/components/CourseCardSkeleton';
import { InterestSignupSection } from '@/components/InterestSignupSection';
import { useEffect } from 'react';
import { useAdminCourses } from '@/hooks/useAdminCourses';

const Courses = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: adminCourses, isLoading: adminLoading } = useAdminCourses();
  const courses = adminCourses || [];
  const practicalInfo = ['Kommer inom kort.'];

  // Laddnings-skelett
  if (adminLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
        <Header />
        <div className="h-[360px] overflow-hidden">
          <img
            src="/uploads/images/kurser_LIT_2024.jpg"
            alt="Kurser på Lilla Improteatern"
            className="w-full h-[360px] object-cover object-center"
          />
        </div>
        <div className="relative z-10 mx-4 md:mx-auto max-w-[1000px] -mt-8">
          <div className="bg-[#F3F3F3] pb-0">
            <div className="p-6 md:p-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, index) => (
                  <CourseCardSkeleton key={index} />
                ))}
              </div>
              <div className="text-center text-gray-600 text-sm mt-8">
                Laddar kurser...
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] overflow-x-hidden">
      <Header />

      {/* Header-bild */}
      <div className="h-[360px] overflow-hidden">
        <img
          src="/uploads/images/kurser_LIT_2024.jpg"
          alt="Kurser på Lilla Improteatern"
          className="w-full h-[360px] object-cover object-center"
          style={{ filter: 'brightness(0.5)' }}
        />
      </div>

      {/* Vitt kort med kurs-översikt */}
      <div className="relative z-10 mx-0 md:mx-auto max-w-[1000px] -mt-16">
        <div className="bg-[#F3F3F3] rounded-t-lg overflow-hidden">
          <div className="p-6 md:p-8 space-y-8">
            {/* Om våra kurser */}
            <section>
              <h1>Om våra kurser</h1>
              <p>
                Lilla Improteatern är platsen för dig som vill utvecklas som
                improvisatör och bli skickligare på att spela roliga scener
                tillsammans med andra. Improv Comedy är ett hantverk. Med flera
                års erfarenhet som improvisatörer och pedagoger har vi skapat
                ett kurssystem som tar dig från grundläggande scenarbete till
                långform och ensemblearbete. Våra kurser bygger på Game of the
                scene och ger dig konkreta verktyg, massor av träning, scentid
                och återkoppling.
              </p>
            </section>

            {/* Aktuella kurser */}
            <section>
              <h1>Aktuella kurser</h1>
              <CourseGrid courses={courses} practicalInfo={practicalInfo} />
            </section>

            {/* Interest signup */}
            <InterestSignupSection />
          </div>

          {/* Grå info-ruta */}
          <div className="w-full bg-[#D9D9D9]">
            <div className="px-4 md:px-0 md:mx-auto md:max-w-[936px] py-8">
              <section className="space-y-6">
                <h2 className="font-tanker text-[32px] underline mb-4">
                  För dig som vill bli duktig på hantverket
                </h2>
                <div className="space-y-4 text-[16px] font-satoshi">
                  <p>
                    Lilla Improteatern är platsen för dig som vill bli
                    skickligare på att skapa roliga scener tillsammans med
                    andra. Här lär du dig inte bara hur man improviserar — du
                    förstår varför det funkar, vad som gör en scen rolig och
                    hur du skapar det tillsammans med andra.
                  </p>
                  <p>
                    Improv comedy är ett hantverk. Genom ett tydligt pedagogiskt
                    upplägg förankrat i många års erfarenhet som både
                    improvisatörer och pedagoger erbjuder vi ett kurssystem som
                    sträcker sig från grundläggande scenträning till
                    långformsformat och ensemblearbete. Hos oss lär du dig att
                    spela komiska scener med glädje, tydliga verktyg och ett
                    fokus på samspelet.
                  </p>
                  <p>
                    Vår undervisning bygger på att steg för steg utveckla dina
                    färdigheter som improvisatör, där vi förstår vad som är kul.
                    Inte genom att tvinga fram skämt, utan genom att spela scener
                    som känns levande, enkla och roliga i stunden.
                  </p>
                  <p>
                    Vi tränar dig i att upptäcka det roliga och följa det i en
                    lekfull struktur där du får växa som improvisatör.
                  </p>
                </div>

                <h3 className="font-tanker text-[24px] mb-2">
                  Behöver jag erfarenhet sedan tidigare?
                </h3>
                <p className="text-[16px] font-satoshi mb-2">
                  Du är välkommen oavsett om du är nybörjare, vill utvecklas som
                  komisk scenperson eller redan är rutinerad. För oss är det
                  viktigaste att du vill utvecklas som scenimprovisatör.
                </p>
                <p className="text-[16px] font-satoshi">Hos oss får du:</p>
                <ul className="list-disc list-inside space-y-2 text-[16px] font-satoshi">
                  <li>Konkreta verktyg för att skapa humor på scen</li>
                  <li>Träning i lyssnande, timing och scenspråk</li>
                  <li>Scentid och feedback</li>
                </ul>
              </section>
            </div>
          </div>

          {/* Luft innan footer */}
          <div className="h-12" />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Courses;
