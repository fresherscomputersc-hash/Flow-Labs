import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Flow HQ — Founder Console | The Flow Labs',
  robots: {
    index: false,
    follow: false,
  },
};

export default function FlowHqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
