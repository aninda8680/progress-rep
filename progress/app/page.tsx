import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="inline-block rotate-[-2deg] border-4 border-black bg-[#ff90e8] px-4 py-1 shadow-[4px_4px_0_0_#14110d] mb-8">
        <span className="text-sm font-black uppercase tracking-widest text-black">Choose Your Path</span>
      </div>
      
      <h1 className="text-6xl font-black leading-none tracking-tight sm:text-8xl mb-4 text-foreground drop-shadow-[4px_4px_0_rgba(255,255,255,0.8)] dark:drop-shadow-[4px_4px_0_rgba(0,0,0,0.8)]">
        Progress.
      </h1>
      <p className="max-w-xl text-xl font-bold sm:text-2xl mb-16 text-foreground bg-white/50 dark:bg-white/10 px-4 py-2 border-2 border-black dark:border-white inline-block rotate-1 shadow-[4px_4px_0_0_#14110d] dark:shadow-[4px_4px_0_0_#ffffff]">
        Track your learning journey.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-4xl">
        <Link 
          href="/app-dev"
          className="group relative flex flex-col items-start gap-4 border-4 border-black bg-[#ffd93d] p-8 text-left transition-all duration-200 hover:-translate-y-2 hover:-rotate-1 hover:shadow-[10px_10px_0_0_#14110d] active:translate-y-1 active:shadow-[2px_2px_0_0_#14110d] shadow-[8px_8px_0_0_#14110d]"
        >
          <div className="absolute -top-5 right-6 rotate-3 border-4 border-black bg-white px-3 py-1 text-sm font-black uppercase tracking-widest text-black">
            60 Days
          </div>
          <h2 className="text-4xl font-black text-[#14110d]">App Dev</h2>
          <p className="text-lg font-bold text-[#14110d]/80 border-l-4 border-black/20 pl-4 mt-2">
            Flutter & Dart: Zero to Shipped. Build Android + iOS apps from scratch.
          </p>
          <div className="mt-6 border-2 border-black bg-white px-4 py-2 font-black uppercase text-black group-hover:bg-black group-hover:text-white transition-colors">
            Start Journey →
          </div>
        </Link>

        <Link 
          href="/dsa"
          className="group relative flex flex-col items-start gap-4 border-4 border-black bg-[#5ce1e6] p-8 text-left transition-all duration-200 hover:-translate-y-2 hover:rotate-1 hover:shadow-[10px_10px_0_0_#14110d] active:translate-y-1 active:shadow-[2px_2px_0_0_#14110d] shadow-[8px_8px_0_0_#14110d]"
        >
          <div className="absolute -top-5 right-6 -rotate-3 border-4 border-black bg-white px-3 py-1 text-sm font-black uppercase tracking-widest text-black">
            30 Days
          </div>
          <h2 className="text-4xl font-black text-[#14110d]">DSA in C++</h2>
          <p className="text-lg font-bold text-[#14110d]/80 border-l-4 border-black/20 pl-4 mt-2">
            Master Data Structures and Algorithms. Get interview-ready in 30 days.
          </p>
          <div className="mt-6 border-2 border-black bg-white px-4 py-2 font-black uppercase text-black group-hover:bg-black group-hover:text-white transition-colors">
            Start Journey →
          </div>
        </Link>
      </div>
    </div>
  );
}
