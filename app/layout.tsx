import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SkillFit AI — Workforce Assessment for Karnataka',
  description: 'AI-powered multilingual video interview and assessment platform for Karnataka workforce fitment',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
