"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CircleUser } from "lucide-react";
import { Badge } from "@/components/ui/badge"

type Job = {
  jobID: string;
  Title: string;
  Company: string;
  Location: string;
  Description: string;
  "Applied Users": { id: string }[] | null;
};

export default function HomePage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState();

  useEffect(() => {
    const fetchJobs = async () => {
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!BASE_URL) {
        console.error("NEXT_PUBLIC_BACKEND_URL is not defined!");
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/api/jobs/`);
        if (!res.ok) throw new Error("Failed to fetch jobs");

        const data = await res.json();
        setJobs(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load jobs");
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
  // Get current user data
  const getCurrentUser = async () => {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = localStorage.getItem('accessToken');
    
    // If no token, don't attempt to fetch user
    if (!token) {
      return;
    }
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // If unauthorized, clear the invalid token
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      setUser(data.user.fullName); // Access the fullName from the nested user object
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };
  
  getCurrentUser();
}, []);
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-200 via-pink-100 to-amber-100 text-black">
      {/* Nav */}
      <header className="mx-auto max-w-7xl px-6 pt-6 flex items-center justify-between">
      <nav className="flex gap-6 text-sm">
        {["Home", "Resume", "About", "Careers"].map((link) => (
          <motion.a
            key={link}
            href="#"
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
        onClick={() => router.push("/login")}
      >
        <CircleUser />
      </motion.div>
    </header>

      {/* Title */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-center font-serif text-6xl">Welcome {user}!</h1>

        <div className="mx-auto mt-10 max-w-2xl space-y-5">
          {loading && <p className="text-center">Loading jobs…</p>}
          {error && <p className="text-center text-red-600">{error}</p>}

          {jobs.map((job) => (
            <motion.article
            key={job.jobID}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.03, boxShadow: "0 10px 25px rgba(0,0,0,0.12)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-full max-w-md rounded-xl bg-white/80 p-8 pb-14 shadow-lg backdrop-blur-md mx-auto"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold">{job.Title}</h2>
                <p className="text-xs">{job.Company}</p>
                <p className="mt-1 text-[11px] text-gray-500">{job.Location}</p>
              </div>

              <button
                className="h-9 shrink-0 rounded-md bg-black px-4 text-xs font-semibold text-white hover:opacity-90"
                onClick={() => router.push(`/jobs/${job.jobID}`)}
              >
                View role
              </button>
            </div>

            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              {job.Tags?.map((tag, index) => (
                <Badge key={`${job.jobID}-tag-${index}`}>
                  {tag}
                </Badge>
              ))}
            </div>

            </motion.article>

            
            ))}

            <motion.article
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="rounded-xl border border-dashed border-black/30 p-5 w-full max-w-md mx-auto"
            >
            <div className="flex justify-between gap-4">
                <div>
                <h2 className="text-sm font-semibold">Open application</h2>
                <p className="mt-4 text-sm">Don't see your role? Apply anyway!</p>
                </div>
                <button className="h-9 rounded-md bg-black px-4 text-xs font-semibold text-white">
                Apply now
                </button>
            </div>
            
            </motion.article>

        </div>
      </section>
    </main>
  );
}
