"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, CircleUser } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type Job = {
  jobID: string;
  Title: string;
  Company: string;
  Location: string;
  Description: string;
  Tags?: string[];
  "Applied Users": { id: string }[] | null;
};

type User = {
  id: string;
  fullName: string;
  email?: string;
};

type Notification = {
  id: string;
  application_id: string;
  notification_date: string;
  message: string;
  is_completed: boolean;
};

export default function HomePage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const MotionLink = motion(Link);
  const links = [
  { label: "Home", href: "/" },
  { label: "Resume", href: "/resume" },
  { label: "Applications", href: "/applications" },
  { label: "About", href: "/about" },
  ];

  const [user, setUser] = useState<User | null>(null);

  // Notifications UI/state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState("");
  const [hasLoadedNotifs, setHasLoadedNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const MotionLink = motion(Link);
  const links = [
    { label: "Home", href: "/" },
    { label: "Resume", href: "/resume" },
    { label: "Applications", href: "/applications" },
    { label: "About", href: "/about" },
  ];

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // If your notification_date is "YYYY-MM-DD", Date parsing can be timezone-shifty.
  // This helper treats "YYYY-MM-DD" as LOCAL midnight.
  const parseNotifDate = (d: string) => {
    // If it's a plain date string, parse as local date
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const [y, m, day] = d.split("-").map(Number);
      return new Date(y, m - 1, day).getTime(); // local midnight
    }
    // Otherwise assume ISO timestamp
    return new Date(d).getTime();
  };

  const isDue = (notificationDate: string) => {
    const due = parseNotifDate(notificationDate);
    const now = Date.now();
    return due <= now;
  };

  const visibleNotifications = useMemo(() => {
    // Safety filter (even if backend already filters):
    // - only due
    // - only not completed
    return notifications.filter((n) => !n.is_completed && isDue(n.notification_date));
  }, [notifications]);

  useEffect(() => {
    setUnreadCount(visibleNotifications.length);
  }, [visibleNotifications.length]);

  // Fetch job listings
  useEffect(() => {
    const fetchJobs = async () => {
      if (!BASE_URL) {
        console.error("NEXT_PUBLIC_BACKEND_URL is not defined!");
        setError("Missing backend URL config");
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
  }, [BASE_URL]);

  // Get current user data
  useEffect(() => {
    const getCurrentUser = async () => {
      if (!BASE_URL) return;

      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const response = await fetch(`${BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
          }
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    getCurrentUser();
  }, [BASE_URL]);

  const fetchNotifications = async (userId: string) => {
    if (!BASE_URL) return;

    try {
      setNotifLoading(true);
      setNotifError("");

      const token = localStorage.getItem("accessToken");

      const res = await fetch(`${BASE_URL}/api/notifications/${userId}/pending`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) throw new Error("Failed to fetch notifications");

      const result = await res.json();
      const list: Notification[] = result.data || [];

      // Store raw list; we filter in visibleNotifications
      setNotifications(list);
      setHasLoadedNotifs(true);
    } catch (e) {
      console.error(e);
      setNotifError("Failed to load notifications");
    } finally {
      setNotifLoading(false);
    }
  };

  const markNotificationComplete = async (notificationId: string) => {
    if (!BASE_URL) return;

    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch(`${BASE_URL}/api/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) throw new Error("Failed to complete notification");

      // Update UI immediately: mark it completed locally OR remove it.
      // Removing is simplest since completed items shouldn't show.
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (e) {
      console.error(e);
      alert("Failed to mark notification as completed.");
    }
  };

  getCurrentUser();
}, []);


  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-200 via-pink-100 to-amber-100 text-black">
      {/* Nav */}
      <header className="relative mx-auto max-w-7xl px-6 pt-6 flex items-center justify-between">
        <nav className="flex gap-6">
          {links.map(({ label, href }) => (
            <MotionLink
              key={label}
              href={href}
              className="cursor-pointer"
              whileHover={{ scale: 1.1, color: "#ec4899" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {label}
            </MotionLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={async () => {
              const next = !showNotifications;
              setShowNotifications(next);

              // Lazy-load only when opening (first time)
              if (next && user?.id && !hasLoadedNotifs) {
                await fetchNotifications(user.id);
              }

              // If you'd rather refresh every time it opens, use this instead:
              // if (next && user?.id) await fetchNotifications(user.id);
            }}
            className="relative p-2 hover:bg-black/5 rounded-full"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </motion.button>

          <motion.div
            whileHover={{ scale: 1.1, opacity: 0.9 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="cursor-pointer"
            onClick={() => router.push("/login")}
          >
            <CircleUser />
          </motion.div>
        </div>

        {/* Click-outside overlay */}
        {showNotifications && (
          <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
        )}

        {/* Notifications dropdown */}
        {showNotifications && (
          <div className="absolute right-6 top-16 w-96 max-w-[90vw] rounded-xl bg-white shadow-2xl border border-black/10 overflow-hidden z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
              <p className="font-semibold text-sm">Notifications</p>
              <button
                className="text-xs text-gray-500 hover:text-gray-800"
                onClick={() => setShowNotifications(false)}
              >
                Close
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifLoading && <p className="p-4 text-sm">Loading…</p>}
              {notifError && <p className="p-4 text-sm text-red-600">{notifError}</p>}

              {!notifLoading && !notifError && visibleNotifications.length === 0 && (
                <p className="p-4 text-sm text-gray-600">
                  No due reminders right now 
                  <br />
                  <span className="text-xs text-gray-500">
                    Reminders appear on/after their date until completed.
                  </span>
                </p>
              )}

              {!notifLoading &&
                !notifError &&
                visibleNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="px-4 py-3 border-b border-black/5 cursor-pointer hover:bg-black/5"
                    onClick={async () => {
                      // Mark complete, then navigate
                      await markNotificationComplete(n.id);
                      setShowNotifications(false);
                      router.push("/applications");
                    }}
                  >
                    <p className="text-sm">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Due: {new Date(parseNotifDate(n.notification_date)).toLocaleDateString()}
                    </p>
                    <p className="mt-2 text-[11px] text-gray-500">
                      Click to mark done + open Applications
                    </p>
                  </div>
                ))}
            </div>

            <div className="px-4 py-3 bg-black/5 text-xs text-gray-600">
              Tip: set follow-ups inside Applications.
            </div>
          </div>
        )}
      </header>

      {/* Title */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-center font-serif text-6xl">
          {user ? `${user.fullName}'s ` : ""}
          Listings
        </h1>

        <div className="mx-auto mt-10 max-w-2xl space-y-5">
          {loading && <p className="text-center">Loading jobs…</p>}
          {error && <p className="text-center text-red-600">{error}</p>}

          {jobs.map((job) => (
            <motion.article
              key={job.jobID}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
              }}
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
                  <Badge key={`${job.jobID}-tag-${index}`}>{tag}</Badge>
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
              <button
                className="h-9 rounded-md bg-black px-4 text-xs font-semibold text-white hover:opacity-90"
                onClick={() => router.push("/applications")}
              >
                Apply now
              </button>
            </div>
          </motion.article>
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
    className="rounded-xl border border-dashed border-black/30 p-5"
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
