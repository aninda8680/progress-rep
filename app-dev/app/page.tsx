"use client";

import { useEffect, useMemo, useState } from "react";
import { WEEKS, TOTAL_DAYS, type Day, type Week } from "./roadmap";

const STORE_KEY = "flutter-roadmap-progress";

const DAY_MSGS = [
  "Day {d} locked in. Keep the streak.",
  "Nice — Day {d} done. Momentum is a compounding asset.",
  "Day {d} ✓. Future-you says thanks.",
  "Shipped Day {d}. One rung higher.",
  "Day {d} in the bag. Don't break the chain.",
];

export default function Home() {
  const [done, setDone] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState<{ text: string; kind: "day" | "project" | "week" } | null>(null);

  // Load persisted progress once.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) setDone(new Set(JSON.parse(raw) as number[]));
    } catch {
      /* ignore corrupt storage */
    }
    setLoaded(true);
  }, []);

  // Persist on change.
  useEffect(() => {
    if (loaded) localStorage.setItem(STORE_KEY, JSON.stringify([...done]));
  }, [done, loaded]);

  // Auto-dismiss toast.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  function toggle(day: Day, week: Week) {
    setDone((prev) => {
      const next = new Set(prev);
      const wasDone = next.has(day.day);
      if (wasDone) {
        next.delete(day.day);
        setToast(null);
      } else {
        next.add(day.day);
        
        // Did this tick complete the whole week?
        const weekComplete = week.days.every((d) => next.has(d.day));
        if (weekComplete) {
          setToast({
            text: `🔥 WEEK ${week.weekNumber} COMPLETE! That whole section is yours. On to the next.`,
            kind: "week",
          });
        } else if (day.isProject) {
          setToast({
            text: `Milestone shipped 🎉 ${day.title}. This is the stuff that goes on your résumé.`,
            kind: "project",
          });
        } else {
          setToast({
            text: DAY_MSGS[day.day % DAY_MSGS.length].replace("{d}", String(day.day)),
            kind: "day",
          });
        }
      }
      return next;
    });
  }

  const completedCount = done.size;
  const pct = Math.round((completedCount / TOTAL_DAYS) * 100);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <Header pct={pct} completedCount={completedCount} />

      <div className="mt-16 flex flex-col gap-10">
        {WEEKS.map((week) => (
          <WeekSection key={week.weekNumber} week={week} done={done} onToggle={toggle} />
        ))}
      </div>

      <footer className="mt-16 border-t-4 border-foreground pt-6 text-center text-sm font-bold uppercase tracking-wide">
        60 days · Dart → Flutter → Shipped 🚀
      </footer>

      {toast && <Toast text={toast.text} kind={toast.kind} />}
    </div>
  );
}

