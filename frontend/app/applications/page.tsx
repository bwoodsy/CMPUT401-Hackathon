"use client";

import { useEffect, useState } from "react";
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
  company_name: string;
  position: string;
  date_applied: string;
  stage_id: string;
  stage_name: string;
  notes?: string;
  resume_id?: string;
  resumeData?: {
    contactInfo: {
      fullName: string;
      email: string;
      phone: string;
      linkedin?: string;
      portfolio?: string;
      location?: string;
    };
    summary: string;
    experiences: Array<{
      company: string;
      title: string;
      startDate: string;
      endDate: string;
      description?: string;
    }>;
    education: Array<{
      school: string;
      degree: string;
      field?: string;
      graduationDate?: string;
    }>;
    skills: string[];
  };
};

type Stage = {
  id: string;
  name: string;
};

type Notification = {
  id: string;
  notification_date: string;
  message: string;
  is_completed: boolean;
};

const STAGE_COLORS: { [key: string]: string } = {
  'Applied': "bg-blue-100 text-blue-700 border-blue-200",
  'Interview': "bg-purple-100 text-purple-700 border-purple-200",
  'Offer': "bg-green-100 text-green-700 border-green-200",
  'Rejected': "bg-red-100 text-red-700 border-red-200",
};

export default function ApplicationsPage() {// This calculates counts based on the 'stage_name' in your Supabase data
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string; fullName: string } | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<{ [key: string]: Notification }>({});
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const getCurrentUser = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      try {
        const response = await fetch(`${BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            router.push('/login');
          }
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        setUser(data.user);
        
        // After getting user, fetch stages and applications
        if (data.user?.id) {
          await Promise.all([
            fetchStages(),
            fetchApplications(data.user.id),
            fetchNotifications(data.user.id)
          ]);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getCurrentUser();
  }, []);

  const fetchStages = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/stages`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stages');
      }
      
      const result = await response.json();
      setStages(result.data || []);
    } catch (error) {
      console.error('Error fetching stages:', error);
    }
  };

  const openNotesModal = (app: Application) => {
  setSelectedApplication(app);
  setNotesDraft(app.notes ?? "");
  setShowNotesModal(true);
};

const closeNotesModal = () => {
  setShowNotesModal(false);
  setNotesDraft("");
  setSelectedApplication(null);
};

