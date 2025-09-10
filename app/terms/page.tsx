export const metadata = { title: "Terms of Service • Revisecards" };

export default function TermsPage() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

      <h2 className="font-semibold text-xl mb-2">1. Your account</h2>
      <p className="text-gray-800 mb-6">
        You are responsible for your account and for all activity under it. Keep your credentials
        secure and comply with your institution’s rules.
      </p>

      <h2 className="font-semibold text-xl mb-2">2. Acceptable use</h2>
      <p className="text-gray-800 mb-6">
        Do not upload unlawful, infringing, or harmful content. Do not use Revisecards to cheat or
        misrepresent work. We may suspend accounts that violate these Terms.
      </p>

      <h2 className="font-semibold text-xl mb-2">3. Intellectual property</h2>
      <p className="text-gray-800 mb-6">
        You retain rights to your uploads. By using Revisecards, you grant us a limited license to
        process your files to provide the service.
      </p>

      <h2 className="font-semibold text-xl mb-2">4. Billing</h2>
      <p className="text-gray-800 mb-6">
        Subscriptions renew automatically until canceled. Prices may change with notice. Refunds are
        handled case-by-case as permitted by law.
      </p>

      <h2 className="font-semibold text-xl mb-2">5. Disclaimers</h2>
      <p className="text-gray-800 mb-6">
        Revisecards is provided “as is.” We strive for accuracy but do not guarantee error-free
        outputs. Always verify critical information.
      </p>

      <h2 className="font-semibold text-xl mb-2">6. Limitation of liability</h2>
      <p className="text-gray-800 mb-6">
        To the maximum extent permitted by law, we are not liable for indirect, incidental, or
        consequential damages.
      </p>

      <h2 className="font-semibold text-xl mb-2">Contact</h2>
      <p className="text-gray-800">
        Questions about these Terms? Email{" "}
        <a className="text-rose-600" href="mailto:revisecards@gmail.com">revisecards@gmail.com</a>.
      </p>

      <p className="text-xs text-gray-500 mt-8">
        This document is provided for general informational purposes and is not legal advice.
      </p>
    </section>
  );
}
