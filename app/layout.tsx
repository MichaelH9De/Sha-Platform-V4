import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MEP Consultancy Platform',
  description: 'Secure project-control platform for UK MEP building services consultancy delivery.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
