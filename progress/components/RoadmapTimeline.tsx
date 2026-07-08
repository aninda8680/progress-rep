"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Loader2, BookOpen, Check, Code2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, collection } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import dsaRoadmap from "@/data/dsa-roadmap.json";
import flutterRoadmap from "@/data/roadmap.json";

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

  const toggleDay = async (dayNumber: number) => {
    if (!user) return;
    
    // Optimistic update
    const isCompleted = completedDays.includes(dayNumber);
    const newCompletedDays = isCompleted 
      ? completedDays.filter(d => d !== dayNumber)
      : [...completedDays, dayNumber];
    
    setAllProgress(prev => ({
      ...prev,
      [user.uid]: newCompletedDays
    }));

    // Save to Firestore
    const progressRef = doc(db, "rooms", roomId, "progress", user.uid);
    await setDoc(progressRef, { completedDays: newCompletedDays }, { merge: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white brutal-border brutal-shadow-lg">
        <div className="w-12 h-12 brutal-border rounded-full border-t-[#ffe800] animate-spin"></div>
      </div>
    );
  }

  const progressPercentage = Math.round((completedDays.length / roadmapData.length) * 100) || 0;

  return (
    <div className="flex flex-col h-full bg-white brutal-border brutal-shadow-lg overflow-hidden max-h-[800px] relative">
      
      {/* Header */}
      <div className="p-6 border-b-[4px] border-black bg-[#94dfff] sticky top-0 z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bitcount font-black uppercase tracking-widest text-black flex items-center gap-3">
            <div className="w-8 h-8 brutal-border bg-white flex items-center justify-center brutal-shadow-sm transform -rotate-6">
              <BookOpen className="w-5 h-5 text-black" strokeWidth={3} />
            </div>
            Roadmap Progress
          </h2>
          <span className="text-sm font-black text-black bg-[#c4ff4d] px-3 py-1 brutal-border brutal-shadow-sm transform rotate-2">
            {progressPercentage}% Completed
          </span>
        </div>
        <div className="h-4 w-full bg-white brutal-border overflow-hidden">
          <div 
            className="h-full bg-black transition-all duration-700" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-white">
        {roadmapData.map((module: any, idx: number) => {
          const isCompleted = completedDays.includes(module.day);
          
          const completedByUsers = Object.entries(allProgress)
            .filter(([uid, days]) => days.includes(module.day))
            .map(([uid]) => usersCache[uid])
            .filter(Boolean);
          
          return (
            <div key={idx} className="relative flex gap-8 group">
              {/* Vertical line connecting nodes */}
              {idx !== roadmapData.length - 1 && (
                <div className={`absolute left-[17px] top-10 -bottom-10 w-[4px] ${isCompleted ? "bg-black" : "bg-black/20"}`}></div>
              )}
              
              {/* Node */}
              <div 
                className="relative z-10 mt-2 cursor-pointer shrink-0" 
                onClick={() => toggleDay(module.day)}
              >
                {isCompleted ? (
                  <div className="w-10 h-10 rounded-none brutal-border bg-[#c4ff4d] flex items-center justify-center brutal-shadow transform hover:scale-110 transition-transform">
                    <Check className="w-6 h-6 text-black" strokeWidth={4} />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-none brutal-border bg-white group-hover:bg-[#ffe800] transition-colors flex items-center justify-center brutal-shadow-sm hover:brutal-shadow"></div>
                )}
              </div>

              {/* Content */}
              <div 
                className={`flex-1 p-6 brutal-border transition-all cursor-pointer brutal-shadow-sm hover:brutal-shadow ${
                  isCompleted 
                    ? "bg-[#c4ff4d]/20" 
                    : "bg-white"
                }`}
                onClick={() => toggleDay(module.day)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <h3 className={`font-bitcount font-black uppercase tracking-wide text-2xl text-black`}>
                      Day {module.day}: {module.title}
                    </h3>
                    
                    {/* Avatars of people who completed it */}
                    {completedByUsers.length > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex -space-x-2">
                          {completedByUsers.map((u, i) => (
                            u.photoURL ? (
                              <img key={u.id || i} src={u.photoURL} alt={u.displayName} title={`${u.displayName} completed this`} className="w-8 h-8 rounded-none brutal-border object-cover" style={{ zIndex: 10 - i }} />
                            ) : (
                              <div key={u.id || i} title={`${u.displayName} completed this`} className="w-8 h-8 rounded-none brutal-border bg-[#ffb4d4] text-black flex items-center justify-center text-xs font-black" style={{ zIndex: 10 - i }}>
                                {u.displayName?.charAt(0) || '?'}
                              </div>
                            )
                          ))}
                        </div>
                        <span className="text-xs font-black uppercase bg-white border-[2px] border-black px-2 py-1 transform -rotate-2">completed</span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest text-black bg-[#ffe800] brutal-border px-3 py-1 transform rotate-2">
                    Week {module.week}
                  </span>
                </div>
                
                {module.topics?.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2 mb-4">
                    {module.topics.map((topic: string, i: number) => (
                      <div key={i} className={`text-sm font-black px-3 py-1.5 brutal-border uppercase ${isCompleted ? "bg-white text-black" : "bg-black text-white"}`}>
                        {topic.replace(/`/g, '')}
                      </div>
                    ))}
                  </div>
                )}

                {module.practice && (
                  <div className="bg-[#f0f0f0] p-5 brutal-border mt-4">
                    <span className="text-sm font-black text-black uppercase tracking-widest flex items-center gap-2 mb-4 border-b-[2px] border-black pb-2">
                      <Code2 className="w-5 h-5 text-black" strokeWidth={3} /> Practice Problems
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {parsePractice(module.practice).map(p => {
                        if (p.type === 'lc') {
                          const searchUrl = p.slug 
                            ? `https://leetcode.com/problems/${p.slug}/description/?search=${p.num}`
                            : `https://leetcode.com/problemset/?search=${p.num}`;
                          return (
                            <a key={p.id} href={searchUrl} target="_blank" rel="noopener noreferrer" 
                               className="inline-flex items-center gap-2 px-3 py-2 bg-white brutal-border text-sm text-black hover:bg-[#ffb4d4] transition-colors brutal-shadow-sm active:brutal-shadow-none group/lc"
                               onClick={(e) => e.stopPropagation()}>
                              <span className="font-black">LC {p.num}</span>
                              {p.text && <span className="font-bold">{p.text}</span>}
                            </a>
                          );
                        }
                        return (
                          <span key={p.id} className="inline-block px-3 py-2 bg-white brutal-border text-sm font-bold text-black">
                            {p.raw}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {module.prompt && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePrompt({ day: module.day, text: module.prompt });
                    }}
                    className="mt-6 bg-[#94dfff] px-4 py-2 text-sm font-black uppercase tracking-wide text-black brutal-btn"
                  >
                    View Prompt
                  </button>
                )}
              </div>
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
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col brutal-border bg-white brutal-shadow-lg transform rotate-1" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b-[4px] border-black bg-[#ffe800] p-5">
          <h2 className="text-xl font-black text-black uppercase">AI Prompt — Day {day}</h2>
          <button onClick={onClose} className="w-8 h-8 brutal-border bg-white hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center font-black">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 text-black custom-scrollbar bg-white">
          <p className="mb-4 text-sm font-bold uppercase tracking-wide">Copy this prompt into ChatGPT or Claude to learn today's concepts.</p>
          <div className="brutal-border bg-[#f0f0f0] p-5">
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed font-bold">{text}</pre>
          </div>
        </div>
        <div className="border-t-[4px] border-black p-5 bg-[#c4ff4d]">
          <button onClick={copyToClipboard} className="w-full bg-white text-black px-4 py-3 text-lg font-black uppercase brutal-btn">
            {copied ? "Copied! 🚀" : "Copy to Clipboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
