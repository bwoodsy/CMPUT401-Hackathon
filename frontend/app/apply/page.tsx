"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CircleUser, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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
  const [user, setUser] = useState<any>(null);
  const [stages, setStages] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
  const fetchStages = async () => {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    
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
  
  fetchStages();
}, []);

// Handle apply button click
const handleApply = async () => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  
  if (!user?.id) {
    alert('Please log in to apply for this job');
    router.push('/login');
    return;
  }

  if (!job) {
    alert('Job information not found');
    return;
  }

  setIsSubmitting(true);

  try {
    const resumeData = {
      user_id: user.id,
      name: `${job.Company} - ${job.Title}`,
      data: {
        contactInfo,
        summary,
        experiences,
        education,
        skills
      },
      is_master: false
    };

    const resumeResponse = await fetch(`${BASE_URL}/api/resumes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resumeData)
    });

    if (!resumeResponse.ok) {
      throw new Error('Failed to save resume');
    }

    const resumeResult = await resumeResponse.json();
    const resumeId = resumeResult.data?.id;

    const appliedStage = stages.find(s => s.name === 'Applied');
    
    if (!appliedStage) {
      throw new Error('Application stage not found');
    }

    const applicationData = {
      user_id: user.id,
      resume_id: resumeId,
      company_name: job.Company,
      position: job.Title,
      date_applied: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      stage_id: appliedStage.id,
      notes: `Location: ${job.Location}`
    };

    const applicationResponse = await fetch(`${BASE_URL}/api/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(applicationData)
    });

    if (!applicationResponse.ok) {
      throw new Error('Failed to submit application');
    }

    const applicationResult = await applicationResponse.json();

    alert('Application submitted successfully!');
    router.push('/applications');
    
  } catch (error) {
    console.error('Error submitting application:', error);
    alert('Failed to submit application. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
  const [contactInfo, setContactInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    portfolio: "",
    location: ""
  });

  const [summary, setSummary] = useState("");
  const [experiences, setExperiences] = useState([
    { company: "", title: "", startDate: "", endDate: "", description: "" }
  ]);
  const [education, setEducation] = useState([
    { school: "", degree: "", field: "", graduationDate: "" }
  ]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  // Layout state
  const [showJob, setShowJob] = useState(true);
  const [showForm, setShowForm] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [jobWidth, setJobWidth] = useState(25);
  const [formWidth, setFormWidth] = useState(35);
  const searchParams = useSearchParams();
  const jobID = searchParams.get("jobID");
  
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'job' | 'form' | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3001/api/jobs/${jobID}`)
      .then((res) => res.json())
      .then((data) => {
        setJob(data);
        setLoading(false);
      });
  }, [params.jobID]);

  // Handle mouse move for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const relativeX = e.clientX - containerRect.left;
      const percentage = (relativeX / containerWidth) * 100;

      if (isDragging === 'job') {
        setJobWidth(Math.max(10, Math.min(60, percentage)));
      } else if (isDragging === 'form') {
        const visibleCount = [showJob, showForm, showPreview].filter(Boolean).length;
        const jobWidthActual = showJob ? jobWidth : 0;
        const adjustedPercentage = percentage - jobWidthActual;
        setFormWidth(Math.max(10, Math.min(70, adjustedPercentage)));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, jobWidth, showJob, showForm, showPreview]);

  const MotionLink = motion(Link);
  const links = [
    { label: "← Back to listings", href: "/" },
    { label: "Resume", href: "/resume" },
    { label: "Applications", href: "/applications" },
    { label: "About", href: "/about" },
  ];

  // Experience handlers
  const addExperience = () => {
    setExperiences([...experiences, { company: "", title: "", startDate: "", endDate: "", description: "" }]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const updated = [...experiences];
    updated[index][field as keyof typeof updated[0]] = value;
    setExperiences(updated);
  };

  // Education handlers
  const addEducation = () => {
    setEducation([...education, { school: "", degree: "", field: "", graduationDate: "" }]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...education];
    updated[index][field as keyof typeof updated[0]] = value;
    setEducation(updated);
  };

  // Skills handlers
  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // Calculate actual widths based on visible cards
  const visibleCards = [showJob, showForm, showPreview].filter(Boolean).length;
  const getActualWidth = (cardWidth: number, isVisible: boolean) => {
    if (!isVisible) return 0;
    if (visibleCards === 1) return 100;
    return cardWidth;
  };

  const actualJobWidth = getActualWidth(jobWidth, showJob);
  const actualFormWidth = getActualWidth(formWidth, showForm);
  const actualPreviewWidth = 100 - actualJobWidth - actualFormWidth;
  useEffect(() => {
  const getCurrentUser = async () => {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = localStorage.getItem("accessToken");

    if (!token) return;

    try {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
        throw new Error("Failed to fetch user");
      }

      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  getCurrentUser();
}, []);

useEffect(() => {
  if (!user?.id) return;

  const fetchMasterResume = async () => {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    try {
      const res = await fetch(
        `${BASE_URL}/api/resumes/${user.id}/master`
      );

      if (!res.ok) {
        if (res.status === 404) return;
        throw new Error("Failed to fetch master resume");
      }

      const result = await res.json();
      const resumeData = result.data?.data;

      if (!resumeData) return;

      const normalized = {
        contactInfo:
          resumeData.contactInfo && typeof resumeData.contactInfo === "object"
            ? {
                fullName: resumeData.contactInfo.fullName || "",
                email: resumeData.contactInfo.email || "",
                phone: resumeData.contactInfo.phone || "",
                linkedin: resumeData.contactInfo.linkedin || "",
                portfolio: resumeData.contactInfo.portfolio || "",
                location: resumeData.contactInfo.location || ""
              }
            : {
                fullName: "",
                email: "",
                phone: "",
                linkedin: "",
                portfolio: "",
                location: ""
              },

        summary: typeof resumeData.summary === "string" ? resumeData.summary : "",

        experiences: Array.isArray(resumeData.experiences)
          ? resumeData.experiences
          : resumeData.experiences
            ? [resumeData.experiences]
            : [],

        education: Array.isArray(resumeData.education)
          ? resumeData.education
          : resumeData.education
            ? [resumeData.education]
            : [],

        skills: Array.isArray(resumeData.skills)
          ? resumeData.skills.filter(s => typeof s === "string")
          : typeof resumeData.skills === "string"
            ? [resumeData.skills]
            : []
    };

    setContactInfo(normalized.contactInfo);
    setSummary(normalized.summary);
    setExperiences(normalized.experiences);
    setEducation(normalized.education);
    setSkills(normalized.skills);
    } catch (err) {
      console.error(err);
    }
  };

  fetchMasterResume();
}, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!job) return <div className="min-h-screen flex items-center justify-center">Job not found</div>;
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-200 via-pink-100 to-amber-100">
      {/* Nav */}
      <header className="mx-auto max-w-[98%] px-6 pt-6 flex items-center justify-between">
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

      {/* Title and Controls */}
      <section className="mx-auto max-w-[98%] px-6 py-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-serif text-5xl">Tailor Your Resume</h1>
          
          {/* Toggle visibility buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowJob(!showJob)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showJob 
                  ? 'bg-black text-white' 
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              {showJob ? <Eye size={16} /> : <EyeOff size={16} />}
              Job
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showForm 
                  ? 'bg-black text-white' 
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              {showForm ? <Eye size={16} /> : <EyeOff size={16} />}
              Edit
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showPreview 
                  ? 'bg-black text-white' 
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              {showPreview ? <Eye size={16} /> : <EyeOff size={16} />}
              Preview
            </button>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-8">
          Customize your resume for this specific job posting
        </p>

        {/* Three Column Layout */}
        <div ref={containerRef} className="flex gap-0 h-[calc(100vh-240px)] relative">
          {/* LEFT: Job Posting */}
          {showJob && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ width: `${actualJobWidth}%` }}
              className="flex flex-col relative"
            >
              <div className="rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-md overflow-y-auto flex-1 mr-2">
                <h2 className="text-lg font-semibold mb-4">Job Posting</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{job.Title}</h3>
                    <p className="text-lg text-gray-700">{job.Company}</p>
                    <p className="text-sm text-gray-500">{job.Location}</p>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold mb-2 uppercase tracking-wide text-gray-600">
                      Description
                    </h4>
                    <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                      {job.Description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resize handle */}
              {showForm && (
                <div
                  onMouseDown={() => setIsDragging('job')}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-pink-300/50 transition-colors group"
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gray-300 rounded group-hover:bg-pink-400 transition-colors" />
                </div>
              )}
            </motion.div>
          )}

          {/* MIDDLE: Resume Form */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              style={{ width: `${actualFormWidth}%` }}
              className="flex flex-col relative"
            >
              <div className="rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-md overflow-y-auto flex-1 mx-2 space-y-6">
                <h2 className="text-lg font-semibold">Edit Resume</h2>

                {/* Contact Info */}
                <div>
                  <h3 className="text-md font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={contactInfo.fullName}
                      onChange={(e) => setContactInfo({...contactInfo, fullName: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <input
                      type="text"
                      placeholder="LinkedIn URL"
                      value={contactInfo.linkedin}
                      onChange={(e) => setContactInfo({...contactInfo, linkedin: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <input
                      type="text"
                      placeholder="Portfolio/Website"
                      value={contactInfo.portfolio}
                      onChange={(e) => setContactInfo({...contactInfo, portfolio: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={contactInfo.location}
                      onChange={(e) => setContactInfo({...contactInfo, location: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                {/* Professional Summary */}
                <div>
                  <h3 className="text-md font-semibold mb-3">Professional Summary</h3>
                  <textarea
                    placeholder="Write a brief professional summary..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                {/* Work Experience */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-md font-semibold">Work Experience</h3>
                    <button
                      onClick={addExperience}
                      className="flex items-center gap-1 rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                  <div className="space-y-4">
                    {experiences.map((exp, index) => (
                      <div key={index} className="rounded-lg border border-gray-200 p-4 relative">
                        {experiences.length > 1 && (
                          <button
                            onClick={() => removeExperience(index)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Company"
                            value={exp.company}
                            onChange={(e) => updateExperience(index, "company", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                          <input
                            type="text"
                            placeholder="Job Title"
                            value={exp.title}
                            onChange={(e) => updateExperience(index, "title", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Start Date"
                              value={exp.startDate}
                              onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                            <input
                              type="text"
                              placeholder="End Date (or Present)"
                              value={exp.endDate}
                              onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                          </div>
                          <textarea
                            placeholder="Description (use bullet points)"
                            value={exp.description}
                            onChange={(e) => updateExperience(index, "description", e.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-md font-semibold">Education</h3>
                    <button
                      onClick={addEducation}
                      className="flex items-center gap-1 rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                  <div className="space-y-4">
                    {education.map((edu, index) => (
                      <div key={index} className="rounded-lg border border-gray-200 p-4 relative">
                        {education.length > 1 && (
                          <button
                            onClick={() => removeEducation(index)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="School/University"
                            value={edu.school}
                            onChange={(e) => updateEducation(index, "school", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                          <input
                            type="text"
                            placeholder="Degree"
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, "degree", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                          <input
                            type="text"
                            placeholder="Field of Study"
                            value={edu.field}
                            onChange={(e) => updateEducation(index, "field", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                          <input
                            type="text"
                            placeholder="Graduation Date"
                            value={edu.graduationDate}
                            onChange={(e) => updateEducation(index, "graduationDate", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-md font-semibold mb-3">Skills</h3>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Add a skill..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <button
                      onClick={addSkill}
                      className="rounded-md bg-black px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge
                        key={index}
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resize handle */}
              {showPreview && (
                <div
                  onMouseDown={() => setIsDragging('form')}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-pink-300/50 transition-colors group"
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gray-300 rounded group-hover:bg-pink-400 transition-colors" />
                </div>
              )}
            </motion.div>
          )}

          {/* RIGHT: Live Preview */}
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{ width: `${actualPreviewWidth}%` }}
              className="flex flex-col"
            >
              <div className="rounded-xl bg-white p-12 shadow-2xl overflow-y-auto flex-1 ml-2"
                style={{ fontFamily: "'Times New Roman', serif", lineHeight: 1.5 }}
              >
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600 mb-6">Preview</h2>

                {/* Contact Info */}
                <div className="mb-10 text-center">
                  <h1 className="text-3xl font-bold tracking-widest mb-2" style={{ letterSpacing: '0.05em' }}>
                    {contactInfo.fullName ? contactInfo.fullName.toUpperCase() : "FIRST LAST"}
                  </h1>
                  <div className="text-xs text-gray-700 space-x-2">
                    {contactInfo.location && <span>{contactInfo.location}</span>}
                    {(contactInfo.location && (contactInfo.phone || contactInfo.email)) && <span>•</span>}
                    {contactInfo.phone && <span>{contactInfo.phone}</span>}
                    {(contactInfo.phone && contactInfo.email) && <span>•</span>}
                    {contactInfo.email && <span>{contactInfo.email}</span>}
                    {contactInfo.linkedin && <span>• {contactInfo.linkedin}</span>}
                    {contactInfo.portfolio && <span>• {contactInfo.portfolio}</span>}
                  </div>
                </div>

                {/* Education */}
                {education.some(edu => edu.school || edu.degree) && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-900 pb-1 mb-3">
                      Education
                    </h2>
                    <div className="space-y-3">
                      {education.filter(edu => edu.school || edu.degree).map((edu, idx) => (
                        <div key={idx} className="flex justify-between">
                          <div>
                            <h3 className="text-xs font-semibold">{edu.school || "University Name"}</h3>
                            <p className="text-xs italic">
                              {edu.degree || "Degree"}{edu.field && `, ${edu.field}`}
                            </p>
                          </div>
                          <div className="text-right text-xs">
                            {edu.graduationDate && <p>{edu.graduationDate}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Professional Summary */}
                {summary && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-900 pb-1 mb-2">
                      Professional Summary
                    </h2>
                    <p className="text-xs text-gray-800">{summary}</p>
                  </div>
                )}

                {/* Experience */}
                {experiences.some(exp => exp.company || exp.title) && (
                  <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-900 pb-1 mb-3">
                      Experience
                    </h2>
                    <div className="space-y-4">
                      {experiences.filter(exp => exp.company || exp.title).map((exp, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between mb-1">
                            <div>
                              <h3 className="text-xs font-semibold">{exp.company || "Company Name"}</h3>
                              <p className="text-xs italic">{exp.title || "Job Title"}</p>
                            </div>
                            <div className="text-right text-xs">
                              <p>{exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : "Dates"}</p>
                            </div>
                          </div>
                          {exp.description && (
                            <ul className="text-xs text-gray-800 list-disc list-inside mt-1">
                              {exp.description.split('\n').map((line, i) => line.trim() && (
                                <li key={i}>{line.startsWith('•') || line.startsWith('-') ? line.replace(/^[-•]\s*/, '') : line}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-900 pb-1 mb-2">
                      Skills
                    </h2>
                    <p className="text-xs text-gray-800">{skills.join(', ')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Apply Button */}
        <div className="mt-6 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleApply}
            disabled={isSubmitting}
            className="rounded-xl bg-black px-8 py-4 text-sm font-semibold text-white hover:opacity-90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Apply with This Resume'}
          </motion.button>
        </div>
      </section>
    </main>
  );
}