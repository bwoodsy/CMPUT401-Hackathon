"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, CircleUser, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

type Job = {
  jobID: string;
  Title: string;
  Company: string;
  Location: string;
  Description: string;
  Tags?: string[];
  "Applied Users": { id: string }[] | null;
};

type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  job_id: string | null;
  created_at: string;
};

type Application = {
  id: string;
  job_id: string;
  status: string;
};

export default function HomePage() {
  const router = useRouter();
  const { user, getAuthHeader, logout } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!BASE_URL) {
        console.error("NEXT_PUBLIC_BACKEND_URL is not defined!");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/api/jobs/`);
        if (!res.ok) throw new Error("Failed to fetch jobs");

        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Fetch notifications for logged-in user
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;

      try {
        const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
        const res = await fetch(`${BASE_URL}/api/notifications/user/${user.id}`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });

        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
  }, [user, getAuthHeader]);

  // Fetch user's applications to show applied status
  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.id) return;

      try {
        const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
        const res = await fetch(`${BASE_URL}/api/applications/user/${user.id}`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });

        if (res.ok) {
          const data: Application[] = await res.json();
          const jobIds = new Set(data.map((app) => app.job_id));
          setAppliedJobIds(jobIds);
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
      }
    };

    fetchApplications();
  }, [user, getAuthHeader]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notifId: string) => {
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      await fetch(`${BASE_URL}/api/notifications/${notifId}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      setNotifications(notifs =>
        notifs.map(n => (n.id === notifId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      await fetch(`${BASE_URL}/api/notifications/user/${user.id}/read-all`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      setNotifications(notifs => notifs.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      {/* Nav */}
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
            className="cursor-pointer"
            whileHover={{ scale: 1.1, color: "#ec4899" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            My Applications
          </motion.a>
          {user && (
            <motion.button
              onClick={handleLogout}
              className="cursor-pointer text-red-600"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Logout
            </motion.button>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {/* Notifications dropdown */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <motion.button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-black/5 rounded-full"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </motion.button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    <div>
                      {notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => handleMarkAsRead(notif.id)}
                          className={`p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                            !notif.read ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">{notif.title}</h4>
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(notif.created_at)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                          {!notif.read && (
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* User icon */}
          <motion.div
            whileHover={{ scale: 1.1, opacity: 0.9 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="cursor-pointer"
            onClick={() => router.push(user ? "/apply" : "/login")}
          >
            <CircleUser />
          </motion.div>
        </div>
      </header>

      {/* Title */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-center font-serif text-6xl">Career Listings</h1>

        {user && (
          <p className="text-center text-gray-600 mt-2">
            Welcome, {user.fullName || user.email}
          </p>
        )}

        <div className="mx-auto mt-10 max-w-2xl space-y-5">
          {loading && <p className="text-center">Loading jobs...</p>}
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

                <div className="flex items-center gap-2">
                  {appliedJobIds.has(job.jobID) && (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Applied
                    </span>
                  )}
                  <button
                    className="h-9 shrink-0 rounded-md bg-black px-4 text-xs font-semibold text-white hover:opacity-90"
                    onClick={() => router.push(`/jobs/${job.jobID}`)}
                  >
                    View role
                  </button>
                </div>
              </div>

              {job.Tags && job.Tags.length > 0 && (
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                  {job.Tags.map((tag, index) => (
                    <Badge key={`${job.jobID}-tag-${index}`}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
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
              <button
                className="h-9 rounded-md bg-black px-4 text-xs font-semibold text-white"
                onClick={() => router.push("/apply")}
              >
                Apply now
              </button>
            </div>
          </motion.article>
        </div>
      </section>
    </>
  );
}
