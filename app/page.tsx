import BgGradient from "@/components/common/bg-gradient";
import HeroSection from "@/components/home/hero-section";
import DemoSection from "@/components/home/demo-section";
import HowItWorksSection from "@/components/home/how-it-works";
import PricingSection from "@/components/home/pricing-section";
import CTASection from "@/components/home/cta-section";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();

  
  if (userId) {
    return (
      <div className="relative w-full">
        <BgGradient />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <section className="rounded-2xl border bg-white/60 backdrop-blur p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Welcome back 👋</h1>
              <p className="text-gray-600">Jump back in where you left off.</p>
            </div>
            <div className="flex gap-3">
              <Button asChild className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl">
                <Link href="/upload">Upload a PDF</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/summaries">Your summaries</Link>
              </Button>
            </div>
          </section>

          
          <PricingSection />
        </div>
      </div>
    );
  }

 
  return (
    <div className="relative w-full">
      <BgGradient />
      <div className="flex flex-col">
        <HeroSection />
        <DemoSection />
        <HowItWorksSection />
        <PricingSection />
        <CTASection />
      </div>
    </div>
  );
}
