"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, PlusCircle } from "lucide-react";

// Define the Resume type based on your resumeRoutes.js
type Resume = {
  id: string;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    location: string;
    phone: string;
    website?: string;
  };
  education: string;
  experience: string;
  skills: string;
  certifications: string;
  references: string;
};

export default function ApplyPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

    // All possible sections
    const ALL_SECTIONS = [
        { id: "education", label: "Education" },
        { id: "experience", label: "Work Experience" },
        { id: "skills", label: "Skills and Abilities" },
        { id: "certifications", label: "Certifications" },
        { id: "references", label: "References" },
    ];

    // Track which sections are currently visible
    const [visibleSections, setVisibleSections] = useState([
        "contact",
        "education",
        "experience",
        "skills",
        "certifications",
        "references",
    ]);

    // Function to remove a section
    const removeSection = (sectionId: string) => {
        setVisibleSections((prev) => prev.filter((id) => id !== sectionId));
    };

    // Function to add a section back
    const addSection = (sectionId: string) => {
        if (!visibleSections.includes(sectionId)) {
        setVisibleSections((prev) => [...prev, sectionId]);
        }
    };

    // Identify which sections are currently hidden
    const hiddenSections = ALL_SECTIONS.filter(s => !visibleSections.includes(s.id));

    // Function to handle the initial submit click
    const handleSubmitClick = (e: React.FormEvent) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    // Function for the 'Confirm' button inside the popup
    const handleConfirmSubmit = () => {
        // You would typically perform your final API POST here
        router.push("/apply/success");
    };
    
    // Form state for autofill
    const [formData, setFormData] = useState({
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
  
    // 1. Fetch resumes from your Supabase backend on mount
    useEffect(() => {
      fetch("http://localhost:3001/api/resumes/") // Ensure this matches your server port
        .then((res) => res.json())
        .then((data) => setResumes(data))
        .catch((err) => console.error("Error fetching resumes:", err));
    }, []);
  
    // 2. Handle Resume Selection and Autofill
    const handleResumeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      setSelectedResumeId(id);
      
      const selected = resumes.find((r) => r.id === id);
      if (selected) {
        console.log(selected)
        setFormData({
          firstName: selected.contact.firstName || "",
          lastName: selected.contact.lastName || "",
          email: selected.contact.email || "",
          location: selected.contact.location || "",
          phone: selected.contact.phone || "",
          website: selected.contact.website || "",
          education: selected.education || "",
          experience: selected.experience || "",
          skills: selected.skills || "",
          certifications: selected.certifications || "",
          references: selected.references || "",
        });
      }
    };

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      {/* Back Button matching header style */}
      <div className="mb-6 flex justify-center">
        <button 
          onClick={() => router.back()}
          className="text-2xl font-medium hover:opacity-70 flex items-center gap-2"
        >
          ← Back
        </button>
      </div>

      <article className="rounded-2xl bg-white p-12 shadow-sm border border-gray-50/50">
        {/* Header Row */}
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-4xl font-bold tracking-tight text-black">Create/Edit Resume</h1>
          <button 
            onClick={handleSubmitClick}
            className="bg-black text-white px-6 py-2 text-xs font-mono uppercase tracking-widest rounded-sm hover:opacity-90">
            Submit
          </button>
        </div>
        
        <p className="text-gray-600 font-serif mb-10">
          Edit in the boxes with your details to generate your resume
        </p>

        {/* --- Dropdown Menu --- */}
        <div className="mb-10 p-4 bg-white-50 rounded-lg border-gray-100">
          <label className="block text-[10px] font-bold uppercase text-gray-500 mb-2">
            Autofill from saved resume
          </label>
          <select 
            value={selectedResumeId}
            onChange={handleResumeSelect}
            className="w-full bg-white border border-gray-200 rounded-md p-2 text-sm outline-none focus:border-black"
          >
            <option value="">Select a resume...</option>
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.contact.firstName} {r.contact.lastName} - {r.contact.email}
              </option>
            ))}
          </select>
        </div>

        {/* Form Sections with Dividers */}
        <div className="space-y-6">
          
          {/* Contact Information */}
          <section className="border-t border-gray-100 pt-4">
            <h2 className="text-xl font-medium text-gray-900 mb-6">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              {[
                { label: "First Name", placeholder: "-" },
                { label: "Last name", placeholder: "-" },
                { label: "Email", placeholder: "-" },
                { label: "Location", placeholder: "-" },
                { label: "Phone Number", placeholder: "-" },
                { label: "Website (optional)", placeholder: "-" },
              ].map((field, i) => (
                <div key={i}>
                  <label className="block text-xs font-medium text-gray-700 mb-2">{field.label}</label>
                    <input 
                        required
                        type="email" 
                        className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black"
                        placeholder="-"
                    />
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          {visibleSections.includes("education") && (
            <section className="border-t border-gray-100 pt-4 relative group">
                <button 
                    onClick={() => removeSection("education")}
                    className="absolute right-0 top-4 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                    <Trash2 size={18} />
                </button>
                <h2 className="text-xl font-medium text-gray-900 mb-4">Education</h2>
                <textarea 
                    required
                    rows={5}
                    className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black resize-none"
                    placeholder="education stuff"/>  
            </section>
          )}

          {/* Work Experience */}
          {visibleSections.includes("experience") && (
          <section className="border-t border-gray-100 pt-4 relative group">
            <button 
                onClick={() => removeSection("experience")}
                className="absolute right-0 top-4 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                <Trash2 size={18} />
            </button>
            <h2 className="text-xl font-medium text-gray-900 mb-4">Work Experience</h2>
            <textarea 
                required
                rows={5}
                className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black resize-none"
                placeholder="work experience stuff"/>  
          </section>
          )}

          {/* Skills and Abilities */}
          {visibleSections.includes("skills") && (
          <section className="border-t border-gray-100 pt-4 relative group">
            <button 
                onClick={() => removeSection("skills")}
                className="absolute right-0 top-4 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                <Trash2 size={18} />
            </button>
            <h2 className="text-xl font-medium text-gray-900 mb-4">Skills and Abilities</h2>
            <textarea 
                required
                rows={5}
                className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black resize-none"
                placeholder="skills stuff"/>  
          </section>
          )}

          {/* Certifications */}
          {visibleSections.includes("certifications") && (
          <section className="border-t border-gray-100 pt-4 relative group">
            <button 
                onClick={() => removeSection("certifications")}
                className="absolute right-0 top-4 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                <Trash2 size={18} />
            </button>
            <h2 className="text-xl font-medium text-gray-900 mb-4">Certifications</h2>
            <textarea 
                required
                rows={5}
                className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black resize-none"
                placeholder="certifications stuff"/>  
          </section>
          )}

          {/* References */}
          {visibleSections.includes("references") && (
          <section className="border-t border-gray-100 pt-4 relative group">
            <button 
                onClick={() => removeSection("references")}
                className="absolute right-0 top-4 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                <Trash2 size={18} />
            </button>
            <h2 className="text-xl font-medium text-gray-900 mb-4">References</h2>
            <textarea 
                required
                rows={5}
                className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black resize-none"
                placeholder="references stuff"/>          
            </section>
          )}

        </div>

        {/* --- ADD SECTION UI --- */}
        {hiddenSections.length > 0 && (
          <div className="mt-12 border-t border-dashed border-gray-200 pt-8">
            <p className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-widest text-center">
              Add sections back to your resume
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {hiddenSections.map((section) => (
                <button
                  key={section.id}
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
      </article>

      {/* --- POPUP MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-black">Confirm Submission</h2>
            <p className="mt-4 text-gray-600">
              Are you sure you want to submit this resume? You won't be able to edit your details after confirming.
            </p>
            
            <div className="mt-8 flex flex-col gap-3">
              <button 
                onClick={handleConfirmSubmit}
                className="w-full rounded-md bg-black py-3 text-sm font-semibold text-white hover:opacity-90">
                Confirm and Submit
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full rounded-md border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Go back
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}