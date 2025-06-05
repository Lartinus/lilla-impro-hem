
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import { usePrefetch } from '@/hooks/usePrefetch';

const Index = () => {
  // Prefetch critical data when user lands on homepage
  usePrefetch();

  return (
    <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <Header />
      <Hero />
      <Footer />
    </div>
  );
};

export default Index;
