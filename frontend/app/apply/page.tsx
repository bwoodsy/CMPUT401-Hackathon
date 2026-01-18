"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

type Resume = {
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

export default function ApplyPage() {
  const router = useRouter();
  const { user, getAuthHeader, isLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [resume, setResume] = useState<Resume>({
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
    const loadResume = async () => {
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
            const contact = JSON.parse(data.contact || "{}");
            setResume({
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
            setResumeId(data.id);
          }
        }
      } catch (error) {
        console.error("Error loading resume:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      loadResume();
    }
  }, [user, isLoading, getAuthHeader]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setResume({
      ...resume,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const url = resumeId
        ? `${BASE_URL}/api/resumes/${resumeId}`
        : `${BASE_URL}/api/resumes`;
      const method = resumeId ? "PUT" : "POST";

      const body = {
        ...resume,
        user_id: user?.id,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        if (!resumeId && data[0]?.id) {
          setResumeId(data[0].id);
        }
        alert("Resume saved!");
      } else {
        alert("Failed to save resume");
      }
    } catch (error) {
      console.error("Error saving resume:", error);
      alert("Failed to save resume");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-pink-200 via-pink-100 to-amber-100 flex items-center justify-center">
        <p className="text-black">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-pink-200 via-pink-100 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-black mb-4">Please log in to create or edit your resume.</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-black text-white px-6 py-2 rounded-md hover:opacity-90"
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-200 via-pink-100 to-amber-100 text-black">
      <section className="mx-auto max-w-4xl px-6 py-12">
        {/* Back Button */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => router.back()}
            className="text-2xl font-medium hover:opacity-70 flex items-center gap-2"
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <article className="rounded-2xl bg-white p-12 shadow-sm border border-gray-50/50">
            {/* Header Row */}
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-4xl font-bold tracking-tight text-black">
                {resumeId ? "Edit Resume" : "Create Resume"}
              </h1>
              <button
                type="submit"
                disabled={saving}
                className="bg-black text-white px-6 py-2 text-xs font-mono uppercase tracking-widest rounded-sm hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Submit"}
              </button>
            </div>

            <p className="text-gray-600 font-serif mb-10">
              Edit in the boxes with your details to generate your resume
            </p>

            {/* Form Sections */}
            <div className="space-y-6">

              {/* Contact Information */}
              <section className="border-t border-gray-100 pt-4">
                <h2 className="text-xl font-medium text-gray-900 mb-6">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      required
                      type="text"
                      name="firstName"
                      value={resume.firstName}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black"
                      placeholder="-"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Last name</label>
                    <input
                      required
                      type="text"
                      name="lastName"
                      value={resume.lastName}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black"
                      placeholder="-"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Email</label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={resume.email}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black"
                      placeholder="-"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Location</label>
                    <input
                      required
                      type="text"
                      name="location"
                      value={resume.location}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black"
                      placeholder="-"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={resume.phone}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black"
                      placeholder="-"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Website (optional)</label>
                    <input
                      type="url"
                      name="website"
                      value={resume.website}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black"
                      placeholder="-"
                    />
                  </div>
                </div>
              </section>

              {/* Education */}
              <section className="border-t border-gray-100 pt-4">
                <h2 className="text-xl font-medium text-gray-900 mb-4">Education</h2>
                <textarea
                  required
                  rows={5}
                  name="education"
                  value={resume.education}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black resize-none"
                  placeholder="education stuff"
                />
              </section>

              {/* Work Experience */}
              <section className="border-t border-gray-100 pt-4">
                <h2 className="text-xl font-medium text-gray-900 mb-4">Work Experience</h2>
                <textarea
                  required
                  rows={5}
                  name="experience"
                  value={resume.experience}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black resize-none"
                  placeholder="work experience stuff"
                />
              </section>

              {/* Skills and Abilities */}
              <section className="border-t border-gray-100 pt-4">
                <h2 className="text-xl font-medium text-gray-900 mb-4">Skills and Abilities</h2>
                <textarea
                  required
                  rows={5}
                  name="skills"
                  value={resume.skills}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black resize-none"
                  placeholder="skills stuff"
                />
              </section>

              {/* Certifications */}
              <section className="border-t border-gray-100 pt-4">
                <h2 className="text-xl font-medium text-gray-900 mb-4">Certifications</h2>
                <textarea
                  required
                  rows={5}
                  name="certifications"
                  value={resume.certifications}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black resize-none"
                  placeholder="certifications stuff"
                />
              </section>

              {/* References */}
              <section className="border-t border-gray-100 pt-4">
                <h2 className="text-xl font-medium text-gray-900 mb-4">References</h2>
                <textarea
                  required
                  rows={5}
                  name="references"
                  value={resume.references}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black resize-none"
                  placeholder="references stuff"
                />
              </section>
            </div>
          </article>
        </form>
      </section>
    </main>
  );
}