function Header({ pct, completedCount }: { pct: number; completedCount: number }) {
  return (
    <header>
      <div className="inline-block rotate-[-2deg] border-4 border-black bg-[#ffd93d] px-4 py-1 shadow-[4px_4px_0_0_#fff] hover:-translate-y-1 transition-transform">
        <span className="text-sm font-black uppercase tracking-widest text-black">60-Day Roadmap</span>
      </div>
      <h1 className="mt-6 text-5xl font-black leading-none tracking-tight sm:text-7xl">
        Flutter &amp; Dart
        <br />
        Zero → Shipped.
      </h1>
      <p className="mt-4 max-w-xl text-lg font-bold sm:text-xl">
        One codebase, Android + iOS. Tick a day when you finish it.
      </p>

      {/* Global Progress Bar */}
      <div className="mt-10 border-4 border-black bg-white text-black p-5 shadow-[8px_8px_0_0_rgba(255,255,255,0.2)] sticky top-4 z-40">
        <div className="flex items-end justify-between">
          <span className="text-base font-black uppercase tracking-wide">Overall progress</span>
          <span className="text-3xl font-black tabular-nums sm:text-4xl">
            {completedCount}
            <span className="text-xl font-bold text-black/50">/{TOTAL_DAYS}</span>
          </span>
        </div>
        <div className="mt-4 h-8 w-full border-4 border-black bg-[#f4f1e8] relative">
          <div
            className="absolute left-0 top-0 h-full bg-[#7bf1a8] border-r-4 border-black transition-[width] duration-300 ease-out flex items-center justify-end"
            style={{ width: `${pct}%` }}
          >
            {pct > 5 && (
              <span className="pr-2 text-sm font-black tabular-nums text-black">{pct}%</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function WeekSection({
  week,
  done,
  onToggle,
}: {
  week: Week;
  done: Set<number>;
  onToggle: (day: Day, week: Week) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  
  const doneInWeek = useMemo(
    () => week.days.filter((d) => done.has(d.day)).length,
    [week.days, done]
  );
  const complete = doneInWeek === week.days.length;
  const pct = Math.round((doneInWeek / week.days.length) * 100);

  return (
    <section className="scroll-mt-24">
      {/* Week banner */}
      <div
        onClick={() => setExpanded(!expanded)}
        className={`cursor-pointer flex flex-wrap items-center gap-4 border-4 border-black p-4 transition-all active:translate-y-1 active:shadow-none shadow-[4px_4px_0_0_rgba(255,255,255,0.2)] hover:shadow-[6px_6px_0_0_rgba(255,255,255,0.2)] ${
          complete ? "bg-[#14110d] text-white border-white" : "bg-white text-black"
        }`}
      >
        <span 
          className={`grid h-14 w-14 shrink-0 place-items-center border-4 text-2xl font-black ${complete ? 'border-white' : 'border-black'}`}
          style={{ background: complete ? "#7bf1a8" : week.accent, color: "#14110d" }}
        >
          {week.weekNumber}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-black leading-tight sm:text-3xl uppercase tracking-tight">
            Week {week.weekNumber}
            {complete && <span className="ml-3 inline-block rotate-12 bg-white text-black px-2 py-1 text-sm border-2 border-black">🔥 COMPLETE</span>}
          </h2>
          <span className={`text-base font-bold uppercase tracking-wide opacity-80`}>
            {week.title}
          </span>
          {/* Mini progress bar */}
          <div className="mt-2 h-3 w-full max-w-sm border-2 border-current bg-black/10 relative">
             <div className="h-full bg-current transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <span
          className={`border-4 px-4 py-2 text-lg font-black uppercase ${
            complete ? "border-white bg-white text-black" : "border-black bg-white text-black"
          }`}
        >
          {expanded ? "− Collapse" : "+ Expand"}
        </span>
      </div>

      {/* Day cards */}
      {expanded && (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {week.days.map((d) =>
            d.isProject ? (
              <ProjectCard key={d.day} day={d} week={week} checked={done.has(d.day)} onToggle={onToggle} />
            ) : (
              <DayCard key={d.day} day={d} week={week} checked={done.has(d.day)} onToggle={onToggle} />
            )
          )}
        </div>
      )}
    </section>
  );
}

function DayCard({
  day,
  week,
  checked,
  onToggle,
}: {
  day: Day;
  week: Week;
  checked: boolean;
  onToggle: (day: Day, week: Week) => void;
}) {
  return (
    <button
      onClick={() => onToggle(day, week)}
      className={`group relative flex flex-col items-start gap-3 border-4 border-black p-5 text-left transition-all duration-200 
        hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.2)] hover:-rotate-1 active:translate-y-1 active:shadow-none
        ${checked ? "bg-[#e8f5e9] text-black opacity-90 shadow-none translate-y-1" : "bg-white text-black shadow-[4px_4px_0_0_rgba(255,255,255,0.2)]"}
      `}
    >
      <div className="flex w-full items-start gap-4">
        <Check checked={checked} accent="#7bf1a8" />
        <div className="flex-1">
          <span className="text-sm font-black uppercase tracking-widest text-black/60 bg-black/5 px-1 inline-block mb-1">
            Day {day.day}
          </span>
          <h3
            className={`text-xl font-black leading-tight ${
              checked ? "line-through decoration-4 opacity-60" : ""
            }`}
          >
            {day.title}
          </h3>
        </div>
        {checked && (
          <div className="absolute right-4 top-4 rotate-[15deg] border-4 border-red-500 text-red-500 px-2 font-black uppercase text-xl opacity-80 pointer-events-none">
            DONE
          </div>
        )}
      </div>

      <div className="pl-12 w-full">
        {day.practice && (
          <div className={`text-base font-semibold border-l-4 border-black/20 pl-3 ${checked ? "opacity-60" : ""}`}>
            Practice: {day.practice}
          </div>
        )}
        {day.topics.length > 0 && !checked && (
          <div className="mt-3 flex flex-col gap-2">
            {day.topics.map((topic, i) => (
              <div key={i} className="bg-black/5 text-black/80 text-xs font-bold px-3 py-2 border-2 border-black/20 w-full leading-normal">
                {topic}
              </div>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

function ProjectCard({
  day,
  week,
  checked,
  onToggle,
}: {
  day: Day;
  week: Week;
  checked: boolean;
  onToggle: (day: Day, week: Week) => void;
}) {
  return (
    <button
      onClick={() => onToggle(day, week)}
      className={`relative col-span-1 flex flex-col gap-4 border-4 p-6 text-left sm:col-span-2 transition-all duration-200
        hover:-translate-y-2 hover:-rotate-1 active:translate-y-1 active:shadow-none
        ${checked ? "bg-[#14110d] text-white border-white shadow-none translate-y-1" : "bg-[#ffd93d] border-black text-black shadow-[8px_8px_0_0_rgba(255,255,255,0.2)]"}
      `}
      style={{
        backgroundImage: !checked ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)' : 'none'
      }}
    >
      <div className="absolute -top-4 right-6 rotate-3 border-4 border-black bg-[#ff90e8] px-3 py-1 text-sm font-black uppercase tracking-widest text-black shadow-[4px_4px_0_0_#14110d]">
        🚀 BUILD DAY / MILESTONE
      </div>
      
      <div className="flex w-full items-start gap-4 z-10">
        <Check checked={checked} accent="#ff90e8" dark={checked} />
        <div className="flex-1">
          <span className={`text-sm font-black uppercase tracking-widest inline-block mb-1 px-1 ${checked ? "bg-white text-black/60" : "bg-black/10 text-black/70"}`}>
            Day {day.day}
          </span>
          <h3 className={`text-3xl font-black leading-tight ${checked ? "line-through decoration-4 opacity-70" : ""}`}>
            {day.title}
          </h3>
          
          {checked && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-8 border-green-500 text-green-500 px-4 py-2 font-black uppercase text-4xl opacity-90 pointer-events-none whitespace-nowrap bg-black/50">
              SHIPPED 🎉
            </div>
          )}
        </div>
      </div>

      <div className="pl-12 w-full z-10">
        <ul className={`list-disc pl-5 text-lg font-bold space-y-1 ${checked ? "text-white/80" : "text-black/90"}`}>
          {day.topics.map((t, i) => (
             <li key={i}>{t}</li>
          ))}
        </ul>
        {day.practice && (
          <div className={`mt-4 text-xl font-black p-3 border-4 ${checked ? "border-white bg-white/10 text-white" : "border-black bg-black/5 text-black"}`}>
            🎯 Goal: {day.practice}
          </div>
        )}
      </div>
    </button>
  );
}

function Check({ checked, accent, dark }: { checked: boolean; accent: string; dark?: boolean }) {
  return (
    <span
      className={`grid h-10 w-10 shrink-0 place-items-center border-4 text-2xl font-black transition-colors ${
        dark ? "border-white" : "border-black"
      }`}
      style={{ background: checked ? accent : "white" }}
    >
      {checked ? <span style={{ color: '#14110d' }}>✓</span> : ""}
    </span>
  );
}

function Toast({ text, kind }: { text: string; kind: "day" | "project" | "week" }) {
  const bg = kind === "week" ? "#7bf1a8" : kind === "project" ? "#ffd93d" : "#ffffff";
  const size = kind === "week" || kind === "project" ? "text-xl sm:text-2xl p-6 border-4" : "text-base p-4 border-4";
  const position = kind === "week" || kind === "project" ? "top-1/4 -translate-y-1/2" : "bottom-8";
  
  return (
    <div className={`pointer-events-none fixed inset-x-0 ${position} z-50 flex justify-center px-4 animate-[bounce_0.2s_ease-out]`}>
      <div
        className={`max-w-2xl border-black text-center font-black shadow-[8px_8px_0_0_#14110d] ${size}`}
        style={{ background: bg, color: '#14110d' }}
      >
        {text}
      </div>
    </div>
  );
}
