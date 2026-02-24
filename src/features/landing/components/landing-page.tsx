import { HeroSection } from "@/features/landing/components/hero-section";
import { BentoFeatures } from "@/features/landing/components/bento-features";
import { PricingCta } from "@/features/landing/components/pricing-cta";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-foreground font-sans selection:bg-indigo-500/30 overflow-x-hidden">
            {/* Background gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none flex justify-center overflow-hidden">
                <div className="absolute -top-[20%] w-[120%] h-[50%] opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-[#0A0A0A] to-transparent blur-3xl"></div>
                <div className="absolute top-[40%] -right-[20%] w-[70%] h-[70%] opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-fuchsia-900 via-[#0A0A0A] to-transparent blur-3xl"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center w-full">
                <HeroSection />
                <BentoFeatures />
                <PricingCta />
            </div>
        </div>
    );
}
