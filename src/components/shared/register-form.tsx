"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed");
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    }
  };

  if (success) {
    return (
      <div className="cisco-card p-8 text-center">
        <div className="w-16 h-16 bg-[#6cc04a]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#6cc04a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-white font-semibold text-lg mb-1">Account Created!</h3>
        <p className="text-gray-400 text-sm">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="cisco-card p-6 border border-[#1f2937]">
      <form onSubmit={handleSubmit} className="space-y-4">
        {["name", "email", "password"].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-300 mb-1.5 capitalize">
              {field === "name" ? "Full Name" : field}
            </label>
            <input
              type={field === "password" ? "password" : field === "email" ? "email" : "text"}
              value={form[field as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              placeholder={
                field === "name" ? "John Doe" :
                field === "email" ? "engineer@company.com" : "••••••••"
              }
              required
              className="w-full px-3 py-2.5 bg-[#0d1117] border border-[#1f2937] rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#00bceb]/50 focus:ring-1 focus:ring-[#00bceb]/20 transition-all"
            />
          </div>
        ))}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-cisco py-2.5 disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-4">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-[#00bceb] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
