// src/pages/ShowDetails.tsx
import Header from '@/components/Header';
import ShowDetailsHeader from '@/components/ShowDetailsHeader';
import ShowDetailsContent from '@/components/ShowDetailsContent';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useShow, useShows } from '@/hooks/useStrapi';
import { formatStrapiShow } from '@/utils/strapiHelpers';

const ShowDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  useEffect(() => { window.scrollTo(0,0); }, []);

  const { data: showData, isLoading, error } = useShow(slug || '');
  const { data: allShowsData } = useShows();

  const show = showData?.data?.[0] ? formatStrapiShow(showData.data[0]) : null;
  const allShows = allShowsData?.data?.map(formatStrapiShow).filter(Boolean) || [];
  const otherShows = show ? allShows.filter(s => s.slug !== slug) : [];

  if (isLoading || !show) {
    return <div className="…">…Loading/Snackbar…</div>;
  }
  if (error) {
    return <div className="…">…Error…</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br …">
      <Header />
      <ShowDetailsHeader showsUrl="/shows" />
      <main className="px-4 md:px-0 max-w-4xl mx-auto space-y-8">
        <ShowDetailsContent show={show} otherShows={otherShows} />
      </main>
    </div>
  );
};

export default ShowDetails;
