"use client";

import { useEffect, useState } from "react";



type Job = {
  jobID: string;
  Title: string;
  Company: string;
  Location: string;
  Description: string;
  "Applied Users": { id: string }[] | null;
};
export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    }
  };

  fetchJobs();
}, []);


return (
    <main className="min-h-screen bg-gradient-to-b from-pink-200 via-pink-100 to-amber-100 text-black">
      {/* Nav */}
      <header className="mx-auto max-w-5xl px-6 pt-6">
        <nav className="flex gap-6 text-sm">
          <a>Product</a>
          <a>Journal</a>
          <a>About</a>
          <a>Careers</a>
          <a className="flex items-center gap-1">
            Get started →
          </a>
        </nav>
      </header>

      {/* Title */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-center font-serif text-6xl">
          Career Listings
        </h1>

        <div className="mx-auto mt-10 max-w-2xl space-y-5">
          {loading && <p className="text-center">Loading jobs…</p>}
          {error && <p className="text-center text-red-600">{error}</p>}
        {jobs.map((job) => (
          <article key={job.jobID} className="rounded-xl bg-white/70 p-5 shadow-sm">
            <h2 className="text-sm font-semibold">{job.Title}</h2>
            <p className="text-xs">{job.Company}</p>
            <p className="mt-1 text-[11px] text-gray-500">{job.Location}</p>
            <p className="mt-4 text-sm text-gray-700">{job.Description}</p>
          </article>
        ))}




          <article className="rounded-xl border border-dashed border-black/30 p-5">
            <div className="flex justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold">Open application</h2>
                <p className="mt-4 text-sm">
                  Don’t see your role? Apply anyway!
                </p>
              </div>
              <button className="h-9 rounded-md bg-black px-4 text-xs font-semibold text-white">
                Apply now
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
