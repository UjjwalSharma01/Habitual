import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from '@/context/AuthContext';
import OnboardingProvider from '@/context/OnboardingContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Habitual - Habit Tracker",
  description: "Track your habits and build a better you",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-200`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <OnboardingProvider>
            {children}
          </OnboardingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
