"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or password");
        setLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12" style={{ background: "#05070d" }}>
      {/* Background gradient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            VibeWorks Hub
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Your mystical command center awaits
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card border border-white/20 p-8">
          <h2 className="mb-6 text-center text-xl font-semibold text-white">
            Sign In
          </h2>

          {error && (
            <div className="mb-4 rounded-lg border border-rose-300/30 bg-rose-300/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-300">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-400 backdrop-blur-sm transition-all focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-400 backdrop-blur-sm transition-all focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border border-cyan-300/30 bg-cyan-400/20 px-4 py-3 font-semibold text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all hover:bg-cyan-400/30 hover:shadow-[0_0_25px_rgba(34,211,238,0.25)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-cyan-300 transition-colors hover:text-cyan-200"
              >
                Register
              </Link>
            </p>
          </div>
        </div>

        {/* Footer hint */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Invite-only access • Premium mystical insights
        </p>
      </motion.div>
    </div>
  );
}
