"use client";

import { useRouter } from "next/navigation";

export default function ApplyPage() {
  const router = useRouter();

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
          <button className="bg-black text-white px-6 py-2 text-xs font-mono uppercase tracking-widest rounded-sm hover:opacity-90">
            Submit
          </button>
        </div>
        
        <p className="text-gray-600 font-serif mb-10">
          Edit in the boxes with your details to generate your resume
        </p>

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
          <section className="border-t border-gray-100 pt-4">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Education</h2>
            <textarea 
                required
                rows={5}
                className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black resize-none"
                placeholder="education stuff"/>  
          </section>

          {/* Work Experience */}
          <section className="border-t border-gray-100 pt-4">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Work Experience</h2>
            <textarea 
                required
                rows={5}
                className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black resize-none"
                placeholder="work experience stuff"/>  
          </section>

          {/* Skills and Abilities */}
          <section className="border-t border-gray-100 pt-4">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Skills and Abilities</h2>
            <textarea 
                required
                rows={5}
                className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black resize-none"
                placeholder="skills stuff"/>  
          </section>

          {/* Certifications */}
          <section className="border-t border-gray-100 pt-4">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Certifications</h2>
            <textarea 
                required
                rows={5}
                className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black resize-none"
                placeholder="certifications stuff"/>  
          </section>

          {/* References */}
          <section className="border-t border-gray-100 pt-4">
            <h2 className="text-xl font-medium text-gray-900 mb-4">References</h2>
            <textarea 
                required
                rows={5}
                className="w-full rounded-md border border-gray-300 bg-white/50 px-4 py-2 outline-none focus:border-black resize-none"
                placeholder="references stuff"/>          
            </section>

        </div>
      </article>
    </section>
  );
}