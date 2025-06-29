
import Header from '@/components/Header';
import CourseGrid from '@/components/CourseGrid';
import CourseCardSkeleton from '@/components/CourseCardSkeleton';
import { useEffect, useMemo } from 'react';
import { useCourses } from '@/hooks/useStrapi';
import { formatStrapiCourse, sortCourses } from '@/utils/strapiHelpers';
import SimpleParallaxHero from "@/components/SimpleParallaxHero";
import { convertMarkdownToHtml, convertMarkdownToHtmlForRedBox } from '@/utils/markdownHelpers';

const Courses = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Use only the courses query, not the parallel one
  const { data, isLoading, error } = useCourses();

  console.log('Courses page - Data:', data);

  // Memoize formatted and sorted courses to avoid recalculating
  const courses = useMemo(() => {
    if (!data) return [];
    
    const formattedCourses = data?.data ? data.data.map(formatStrapiCourse).filter(Boolean) : [];
    const sortedCourses = sortCourses(formattedCourses);
    
    return sortedCourses;
  }, [data]);

  console.log('Formatted courses:', courses);

  // Hardcoded course main info (previously fetched from API)
  const hardcodedMainInfo = {
    info: `Vi erbjuder kurser inom Improv Comedy för alla nivåer – från nybörjare till erfarna improvisatörer. Våra kurser fokuserar på att utveckla din kreativitet, spontanitet och förmåga att samarbeta på scen.

Alla kurser leds av erfarna improvisatörer och pedagoger som brinner för att dela med sig av sina kunskaper. Vi tror på learning by doing och att humor utvecklas bäst i en trygg och stödjande miljö.`,

    redbox: `**Observera:** Kurserna är populära och platser fyller på snabbt. Vi rekommenderar att du anmäler dig i god tid för att säkra din plats.

**Kursmaterial:** Allt material ingår i kursavgiften. Du behöver bara ta med dig nyfikenhet och lust att lära!`,

    infoAfterRedbox: `Efter avslutad kurs får du möjlighet att fortsätta utvecklas inom vårt community. Vi erbjuder även fortsättningskurser och workshops för dig som vill fördjupa dina kunskaper ytterligare.

Har du frågor om våra kurser? Kontakta oss så hjälper vi dig att hitta rätt kurs för din nivå och dina mål.`
  };

  // Fallback practical info if course doesn't have its own
  const practicalInfo = [
    "Kommer inom kort."
  ];

  // Show loading state with skeletons
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary">
        <Header />
        <section className="py-8 px-0.5 md:px-4 pb-8 mt-20 flex-1">
          <div className="grid md:grid-cols-2 gap-6 mb-6 mx-[12px] md:mx-0 md:max-w-5xl md:mx-auto">
            {[...Array(4)].map((_, index) => (
              <CourseCardSkeleton key={index} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    console.error('Error loading data:', error);
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Ett fel uppstod vid laddning av kurser. Testa igen!</div>
        </div>
      </div>
    );
  }

  // Convert markdown to HTML for the hardcoded content
  const htmlInfo = convertMarkdownToHtml(hardcodedMainInfo.info);
  const htmlRed = convertMarkdownToHtmlForRedBox(hardcodedMainInfo.redbox);
  const htmlAfter = convertMarkdownToHtml(hardcodedMainInfo.infoAfterRedbox);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary relative overflow-x-hidden overflow-y-visible">
      <Header />
      <SimpleParallaxHero imageSrc="/uploads/images/kurser_LIT_2024.jpg" />
      <section className="py-8 px-0.5 md:px-4 pb-8 mt-0 flex-1 relative z-10" style={{ paddingTop: "220px" }}>
        <CourseGrid courses={courses} practicalInfo={practicalInfo} />
        
        {/* Hardcoded course info section (previously CourseInfoSection component) */}
        <section className="flex justify-center px-4 md:px-0 mt-12">
          <div className="bg-white max-w-3xl w-full p-8 shadow-lg rounded-none space-y-12">
            {/* Första textblocket */}
            {htmlInfo && (
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: htmlInfo }}
              />
            )}

            {/* Röd callout med vit text */}
            {htmlRed && (
              <div
                className="bg-[#772424] p-6 rounded-none text-white [&>*]:text-white [&>p]:text-white [&>h1]:text-white [&>h2]:text-white [&>h3]:text-white [&>h4]:text-white [&>h5]:text-white [&>h6]:text-white"
                dangerouslySetInnerHTML={{ __html: htmlRed }}
              />
            )}

            {/* Avslutande textblock */}
            {htmlAfter && (
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: htmlAfter }}
              />
            )}
          </div>
        </section>
      </section>
    </div>
  );
};

export default Courses;
