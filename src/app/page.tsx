import { Contact } from '@/components/Contact/Contact';
import { Footer } from '@/components/Footer/Footer';
import { Header } from '@/components/Header/Header';
import { Hero } from '@/components/Hero/Hero';
import { Map } from '@/components/Map/Map';
import { Services } from '@/components/Services/Services';

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <Services />
      <Contact />
      <Map />
      <Footer />
    </main>
  );
}
