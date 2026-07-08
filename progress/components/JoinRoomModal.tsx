"use client";

import { useState } from "react";
import { X, Loader2, Info, FolderOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import toast from "react-hot-toast";

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function JoinRoomModal({ isOpen, onClose, onSuccess }: JoinRoomModalProps) {
  const { user } = useAuth();
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const isValidFormat = roomCode.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = roomCode.trim();

    if (!trimmedCode) {
      setError("Please enter a room code.");
      return;
    }

    if (!user) {
      setError("You must be logged in to join a room.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const roomRef = doc(db, "rooms", trimmedCode);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        setError("Invalid room code. Please check and try again.");
        return;
      }

      const roomData = roomSnap.data();

      if (roomData.members && roomData.members.includes(user.uid)) {
        setError("You are already a member of this room.");
        return;
      }

      // Add user to the members array
      await updateDoc(roomRef, {
        members: arrayUnion(user.uid)
      });
      
      toast.success(`Successfully joined '${roomData.name}'!`);
      
      setRoomCode("");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error joining room:", err);
      if (err.code === 'permission-denied') {
        setError("You don't have permission to join this room.");
      } else {
        setError("Failed to join room. Please try again.");
      }
      toast.error("Failed to join room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-md bg-white brutal-border brutal-shadow-lg overflow-hidden transform -rotate-1">
        <div className="flex items-center justify-between p-6 border-b-[4px] border-black bg-[#94dfff]">
          <h2 className="text-2xl font-black text-black uppercase tracking-tight">Join a Room</h2>
          <button 
            onClick={onClose}
            className="p-1 brutal-border bg-white hover:bg-red-500 hover:text-white transition-colors brutal-shadow-sm active:brutal-shadow-none"
          >
            <X className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="flex items-start gap-3 p-4 mb-6 text-sm text-black bg-[#ff9c9c] brutal-border brutal-shadow-sm font-bold">
              <Info className="w-5 h-5 mt-0.5 shrink-0" strokeWidth={3} />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4 mb-8">
            <label htmlFor="roomCode" className="block text-lg font-black text-black uppercase tracking-wide">
              Room Code
            </label>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value);
                if (error) setError("");
              }}
              placeholder="Paste your room code here"
              className="w-full bg-white brutal-border px-4 py-4 text-black placeholder-black/40 font-bold focus:outline-none focus:ring-0 focus:brutal-shadow transition-shadow"
              autoFocus
            />
            <p className="text-sm text-black font-bold mt-2 px-1">
              * Must be a valid ID provided by the room creator
            </p>
          </div>

          <div className="flex justify-end gap-4 border-t-[3px] border-black pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 font-black text-black bg-white brutal-border hover:bg-black hover:text-white transition-colors uppercase tracking-wide"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isValidFormat}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#ffe800] disabled:opacity-50 text-black font-black uppercase tracking-wide brutal-btn"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} />
              ) : (
                <>
                  <FolderOpen className="w-5 h-5" strokeWidth={3} />
                  Join Room
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
