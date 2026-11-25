import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scoping Cockpit & Project Estimator | The Flow Labs',
  description:
    'Calculate your build investment in seconds or select a tailored budget tier. Transparent scoping for MVPs, web platforms, and AI systems.',
  alternates: {
    canonical: '/scoping',
  },
  openGraph: {
    title: 'Scoping Cockpit & Project Estimator | The Flow Labs',
    description: 'Calculate your build investment in seconds or select a tailored budget tier.',
    url: 'https://www.theflowlabs.online/scoping',
  },
};

export default function ScopingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
