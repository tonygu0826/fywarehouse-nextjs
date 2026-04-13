import type { ReactNode } from 'react';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';

export default function FrNewsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main style={{ minHeight: '60vh', paddingTop: '24px', paddingBottom: '48px' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
