
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseGrid from '@/components/CourseGrid';
import CourseCardSkeleton from '@/components/CourseCardSkeleton';
import CourseInfoSection from '@/components/CourseInfoSection';
import { InterestSignupSection } from '@/components/InterestSignupSection';
import { useEffect } from 'react';
import { useAdminCourses } from '@/hooks/useAdminCourses';
import SimpleParallaxHero from "@/components/SimpleParallaxHero";
import { useToast } from '@/hooks/use-toast';

const Courses = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: adminCourses, isLoading: adminLoading } = useAdminCourses();

  const courses = adminCourses || [];
  console.log('Admin courses:', courses);

  const practicalInfo = [
    "Kommer inom kort."
  ];

  // Show enhanced loading state with skeletons
  if (adminLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary">
        <Header />
        <div className="h-[360px] overflow-hidden">
          <SimpleParallaxHero imageSrc="/uploads/images/kurser_LIT_2024.jpg" />
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
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary relative overflow-x-hidden overflow-y-visible">
      <Header />
      <div className="h-[360px] overflow-hidden">
        <SimpleParallaxHero imageSrc="/uploads/images/kurser_LIT_2024.jpg" />
      </div>
      
      {/* Main content card overlapping the image */}
      <div className="relative z-10 mx-4 md:mx-auto max-w-[1000px] -mt-8">
        <div className="bg-[#F3F3F3] pb-0">
          <div className="p-6 md:p-8 space-y-8">
            
            {/* Om våra kurser */}
            <section>
              <h1>Om våra kurser</h1>
              <p>
                Lilla Improteatern är platsen för dig som vill utvecklas som improvisatör och bli skickligare på att spela roliga scener tillsammans med andra. 
                Improv Comedy är ett hantverk. Med flera års erfarenhet som improvisatörer och pedagoger har vi skapat ett kurssystem som tar dig från grundläggande scenarbete till långform och ensemblearbete. 
                Våra kurser bygger på Game of the scene och ger dig konkreta verktyg, massor av träning, scentid och återkoppling.
              </p>
            </section>

            {/* Aktuella kurser */}
            <section>
              <h1>Aktuella kurser</h1>
              <CourseGrid courses={courses} practicalInfo={practicalInfo} />
            </section>

            {/* Interest signup section */}
            <InterestSignupSection />
          </div>
        </div>

        {/* För dig som vill bli duktig på hantverket - separate gray box */}
        <div className="bg-[#D9D9D9] p-6 md:p-8">
          <section>
            <h1>För dig som vill bli duktig på hantverket</h1>
            <div className="space-y-4 mb-6">
              <p>
                Lilla Improteatern är platsen för dig som vill bli skickligare på att skapa roliga scener tillsammans med andra. Här lär du dig inte bara hur man improviserar - du förstår varför det funkar, vad som gör en scen rolig och hur du skapar det tillsammans med andra.
              </p>
              <p>
                Vi ser på improv comedy som ett hantverk. Genom ett tydligt pedagogiskt upplägg förankrat i många års erfarenhet som både improvisatörer och pedagoger erbjuder vi ett kurssystem som sträcker sig från grundläggande scenträning till långformsformat och ensemblearbete. Hos oss lär du dig att spela komiska scener med glädje, tydliga verktyg och ett fokus på samspelet.
              </p>
              <p>
                Vår undervisning bygger på att steg för steg utveckla dina färdigheter som improvisatör, där vi förstår vad som är kul. Inte genom att tvinga fram skämt, utan genom att spela scener som känns levande, enkla och roliga i stunden.
              </p>
              <p>
                Vi tränar dig i att upptäcka det roliga och följa det i en lekfull struktur där du får växa som improvisatör.
              </p>
            </div>

            <h2 className="mb-4">Behöver jag erfarenhet sedan tidigare?</h2>
            <p>
              Du är välkommen oavsett om du är nybörjare, vill utvecklas som komisk scenperson eller redan är rutinerad. För oss är det viktigaste att du vill utvecklas som scenimprovisatör.
            </p>
            <p>Hos oss får du:</p>
            <ul className="list-none pl-0 space-y-2">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-black rounded-full flex-shrink-0 mt-2"></div>
                <span>Konkreta verktyg för att skapa humor på scen</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-black rounded-full flex-shrink-0 mt-2"></div>
                <span>Träning i lyssnande, timing och scenspråk</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-black rounded-full flex-shrink-0 mt-2"></div>
                <span>Scentid och feedback</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Courses;
