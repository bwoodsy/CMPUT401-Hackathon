"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trash2, PlusCircle, CircleUser } from "lucide-react";

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

    useEffect(() => {
        fetch("http://localhost:3001/api/resumes/")
        .then((res) => res.json())
        .then((data) => setResumes(data))
        .catch((err) => console.error("Error fetching resumes:", err));
    }, []);

    const handleResumeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedResumeId(id);
        const selected = resumes.find((r) => r.id === id);
        if (selected) {
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

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    // Perform your API POST here
    router.push("/apply/success");
  };

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
          {["← Back to listings", "Resume", "About", "Careers"].map((link) => (
            <motion.a
              key={link}
              href="/"
              className="cursor-pointer"
              whileHover={{ scale: 1.1, color: "#ec4899" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {link}
            </motion.a>
          ))}
          <motion.a
            href="#"
            className="flex items-center gap-1 cursor-pointer"
            whileHover={{ scale: 1.1, color: "#ec4899" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Get started →
          </motion.a>
        </nav>

        <motion.div
          whileHover={{ scale: 1.1, opacity: 0.9 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="cursor-pointer"
          onClick={() => router.push("/login")}
        >
        {/* Header */}
        <header className="w-full max-w-5xl mx-auto px-6 pt-6 flex items-center justify-between">
            <nav className="flex gap-6 text-sm">
            {["← Back to listings", "Resume", "About", "Careers"].map((link) => (
                <motion.a
                key={link}
                href="/"
                className="cursor-pointer"
                whileHover={{ scale: 1.1, color: "#ec4899" }}
                transition={{ type: "spring", stiffness: 300 }}
                >
                {link}
                </motion.a>
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
          {link}
        </motion.a>
      ))}

      <motion.a
        href="#"
        className="flex items-center gap-1 cursor-pointer"
        whileHover={{ scale: 1.1, color: "#ec4899" }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        Get started →
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
    {/* Header */}
    <div className="mb-2">
      <h1 className="text-4xl font-bold tracking-tight text-black">
        Create / Edit Resume
      </h1>
    </div>

    <p className="text-gray-600 font-serif mb-10">
      Edit in the boxes with your details to generate your resume
    </p>

    {/* Autofill */}
    <div className="mb-10 p-4 rounded-lg border-gray-100">
      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-2">
        Autofill from saved resume
      </label>
      <select
        value={selectedResumeId}
        onChange={handleResumeSelect}
        className="w-full bg-white border border-gray-200 rounded-md p-2 text-sm outline-none focus:border-black"
      >
        {/* Title */}
        <div className="mb-2">
          <h1 className="text-4xl font-bold tracking-tight text-black">
            Create / Edit Resume
          </h1>
        </div>

        <p className="text-gray-600 font-serif mb-10">
          Edit in the boxes with your details to generate your resume
        </p>

        {/* Autofill */}
        <div className="mb-10 p-4 rounded-lg border-gray-100">
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
                {r.contact.firstName} {r.contact.lastName} – {r.contact.email}
              </option>
            ))}
          </select>
        </div>

        {/* Form Sections */}
        <form className="space-y-6">
          {/* Contact Info */}
          <section className="border-t border-gray-100 pt-4">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              {[
                "firstName",
                "lastName",
                "email",
                "location",
                "phone",
                "website",
              ].map((field) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type="text"
                    value={formData[field as keyof typeof formData]}
                    onChange={(e) =>
                      setFormData({ ...formData, [field]: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black"
                  />
                </div>
            </section>

            {/* Other Sections */}
            {[
                { title: "Education", field: "education" },
                { title: "Work Experience", field: "experience" },
                { title: "Skills and Abilities", field: "skills" },
                { title: "Certifications", field: "certifications" },
                { title: "References", field: "references" },
            ].map((section) => (
                visibleSections.includes(section.field) && (
                    <section key={section.field} className="border-t border-gray-100 pt-4 relative group">
                    <button 
                        onClick={() => removeSection(section.field)}
                        className="absolute right-0 top-4 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                        <Trash2 size={18} />
                    </button>
                    <h2 className="text-xl font-medium text-gray-900 mb-4">
                        {section.title}
                    </h2>
                    <textarea
                        rows={5}
                        value={formData[section.field as keyof typeof formData]}
                        onChange={(e) =>
                        setFormData({ ...formData, [section.field]: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black resize-none"
                    />
                    </section>
                )
            ))}

            {/* Submit Button */}
            <motion.button
                type="submit"
                onClick={handleSubmitClick}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-black text-white px-6 py-2 text-xs font-mono uppercase tracking-widest rounded-sm hover:opacity-90 mt-8"
            >
                Submit
            </motion.button>
            </form>

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
                    className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:border-black hover:text-black transition-colors">
                    <PlusCircle size={14} />
                    {section.label}
                    </button>
                ))}
                </div>
            </div>
            )}
        </motion.article>

        {/* Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-black">Confirm Submission</h2>
                <p className="mt-4 text-gray-600">
                Are you sure you want to submit this resume? You won't be able to edit
                your details after confirming.
                </p>

                <div className="mt-8 flex flex-col gap-3">
                <button
                    onClick={handleConfirmSubmit}
                    className="w-full rounded-md bg-black py-3 text-sm font-semibold text-white hover:opacity-90"
                >
                    Confirm and Submit
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
          </div>
        </div>
      )}
    </section>
          )}
        </section>
      ))}

      {/* Submit Button at the Bottom */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-black text-white px-6 py-2 text-xs font-mono uppercase tracking-widest rounded-sm hover:opacity-90 mt-8"
      >
        Submit
      </motion.button>
    </div>
  </motion.article>
</motion.section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-black">Confirm Submission</h2>
            <p className="mt-4 text-gray-600">
              Are you sure you want to submit this resume? You won't be able to edit
              your details after confirming.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={handleConfirmSubmit}
                className="w-full rounded-md bg-black py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                Confirm and Submit
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
