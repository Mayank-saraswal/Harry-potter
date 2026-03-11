"use client";

import { motion } from "framer-motion";
import { CpuIcon, GlobeIcon, ZapIcon, LockIcon } from "lucide-react";

const features = [
    {
        title: "Instant environments",
        description: "Launch full-stack Node.js, Python, and Go environments in milliseconds.",
        icon: <ZapIcon className="size-6 text-amber-400" />,
        className: "md:col-span-2 md:row-span-2 bg-gradient-to-br from-white/5 to-white/0",
        hasGlow: true
    },
    {
        title: "Global Edge Network",
        description: "Your code runs near your users automatically.",
        icon: <GlobeIcon className="size-6 text-blue-400" />,
        className: "md:col-span-1 border-indigo-500/20",
        hasGlow: false
    },
    {
        title: "Enterprise Security",
        description: "Isolated VMs per session. Zero-trust by default.",
        icon: <LockIcon className="size-6 text-emerald-400" />,
        className: "md:col-span-1",
        hasGlow: false
    },
    {
        title: "AI-Native Intelligence",
        description: "Not just autocomplete. Full repository awareness and multi-file orchestrations.",
        icon: <CpuIcon className="size-6 text-fuchsia-400" />,
        className: "md:col-span-2 bg-gradient-to-tr from-fuchsia-500/10 to-transparent",
        hasGlow: true
    }
];

export const BentoFeatures = () => {
    return (
        <section className="relative w-full py-24 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-16 text-center md:text-left">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                        Everything you need. <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 to-neutral-600">Built right in.</span>
                    </h2>
                    <p className="text-neutral-400 max-w-lg text-lg">
                        Stop configuring Webpack, Docker, or CI pipelines. Moris handles the infrastructure so you can focus on shipping.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[160px]">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-[#111114] p-8 flex flex-col justify-between transition-colors hover:border-white/20 hover:bg-[#1a1a1f] ${feature.className}`}
                        >
                            {feature.hasGlow && (
                                <div className="absolute -top-24 -right-24 size-64 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors pointer-events-none" />
                            )}

                            <div className="bg-white/5 size-12 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner mb-4 group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
