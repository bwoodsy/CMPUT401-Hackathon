"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3001/api/jobs/${params.jobID}`)
      .then((res) => res.json())
      .then((data) => {
        setJob(data);
        setLoading(false);
      });
  }, [params.jobID]);

  if (loading) return <div>Loading...</div>;
  if (!job) return <div>Job not found</div>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-200 via-pink-100 to-amber-100 text-black">
      {/* Nav */}
      <header className="mx-auto max-w-5xl px-6 pt-6">
        <nav className="flex gap-6 text-sm">
          <button onClick={() => router.push('/')} className="hover:underline">← Back to listings</button>
          <a>Product</a>
          <a>Journal</a>
          <a>About</a>
          <a>Careers</a>
          <a className="flex items-center gap-1">
            Get started →
          </a>
        </nav>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        {loading && <p className="text-center">Loading job details…</p>}
        
        {!loading && job && (
          <article className="rounded-xl bg-white/70 p-12 shadow-lg">
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

              <div className="flex gap-4 pt-6">
                <button className="rounded-md bg-black px-8 py-3 text-sm font-semibold text-white hover:opacity-90">
                  Apply now
                </button>
                <button 
                  onClick={() => router.push('/')}
                  className="rounded-md border border-black px-8 py-3 text-sm font-semibold hover:bg-black/5"
                >
                  Back to listings
                </button>
              </div>
            </div>
          </article>
        )}

        {!loading && !job && (
          <p className="text-center text-red-600">Job not found</p>
        )}
      </section>
    </main>
  );
}