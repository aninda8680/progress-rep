"use client";

import { useState } from "react";
import { X, BookOpen, Users, Loader2, Link as LinkIcon, Copy, CheckCircle2, Info, Binary, Smartphone } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (roomId: string) => void;
}

const AVAILABLE_ROADMAPS = [
  { id: "dsa-roadmap", title: "Data Structures & Algorithms (C++)", icon: <Binary className="w-6 h-6 text-black" strokeWidth={2.5} /> },
  { id: "roadmap", title: "Flutter App Development", icon: <Smartphone className="w-6 h-6 text-black" strokeWidth={2.5} /> }
];

export function CreateRoomModal({ isOpen, onClose, onSuccess }: CreateRoomModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [selectedRoadmap, setSelectedRoadmap] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const MAX_CHARS = 30;
  const isOverLimit = name.length > MAX_CHARS;
  const isEmpty = name.trim().length === 0;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmpty) {
      setError("Room name is required");
      return;
    }
    
    if (isOverLimit) {
      setError("Room name must be 30 characters or less");
      return;
    }

    if (!user) {
      setError("You must be logged in to create a room");
      return;
    }

    if (!selectedRoadmap) {
      setError("Please select a roadmap");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const selectedRoadmapData = AVAILABLE_ROADMAPS.find(r => r.id === selectedRoadmap);
      
      const docRef = await addDoc(collection(db, "rooms"), {
        name: name.trim(),
        roadmap: selectedRoadmapData?.title,
        roadmapId: selectedRoadmap,
        createdBy: user.uid,
        members: [user.uid],
        progress: 0,
        createdAt: serverTimestamp(),
      });

      setCreatedRoomId(docRef.id);
      setStep(2);
      toast.success("Room created successfully!");
      onSuccess(docRef.id);
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(createdRoomId);
    setCopied(true);
    toast.success("Room code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const resetAndClose = () => {
    setStep(1);
    setName("");
    setSelectedRoadmap("");
    setCreatedRoomId("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={step === 1 ? onClose : undefined}
      ></div>
      
      <div className="relative w-full max-w-md bg-white brutal-border brutal-shadow-lg overflow-hidden transform rotate-1">
        <div className="flex items-center justify-between p-6 border-b-[4px] border-black bg-[#ffe800]">
          <h2 className="text-2xl font-black text-black uppercase tracking-tight">
            {step === 1 ? "Create a Room" : "Room Created!"}
          </h2>
          <button 
            onClick={resetAndClose}
            className="p-1 brutal-border bg-white hover:bg-red-500 hover:text-white transition-colors brutal-shadow-sm active:brutal-shadow-none"
          >
            <X className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleCreate} className="p-8">
            {error && (
              <div className="flex items-start gap-3 p-4 mb-6 text-sm text-black bg-[#ff9c9c] brutal-border brutal-shadow-sm font-bold">
                <Info className="w-5 h-5 mt-0.5 shrink-0" strokeWidth={3} />
                <p>{error}</p>
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="roomName" className="block text-lg font-black text-black uppercase tracking-wide">
                    Room Name
                  </label>
                  <span className={`text-sm font-black ${isOverLimit ? 'text-[#ff9c9c]' : 'text-black'}`}>
                    {name.length} / {MAX_CHARS}
                  </span>
                </div>
                <input
                  id="roomName"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="e.g. Weekend DSA Warriors"
                  className="w-full bg-white brutal-border px-4 py-4 text-black placeholder-black/40 font-bold focus:outline-none focus:ring-0 focus:brutal-shadow transition-shadow"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-lg font-black text-black uppercase tracking-wide mb-3">
                  Select Roadmap
                </label>
                <div className="space-y-4">
                  {AVAILABLE_ROADMAPS.map((roadmap) => (
                    <div 
                      key={roadmap.id}
                      onClick={() => setSelectedRoadmap(roadmap.id)}
                      className={`flex items-center gap-4 p-4 brutal-border cursor-pointer transition-all brutal-shadow-sm ${
                        selectedRoadmap === roadmap.id 
                          ? "bg-[#c4ff4d] transform translate-x-1" 
                          : "bg-white hover:bg-[#c4ff4d]/20 hover:translate-x-1"
                      }`}
                    >
                      <div className="shrink-0 w-12 h-12 brutal-border bg-white flex items-center justify-center transform -rotate-3">{roadmap.icon}</div>
                      <div>
                        <h3 className="font-black text-black uppercase tracking-wide">
                          {roadmap.title}
                        </h3>
                        <p className="text-xs text-black font-bold mt-1">
                          Structured curriculum loaded from /data
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4 border-t-[3px] border-black pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 font-black text-black bg-white brutal-border hover:bg-black hover:text-white transition-colors uppercase tracking-wide"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || isOverLimit || isEmpty || !selectedRoadmap}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#ffb4d4] disabled:opacity-50 text-black font-black uppercase tracking-wide brutal-btn"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} />
                ) : (
                  <>
                    <Users className="w-5 h-5" strokeWidth={3} />
                    Create
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-10 text-center bg-white">
            <div className="w-20 h-20 bg-[#c4ff4d] brutal-border flex items-center justify-center mx-auto mb-6 brutal-shadow transform rotate-3">
              <CheckCircle2 className="w-10 h-10 text-black" strokeWidth={3} />
            </div>
            
            <h3 className="text-3xl font-black text-black mb-3 uppercase tracking-tight">You're all set!</h3>
            <p className="text-black font-bold text-lg mb-8">
              Share this code with your study group so they can join your room.
            </p>

            <div className="bg-[#94dfff] brutal-border p-4 flex items-center justify-between mb-8 brutal-shadow-sm transform -rotate-1">
              <div className="flex items-center gap-3 overflow-hidden">
                <LinkIcon className="w-6 h-6 text-black shrink-0" strokeWidth={3} />
                <code className="text-black font-mono font-black text-lg truncate select-all">{createdRoomId}</code>
              </div>
              <button 
                onClick={copyToClipboard}
                className="ml-3 p-3 bg-white brutal-border hover:bg-[#ffe800] transition-colors shrink-0 brutal-shadow-sm active:brutal-shadow-none"
              >
                {copied ? <CheckCircle2 className="w-5 h-5 text-black" strokeWidth={3} /> : <Copy className="w-5 h-5 text-black" strokeWidth={3} />}
              </button>
            </div>

            <button
              onClick={resetAndClose}
              className="w-full px-6 py-4 bg-black hover:bg-black/80 text-white font-black uppercase tracking-wide transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
