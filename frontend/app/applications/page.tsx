"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CircleUser, ExternalLink, Trash2, Bell, BellOff, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type Application = {
  id: string;
  user_id: string;
  job_id: string;
  job_title?: string;
  company?: string;
  status: string;
  notes?: string;
  reminder_date?: string;
  created_at: string;
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

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/api/applications/user/${user.id}`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });

        if (!res.ok) throw new Error("Failed to fetch applications");

        const data = await res.json();
        setApplications(Array.isArray(data) ? data : []);
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
  }, [user, isLoading, getAuthHeader, BASE_URL]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
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

  const handleDeleteApplication = async (appId: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      const res = await fetch(`${BASE_URL}/api/applications/${appId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      if (res.ok) {
        setApplications(apps => apps.filter(app => app.id !== appId));
      }
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Unknown date";
    }
  };

  const filteredApplications = filterStatus === "all"
    ? applications
    : applications.filter(app => app.status === filterStatus);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-black">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-black mb-4">Please log in to view your applications.</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-black text-white px-6 py-2 rounded-md hover:opacity-90"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="mx-auto max-w-7xl px-6 pt-6 flex items-center justify-between">
        <nav className="flex gap-6 text-sm">
          <motion.a
            href="/"
            className="cursor-pointer"
            whileHover={{ scale: 1.1, color: "#ec4899" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Home
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
            className="cursor-pointer font-semibold"
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
          onClick={() => router.push("/apply")}
        >
          <CircleUser />
        </motion.div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-center font-serif text-5xl mb-4">My Applications</h1>
        <p className="text-center text-gray-600 mb-8">
          Track and manage your job applications
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 rounded-lg p-4 text-center shadow">
            <p className="text-2xl font-bold">{applications.length}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center shadow">
            <p className="text-2xl font-bold text-blue-800">
              {applications.filter(a => a.status === "applied").length}
            </p>
            <p className="text-xs text-blue-600">Applied</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center shadow">
            <p className="text-2xl font-bold text-yellow-800">
              {applications.filter(a => a.status === "interview").length}
            </p>
            <p className="text-xs text-yellow-600">Interview</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center shadow">
            <p className="text-2xl font-bold text-green-800">
              {applications.filter(a => a.status === "offer").length}
            </p>
            <p className="text-xs text-green-600">Offers</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex justify-center mb-8 gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filterStatus === "all"
                ? "bg-black text-white"
                : "bg-white/80 text-black hover:bg-white"
            }`}
          >
            All ({applications.length})
          </button>
          {statusOptions.map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                filterStatus === status
                  ? "bg-black text-white"
                  : "bg-white/80 text-black hover:bg-white"
              }`}
            >
              {status} ({applications.filter(a => a.status === status).length})
            </button>
          ))}
        </div>

        {error && <p className="text-center text-red-600 mb-4">{error}</p>}

        {filteredApplications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white/60 rounded-xl"
          >
            <p className="text-gray-600 mb-4">
              {filterStatus === "all"
                ? "You haven't applied to any jobs yet."
                : `No ${filterStatus} applications.`}
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-black text-white px-6 py-2 rounded-md hover:opacity-90"
            >
              Browse Jobs
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app, index) => (
              <motion.article
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">
                        {app.job_title || "Position"}
                      </h2>
                      <button
                        onClick={() => router.push(`/jobs/${app.job_id}`)}
                        className="text-gray-400 hover:text-black"
                        title="View job"
                      >
                        <ExternalLink size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">{app.company || "Company"}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Applied: {formatDate(app.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[app.status] || "bg-gray-100 text-gray-800"}`}>
                      {app.status}
                    </span>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white cursor-pointer"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDeleteApplication(app.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete application"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Notes section */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Notes</h3>
                    {editingNotes !== app.id && (
                      <button
                        onClick={() => {
                          setEditingNotes(app.id);
                          setNotesText(app.notes || "");
                        }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {app.notes ? "Edit" : "Add notes"}
                      </button>
                    )}
                  </div>

                  {editingNotes === app.id ? (
                    <div>
                      <textarea
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:border-black"
                        placeholder="Add notes about this application (interview dates, contacts, etc.)..."
                        autoFocus
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
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {app.notes || "No notes yet."}
                    </p>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
