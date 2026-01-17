export default function ApplyPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-center font-serif text-6xl">Open Application</h1>
      
      <div className="mx-auto mt-10 max-w-2xl">
        <form className="rounded-xl bg-white/70 p-8 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500">Full Name</label>
            <input type="text" className="w-full border-b border-gray-300 bg-transparent py-2 outline-none focus:border-black" placeholder="Jane Doe" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500">Email</label>
            <input type="email" className="w-full border-b border-gray-300 bg-transparent py-2 outline-none focus:border-black" placeholder="jane@example.com" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500">Why us?</label>
            <textarea className="w-full border-b border-gray-300 bg-transparent py-2 outline-none focus:border-black" rows={4} placeholder="Tell us about yourself..." />
          </div>
          <button className="w-full rounded-md bg-black py-3 text-sm font-semibold text-white hover:opacity-90">
            Submit Application
          </button>
        </form>
      </div>
    </section>
  );
}