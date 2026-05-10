"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  // Demo accounts helper
  const fillDemo = (role: string) => {
    const accounts: Record<string, { email: string; password: string }> = {
      admin: { email: "admin@netops.dev", password: "admin123" },
      senior: { email: "senior@netops.dev", password: "senior123" },
      junior: { email: "junior@netops.dev", password: "junior123" },
    };
    const account = accounts[role];
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
    }
  };

  return (
    <div className="cisco-card p-6 border border-[#1f2937]">
      {/* Demo accounts */}
      <div className="mb-6 p-3 bg-[#00bceb]/5 border border-[#00bceb]/10 rounded-lg">
        <p className="text-xs text-gray-500 mb-2 font-mono">DEMO ACCOUNTS:</p>
        <div className="flex gap-2 flex-wrap">
          {["admin", "senior", "junior"].map((role) => (
            <button
              key={role}
              onClick={() => fillDemo(role)}
              type="button"
              className="px-2 py-1 text-xs bg-[#0d1117] border border-[#1f2937] rounded text-gray-400 hover:text-[#00bceb] hover:border-[#00bceb]/30 transition-colors font-mono"
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="engineer@company.com"
            required
            className="w-full px-3 py-2.5 bg-[#0d1117] border border-[#1f2937] rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#00bceb]/50 focus:ring-1 focus:ring-[#00bceb]/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-3 py-2.5 bg-[#0d1117] border border-[#1f2937] rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#00bceb]/50 focus:ring-1 focus:ring-[#00bceb]/20 transition-all"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-cisco py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Authenticating...
            </span>
          ) : (
            "Sign In to Dashboard"
          )}
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-4">
        No account?{" "}
        <Link href="/auth/register" className="text-[#00bceb] hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
