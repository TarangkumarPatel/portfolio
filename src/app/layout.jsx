import { Inter, Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700', '800', '900']
});

const displayFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700', '800']
});

const heroFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-hero',
  weight: ['500', '600', '700']
});

export const metadata = {
  title: 'Tarangkumar Patel | Portfolio',
  description: 'Digital excellence and technical architecture.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${displayFont.variable} ${heroFont.variable}`}>
      <body className="font-sans antialiased bg-[#050505] text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
