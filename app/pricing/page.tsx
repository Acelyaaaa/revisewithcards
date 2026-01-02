import BgGradient from "@/components/common/bg-gradient";
import PricingSection from "@/components/home/pricing-section";

export const metadata = {
  title: "Pricing – Revisecards",
  description: "Choose the plan that fits your study flow.",
};

export default function PricingPage() {
  return (
    <div className="relative w-full">
      
      <BgGradient className="opacity-40" />
      <PricingSection />
    </div>
  );
}
