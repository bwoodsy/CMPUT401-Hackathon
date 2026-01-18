"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

type Application = {
  id: string;
  user_id: string;
  job_id: string;
  job_title: string;
  company: string;
  status: string;
  applied_date: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

const statusColors: Record<string, string> = {
  applied: "bg-blue-100 text-blue-800",
  interview: "bg-yellow-100 text-yellow-800",
  offer: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const statusOptions = ["applied", "interview", "offer", "rejected"];

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, getAuthHeader, isLoading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
        const res = await fetch(`${BASE_URL}/api/applications/user/${user.id}`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });

        if (!res.ok) throw new Error("Failed to fetch applications");

        const data = await res.json();
        setApplications(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      fetchApplications();
    }
  }, [user, isLoading, getAuthHeader]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(`${BASE_URL}/api/applications/${appId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setApplications(apps =>
          apps.map(app =>
            app.id === appId ? { ...app, status: newStatus } : app
          )
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleSaveNotes = async (appId: string) => {
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(`${BASE_URL}/api/applications/${appId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ notes: notesText }),
      });

      if (res.ok) {
        setApplications(apps =>
          apps.map(app =>
            app.id === appId ? { ...app, notes: notesText } : app
          )
        );
        setEditingNotes(null);
        setNotesText("");
      }
    } catch (error) {
      console.error("Error updating notes:", error);
    }
  };

  const filteredApplications = filterStatus === "all"
    ? applications
    : applications.filter(app => app.status === filterStatus);

  if (isLoading || loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-pink-200 via-pink-100 to-amber-100 flex items-center justify-center">
        <p className="text-black">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-pink-200 via-pink-100 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-black mb-4">Please log in to view your applications.</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-black text-white px-6 py-2 rounded-md hover:opacity-90"
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-200 via-pink-100 to-amber-100 text-black">
      <section className="mx-auto max-w-5xl px-6 py-12">
        {/* Back Button */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => router.push("/")}
            className="text-2xl font-medium hover:opacity-70 flex items-center gap-2"
          >
            ← Back to Jobs
          </button>
        </div>

        <h1 className="text-center font-serif text-5xl mb-8">My Applications</h1>

        {/* Filter */}
        <div className="flex justify-center mb-8 gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filterStatus === "all"
                ? "bg-black text-white"
                : "bg-white/80 text-black hover:bg-white"
            }`}
          >
            All
          </button>
          {statusOptions.map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${
                filterStatus === status
                  ? "bg-black text-white"
                  : "bg-white/80 text-black hover:bg-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {error && <p className="text-center text-red-600 mb-4">{error}</p>}

        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No applications found.</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 bg-black text-white px-6 py-2 rounded-md hover:opacity-90"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map(app => (
              <motion.article
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{app.job_title || "Job Title"}</h2>
                    <p className="text-sm text-gray-600">{app.company || "Company"}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Applied: {new Date(app.applied_date).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[app.status] || "bg-gray-100 text-gray-800"}`}>
                      {app.status}
                    </span>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notes section */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Notes / Communication Log</h3>
                    {editingNotes !== app.id && (
                      <button
                        onClick={() => {
                          setEditingNotes(app.id);
                          setNotesText(app.notes || "");
                        }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {editingNotes === app.id ? (
                    <div>
                      <textarea
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="Add notes about this application..."
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSaveNotes(app.id)}
                          className="px-3 py-1 bg-black text-white text-xs rounded-md hover:opacity-90"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingNotes(null);
                            setNotesText("");
                          }}
                          className="px-3 py-1 bg-gray-200 text-black text-xs rounded-md hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      {app.notes || "No notes yet."}
                    </p>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
