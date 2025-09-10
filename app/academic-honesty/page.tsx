export const metadata = { title: "Academic honesty • Revisecards" };

export default function AcademicHonestyPage() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Academic honesty</h1>
      <p className="text-gray-800 mb-6">
        We support ethical learning. Using Revisecards to cheat or misrepresent work violates our
        Terms of Service and may violate your institution’s policies.
      </p>

      <h2 className="font-semibold text-xl mt-4 mb-2">Examples of acceptable use</h2>
      <ul className="list-disc pl-6 space-y-2 text-gray-800">
        <li>Creating study notes and practice questions for personal learning.</li>
        <li>Reviewing concepts before exams or discussions.</li>
      </ul>

      <h2 className="font-semibold text-xl mt-6 mb-2">Examples of unacceptable use</h2>
      <ul className="list-disc pl-6 space-y-2 text-gray-800">
        <li>Submitting AI-generated content as your own graded work.</li>
        <li>Uploading content you do not have the right to use or share.</li>
      </ul>

      <p className="text-gray-700 mt-6">
        Questions? Contact{" "}
        <a className="text-rose-600" href="mailto:revisecards@gmail.com">revisecards@gmail.com</a>.
      </p>
    </section>
  );
}
