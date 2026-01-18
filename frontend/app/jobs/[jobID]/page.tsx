"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CircleUser, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type Job = {
  jobID: string;
  Title: string;
  Company: string;
  Location: string;
  Description: string;
};

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, getAuthHeader } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasResume, setHasResume] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Fetch job details
  useEffect(() => {
    fetch(`${BASE_URL}/api/jobs/${params.jobID}`)
      .then((res) => res.json())
      .then((data) => {
        setJob(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.jobID, BASE_URL]);

  // Check if user has a resume
  useEffect(() => {
    if (!user?.id) return;

    fetch(`${BASE_URL}/api/resumes/user/${user.id}`, {
      headers: getAuthHeader(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setHasResume(true);
        }
      })
      .catch(() => {});
  }, [user, BASE_URL, getAuthHeader]);

  // Check if user already applied to this job
  useEffect(() => {
    if (!user?.id || !params.jobID) return;

    fetch(`${BASE_URL}/api/applications/user/${user.id}`, {
      headers: getAuthHeader(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const applied = data.some((app) => app.job_id === params.jobID);
          setHasApplied(applied);
        }
      })
      .catch(() => {});
  }, [user, params.jobID, BASE_URL, getAuthHeader]);

  const handleApply = () => {
    if (!user?.id) {
      router.push("/login");
      return;
    }

    if (!hasResume) {
      router.push("/apply");
      return;
    }

    // Navigate to apply page with job context to tailor resume
    router.push(`/apply?jobId=${params.jobID}&jobTitle=${encodeURIComponent(job?.Title || '')}&company=${encodeURIComponent(job?.Company || '')}`);
  };

  if (loading) return <div className="p-12 text-center">Loading...</div>;
  if (!job) return <div className="p-12 text-center">Job not found</div>;

  return (
    <>
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto px-6 pt-6 flex items-center justify-between">
        <nav className="flex gap-6 text-sm">
          <motion.a
            href="/"
            className="cursor-pointer"
            whileHover={{ scale: 1.1, color: "#ec4899" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            ← Back to listings
          </motion.a>
          <motion.a
            href="/apply"
            className="cursor-pointer"
            whileHover={{ scale: 1.1, color: "#ec4899" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Resume
          </motion.a>
          <motion.a
            href="/applications"
            className="cursor-pointer"
            whileHover={{ scale: 1.1, color: "#ec4899" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            My Applications
          </motion.a>
        </nav>

        <motion.div
          whileHover={{ scale: 1.1, opacity: 0.9 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="cursor-pointer"
          onClick={() => router.push(user ? "/apply" : "/login")}
        >
          <CircleUser />
        </motion.div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-5xl px-6 py-12 flex-1">
        <motion.article
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.12)" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-xl bg-white/80 p-12 shadow-lg mx-auto max-w-3xl"
        >
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl font-serif font-bold">{job.Title}</h1>
              <p className="text-2xl mt-3 text-gray-700">{job.Company}</p>
              <p className="mt-2 text-lg text-gray-500">{job.Location}</p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold mb-3">Job Description</h2>
              <p className="text-base leading-relaxed text-gray-700 whitespace-pre-wrap">
                {job.Description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              {hasApplied ? (
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  Applied
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  className="rounded-md bg-black px-8 py-3 text-sm font-semibold text-white hover:opacity-90"
                >
                  {user ? (hasResume ? "Apply now" : "Create resume to apply") : "Login to apply"}
                </button>
              )}
              <button
                onClick={() => router.push("/")}
                className="rounded-md border border-black px-8 py-3 text-sm font-semibold hover:bg-black/5"
              >
                Back to listings
              </button>
            </div>
          </div>
        </motion.article>
      </section>
    </>
  );
}
