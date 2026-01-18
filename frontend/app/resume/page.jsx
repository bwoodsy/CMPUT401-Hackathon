"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CircleUser, Plus, Trash2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MasterResumePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [resumeId, setResumeId] = useState(null)

  const [contactInfo, setContactInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    portfolio: "",
    location: ""
  });

  const MotionLink = motion(Link);
  const links = [
  { label: "← Back to listings", href: "/" },
  { label: "Resume", href: "/resume" },
  { label: "Applications", href: "/applications" },
  { label: "About", href: "/about" },
  ];

  const [summary, setSummary] = useState("");

  const [experiences, setExperiences] = useState([
    { company: "", title: "", startDate: "", endDate: "", description: "" }
  ]);

  const [education, setEducation] = useState([
    { school: "", degree: "", field: "", graduationDate: "" }
  ]);

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  const addExperience = () => {
    setExperiences([...experiences, { company: "", title: "", startDate: "", endDate: "", description: "" }]);
  };

  const removeExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (index, field, value) => {
    const updated = [...experiences];
    updated[index][field] = value;
    setExperiences(updated);
  };

  const addEducation = () => {
    setEducation([...education, { school: "", degree: "", field: "", graduationDate: "" }]);
  };

  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const updateEducation = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  useEffect(() => {
  const getCurrentUser = async () => {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const token = localStorage.getItem('accessToken');

      if (!token) return;

      try {
        const response = await fetch(`${BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
          throw new Error('Failed to fetch user');
        }

        const data = await response.json();
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
      const response = await fetch(
        `${BASE_URL}/api/resumes/${user.id}/master`
      );

      if (!response.ok) {
        if (response.status === 404) return;
        throw new Error('Failed to fetch master resume');
      }

      const result = await response.json();
      const resumeData = result.data?.data;

      if (!resumeData) return;

      setContactInfo({
        fullName: resumeData.contactInfo?.fullName || "",
        email: resumeData.contactInfo?.email || "",
        phone: resumeData.contactInfo?.phone || "",
        linkedin: resumeData.contactInfo?.linkedin || "",
        portfolio: resumeData.contactInfo?.portfolio || "",
        location: resumeData.contactInfo?.location || ""
      });

      setSummary(resumeData.summary || "");

      if (Array.isArray(resumeData.experiences)) {
        setExperiences(resumeData.experiences);
      }

      if (Array.isArray(resumeData.education)) {
        setEducation(resumeData.education);
      }

      if (Array.isArray(resumeData.skills)) {
        setSkills(resumeData.skills);
      }

      setResumeId(result.data?.id);
    } catch (err) {
      console.error(err);
    }
  };

  fetchMasterResume();
  }, [user]);



  
// Updated handleSave to POST or update the master resume
const handleSave = async () => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  
  if (!user?.id) {
    alert('User not found. Please log in again.');
    return;
  }
  
  const resumeData = {
    user_id: user.id,
    name: "Master Resume", // You can make this dynamic if needed
    data: {
      contactInfo,
      summary,
      experiences,
      education,
      skills
    },
    is_master: true
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/resumes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resumeData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save resume');
    }
    
    const result = await response.json();
    console.log('Resume saved:', result);
    
    // Store the resume ID for future reference
    setResumeId(result.data?.id);
    
    alert('Resume saved successfully!');
  } catch (error) {
    console.error('Error saving resume:', error);
    alert('Failed to save resume. Please try again.');
  }
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

      {/* Title */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-center font-serif text-5xl mb-2">Master Resume</h1>
        <p className="text-center text-sm text-gray-600 mb-8">
          Build your master resume once, then customize it for each job application
        </p>

        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Form */}
          <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] pr-4">
            
            {/* Contact Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-md"
            >
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
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
            </motion.div>

            {/* Professional Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-md"
            >
              <h2 className="text-lg font-semibold mb-4">Professional Summary</h2>
              <textarea
                placeholder="Write a brief professional summary..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </motion.div>

            {/* Work Experience */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Work Experience</h2>
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
            </motion.div>

            {/* Education */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Education</h2>
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
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-md"
            >
              <h2 className="text-lg font-semibold mb-4">Skills</h2>
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
            </motion.div>

            {/* Save Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-4 text-sm font-semibold text-white hover:opacity-90 shadow-lg"
            >
              <Save size={18} /> Save Master Resume
            </motion.button>
          </div>
         {/* RIGHT: Live Preview */}
          <div className="sticky top-6 h-fit">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl bg-white p-12 shadow-2xl overflow-y-auto max-h-[calc(100vh-100px)]"
              style={{ fontFamily: "'Times New Roman', serif", lineHeight: 1.5 }}
            >
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

              {/* Skills */}
              {skills.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-900 pb-1 mb-2">
                    Skills
                  </h2>
                  <p className="text-xs text-gray-800">{skills.join(', ')}</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}