"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRightIcon, TerminalIcon, SparklesIcon, CodeIcon, LayersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
    return (
        <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 px-6 overflow-hidden">

            {/* Abstract Glowing Grid Background */}
            <div className="absolute inset-0 pointer-events-none z-[-1]" style={{
                backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                backgroundSize: '4rem 4rem',
                maskImage: 'radial-gradient(ellipse 60% 60% at 50% 30%, #000 20%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 30%, #000 20%, transparent 100%)',
            }} />

            <div className="max-w-5xl mx-auto w-full flex flex-col items-center text-center space-y-10">

                {/* Pill Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                >
                    <SparklesIcon className="size-4" />
                    <span>The Next Generation AI Dev Environment</span>
                </motion.div>

                {/* Hero Headline */}
                <motion.h1
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-100 to-indigo-900 drop-shadow-sm leading-tight pb-2"
                >
                    Code at the speed <br className="hidden md:block" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">of thought.</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                    className="text-lg md:text-xl text-neutral-400 max-w-2xl font-medium tracking-wide"
                >
                    Create, edit, and orchestrate web and native applications entirely driven by AI. From standard websites to complex multi-language microservices.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row items-center gap-6 mt-4 w-full justify-center"
                >
                    <Link href="/projects" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base bg-white text-black hover:bg-neutral-200 transition-all rounded-full border border-transparent hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                            Start Building Now
                            <ArrowRightIcon className="ml-2 size-5" />
                        </Button>
                    </Link>
                    <Link href="/dashboard" className="w-full sm:w-auto">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base rounded-full border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800 text-white backdrop-blur-md transition-all hover:scale-105 active:scale-95">
                            <TerminalIcon className="mr-2 size-5" />
                            View Dashboard
                        </Button>
                    </Link>
                </motion.div>

                {/* 3D Mockup Container (Simplified CSS 3D for performance and reliability over external libraries like Spline unless specifically requested) */}
                <motion.div
                    initial={{ opacity: 0, y: 100, rotateX: 20 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 1, delay: 0.8, type: "spring", stiffness: 50 }}
                    className="w-full max-w-5xl mt-16 perspective-1000"
                >
                    <div className="relative w-full aspect-[16/9] rounded-2xl md:rounded-[2rem] border border-white/10 bg-[#0c0c0e] shadow-[0_20px_60px_-15px_rgba(99,102,241,0.3)] overflow-hidden transform-gpu flex flex-col">
                        {/* Window Header */}
                        <div className="h-12 w-full border-b border-white/10 bg-[#141417] flex items-center px-4 gap-2">
                            <div className="flex gap-1.5">
                                <div className="size-3 rounded-full bg-red-500/80" />
                                <div className="size-3 rounded-full bg-amber-500/80" />
                                <div className="size-3 rounded-full bg-green-500/80" />
                            </div>
                            <div className="mx-auto flex items-center gap-2 bg-black/40 px-3 py-1 rounded-md text-xs text-neutral-500 font-mono ring-1 ring-white/5">
                                <LayersIcon className="size-3" />
                                moris-studio / main.tsx
                            </div>
                        </div>

                        {/* Window Body Mockup */}
                        <div className="flex flex-1 overflow-hidden font-mono text-sm">
                            <div className="w-12 h-full border-r border-white/5 bg-[#0a0a0c] flex flex-col items-center py-4 gap-4 text-neutral-600">
                                <CodeIcon className="size-5 hover:text-white cursor-pointer transition-colors" />
                                <TerminalIcon className="size-5 hover:text-white cursor-pointer transition-colors" />
                                <LayersIcon className="size-5 hover:text-white cursor-pointer transition-colors" />
                            </div>
                            <div className="flex-1 p-6 relative">
                                <div className="absolute right-6 top-6 max-w-xs shadow-xl border border-white/10 rounded-xl bg-black/60 backdrop-blur-xl p-4 transform translate-y-[-10px] animate-pulse">
                                    <p className="text-indigo-400 font-medium text-xs mb-2">AI Assistant</p>
                                    <p className="text-gray-300 text-sm">Refactoring the dashboard component for 30% faster render times...</p>
                                </div>

                                <pre className="text-neutral-400">
                                    <code className="text-pink-400">import</code> &#123; useState, useEffect &#125; <code className="text-pink-400">from</code> <code className="text-green-300">&quot;react&quot;</code>;<br /><br />
                                    <code className="text-blue-400">export default function</code> <code className="text-amber-200">MorisEngine</code>() &#123;<br />
                                    &nbsp;&nbsp;<code className="text-pink-400">const</code> [code, setCode] = <code className="text-amber-200">useState</code>(<code className="text-green-300">&quot;Hello World&quot;</code>);<br /><br />
                                    &nbsp;&nbsp;<code className="text-blue-400">return</code> (<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&lt;<code className="text-indigo-300">div</code> <code className="text-blue-200">className</code>=<code className="text-green-300">&quot;flex h-screen bg-black text-white&quot;</code>&gt;<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<code className="text-indigo-300">Sidebar</code> /&gt;<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<code className="text-indigo-300">Editor</code> <code className="text-blue-200">value</code>=&#123;code&#125; /&gt;<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<code className="text-indigo-300">AITerminal</code> /&gt;<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&lt;/<code className="text-indigo-300">div</code>&gt;<br />
                                    &nbsp;&nbsp;);<br />
                                    &#125;
                                </pre>
                            </div>
                        </div>

                        {/* Shine effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08] pointer-events-none" />
                    </div>
                </motion.div>

            </div>
        </section>
    );
};
