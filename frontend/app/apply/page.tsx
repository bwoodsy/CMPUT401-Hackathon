"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Trash2, PlusCircle, CircleUser, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type SavedResume = {
  id: string;
  contact: string;
  education: string;
  experience: string;
  skills: string;
  certifications: string;
  references: string;
  user_id?: string;
};

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  phone: string;
  website: string;
  education: string;
  experience: string;
  skills: string;
  certifications: string;
  references: string;
};

const ALL_SECTIONS = [
  { id: "education", label: "Education" },
  { id: "experience", label: "Work Experience" },
  { id: "skills", label: "Skills and Abilities" },
  { id: "certifications", label: "Certifications" },
  { id: "references", label: "References" },
];

export default function ApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, getAuthHeader, isLoading } = useAuth();

  // Check if this is a job-specific application
  const jobId = searchParams.get("jobId");
  const jobTitle = searchParams.get("jobTitle") || "";
  const company = searchParams.get("company") || "";
  const isJobApplication = !!jobId;

  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [masterResumeId, setMasterResumeId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [visibleSections, setVisibleSections] = useState([
    "education",
    "experience",
    "skills",
    "certifications",
    "references",
  ]);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    phone: "",
    website: "",
    education: "",
    experience: "",
    skills: "",
    certifications: "",
    references: "",
  });

  // Load user's master resume
  useEffect(() => {
    const loadUserResume = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
        const res = await fetch(`${BASE_URL}/api/resumes/user/${user.id}`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) {
            let contact: Record<string, string> = {};
            try {
              contact = typeof data.contact === 'string'
                ? JSON.parse(data.contact || "{}")
                : data.contact || {};
            } catch {
              // Old format - contact is a plain string
            }
            setFormData({
              firstName: contact.firstName || "",
              lastName: contact.lastName || "",
              email: contact.email || "",
              location: contact.location || "",
              phone: contact.phone || "",
              website: contact.website || "",
              education: data.education || "",
              experience: data.experience || "",
              skills: data.skills || "",
              certifications: data.certifications || "",
              references: data.references || "",
            });
            setMasterResumeId(data.id);
          }
        }
      } catch (error) {
        console.error("Error loading resume:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      loadUserResume();
    }
  }, [user, isLoading, getAuthHeader]);

  // Fetch current user's saved resumes for autofill dropdown
  useEffect(() => {
    if (!user?.id) return;

    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    fetch(`${BASE_URL}/api/resumes/user/${user.id}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setResumes([data]);
        } else {
          setResumes([]);
        }
      })
      .catch((err) => console.error("Error fetching resumes:", err));
  }, [user, getAuthHeader]);

  const loadMasterResume = () => {
    if (resumes.length > 0) {
      const master = resumes[0];
      let contact: Record<string, string> = {};
      try {
        contact = typeof master.contact === 'string'
          ? JSON.parse(master.contact || "{}")
          : master.contact || {};
      } catch {
        // Old format
      }
      setFormData({
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        email: contact.email || "",
        location: contact.location || "",
        phone: contact.phone || "",
        website: contact.website || "",
        education: master.education || "",
        experience: master.experience || "",
        skills: master.skills || "",
        certifications: master.certifications || "",
        references: master.references || "",
      });
    }
  };

  const handleResumeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedResumeId(id);
    const selected = resumes.find((r) => r.id === id);
    if (selected) {
      let contact: Record<string, string> = {};
      try {
        contact = typeof selected.contact === 'string'
          ? JSON.parse(selected.contact || "{}")
          : selected.contact || {};
      } catch {
        // Old format
      }
      setFormData({
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        email: contact.email || "",
        location: contact.location || "",
        phone: contact.phone || "",
        website: contact.website || "",
        education: selected.education || "",
        experience: selected.experience || "",
        skills: selected.skills || "",
        certifications: selected.certifications || "",
        references: selected.references || "",
      });
    }
  };

  const removeSection = (sectionId: string) => {
    setVisibleSections((prev) => prev.filter((id) => id !== sectionId));
  };

  const addSection = (sectionId: string) => {
    if (!visibleSections.includes(sectionId)) {
      setVisibleSections((prev) => [...prev, sectionId]);
    }
  };

  const hiddenSections = ALL_SECTIONS.filter(s => !visibleSections.includes(s.id));

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setSaving(true);
    setIsModalOpen(false);

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

      if (isJobApplication) {
        // JOB APPLICATION FLOW:
        // 1. Create a NEW resume copy (don't modify master)
        // 2. Create an application record

        // Step 1: Create new resume copy
        const resumeResponse = await fetch(`${BASE_URL}/api/resumes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify({
            ...formData,
            user_id: user?.id,
          }),
        });

        if (!resumeResponse.ok) {
          const errorData = await resumeResponse.json();
          throw new Error(errorData.error || "Failed to save resume");
        }

        // Step 2: Create application record
        const applicationResponse = await fetch(`${BASE_URL}/api/applications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify({
            user_id: user?.id,
            job_id: jobId,
            status: "applied",
            job_title: jobTitle,
            company: company,
          }),
        });

        if (!applicationResponse.ok) {
          const errorData = await applicationResponse.json();
          throw new Error(errorData.error || "Failed to create application");
        }

        router.push("/apply/success?applied=true");
      } else {
        // MASTER RESUME FLOW:
        // Update existing master resume or create new one
        const url = masterResumeId
          ? `${BASE_URL}/api/resumes/${masterResumeId}`
          : `${BASE_URL}/api/resumes`;
        const method = masterResumeId ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify({
            ...formData,
            user_id: user?.id,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (!masterResumeId && data[0]?.id) {
            setMasterResumeId(data[0].id);
          }
          router.push("/apply/success");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save resume");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`Error: ${error}`);
    } finally {
      setSaving(false);
    }
  };

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
          <p className="text-black mb-4">Please log in to create or edit your resume.</p>
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
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto max-w-4xl px-6 py-12"
    >
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto px-6 pt-6 flex items-center justify-between">
        <nav className="flex gap-6 text-sm">
          <motion.a
            href="/"
            className="cursor-pointer"
            whileHover={{ scale: 1.1, color: "#ec4899" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {isJobApplication ? "← Cancel" : "← Back to listings"}
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

      {/* Main Card */}
      <motion.article
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{
          scale: 1.02,
          boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="rounded-2xl bg-white/80 p-12 shadow-lg border border-gray-50/50 mt-12"
      >
        {/* Title */}
        <div className="mb-2">
          <h1 className="text-4xl font-bold tracking-tight text-black">
            {isJobApplication ? "Apply for Position" : (masterResumeId ? "Edit Master Resume" : "Create Master Resume")}
          </h1>
        </div>

        {isJobApplication ? (
          <div className="mb-10">
            <p className="text-gray-600 font-serif">
              Tailor your resume for this position
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="font-semibold text-blue-900">{jobTitle}</p>
              <p className="text-blue-700 text-sm">{company}</p>
              <p className="text-xs text-blue-600 mt-2">
                Your master resume is loaded below. Edit it to highlight relevant experience for this role.
                This will NOT modify your master resume.
              </p>
            </div>
            <button
              type="button"
              onClick={loadMasterResume}
              className="mt-4 flex items-center gap-2 text-sm text-gray-600 hover:text-black"
            >
              <RefreshCw size={14} />
              Reset to master resume
            </button>
          </div>
        ) : (
          <p className="text-gray-600 font-serif mb-10">
            This is your master resume. Job applications will use a copy of this.
          </p>
        )}

        {/* Autofill - only show for master resume editing */}
        {!isJobApplication && resumes.length > 0 && (
          <div className="mb-10 p-4 rounded-lg border border-gray-100">
            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-2">
              Autofill from saved resume
            </label>
            <select
              value={selectedResumeId}
              onChange={handleResumeSelect}
              className="w-full bg-white border border-gray-200 rounded-md p-2 text-sm outline-none focus:border-black"
            >
              <option value="">Select a resume...</option>
              {resumes.map((r) => {
                let contact: Record<string, string> = {};
                try {
                  contact = typeof r.contact === 'string'
                    ? JSON.parse(r.contact || "{}")
                    : r.contact || {};
                } catch {
                  // Old format
                }
                const label = contact.firstName
                  ? `${contact.firstName} ${contact.lastName} - ${contact.email}`
                  : `Resume ${String(r.id).slice(0, 8)}`;
                return (
                  <option key={r.id} value={r.id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmitClick}>
          {/* Contact Info */}
          <section className="border-t border-gray-100 pt-4">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              {["firstName", "lastName", "email", "location", "phone", "website"].map((field) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    {field === "firstName" ? "First Name" :
                     field === "lastName" ? "Last Name" :
                     field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type={field === "email" ? "email" : "text"}
                    value={formData[field as keyof FormData]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black"
                    required={field !== "website"}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Dynamic Sections */}
          {ALL_SECTIONS.map((section) => (
            visibleSections.includes(section.id) && (
              <section
                key={section.id}
                className="border-t border-gray-100 pt-4 relative group"
              >
                <button
                  type="button"
                  onClick={() => removeSection(section.id)}
                  className="absolute right-0 top-4 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                >
                  <Trash2 size={18} />
                </button>
                <h2 className="text-xl font-medium text-gray-900 mb-4">
                  {section.label}
                </h2>
                <textarea
                  rows={5}
                  value={formData[section.id as keyof FormData]}
                  onChange={(e) => setFormData({ ...formData, [section.id]: e.target.value })}
                  className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black resize-none"
                />
              </section>
            )
          ))}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={saving}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-black text-white px-6 py-2 text-xs font-mono uppercase tracking-widest rounded-sm hover:opacity-90 mt-8 disabled:opacity-50"
          >
            {saving ? "Submitting..." : (isJobApplication ? "Submit Application" : "Save Resume")}
          </motion.button>
        </form>

        {/* Add Section UI */}
        {hiddenSections.length > 0 && (
          <div className="mt-12 border-t border-dashed border-gray-200 pt-8">
            <p className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-widest text-center">
              Add sections back to your resume
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {hiddenSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => addSection(section.id)}
                  className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:border-black hover:text-black transition-colors"
                >
                  <PlusCircle size={14} />
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.article>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-black">
              {isJobApplication ? "Confirm Application" : "Confirm Save"}
            </h2>
            <p className="mt-4 text-gray-600">
              {isJobApplication
                ? `Submit your tailored resume for ${jobTitle} at ${company}?`
                : "Save your master resume?"
              }
            </p>
            {isJobApplication && (
              <p className="mt-2 text-sm text-gray-500">
                This will create an application and save a copy of this resume for this job.
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={handleConfirmSubmit}
                className="w-full rounded-md bg-black py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                {isJobApplication ? "Submit Application" : "Save Resume"}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full rounded-md border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
}
