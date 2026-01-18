"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CircleUser } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const auth = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!BASE_URL) throw new Error("Backend URL not set");

    const payload = {
      email: email.trim(),
      password: password.trim(),
      fullName: fullName.trim(),
    };

    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Signup failed");
    }

    auth.login(data.session.access_token, {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.user_metadata?.full_name || fullName,
    });
    router.push("/");
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};



  return (
    <>
    <header className="mx-auto max-w-5xl px-6 pt-6 flex items-center justify-between">
      <nav className="flex gap-6 text-sm">
        {[ "← Back to listings", "Resume", "About", "Careers"].map((link) => (
          <motion.a
            key={link}
            href="/"
            className="cursor-pointer"
            whileHover={{ scale: 1.1, color: "#ec4899" }} // pink-500
            transition={{ type: "spring", stiffness: 300 }}
          >
            {link}
          </motion.a>
        ))}

        <motion.a
          href="#"
          className="flex items-center gap-1 cursor-pointer"
          whileHover={{ scale: 1.1, color: "#ec4899" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          Get started →
        </motion.a>
      </nav>

      <motion.div
        whileHover={{ scale: 1.1, opacity: 0.9 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="cursor-pointer"
        onClick={() => router.push("/signup")}
      >
        <CircleUser />
      </motion.div>
      </header>
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-pink-200 via-pink-100 to-amber-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md rounded-xl bg-white/80 p-8 shadow-lg backdrop-blur-md"
      >
        <h1 className="mb-6 text-center font-serif text-3xl font-bold text-black">
          Signup
        </h1>

        {error && <p className="mb-4 text-center text-red-600">{error}</p>}

        <form className="space-y-5" onSubmit={handleSignup}>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Name
            </label>
            <input
              type="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
              minLength={6}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-black placeholder-gray-400 focus:border-pink-400 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Signing up…" : "Signup"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          have an account?{" "}
          <a href="/login" className="font-semibold text-pink-600 hover:underline">
            Login
          </a>
        </p>
      </motion.div>
    </main>
    </>
  );
}
