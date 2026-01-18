export default function SuccessPage() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-serif text-5xl font-bold">Application Sent!</h1>
      <p className="mt-4 text-gray-600">You've successfully applied for this position.</p>
      <a href="/" className="mt-8 text-sm font-semibold underline">Return to Careers</a>
    </section>
  );
}