"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckCircle2, Circle, Loader2, BookOpen, Check, Code2, ChevronDown, ChevronUp } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, collection } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import dsaRoadmap from "@/data/dsa-roadmap.json";
import flutterRoadmap from "@/data/roadmap.json";
import toast from "react-hot-toast";

const roadmaps: Record<string, any[]> = {
  "dsa-roadmap": dsaRoadmap,
  "roadmap": flutterRoadmap
};

interface RoadmapTimelineProps {
  roomId: string;
  roadmapId: string;
  usersCache: Record<string, any>;
}

export function RoadmapTimeline({ roomId, roadmapId, usersCache }: RoadmapTimelineProps) {
  const { user } = useAuth();
  const [allProgress, setAllProgress] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [activePrompt, setActivePrompt] = useState<{ day: number; text: string } | null>(null);

  const roadmapData = roadmaps[roadmapId] || [];
  const completedDays = user ? (allProgress[user.uid] || []) : [];

  const weeksData = useMemo(() => {
    const weeks: Record<number, any[]> = {};
    roadmapData.forEach((module: any) => {
      const w = module.week || 1;
      if (!weeks[w]) weeks[w] = [];
      weeks[w].push(module);
    });
    return weeks;
  }, [roadmapData]);

  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([1]);

  // Helper to parse practice string into LeetCode links
  const parsePractice = (practiceStr: string) => {
    if (!practiceStr) return [];
    return practiceStr.split(',').map((s, idx) => {
      const item = s.trim();
      const match = item.match(/^LC\s*(\d+)(?:\s*\((.*?)\))?/i);
      if (match) {
        const num = match[1];
        const text = match[2] || '';
        let slug = '';
        if (text) {
          const namePart = text.split(' - ')[0].trim();
          slug = namePart.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
        }
        return { id: idx, type: 'lc', num, text, slug, raw: item };
      }
      return { id: idx, type: 'text', raw: item };
    });
  };

  useEffect(() => {
    if (!roomId) return;

    const progressCollection = collection(db, "rooms", roomId, "progress");
    const unsubscribe = onSnapshot(progressCollection, (snapshot) => {
      const newProgress: Record<string, number[]> = {};
      snapshot.forEach(docSnap => {
        newProgress[docSnap.id] = docSnap.data().completedDays || [];
      });
      setAllProgress(newProgress);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching roadmap progress:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  const toggleWeek = (week: number) => {
    setExpandedWeeks(prev => 
      prev.includes(week) ? prev.filter(w => w !== week) : [...prev, week]
    );
  };

  const toggleDay = async (module: any) => {
    if (!user) return;
    
    const dayNumber = module.day;
    const isCompleted = completedDays.includes(dayNumber);
    const newCompletedDays = isCompleted 
      ? completedDays.filter(d => d !== dayNumber)
      : [...completedDays, dayNumber];
    
    setAllProgress(prev => ({
      ...prev,
      [user.uid]: newCompletedDays
    }));

    if (!isCompleted) {
      if (module.isProject) {
        toast(`Milestone shipped 🎉`, { icon: '🚀', style: { background: '#ffd93d' } });
      } else {
        toast(`Nice — Day ${dayNumber} locked in.`, { icon: '🔥' });
      }

      // Check if week is completed with this action
      const weekNum = module.week || 1;
      const weekDays = weeksData[weekNum].map(d => d.day);
      const isWeekNowCompleted = weekDays.every(d => newCompletedDays.includes(d));
      if (isWeekNowCompleted) {
        toast(`WEEK ${weekNum} COMPLETE 🔥`, { 
          icon: '🏆',
          style: { background: '#7bf1a8', color: 'black', border: '4px solid black', padding: '16px', fontSize: '1.2rem', fontWeight: 900 }
        });
      }
    }

    // Save to Firestore
    const progressRef = doc(db, "rooms", roomId, "progress", user.uid);
    await setDoc(progressRef, { completedDays: newCompletedDays }, { merge: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f4f1e8] dark:bg-[#141414] brutal-border brutal-shadow-lg">
        <div className="w-12 h-12 brutal-border rounded-full border-t-[#ffd93d] animate-spin"></div>
      </div>
    );
  }

  const progressPercentage = Math.round((completedDays.length / roadmapData.length) * 100) || 0;

  return (
    <div className="flex flex-col relative w-full">
      
      {/* Global Progress Bar (Header) */}
      <div className="p-6 brutal-border brutal-shadow-md bg-[#5ce1e6] sticky top-0 z-30 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bitcount font-black uppercase tracking-widest text-black flex items-center gap-3">
            <div className="w-8 h-8 brutal-border bg-white flex items-center justify-center brutal-shadow-sm transform -rotate-6">
              <BookOpen className="w-5 h-5 text-black" strokeWidth={3} />
            </div>
            Roadmap Progress
          </h2>
          <span className="text-sm font-black text-black bg-[#7bf1a8] px-3 py-1 brutal-border brutal-shadow-sm transform rotate-2">
            {completedDays.length} / {roadmapData.length} Days
          </span>
        </div>
        <div className="h-6 w-full bg-white brutal-border overflow-hidden relative">
          <div 
            className="h-full bg-black transition-all duration-700" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-black uppercase text-white mix-blend-difference pointer-events-none">
            {progressPercentage}% Completed
          </span>
        </div>
      </div>

      {/* Timeline grouped by Weeks */}
      <div className="space-y-8 bg-transparent pb-16">
        {Object.entries(weeksData).map(([weekStr, days]) => {
          const weekNum = parseInt(weekStr);
          const isExpanded = expandedWeeks.includes(weekNum);
          const weekDaysCompleted = days.filter(d => completedDays.includes(d.day)).length;
          const weekTotal = days.length;
          const weekProgress = Math.round((weekDaysCompleted / weekTotal) * 100);
          const isWeekCompleted = weekDaysCompleted === weekTotal;

          return (
            <div key={weekNum} className="mb-8">
              {/* Week Header */}
              <div 
                className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 brutal-border cursor-pointer transition-all brutal-shadow-sm hover:brutal-shadow ${isWeekCompleted ? 'bg-[#7bf1a8] text-black' : 'bg-white text-black'}`}
                onClick={() => toggleWeek(weekNum)}
              >
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-wide flex items-center gap-2">
                    Week {weekNum} {isWeekCompleted && <span className="text-sm bg-white border-2 border-black px-2 py-0.5 ml-2 transform -rotate-3">COMPLETED 🔥</span>}
                  </h2>
                  <p className="text-sm font-bold opacity-80 mt-1">{days[0]?.phase || 'Learning Phase'}</p>
                </div>
                <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
                  <div className="flex flex-col items-end gap-1 flex-1 sm:flex-none">
                    <span className="text-xs font-black">{weekDaysCompleted}/{weekTotal} Days</span>
                    <div className="w-full sm:w-32 h-3 bg-white brutal-border">
                      <div className="h-full bg-black transition-all duration-500" style={{ width: `${weekProgress}%` }}></div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-6 h-6" strokeWidth={3} /> : <ChevronDown className="w-6 h-6" strokeWidth={3} />}
                </div>
              </div>

              {/* Days Grid */}
              {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {days.map((module: any) => {
                    const isCompleted = completedDays.includes(module.day);
                    const completedByUsers = Object.entries(allProgress)
                      .filter(([uid, d]) => d.includes(module.day))
                      .map(([uid]) => usersCache[uid])
                      .filter(Boolean);

                    // Prompt button accent cycles: yellow → pink → cyan → green → purple
                    const promptColors = ['#ffd93d', '#ff90e8', '#5ce1e6', '#7bf1a8', '#c084fc'];
                    const promptAccent = promptColors[(module.day - 1) % promptColors.length];

                    // Parse a topic string: "Bold Part, subtitle part" → { main, sub }
                    const parseTopic = (t: string) => {
                      const clean = t.replace(/`/g, '');
                      // Split on first comma only if the topic has multiple comma segments
                      const commaIdx = clean.indexOf(',');
                      if (commaIdx !== -1) {
                        return { main: clean.slice(0, commaIdx).trim(), sub: clean.slice(commaIdx + 1).trim() };
                      }
                      // Split on first opening parenthesis
                      const parenIdx = clean.indexOf('(');
                      if (parenIdx !== -1) {
                        return { main: clean.slice(0, parenIdx).trim(), sub: clean.slice(parenIdx).trim() };
                      }
                      return { main: clean, sub: '' };
                    };

                    return (
                      <div 
                        key={module.day} 
                        className={`group cursor-pointer relative flex flex-col transition-all duration-150 hover:-translate-y-1 active:translate-y-0.5 overflow-hidden ${module.isProject ? 'md:col-span-2' : ''} ${isCompleted ? 'bg-[#dff6e3]' : 'bg-white'}`}
                        style={{ border: '3px solid #14110d', boxShadow: '5px 5px 0 0 #14110d' }}
                        onClick={() => toggleDay(module)}
                      >
                        {isCompleted && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                            <span 
                              className="text-4xl font-black uppercase tracking-wider text-black px-6 py-2 transform -rotate-[15deg] inline-block whitespace-nowrap"
                              style={{ backgroundColor: '#7bf1a8', border: '4px solid #14110d', boxShadow: '6px 6px 0 0 #14110d' }}
                            >
                              ✓ DONE
                            </span>
                          </div>
                        )}
                        <div className={`p-5 flex flex-col flex-1 transition-all ${isCompleted ? 'opacity-30 grayscale' : ''}`}>

                          {/* ── HEADER: DAY box + title ── */}
                          <div className="flex items-start gap-4 mb-4">
                            <div 
                              className="flex flex-col items-center justify-center shrink-0 px-3 py-2"
                              style={{ border: '3px solid #14110d', minWidth: '54px', backgroundColor: isCompleted ? '#7bf1a8' : 'transparent' }}
                            >
                              <span className="text-[9px] font-black uppercase tracking-widest leading-none text-black">DAY</span>
                              <span className="text-[1.7rem] font-black leading-none text-black">{module.day}</span>
                            </div>
                            <div className="flex flex-col justify-center pt-0.5 flex-1 min-w-0">
                              <h3 className={`font-black uppercase text-[1.05rem] leading-snug text-black ${isCompleted ? 'line-through decoration-[2px]' : ''}`}>
                                {module.title}
                              </h3>
                              {module.isProject && (
                                <span className="text-[9px] font-black uppercase tracking-widest mt-1" style={{ color: '#e040fb' }}>
                                  🚀 BUILD PROJECT
                                </span>
                              )}
                            </div>
                          </div>

                          {/* ── DIVIDER ── */}
                          <div className="border-t-[2px] border-black/15 mb-3" />

                          {/* ── TOPICS LIST ── */}
                          {module.topics?.length > 0 && (
                            <div className="flex-1 mb-3">
                              {module.topics.map((topic: string, i: number) => {
                                const { main, sub } = parseTopic(topic);
                                return (
                                  <div key={i}>
                                    <div className="flex items-start gap-2.5 py-2">
                                      <span className={`text-[9px] text-black mt-[3px] shrink-0 font-black select-none ${isCompleted ? 'opacity-40' : ''}`}>■</span>
                                      <div>
                                        <span className={`text-[12px] font-bold text-black leading-snug ${isCompleted ? 'line-through opacity-60' : ''}`}>{main}</span>
                                        {sub && (
                                          <p className={`text-[11px] leading-snug mt-0.5 ${isCompleted ? 'line-through opacity-40' : ''}`} style={{ color: isCompleted ? 'inherit' : 'rgba(0,0,0,0.45)' }}>{sub}</p>
                                        )}
                                      </div>
                                    </div>
                                    {i < module.topics.length - 1 && (
                                      <div className="border-t border-black/8" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* ── PRACTICE ── */}
                          {module.practice && (
                            <>
                              <div className="border-t-[2px] border-black/15 mb-3" />
                              <div className="mb-4">
                                <p className="text-[11px] font-black uppercase tracking-widest text-black mb-2">
                                  PRACTICE
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {parsePractice(module.practice).map(p => {
                                    if (p.type === 'lc') {
                                      const searchUrl = p.slug 
                                        ? `https://leetcode.com/problems/${p.slug}/description/?search=${p.num}`
                                        : `https://leetcode.com/problemset/?search=${p.num}`;
                                      return (
                                        <a 
                                          key={p.id} 
                                          href={searchUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer" 
                                          className="inline-flex items-center px-3 py-1 text-[11px] font-bold text-black bg-white hover:bg-[#ff90e8] transition-colors"
                                          style={{ border: '2px solid #14110d' }}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          LC {p.num}
                                        </a>
                                      );
                                    }
                                    return (
                                      <span key={p.id} className="inline-block px-3 py-1 bg-white text-[11px] font-bold text-black" style={{ border: '2px solid #14110d' }}>
                                        {p.raw}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          )}

                          {/* ── BOTTOM ROW: avatars + prompt button ── */}
                          <div className="flex items-center justify-between gap-2 mt-auto">
                            {completedByUsers.length > 0 ? (
                              <div className="flex items-center gap-1.5">
                                <div className="flex -space-x-1.5">
                                  {completedByUsers.map((u, i) => (
                                    u.photoURL ? (
                                      <img key={u.id || i} src={u.photoURL} alt={u.displayName} title={`${u.displayName} completed this`} className="w-5 h-5 object-cover" style={{ border: '2px solid #14110d', zIndex: 10 - i }} />
                                    ) : (
                                      <div key={u.id || i} title={`${u.displayName} completed this`} className="w-5 h-5 bg-[#ff90e8] text-black flex items-center justify-center text-[9px] font-black" style={{ border: '2px solid #14110d', zIndex: 10 - i }}>
                                        {u.displayName?.charAt(0) || '?'}
                                      </div>
                                    )
                                  ))}
                                </div>
                                <span className="text-[9px] font-black uppercase opacity-40">done</span>
                              </div>
                            ) : <div />}

                            {module.prompt && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActivePrompt({ day: module.day, text: module.prompt });
                                }}
                                className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-black transition-all active:shadow-none active:translate-y-0.5"
                                style={{ 
                                  backgroundColor: promptAccent,
                                  border: '3px solid #14110d',
                                  boxShadow: '3px 3px 0 0 #14110d'
                                }}
                              >
                                ⚡ PROMPT
                              </button>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activePrompt && (
        <PromptModal 
          day={activePrompt.day} 
          text={activePrompt.text} 
          onClose={() => setActivePrompt(null)} 
        />
      )}
    </div>
  );
}

function PromptModal({ day, text, onClose }: { day: number; text: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col brutal-border bg-[#f4f1e8] dark:bg-[#141414] brutal-shadow-lg transform rotate-1" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b-4 border-black bg-[#ffd93d] p-5">
          <h2 className="text-xl font-black text-black uppercase">AI Prompt — Day {day}</h2>
          <button onClick={onClose} className="w-8 h-8 brutal-border bg-white hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center font-black">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 text-black custom-scrollbar bg-[#f4f1e8] dark:bg-[#141414]">
          <p className="mb-4 text-sm font-bold uppercase tracking-wide">Copy this prompt into ChatGPT or Claude to learn today's concepts.</p>
          <div className="brutal-border bg-[#f0f0f0] p-5">
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed font-bold">{text}</pre>
          </div>
        </div>
        <div className="border-t-4 border-black p-5 bg-[#7bf1a8]">
          <button onClick={copyToClipboard} className="w-full bg-white text-black px-4 py-3 text-lg font-black uppercase brutal-btn">
            {copied ? "Copied! 🚀" : "Copy to Clipboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
