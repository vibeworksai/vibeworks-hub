"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  validateUsername,
  validatePassword,
  validateEmail,
  validateFullName,
  validateInviteCode,
} from "@/lib/validation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    inviteCode: "",
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    const inviteError = validateInviteCode(formData.inviteCode);
    if (inviteError) {
      setError(inviteError);
      return;
    }

    const nameError = validateFullName(formData.fullName);
    if (nameError) {
      setError(nameError);
      return;
    }

    const usernameError = validateUsername(formData.username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    const emailError = validateEmail(formData.email);
    if (emailError) {
      setError(emailError);
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Registration failed:", data);
        setError(data.error || "Registration failed. Please check all fields.");
        setLoading(false);
        return;
      }

      // Auto-login after successful registration
      const signInResult = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created but login failed. Please sign in manually.");
        setLoading(false);
      } else {
        // Redirect to onboarding
        router.push("/onboarding");
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
            Join the mystical command center
          </p>
        </div>

        {/* Registration Card */}
        <div className="glass-card border border-white/20 p-8">
          <h2 className="mb-6 text-center text-xl font-semibold text-white">
            Create Account
          </h2>

          {error && (
            <div className="mb-4 rounded-lg border border-rose-300/30 bg-rose-300/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="inviteCode" className="mb-2 block text-sm font-medium text-slate-300">
                Invite Code *
              </label>
              <input
                id="inviteCode"
                name="inviteCode"
                type="text"
                value={formData.inviteCode}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 font-mono text-white placeholder-slate-400 backdrop-blur-sm transition-all focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                placeholder="INVITE-CODE-HERE"
              />
            </div>

            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-300">
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-400 backdrop-blur-sm transition-all focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                placeholder="Ivan Lee"
              />
            </div>

            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-300">
                Username *
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-400 backdrop-blur-sm transition-all focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                placeholder="ivanlee"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
                Email (optional)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-400 backdrop-blur-sm transition-all focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                placeholder="ivan@vibeworks.ai"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-400 backdrop-blur-sm transition-all focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-300">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-400 backdrop-blur-sm transition-all focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                placeholder="Re-enter password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border border-cyan-300/30 bg-cyan-400/20 px-4 py-3 font-semibold text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all hover:bg-cyan-400/30 hover:shadow-[0_0_25px_rgba(34,211,238,0.25)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-cyan-300 transition-colors hover:text-cyan-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer hint */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Invite codes: IVAN-VW-2026 • NATASHA-VW-2026
        </p>
      </motion.div>
    </div>
  );
}
