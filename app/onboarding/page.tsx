"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateLifePath, getSunSign, getLifePathMeaning } from "@/lib/numerology";

type Step = 1 | 2 | 3 | 4 | 5;

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    birthLat: null as number | null,
    birthLng: null as number | null,
  });

  const [calculated, setCalculated] = useState<{
    lifePathNumber: number;
    sunSign: string;
  } | null>(null);

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    if (!formData.birthDate) {
      alert("Birth date is required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete onboarding");
      }

      // Store calculated values
      setCalculated({
        lifePathNumber: data.data.lifePathNumber,
        sunSign: data.data.sunSign,
      });

      // Update session
      await update();

      // Move to final step
      setCurrentStep(5);
      setLoading(false);
    } catch (error: any) {
      alert(error.message || "Failed to complete onboarding");
      setLoading(false);
    }
  };

  const finishOnboarding = () => {
    router.push("/");
    router.refresh();
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
        className="relative w-full max-w-2xl"
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex flex-1 items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all ${
                    step <= currentStep
                      ? "border-cyan-300 bg-cyan-400/20 text-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                      : "border-white/20 bg-white/5 text-slate-400"
                  }`}
                >
                  {step}
                </div>
                {step < 5 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 transition-all ${
                      step < currentStep ? "bg-cyan-300" : "bg-white/20"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card Container */}
        <div className="glass-card border border-white/20 p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="mb-4 text-center text-2xl font-bold text-white">
                  Welcome, {session?.user?.name || "friend"}! 👋
                </h2>
                <p className="mb-6 text-center text-slate-300">
                  Let's personalize your mystical command center. We'll need a few details to
                  calculate your Life Path number and astrological profile.
                </p>
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={nextStep}
                    className="rounded-lg border border-cyan-300/30 bg-cyan-400/20 px-8 py-3 font-semibold text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all hover:bg-cyan-400/30 active:scale-95"
                  >
                    Let's Begin
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Birth Date */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="mb-4 text-center text-2xl font-bold text-white">
                  When were you born? 🎂
                </h2>
                <p className="mb-6 text-center text-sm text-slate-400">
                  Your birth date is the foundation of your numerology profile
                </p>
                <div className="mx-auto max-w-md">
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white backdrop-blur-sm transition-all focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="mt-8 flex justify-between">
                  <button
                    onClick={prevStep}
                    className="rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-medium text-slate-300 transition-all hover:bg-white/10 active:scale-95"
                  >
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!formData.birthDate}
                    className="rounded-lg border border-cyan-300/30 bg-cyan-400/20 px-8 py-3 font-semibold text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all hover:bg-cyan-400/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Birth Time (Optional) */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="mb-4 text-center text-2xl font-bold text-white">
                  What time were you born? ⏰
                </h2>
                <p className="mb-6 text-center text-sm text-slate-400">
                  Optional, but helps with more accurate birth chart calculations
                </p>
                <div className="mx-auto max-w-md">
                  <input
                    type="time"
                    value={formData.birthTime}
                    onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                    className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white backdrop-blur-sm transition-all focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                  />
                </div>
                <div className="mt-8 flex justify-between">
                  <button
                    onClick={prevStep}
                    className="rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-medium text-slate-300 transition-all hover:bg-white/10 active:scale-95"
                  >
                    Back
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={nextStep}
                      className="rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-medium text-slate-300 transition-all hover:bg-white/10 active:scale-95"
                    >
                      Skip
                    </button>
                    <button
                      onClick={nextStep}
                      className="rounded-lg border border-cyan-300/30 bg-cyan-400/20 px-8 py-3 font-semibold text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all hover:bg-cyan-400/30 active:scale-95"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Birth Place (Optional) */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="mb-4 text-center text-2xl font-bold text-white">
                  Where were you born? 🌍
                </h2>
                <p className="mb-6 text-center text-sm text-slate-400">
                  Optional, for precise astrological calculations
                </p>
                <div className="mx-auto max-w-md">
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    placeholder="City, State/Country"
                    className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-slate-400 backdrop-blur-sm transition-all focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                  />
                </div>
                <div className="mt-8 flex justify-between">
                  <button
                    onClick={prevStep}
                    className="rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-medium text-slate-300 transition-all hover:bg-white/10 active:scale-95"
                  >
                    Back
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-medium text-slate-300 transition-all hover:bg-white/10 active:scale-95"
                    >
                      {loading ? "Calculating..." : "Skip"}
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="rounded-lg border border-cyan-300/30 bg-cyan-400/20 px-8 py-3 font-semibold text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all hover:bg-cyan-400/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? "Calculating..." : "Calculate"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Results */}
            {currentStep === 5 && calculated && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="mb-6 text-center text-3xl font-bold text-white">
                  Your Mystical Profile ✨
                </h2>

                <div className="space-y-4">
                  {/* Life Path Number */}
                  <div className="rounded-lg border border-cyan-300/30 bg-cyan-400/10 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-cyan-200">Life Path Number</p>
                        <p className="mt-1 text-2xl font-bold text-white">
                          {calculated.lifePathNumber}
                        </p>
                        <p className="mt-1 text-sm text-cyan-100">
                          {getLifePathMeaning(calculated.lifePathNumber).title}
                        </p>
                      </div>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-cyan-300 bg-cyan-400/20 text-3xl font-bold text-cyan-100">
                        {calculated.lifePathNumber}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-300">
                      {getLifePathMeaning(calculated.lifePathNumber).description}
                    </p>
                  </div>

                  {/* Sun Sign */}
                  <div className="rounded-lg border border-white/20 bg-white/5 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-400">Sun Sign</p>
                        <p className="mt-1 text-2xl font-bold text-white">
                          {calculated.sunSign}
                        </p>
                      </div>
                      <div className="text-4xl">♈</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={finishOnboarding}
                    className="rounded-lg border border-cyan-300/30 bg-cyan-400/20 px-8 py-4 text-lg font-semibold text-cyan-100 shadow-[0_0_25px_rgba(34,211,238,0.2)] transition-all hover:bg-cyan-400/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] active:scale-95"
                  >
                    Enter Your Command Center →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
