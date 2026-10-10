import { HeroBanner } from '@/features/hero-banner';
import { HomeSections } from '@/features/home-sections';

export default function Home() {
  return (
    <>
      <HeroBanner />
      <main className="px-md py-lg">
        <HomeSections />
      </main>
    </>
  );
}
