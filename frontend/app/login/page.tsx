"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Login failed");
      }

      const data = await res.json();
      console.log("Login successful:", data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-pink-200 via-pink-100 to-amber-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md rounded-xl bg-white/80 p-8 shadow-lg backdrop-blur-md"
      >
        <h1 className="mb-6 text-center font-serif text-3xl font-bold text-black">
          Login
        </h1>

        {error && <p className="mb-4 text-center text-red-600">{error}</p>}

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Name
            </label>
            <input
              type="name"
              value={password}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-black placeholder-gray-400 focus:border-pink-400 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
              placeholder="Name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-black placeholder-gray-400 focus:border-pink-400 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-black placeholder-gray-400 focus:border-pink-400 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href="/signup" className="font-semibold text-pink-600 hover:underline">
            Sign up
          </a>
        </p>
      </motion.div>
    </main>
  );
}
