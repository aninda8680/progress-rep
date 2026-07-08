"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Plus, 
  LogOut,
  FolderOpen,
  Settings
} from "lucide-react";
import { CreateRoomModal } from "@/components/CreateRoomModal";
import { JoinRoomModal } from "@/components/JoinRoomModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-12 h-12 brutal-border rounded-full border-t-[#ffe800] animate-spin"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans selection:bg-[#ffb4d4]">
      {/* Sidebar */}
      <aside className="w-64 border-r-[4px] border-black bg-white flex flex-col hidden md:flex z-20 brutal-shadow-lg relative">
        <div className="p-6 border-b-[4px] border-black flex items-center gap-3 bg-[#ffe800]">
          <div className="w-8 h-8 brutal-border bg-black flex items-center justify-center transform rotate-6">
            <div className="w-3 h-3 bg-[#ffe800] rounded-none"></div>
          </div>
          <span className="font-bold text-xl tracking-tight uppercase font-bitcount">Portline</span>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-6 overflow-y-auto">
          <div>
            <div className="text-sm font-black text-black uppercase tracking-wider mb-3 px-3">Actions</div>
            <div className="space-y-3">
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-3 bg-[#c4ff4d] text-black font-black uppercase tracking-wide brutal-btn"
              >
                <Plus className="w-5 h-5" strokeWidth={3} />
                Create Room
              </button>
              <button 
                onClick={() => setIsJoinModalOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-3 bg-white text-black font-black uppercase tracking-wide brutal-btn"
              >
                <FolderOpen className="w-5 h-5" strokeWidth={3} />
                Join Room
              </button>
            </div>
          </div>

          <div>
            <div className="text-sm font-black text-black uppercase tracking-wider mb-3 px-3">Menu</div>
            <nav className="space-y-2">
              <Link
                href="/dashboard"
                className={`flex items-center gap-3 px-3 py-3 font-black transition-all uppercase tracking-wide ${
                  pathname === "/dashboard" 
                    ? "bg-[#ffb4d4] text-black brutal-border brutal-shadow-sm translate-x-1" 
                    : "text-black hover:bg-[#ffb4d4]/30 hover:translate-x-1 brutal-border border-transparent hover:border-black"
                }`}
              >
                <LayoutDashboard className="w-5 h-5" strokeWidth={3} />
                Overview
              </Link>
              <Link
                href="/dashboard/settings"
                className={`flex items-center gap-3 px-3 py-3 font-black transition-all uppercase tracking-wide ${
                  pathname === "/dashboard/settings" 
                    ? "bg-[#ffb4d4] text-black brutal-border brutal-shadow-sm translate-x-1" 
                    : "text-black hover:bg-[#ffb4d4]/30 hover:translate-x-1 brutal-border border-transparent hover:border-black"
                }`}
              >
                <Settings className="w-5 h-5" strokeWidth={3} />
                Settings
              </Link>
            </nav>
          </div>
        </div>

        <div className="p-4 border-t-[4px] border-black bg-[#94dfff]">
          <div className="flex items-center gap-3 mb-4 px-2">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-10 h-10 brutal-border bg-white" />
            ) : (
              <div className="w-10 h-10 bg-white flex items-center justify-center text-sm brutal-border font-black">
                {user.displayName?.charAt(0) || user.email?.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-black truncate uppercase">{user.displayName || "User"}</p>
              <p className="text-xs text-black font-bold truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-white text-black font-black uppercase tracking-wide brutal-btn"
          >
            <LogOut className="w-5 h-5" strokeWidth={3} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background relative z-10">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b-[4px] border-black bg-[#ffe800] brutal-shadow-sm relative z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 brutal-border bg-black flex items-center justify-center transform rotate-6">
              <div className="w-3 h-3 bg-[#ffe800] rounded-none"></div>
            </div>
            <span className="font-bold text-lg tracking-tight uppercase font-bitcount">Portline</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="p-2 bg-[#c4ff4d] brutal-btn"
            >
              <Plus className="w-5 h-5 text-black" strokeWidth={3} />
            </button>
            <button 
              onClick={() => setIsJoinModalOpen(true)}
              className="p-2 bg-white brutal-btn"
            >
              <FolderOpen className="w-5 h-5 text-black" strokeWidth={3} />
            </button>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-10 h-10 brutal-border bg-white" />
            ) : (
              <div className="w-10 h-10 bg-white flex items-center justify-center text-sm brutal-border font-black">
                {user.displayName?.charAt(0) || user.email?.charAt(0)}
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      <CreateRoomModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={() => {}} 
      />
      <JoinRoomModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
        onSuccess={() => {}} 
      />
    </div>
  );
}
