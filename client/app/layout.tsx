import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Codesarge',
  description: 'A small coding quiz for testing Codeverity.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
