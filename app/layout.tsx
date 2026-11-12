
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/common/header";
import Footer from "@/components/common/footer";
import { ClerkProvider } from "@clerk/nextjs";
import PageTransition from "@/components/common/page-transition";
import BgGradient from "@/components/common/bg-gradient";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Revisecards",
  description: "A flashcard app to help you learn anything.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          
          <BgGradient />
          <BgGradient className="top-auto bottom-[-20rem] rotate-[210deg] opacity-25" />
          <div className="relative flex min-h-screen flex-col">
            <Header />
            
            <PageTransition>{children}</PageTransition>
            <Footer />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