const saveNotes = async () => {
  if (!selectedApplication) return;

  try {
    setSavingNotes(true);

    const response = await fetch(`${BASE_URL}/api/applications/${selectedApplication.id}/notes`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notes: notesDraft }),
    });

    if (!response.ok) {
      throw new Error("Failed to save notes");
    }

    // Update local state immediately
    setApplications((prev) =>
      prev.map((a) =>
        a.id === selectedApplication.id ? { ...a, notes: notesDraft } : a
      )
    );

    closeNotesModal();
  } catch (err) {
    console.error(err);
    alert("Failed to save notes. Please try again.");
  } finally {
    setSavingNotes(false);
  }
};


  const fetchApplications = async (userId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/applications/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      
      const result = await response.json();
      
      // Transform the data to match our Application type
      const transformedApps = (result.data || []).map((app: any) => ({
        id: app.id,
        company_name: app.company_name,
        position: app.position,
        date_applied: app.date_applied,
        stage_id: app.stage_id,
        stage_name: app.application_stages?.name || 'Applied',
        notes: app.notes,
        resume_id: app.resume_id,
        resumeData: app.resumes?.data ? {
          contactInfo: app.resumes.data.contactInfo || {},
          summary: app.resumes.data.summary || '',
          experiences: app.resumes.data.experiences || [],
          education: app.resumes.data.education || [],
          skills: app.resumes.data.skills || []
        } : undefined
      }));
      
      setApplications(transformedApps);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchNotifications = async (userId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/notifications/${userId}/pending`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const result = await response.json();
      
      // Map notifications by application_id for easy lookup
      const notifMap: { [key: string]: Notification } = {};
      (result.data || []).forEach((notif: any) => {
        notifMap[notif.application_id] = notif;
      });
      
      setNotifications(notifMap);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const updateStatus = async (appId: string, newStageId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/applications/${appId}/stage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stage_id: newStageId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      // Update local state
      const newStageName = stages.find(s => s.id === newStageId)?.name || 'Applied';
      setApplications(applications.map(app =>
        app.id === appId ? { ...app, stage_id: newStageId, stage_name: newStageName } : app
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const setReminder = async () => {
  if (!selectedApplication || !reminderDate || !user) return;

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  try {
    const response = await fetch(`${BASE_URL}/api/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user.id, // Assuming user object has an id
        application_id: selectedApplication.id,
        notification_date: reminderDate, // Matches the local state 'reminderDate'        
        message: `Reminder: Follow up on your application for ${selectedApplication.position} at ${selectedApplication.company_name}`,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create notification");
    }

    const result = await response.json();
    console.log("Notification set successfully:", result);

    // Close the modal and reset state
    setShowReminderModal(false);
    setReminderDate("");
    alert("Reminder set successfully!");
  } catch (error) {
    console.error("Error setting reminder:", error);
    alert("Could not set reminder. Please try again.");
  }
};

  const MotionLink = motion(Link);
  const links = [
    { label: "← Back to listings", href: "/" },
    { label: "Resume", href: "/resume" },
    { label: "Applications", href: "/applications" },
    { label: "About", href: "/about" },
  ];

  const filteredApplications = selectedStage
    ? applications.filter(app => app.stage_id === selectedStage)
    : applications;

  const getStageColor = (stageName: string) => {
    return STAGE_COLORS[stageName] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-200 via-pink-100 to-amber-100 flex items-center justify-center">
        <p className="text-lg">Loading applications...</p>
      </div>
    );
  }

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
          {stages.map((stage) => {
            const count = applications.filter(app => app.stage_name === stage.name).length;
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  selectedStage === stage.id
                    ? getStageColor(stage.name) + " font-semibold"
                    : "bg-white/80 text-gray-700 border-gray-200 hover:bg-white"
                }`}
              >
                {stage.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredApplications.map((app) => {
              const notification = notifications[app.id];
              
              return (
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
                        <button className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStageColor(app.stage_name)}`}>
                          {app.stage_name}
                          <ChevronDown size={14} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {stages.map((stage) => (
                          <DropdownMenuItem
                            key={stage.id}
                            onClick={() => updateStatus(app.id, stage.id)}
                          >
                            <span className={`px-2 py-1 rounded text-xs ${getStageColor(stage.name)}`}>
                              {stage.name}
                            </span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {notification && (
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <Bell size={14} />
                        {new Date(notification.notification_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Company & Position */}
                  <h3 className="text-xl font-bold mb-1">{app.company_name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{app.position}</p>

                  {/* Date Applied */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
                    <Calendar size={14} />
                    Applied: {new Date(app.date_applied).toLocaleDateString()}
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
                      {notification ? 'Update' : 'Set'} Reminder
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
                    <button
                      onClick={() => openNotesModal(app)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-black/5 hover:bg-black/10 text-xs font-medium transition-colors"
                    >
                      <FileText size={14} />
                      {app.notes?.trim() ? "Edit Notes" : "Add Notes"}
                    </button>
                  </div>
                  
                </motion.div>
              );
            })}
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
                  <h2 className="text-xl font-bold">Resume for {selectedApplication.company_name}</h2>
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
                  Set a reminder for <span className="font-semibold">{selectedApplication.company_name}</span> - {selectedApplication.position}
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
      {/* Notes Modal */}
<AnimatePresence>
  {showNotesModal && selectedApplication && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={closeNotesModal}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">
              Notes — {selectedApplication.company_name}
            </h2>
            <p className="text-sm text-gray-500">{selectedApplication.position}</p>
          </div>
          <button
            onClick={closeNotesModal}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Textarea */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your notes
          </label>
          <textarea
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            placeholder="Add interview details, recruiter name, follow-up plan, salary range, etc."
            rows={8}
            className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <p className="mt-2 text-xs text-gray-500">
            Tip: Paste the job link, add key requirements, and track your follow-ups.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={saveNotes}
            disabled={savingNotes}
            className="flex-1 rounded-md bg-black px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingNotes ? "Saving..." : "Save Notes"}
          </button>
          <button
            onClick={closeNotesModal}
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