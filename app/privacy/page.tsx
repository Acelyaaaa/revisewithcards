export const metadata = { title: "Privacy Policy • Revisecards" };

export default function PrivacyPage() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

      <h2 className="font-semibold text-xl mb-2">What we collect</h2>
      <ul className="list-disc pl-6 space-y-2 text-gray-800 mb-6">
        <li>Account info from our auth provider (email, user ID).</li>
        <li>Uploaded PDFs and generated flashcards (when you save them).</li>
        <li>Usage and telemetry needed to run the service (request logs, errors).</li>
      </ul>

      <h2 className="font-semibold text-xl mb-2">How we use data</h2>
      <p className="text-gray-800 mb-6">
        To process your PDFs into flashcards, enforce quotas, improve reliability, and provide
        support. We do not sell your data and we do not use your uploads to train external models.
      </p>

      <h2 className="font-semibold text-xl mb-2">Retention & deletion</h2>
      <p className="text-gray-800 mb-6">
        You can delete saved flashcards at any time from the Summaries page. Backups are purged on a
        rolling basis. Support requests may retain relevant metadata.
      </p>

      <h2 className="font-semibold text-xl mb-2">Third parties</h2>
      <p className="text-gray-800 mb-6">
        We use reputable vendors to operate Revisecards (e.g., authentication, payments, hosting,
        file storage, AI model APIs). Each vendor processes only what is required.
      </p>

      <h2 className="font-semibold text-xl mb-2">Contact</h2>
      <p className="text-gray-800">
        Email <a className="text-rose-600" href="mailto:revisecards@gmail.com">revisecards@gmail.com</a>{" "}
        for privacy questions or data requests.
      </p>
    </section>
  );
}
