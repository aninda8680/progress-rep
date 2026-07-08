"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#94dfff]">
        <div className="w-12 h-12 brutal-border rounded-full border-t-[#ffe800] animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#94dfff] flex flex-col font-sans text-black selection:bg-[#ffb4d4]">
      {/* Top Nav Minimal */}
      <nav className="w-full px-6 py-6 absolute top-0 left-0">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-black uppercase text-black hover:underline decoration-4 underline-offset-4 transition-all">
          <ArrowLeft className="w-6 h-6" strokeWidth={3} />
          Back to Home
        </Link>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md brutal-border bg-white p-10 relative brutal-shadow-lg transform rotate-1">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 brutal-border bg-[#ffe800] flex items-center justify-center mb-6 brutal-shadow-sm transform -rotate-3">
              <LayoutDashboard className="w-8 h-8 text-black" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black text-black mb-3 tracking-tighter uppercase">Welcome to Portline</h1>
            <p className="text-lg text-black font-bold">Sign in to access your study groups and roadmaps.</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={signInWithGoogle}
              className="w-full relative group flex items-center justify-center gap-4 px-6 py-4 bg-[#ffb4d4] brutal-btn brutal-shadow-sm active:brutal-shadow-none"
            >
              {/* Google Icon SVG */}
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-lg font-black text-black uppercase tracking-wide">Continue with Google</span>
            </button>
          </div>
          
          <div className="mt-8 pt-8 border-t-[3px] border-black">
            <p className="text-center text-sm text-black font-bold uppercase">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
