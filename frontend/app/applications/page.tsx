"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CircleUser, Calendar, FileText, X, ChevronDown, Bell, Eye } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Application = {
  id: string;
  company: string;
  position: string;
  dateApplied: string;
  status: "applied" | "interview" | "offer" | "rejected";
  followUpDate?: string;
  resumeData?: {
    contactInfo: {
      fullName: string;
      email: string;
      phone: string;
    };
    summary: string;
    experiences: Array<{
      company: string;
      title: string;
      startDate: string;
      endDate: string;
    }>;
    education: Array<{
      school: string;
      degree: string;
    }>;
    skills: string[];
  };
};

const STAGES = [
  { value: "applied", label: "Applied", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "interview", label: "Interview", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "offer", label: "Offer", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700 border-red-200" },
];

export default function ApplicationsPage() {
  const router = useRouter();
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderDate, setReminderDate] = useState("");

  // Mock data - replace with actual API call
  const [applications, setApplications] = useState<Application[]>([
    {
      id: "1",
      company: "Google",
      position: "Software Engineer",
      dateApplied: "2025-01-10",
      status: "interview",
      followUpDate: "2025-01-25",
      resumeData: {
        contactInfo: {
          fullName: "John Doe",
          email: "john@email.com",
          phone: "(555) 123-4567"
        },
        summary: "Experienced software engineer with 5+ years...",
        experiences: [
          { company: "Tech Corp", title: "Senior Dev", startDate: "2020", endDate: "2024" }
        ],
        education: [
          { school: "MIT", degree: "BS Computer Science" }
        ],
        skills: ["React", "Node.js", "Python"]
      }
    },
    {
      id: "2",
      company: "Microsoft",
      position: "Frontend Developer",
      dateApplied: "2025-01-08",
      status: "applied",
      resumeData: {
        contactInfo: {
          fullName: "John Doe",
          email: "john@email.com",
          phone: "(555) 123-4567"
        },
        summary: "Frontend specialist...",
        experiences: [
          { company: "Tech Corp", title: "Frontend Dev", startDate: "2019", endDate: "2024" }
        ],
        education: [
          { school: "MIT", degree: "BS Computer Science" }
        ],
        skills: ["React", "TypeScript", "CSS"]
      }
    },
    {
      id: "3",
      company: "Amazon",
      position: "Full Stack Engineer",
      dateApplied: "2025-01-05",
      status: "rejected",
    },
    {
      id: "4",
      company: "Meta",
      position: "Software Engineer",
      dateApplied: "2025-01-15",
      status: "offer",
      followUpDate: "2025-01-22",
    },
  ]);

  const MotionLink = motion(Link);
  const links = [
    { label: "← Back to listings", href: "/" },
    { label: "Resume", href: "/resume" },
    { label: "Applications", href: "/applications" },
    { label: "About", href: "/about" },
  ];

  const filteredApplications = selectedStage
    ? applications.filter(app => app.status === selectedStage)
    : applications;

  const updateStatus = (appId: string, newStatus: Application["status"]) => {
    setApplications(applications.map(app =>
      app.id === appId ? { ...app, status: newStatus } : app
    ));
  };

  const setReminder = () => {
    if (selectedApplication && reminderDate) {
      setApplications(applications.map(app =>
        app.id === selectedApplication.id ? { ...app, followUpDate: reminderDate } : app
      ));
      setShowReminderModal(false);
      setReminderDate("");
    }
  };

  const getStageColor = (status: string) => {
    return STAGES.find(s => s.value === status)?.color || "bg-gray-100 text-gray-700";
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-200 via-pink-100 to-amber-100">
      {/* Nav */}
      <header className="mx-auto max-w-7xl px-6 pt-6 flex items-center justify-between">
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
       
        <motion.div
          whileHover={{ scale: 1.1, opacity: 0.9 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="cursor-pointer"
          onClick={() => router.push("/login")}
        >
          <CircleUser />
        </motion.div>
      </header>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-center font-serif text-5xl mb-2">My Applications</h1>
        <p className="text-center text-sm text-gray-600 mb-8">
          Track and manage all your job applications in one place
        </p>

        {/* Stage Filter Buttons */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          <button
            onClick={() => setSelectedStage(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedStage === null
                ? "bg-black text-white"
                : "bg-white/80 text-gray-700 hover:bg-white"
            }`}
          >
            All ({applications.length})
          </button>
          {STAGES.map((stage) => {
            const count = applications.filter(app => app.status === stage.value).length;
            return (
              <button
                key={stage.value}
                onClick={() => setSelectedStage(stage.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  selectedStage === stage.value
                    ? stage.color + " font-semibold"
                    : "bg-white/80 text-gray-700 border-gray-200 hover:bg-white"
                }`}
              >
                {stage.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredApplications.map((app) => (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}
                className="rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-md relative"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStageColor(app.status)}`}>
                        {STAGES.find(s => s.value === app.status)?.label}
                        <ChevronDown size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {STAGES.map((stage) => (
                        <DropdownMenuItem
                          key={stage.value}
                          onClick={() => updateStatus(app.id, stage.value as Application["status"])}
                        >
                          <span className={`px-2 py-1 rounded text-xs ${stage.color}`}>
                            {stage.label}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {app.followUpDate && (
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <Bell size={14} />
                      {new Date(app.followUpDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Company & Position */}
                <h3 className="text-xl font-bold mb-1">{app.company}</h3>
                <p className="text-sm text-gray-600 mb-4">{app.position}</p>

                {/* Date Applied */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
                  <Calendar size={14} />
                  Applied: {new Date(app.dateApplied).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedApplication(app);
                      setShowReminderModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-black/5 hover:bg-black/10 text-xs font-medium transition-colors"
                  >
                    <Bell size={14} />
                    Set Reminder
                  </button>
                  {app.resumeData && (
                    <button
                      onClick={() => {
                        setSelectedApplication(app);
                        setShowResumeModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-black text-white hover:opacity-90 text-xs font-medium transition-all"
                    >
                      <Eye size={14} />
                      View Resume
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-20">
            <FileText size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No applications found in this category</p>
          </div>
        )}
      </section>

      {/* Resume Preview Modal */}
      <AnimatePresence>
        {showResumeModal && selectedApplication?.resumeData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowResumeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[85vh] rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold">Resume for {selectedApplication.company}</h2>
                  <p className="text-sm text-gray-500">{selectedApplication.position}</p>
                </div>
                <button
                  onClick={() => setShowResumeModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Resume Content */}
              <div className="flex-1 overflow-y-auto p-8" style={{ fontFamily: "'Times New Roman', serif" }}>
                {/* Contact Info */}
                <div className="text-center mb-8 pb-6 border-b border-gray-300">
                  <h1 className="text-2xl font-bold mb-2 tracking-wide">
                    {selectedApplication.resumeData.contactInfo.fullName.toUpperCase()}
                  </h1>
                  <div className="text-xs text-gray-600 space-x-2">
                    <span>{selectedApplication.resumeData.contactInfo.email}</span>
                    <span>•</span>
                    <span>{selectedApplication.resumeData.contactInfo.phone}</span>
                  </div>
                </div>

                {/* Professional Summary */}
                {selectedApplication.resumeData.summary && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-900 pb-1 mb-2">
                      Professional Summary
                    </h2>
                    <p className="text-xs text-gray-800 leading-relaxed">
                      {selectedApplication.resumeData.summary}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {selectedApplication.resumeData.experiences.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-900 pb-1 mb-3">
                      Experience
                    </h2>
                    <div className="space-y-3">
                      {selectedApplication.resumeData.experiences.map((exp, idx) => (
                        <div key={idx} className="flex justify-between">
                          <div>
                            <h3 className="text-xs font-semibold">{exp.company}</h3>
                            <p className="text-xs italic">{exp.title}</p>
                          </div>
                          <div className="text-right text-xs">
                            <p>{exp.startDate} - {exp.endDate}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {selectedApplication.resumeData.education.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-900 pb-1 mb-3">
                      Education
                    </h2>
                    <div className="space-y-2">
                      {selectedApplication.resumeData.education.map((edu, idx) => (
                        <div key={idx}>
                          <h3 className="text-xs font-semibold">{edu.school}</h3>
                          <p className="text-xs italic">{edu.degree}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {selectedApplication.resumeData.skills.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-900 pb-1 mb-2">
                      Skills
                    </h2>
                    <p className="text-xs text-gray-800">
                      {selectedApplication.resumeData.skills.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reminder Modal */}
      <AnimatePresence>
        {showReminderModal && selectedApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowReminderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Set Follow-Up Reminder</h2>
                <button
                  onClick={() => setShowReminderModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Set a reminder for <span className="font-semibold">{selectedApplication.company}</span> - {selectedApplication.position}
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-Up Date
                  </label>
                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={setReminder}
                  disabled={!reminderDate}
                  className="flex-1 rounded-md bg-black px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Set Reminder
                </button>
                <button
                  onClick={() => setShowReminderModal(false)}
                  className="flex-1 rounded-md border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}