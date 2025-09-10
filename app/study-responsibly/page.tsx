export const metadata = { title: "Study responsibly • Revisecards" };

export default function StudyResponsiblyPage() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Study responsibly</h1>
      <p className="text-gray-800 mb-6">
        Revisecards helps you revise faster, but academic integrity always comes first.
      </p>

      <ul className="list-disc pl-6 space-y-3 text-gray-800">
        <li>Use flashcards to understand concepts, not to bypass reading or assignments.</li>
        <li>Do not submit AI-generated content as original work unless your institution permits it.</li>
        <li>Always cite your sources. When in doubt, ask your instructor.</li>
        <li>Respect copyright. Upload documents you have the right to use.</li>
      </ul>

      <p className="text-gray-700 mt-6">
        If you have questions about permitted use, email{" "}
        <a className="text-rose-600" href="mailto:revisecards@gmail.com">revisecards@gmail.com</a>.
      </p>
    </section>
  );
}
