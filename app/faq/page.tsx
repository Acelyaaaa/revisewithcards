export const metadata = { title: "FAQ • Revisecards" };

export default function FAQPage() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>

      <div className="space-y-6 text-gray-800">
        <div>
          <h2 className="font-semibold text-lg">What does Revisecards do?</h2>
          <p>
            Upload a PDF and get a set of question &amp; answer flashcards generated from the content.
            You can regenerate for variety and save sets to your Summaries.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-lg">Is there a free plan?</h2>
          <p>
            Yes. The free tier allows up to 5 uploads per month (each producing 10 flashcards).
            The Pro plan increases this limit and prioritizes processing.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-lg">What file types are supported?</h2>
          <p>PDF only (≤ 10 MB) for now.</p>
        </div>

        <div>
          <h2 className="font-semibold text-lg">Do you store my documents?</h2>
          <p>
            We store only what’s needed to create and display your flashcards. You can delete your
            saved sets from the Summaries page at any time.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-lg">Do you train on my data?</h2>
          <p>No. Your uploads are not used to train external models.</p>
        </div>

        <div>
          <h2 className="font-semibold text-lg">How do I cancel?</h2>
          <p>
            You can cancel any time from the billing portal (linked from your account menu) or by
            contacting us at <a className="text-rose-600" href="mailto:revisecards@gmail.com">revisecards@gmail.com</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
