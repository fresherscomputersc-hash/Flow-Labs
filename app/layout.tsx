import type { Metadata } from 'next';
import './globals.css';
import { Dock } from '@/components/navigation/Dock';
import { Footer } from '@/components/navigation/Footer';

export const metadata: Metadata = {
  title: 'The Flow Labs — Interfaces, Scaled Systems & Applied Intelligence',
  description:
    'A founder-led digital engineering studio in Bhubaneswar. We design, build and ship interfaces, scaled systems and applied intelligence in-house. Four builds a month.',
  metadataBase: new URL('https://www.theflowlabs.online'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'The Flow Labs — Interfaces, Scaled Systems & Applied Intelligence',
    description: 'A founder-led digital engineering studio. Four builds a month, 100% in-house.',
    url: 'https://www.theflowlabs.online',
    siteName: 'The Flow Labs',
    images: ['/assets/work-droovee.png'],
    locale: 'en_IN',
    type: 'website',
  },
  icons: {
    icon: '/assets/favicon.svg',
    apple: '/assets/icon-180.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-[#07090E] text-[#F8FAFC] antialiased selection:bg-neon-cyan/30 selection:text-white relative">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:px-4 focus:py-2 focus:bg-cyan-400 focus:text-slate-950 focus:font-mono focus:text-xs focus:font-semibold focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-300"
        >
          Skip to content
        </a>
        <Dock />
        <main id="main" className="relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
