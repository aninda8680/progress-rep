"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Server, Boxes, Zap, ArrowRight, Activity, Users, Lock, ChevronRight, BarChart } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-12 h-12 brutal-border rounded-full border-t-[#ffe800] animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-[#ffb4d4] overflow-hidden relative">
      <div className="min-h-screen flex flex-col">
        <nav className="w-full flex items-center justify-between px-6 py-6 max-w-7xl mx-auto z-50 brutal-border-b border-b-[3px] border-black bg-[#ffb4d4]">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 brutal-border bg-[#ffe800] flex items-center justify-center transform -rotate-6">
               <div className="w-3 h-3 bg-black rounded-full"></div>
            </div>
            <span className="font-bold text-lg tracking-widest uppercase text-black font-bitcount">PORTLINE</span>
          </div>
          <div className="hidden md:flex items-center justify-center gap-8 text-sm font-bold text-black uppercase tracking-wide">
            <a href="#features" className="hover:underline decoration-4 underline-offset-4 decoration-black">Platform</a>
            <a href="#roadmaps" className="hover:underline decoration-4 underline-offset-4 decoration-black">Roadmaps</a>
            <a href="#community" className="hover:underline decoration-4 underline-offset-4 decoration-black">Community</a>
          </div>
          <div className="flex items-center justify-end gap-4 flex-1">
            <Link
              href="/login"
              className="text-sm font-bold text-black hover:underline decoration-4 underline-offset-4 hidden md:block uppercase"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-bold bg-[#ffe800] text-black brutal-btn inline-flex items-center gap-2 uppercase tracking-wide"
            >
              Start learning
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>

        <section className="px-6 flex-1 flex flex-col items-center justify-center max-w-250 mx-auto w-full text-center relative z-10 py-20">
          <div className="group inline-flex items-center gap-3 px-4 py-2 brutal-border bg-[#c4ff4d] text-black text-sm font-bold mb-10 brutal-shadow-sm cursor-pointer hover:bg-[#b0f030]">
            <span className="flex items-center justify-center bg-black text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 brutal-border">
              Beta
            </span>
            <span className="text-sm tracking-widest uppercase">Portline is now available</span>
            <ChevronRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
          </div>
          
          <h1 className="text-6xl md:text-[7rem] font-black tracking-tighter mb-8 leading-[1] text-black uppercase drop-shadow-[4px_4px_0_rgba(0,0,0,1)] text-white" style={{ WebkitTextStroke: "2px black" }}>
            Master any skill.<br />
            <span className="bg-[#ffb4d4] px-4 text-black" style={{ WebkitTextStroke: "0" }}>Together.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-black font-bold max-w-2xl mb-12 leading-relaxed border-l-8 border-black pl-6 text-left mx-auto">
            Create structured roadmaps, invite your peers, and track your progress in real-time. 
            The brutalist platform for developer study groups.
          </p>

          <div className="flex items-center gap-6 flex-col sm:flex-row w-full sm:w-auto justify-center mt-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-10 py-5 text-lg font-black bg-[#ffe800] text-black brutal-btn uppercase tracking-widest"
            >
              Get started for free
            </Link>
            <a href="#features" className="w-full sm:w-auto px-10 py-5 text-lg font-black bg-white text-black brutal-btn uppercase tracking-widest">
              Explore features
            </a>
          </div>
        </section>
      </div>

      <section id="features" className="py-32 border-t-[4px] border-black bg-[#c4ff4d]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-24 text-left max-w-3xl brutal-border bg-white p-8 brutal-shadow-lg transform -rotate-1">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black tracking-tighter leading-[1] uppercase">The ultimate standard in collaborative learning.</h2>
            <p className="text-black text-xl font-bold">Portline combines your roadmaps, progress tracking, and team activity into a single, brutally engineered ecosystem.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              color="bg-[#ffb4d4]"
              icon={<Activity className="w-8 h-8 text-black" />}
              title="Real-time Sync"
              description="Progress updates are broadcasted instantly to all members in your study group via Firestore infrastructure."
            />
            <FeatureCard 
              color="bg-white"
              icon={<Boxes className="w-8 h-8 text-black" />}
              title="Structured Roadmaps"
              description="Deploy curated curriculums like DSA or System Design, directly integrated into your room's timeline."
            />
            <FeatureCard 
              color="bg-[#ffe800]"
              icon={<Lock className="w-8 h-8 text-black" />}
              title="Secure Enclaves"
              description="Granular database security rules ensure only invited members can view or mutate room state."
            />
            <FeatureCard 
              color="bg-white"
              icon={<BarChart className="w-8 h-8 text-black" />}
              title="Activity Heatmaps"
              description="Visualize your consistency with GitHub-style contribution graphs synced to your actual progress."
            />
            <FeatureCard 
              color="bg-[#94dfff]"
              icon={<Users className="w-8 h-8 text-black" />}
              title="Multiplayer First"
              description="Built from the ground up for teams. See exactly who completed what, and when."
            />
            <FeatureCard 
              color="bg-white"
              icon={<Server className="w-8 h-8 text-black" />}
              title="Serverless Backend"
              description="Powered by blazing fast Firebase architecture for zero-latency updates and massive scale."
            />
          </div>
        </div>
      </section>

      <section className="py-40 border-t-[4px] border-black bg-[#ffb4d4] relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-6xl md:text-8xl font-black text-black mb-8 tracking-tighter leading-[1] uppercase">Begin your<br/>journey.</h2>
          <p className="text-black text-2xl font-bold mb-12 max-w-2xl mx-auto bg-white brutal-border p-6 transform rotate-1 brutal-shadow">
            Create your first room today, invite your peers, and start tracking your development progress in perfect sync.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-12 py-6 text-xl font-black bg-[#ffe800] text-black brutal-btn uppercase tracking-widest"
          >
            Start learning for free
          </Link>
        </div>
      </section>

      <footer className="border-t-[4px] border-black py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-8 h-8 brutal-border bg-black flex items-center justify-center transform rotate-6">
                  <div className="w-3 h-3 bg-[#ffe800] rounded-none"></div>
               </div>
              <span className="font-bold text-xl tracking-widest uppercase text-black font-bitcount">PORTLINE</span>
            </div>
            <p className="text-lg text-black font-bold max-w-sm mb-8">
              The collaborative learning platform built specifically for ambitious developers and study groups.
            </p>
            <div className="flex gap-6 text-lg font-black uppercase">
              <a href="#" className="text-black hover:underline decoration-4 underline-offset-4">Twitter</a>
              <a href="#" className="text-black hover:underline decoration-4 underline-offset-4">GitHub</a>
            </div>
          </div>
          
          <div>
            <h4 className="text-black font-black mb-6 text-xl uppercase tracking-wider">Platform</h4>
            <ul className="space-y-4 text-lg font-bold text-black">
              <li><Link href="/dashboard" className="hover:underline decoration-4 underline-offset-4">Dashboard</Link></li>
              <li><Link href="/login" className="hover:underline decoration-4 underline-offset-4">Create Room</Link></li>
              <li><Link href="/login" className="hover:underline decoration-4 underline-offset-4">Join Room</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-black font-black mb-6 text-xl uppercase tracking-wider">Resources</h4>
            <ul className="space-y-4 text-lg font-bold text-black">
              <li><a href="#roadmaps" className="hover:underline decoration-4 underline-offset-4">DSA Roadmap</a></li>
              <li><a href="#roadmaps" className="hover:underline decoration-4 underline-offset-4">Flutter Roadmap</a></li>
              <li><a href="#community" className="hover:underline decoration-4 underline-offset-4">Community</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t-[4px] border-black flex justify-between items-center text-sm text-black font-bold uppercase tracking-widest flex-col md:flex-row gap-4">
          <p>© {new Date().getFullYear()} Portline. All rights reserved.</p>
          <div className="bg-[#c4ff4d] px-4 py-2 brutal-border brutal-shadow-sm font-bitcount">
            SYSTEM ONLINE
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <div className={`p-8 brutal-border ${color} brutal-shadow hover:-translate-y-2 hover:translate-x-2 transition-transform duration-200`}>
      <div className="w-16 h-16 brutal-border bg-white flex items-center justify-center mb-8 brutal-shadow-sm">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-black mb-4 uppercase">{title}</h3>
      <p className="text-lg text-black font-bold leading-relaxed">{description}</p>
    </div>
  );
}
