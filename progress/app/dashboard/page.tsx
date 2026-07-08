"use client";

import { useAuth } from "@/context/AuthContext";
import { Users, MoreHorizontal, CheckCircle2, Circle, Clock, Loader2, Calendar, ChevronLeft, ChevronRight, Activity, TrendingUp, FolderOpen, MousePointerClick, Trash2, Copy } from "lucide-react";
import { format, formatDistanceToNow, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, addDays } from "date-fns";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, deleteDoc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import dsaRoadmap from "@/data/dsa-roadmap.json";
import flutterRoadmap from "@/data/roadmap.json";
import { RoadmapTimeline } from "@/components/RoadmapTimeline";

const roadmaps: Record<string, any[]> = {
  "dsa-roadmap": dsaRoadmap,
  "roadmap": flutterRoadmap
};

interface Room {
  id: string;
  name: string;
  roadmap: string;
  roadmapId?: string;
  members: string[];
  progress: number;
  createdAt: any;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // State for the unified single-page experience
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [usersCache, setUsersCache] = useState<Record<string, any>>({});
  const [userProgress, setUserProgress] = useState<Record<string, number[]>>({});

  const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDeleteRoom = async (roomIdToDelete: string) => {
    if (!confirm("Are you sure you want to delete this room? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "rooms", roomIdToDelete));
      if (selectedRoomId === roomIdToDelete) {
        setSelectedRoomId(null);
      }
      toast.success("Room deleted successfully");
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("Failed to delete room. Check console and Firebase rules.");
    }
  };

  useEffect(() => {
    if (!user) return;

    // Fetch rooms where the user is a member
    const q = query(
      collection(db, "rooms"),
      where("members", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRooms: Room[] = [];
      snapshot.forEach((doc) => {
        fetchedRooms.push({ id: doc.id, ...doc.data() } as Room);
      });
      
      // Sort client-side by createdAt descending
      fetchedRooms.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });

      setRooms(fetchedRooms);
      setLoadingRooms(false);
      
      // Auto-select first room if none selected
      if (fetchedRooms.length > 0 && !selectedRoomId) {
        setSelectedRoomId(fetchedRooms[0].id);
      }
    }, (error) => {
      console.error("Error fetching rooms:", error);
      setLoadingRooms(false);
    });

    return () => unsubscribe();
  }, [user, selectedRoomId]);

  useEffect(() => {
    if (rooms.length === 0) return;
    const memberIds = Array.from(new Set(rooms.flatMap(r => r.members || [])));
    
    setUsersCache(prev => {
      const missingIds = memberIds.filter(id => !prev[id]);
      if (missingIds.length > 0) {
        Promise.all(
          missingIds.map(async (id) => {
            try {
              const snap = await getDoc(doc(db, "users", id));
              if (snap.exists()) return { id, ...snap.data() };
            } catch (e) {
              console.error(e);
            }
            return { id, displayName: "Unknown User", photoURL: "" };
          })
        ).then(results => {
          setUsersCache(current => {
            const newCache = { ...current };
            results.forEach(u => { newCache[u.id] = u; });
            return newCache;
          });
        });
      }
      return prev;
    });
  }, [rooms]);

  useEffect(() => {
    if (!user || rooms.length === 0) return;
    
    const unsubscribes = rooms.map(room => {
      const progressRef = doc(db, "rooms", room.id, "progress", user.uid);
      return onSnapshot(progressRef, (docSnap) => {
        setUserProgress(prev => ({
          ...prev,
          [room.id]: docSnap.exists() ? (docSnap.data().completedDays || []) : []
        }));
      });
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [user, rooms]);

  // Generate calendar real data
  const today = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd }).map(date => {
    // A day has activity if it corresponds to a completed task in any room
    const hasActivity = rooms.some(room => {
      if (!room.createdAt) return false;
      const roomDate = room.createdAt.toDate();
      const completed = userProgress[room.id] || [];
      return completed.some(dayNum => {
        // Map day 1 to creation date, day 2 to creation date + 1, etc.
        const targetDate = addDays(roomDate, dayNum - 1);
        return isSameDay(targetDate, date);
      });
    });

    return {
      date,
      hasActivity,
      isToday: isSameDay(date, today)
    };
  });

  // Generate real upcoming deadlines
  const upcomingDeadlines = rooms.map(room => {
    if (!room.createdAt || !room.roadmapId) return null;
    const roomDate = room.createdAt.toDate();
    
    const roadmapData = roadmaps[room.roadmapId];
    if (!roadmapData) return null;
    
    const completed = userProgress[room.id] || [];
    
    // Find the first uncompleted module
    const nextModule = roadmapData.find((item: any) => !completed.includes(item.day));
    if (!nextModule) return null;

    // Calculate when this should be done
    const deadlineDate = addDays(roomDate, nextModule.day - 1);
    const isOverdue = deadlineDate < new Date(new Date().setHours(0,0,0,0));
    
    let timeText = isSameDay(deadlineDate, today) ? "Today" : 
                   isSameDay(deadlineDate, addDays(today, 1)) ? "Tomorrow" : 
                   isOverdue ? "Overdue" : format(deadlineDate, "MMM d");

    return {
      roomId: room.id,
      roomName: room.name,
      title: nextModule.title,
      timeText,
      deadlineDate,
      isOverdue
    };
  }).filter(Boolean);

  // Sort deadlines by date
  upcomingDeadlines.sort((a: any, b: any) => a.deadlineDate.getTime() - b.deadlineDate.getTime());

  // Take the first 3 deadlines to show
  const displayDeadlines = upcomingDeadlines.slice(0, 3);
  
  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  // Neo brutalist background color palette for rooms
  const roomColors = ["bg-[#ffb4d4]", "bg-[#94dfff]", "bg-[#c4ff4d]", "bg-[#ffe800]", "bg-[#ff9c9c]"];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-[#ffb4d4] overflow-hidden relative">
      <div className="p-8 max-w-[1600px] mx-auto relative z-10 h-screen flex flex-col">
        <header className="mb-8 shrink-0">
          <h1 className="text-4xl md:text-5xl font-bitcount font-black text-black uppercase tracking-tight brutal-shadow-sm inline-block bg-[#ffe800] border-[3px] border-black px-4 py-2 transform -rotate-1">
            Welcome back, {user?.displayName?.split(" ")[0] || "there"}
          </h1>
          <p className="text-black mt-4 font-bold text-lg max-w-xl">
            Here's what's happening in your study groups. Time to crush those goals!
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 min-h-0">
          {/* Column 1: Rooms Navigation */}
          <div className="col-span-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar flex flex-col">
            <h2 className="text-xl font-bitcount font-black uppercase tracking-widest text-black flex items-center gap-3 shrink-0 bg-[#c4ff4d] border-[3px] border-black p-2 brutal-shadow-sm self-start">
              <FolderOpen className="w-5 h-5 text-black" strokeWidth={3} />
              Your Rooms
            </h2>

            {loadingRooms ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-5 bg-white brutal-border h-32 brutal-shadow animate-pulse"></div>
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <div className="p-8 text-center bg-white brutal-border border-dashed brutal-shadow">
                <Users className="w-8 h-8 text-black mx-auto mb-3" strokeWidth={2.5} />
                <h3 className="text-black font-black uppercase text-sm">No active rooms</h3>
              </div>
            ) : (
              <div className="space-y-5 pb-8">
                {rooms.map((room, idx) => {
                  const colorClass = roomColors[idx % roomColors.length];
                  return (
                    <div 
                      key={room.id} 
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`p-5 brutal-border transition-all cursor-pointer relative group
                        ${selectedRoomId === room.id 
                          ? `${colorClass} brutal-shadow transform translate-x-1 -translate-y-1` 
                          : 'bg-white brutal-shadow-sm hover:translate-x-1 hover:-translate-y-1 hover:brutal-shadow'
                        }
                      `}
                    >
                      <div className="flex justify-between items-start mb-4 gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bitcount font-black text-xl uppercase tracking-wide text-black flex items-center gap-2">
                            {room.name}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(room.id);
                                toast.success("Room code copied!");
                              }}
                              className="text-black hover:bg-black hover:text-white p-1 brutal-border transition-colors shrink-0"
                              title="Copy room code"
                            >
                              <Copy className="w-3 h-3" strokeWidth={3} />
                            </button>
                          </h3>
                          <p className="text-sm text-black font-bold mt-1 leading-relaxed">{room.roadmap}</p>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.id); }}
                          className="text-black hover:bg-red-500 hover:text-white p-2 brutal-border transition-colors shrink-0 brutal-shadow-sm active:brutal-shadow-none"
                          title="Delete Room"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 border-t-[3px] border-black pt-4">
                        <div className="flex items-center -space-x-2 group/members relative cursor-help">
                          {room.members?.slice(0, 4).map((mId, index) => {
                            const u = usersCache[mId];
                            return (
                              <div key={mId} className="w-8 h-8 rounded-none brutal-border bg-white flex items-center justify-center overflow-hidden relative hover:z-20 hover:-translate-y-1 transition-transform brutal-shadow-sm" style={{ zIndex: 10 - index }}>
                                {u?.photoURL ? (
                                  <img src={u.photoURL} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-xs font-black text-black bg-[#94dfff] w-full h-full flex items-center justify-center">
                                    {u?.displayName?.charAt(0).toUpperCase() || '?'}
                                  </span>
                                )}
                              </div>
                            )
                          })}
                          {(room.members?.length || 0) > 4 && (
                            <div className="w-8 h-8 rounded-none brutal-border bg-[#ffe800] flex items-center justify-center z-[5] text-xs font-black text-black brutal-shadow-sm">
                              +{(room.members?.length || 0) - 4}
                            </div>
                          )}
                          
                          {/* Tooltip on hover */}
                          <div className="absolute left-0 bottom-full mb-3 hidden group-hover/members:flex flex-col bg-white brutal-border brutal-shadow-lg p-2 z-50 w-56">
                            <div className="text-xs font-black text-black uppercase tracking-wider mb-2 px-2 pt-1 border-b-[2px] border-black pb-1">Members ({room.members?.length || 0})</div>
                            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                              {room.members?.map(mId => {
                                const u = usersCache[mId];
                                return (
                                  <div key={mId} className="flex items-center gap-3 p-2 hover:bg-[#c4ff4d] brutal-border transition-colors cursor-default">
                                    {u?.photoURL ? (
                                      <img src={u.photoURL} alt="avatar" className="w-6 h-6 brutal-border object-cover" />
                                    ) : (
                                      <div className="w-6 h-6 brutal-border bg-[#ffb4d4] text-black flex items-center justify-center text-[10px] font-black">
                                        {u?.displayName?.charAt(0).toUpperCase() || '?'}
                                      </div>
                                    )}
                                    <span className="truncate text-black text-sm font-bold uppercase">{u?.displayName || 'Loading...'}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Columns 2 & 3: Main Stage (Roadmap Timeline) */}
          <div className="col-span-1 lg:col-span-2 flex flex-col h-[calc(100vh-160px)] min-h-0">
            {selectedRoom ? (
               <RoadmapTimeline 
                 roomId={selectedRoom.id} 
                 roadmapId={selectedRoom.roadmapId || "roadmap"} 
                 usersCache={usersCache}
               />
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-white brutal-border brutal-shadow-lg p-12 text-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#000 2px, transparent 2px)", backgroundSize: "20px 20px" }}></div>
                <div className="w-20 h-20 bg-[#ffe800] brutal-border flex items-center justify-center mb-6 brutal-shadow-sm transform rotate-3">
                  <MousePointerClick className="w-10 h-10 text-black" strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl font-black text-black mb-3 tracking-tight uppercase">Select a room</h2>
                <p className="text-black font-bold max-w-sm text-lg">Choose a room from the sidebar to view its roadmap timeline and track your progress.</p>
              </div>
            )}
          </div>

          {/* Column 4: Activity & Widgets */}
          <div className="col-span-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar pb-10">
            <div>
              <h2 className="text-xl font-bitcount font-black uppercase tracking-widest text-black mb-6 flex items-center gap-3 bg-[#ffb4d4] border-[3px] border-black p-2 brutal-shadow-sm self-start inline-flex">
                <TrendingUp className="w-5 h-5 text-black" strokeWidth={3} />
                Activity
              </h2>
              <div className="p-6 bg-white brutal-border brutal-shadow-lg relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#94dfff] rounded-full blur-2xl opacity-50 z-0"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6 border-b-[3px] border-black pb-4">
                    <h3 className="text-lg font-black text-black tracking-wide uppercase">{format(currentMonth, "MMMM yyyy")}</h3>
                    <div className="flex gap-2">
                      <button onClick={handlePreviousMonth} className="p-1.5 brutal-border bg-white hover:bg-[#ffe800] text-black transition-colors brutal-shadow-sm active:brutal-shadow-none">
                        <ChevronLeft className="w-5 h-5" strokeWidth={3} />
                      </button>
                      <button onClick={handleNextMonth} className="p-1.5 brutal-border bg-white hover:bg-[#ffe800] text-black transition-colors brutal-shadow-sm active:brutal-shadow-none">
                        <ChevronRight className="w-5 h-5" strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <div key={i} className="text-center text-sm font-black text-black pb-2 border-b-2 border-black/20">
                        {d}
                      </div>
                    ))}
                    
                    {Array.from({ length: calendarDays[0].date.getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square border-[2px] border-dashed border-black/10"></div>
                    ))}
                    
                    {calendarDays.map((day, i) => {
                      const isPast = day.date.getTime() < new Date().setHours(0, 0, 0, 0);
                      return (
                        <div 
                          key={i} 
                          className={`aspect-square flex items-center justify-center text-sm font-black transition-all duration-150 brutal-border
                            ${day.isToday ? 'bg-[#ffe800] text-black' : 'text-black bg-white'}
                            ${day.hasActivity 
                              ? 'bg-[#c4ff4d] text-black brutal-shadow scale-[1.05] z-10' 
                              : 'hover:bg-black hover:text-white cursor-pointer shadow-none'
                            }
                            ${!day.hasActivity && isPast ? 'opacity-30' : ''}
                          `}
                          title={format(day.date, "MMM d")}
                        >
                          {format(day.date, "d")}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="p-6 bg-white brutal-border brutal-shadow-lg relative">
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[#ff9c9c] rounded-full blur-2xl opacity-50 z-0"></div>
                <div className="relative z-10">
                  <h3 className="text-lg font-bitcount font-black uppercase text-black mb-6 tracking-widest border-b-[3px] border-black pb-3">Deadlines</h3>
                  <div className="space-y-4">
                    {displayDeadlines.length > 0 ? (
                       displayDeadlines.map((deadline: any, idx) => (
                         <div key={idx} className={`flex items-start gap-4 p-3 brutal-border ${deadline.isOverdue ? 'bg-[#ff9c9c]' : 'bg-[#94dfff]'}`}>
                           <div className="w-10 h-10 brutal-border bg-white flex items-center justify-center shrink-0">
                             <Clock className={`w-5 h-5 ${deadline.isOverdue ? 'text-black' : 'text-black'}`} strokeWidth={3} />
                           </div>
                            <div className="flex-1">
                              <p className="text-sm font-black text-black leading-tight mb-1 uppercase">{deadline.title}</p>
                              <p className={`text-xs font-bold ${deadline.isOverdue ? 'text-white bg-black px-1 py-0.5 inline-block' : 'text-black'}`}>
                                {deadline.timeText} in <span className="font-black">{deadline.roomName}</span>
                              </p>
                            </div>
                         </div>
                       ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center brutal-border bg-white border-dashed">
                        <div className="w-12 h-12 bg-[#ffe800] brutal-border flex items-center justify-center mb-3">
                          <Calendar className="w-6 h-6 text-black" strokeWidth={2.5} />
                        </div>
                        <p className="text-sm font-black text-black uppercase">No immediate deadlines</p>
                        <p className="text-xs text-black mt-1 font-bold">Check back once you create or join a room.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
