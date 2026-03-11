"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PricingCta = () => {
    return (
        <section className="relative w-full py-32 px-6 flex justify-center">
            {/* Container with a glowing border effect */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className="relative max-w-4xl w-full rounded-[2rem] border border-white/10 bg-black/60 backdrop-blur-3xl p-10 md:p-20 text-center overflow-hidden"
            >
                {/* Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-32 bg-indigo-500/20 blur-[100px] pointer-events-none rounded-full" />

                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                    Ready to deploy?
                </h2>
                <p className="text-neutral-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                    Join thousands of developers using Moris to build the future of software, today. No credit card required.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/projects" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base bg-white text-black hover:bg-neutral-200 transition-all rounded-full hover:scale-105 active:scale-95 shadow-xl">
                            Get Started for Free
                            <ArrowRightIcon className="ml-2 size-5" />
                        </Button>
                    </Link>
                    <Link href="/pricing" className="w-full sm:w-auto">
                        <Button size="lg" variant="ghost" className="w-full sm:w-auto h-14 px-8 text-base text-neutral-300 hover:text-white hover:bg-white/5 rounded-full transition-all">
                            View Pricing
                        </Button>
                    </Link>
                </div>

                <p className="mt-8 text-sm text-neutral-500 font-medium">
                    Includes 500,000 free AI tokens per month.
                </p>
            </motion.div>
        </section>
    );
};
