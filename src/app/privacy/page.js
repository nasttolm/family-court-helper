import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Privacy Policy - Family Court Helper',
  description: 'Privacy policy for Family Court Helper application',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <p className="text-sm text-gray-600 mb-8">Last updated: [23/11/2025]</p>

            <p>We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and protect your information when you use Family Court Helper ("we", "us", "the Service").</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">1.1 Information You Provide Directly</h3>
              <p className="mb-4">This includes:</p>

              <h4 className="text-lg font-semibold text-gray-900 mb-2">A. Your personal details</h4>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Full name</li>
                <li>Date of birth</li>
                <li>Address</li>
                <li>Contact details</li>
                <li>Whether you wish your address to be withheld</li>
              </ul>

              <h4 className="text-lg font-semibold text-gray-900 mb-2">B. Case information</h4>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Applicant/respondent status</li>
                <li>Name of court</li>
                <li>Case number</li>
                <li>Desired court orders/outcomes</li>
              </ul>

              <h4 className="text-lg font-semibold text-gray-900 mb-2">C. Children's information</h4>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Names, DOBs, addresses</li>
                <li>Who they live with</li>
                <li>Special educational needs</li>
                <li>Health conditions – medical documentation</li>
                <li>Social worker name & local authority</li>
                <li>Any risks of harm or abduction</li>
              </ul>

              <h4 className="text-lg font-semibold text-gray-900 mb-2">D. Information about the other party</h4>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Name</li>
                <li>Date of birth</li>
                <li>Address</li>
              </ul>

              <h4 className="text-lg font-semibold text-gray-900 mb-2">E. Sensitive disclosures</h4>
              <p className="mb-2">These may include:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Domestic abuse</li>
                <li>Threats or violence</li>
                <li>Coercive/controlling behaviour</li>
                <li>Child safeguarding concerns</li>
                <li>Disabilities or health conditions</li>
                <li>Interpreter or language needs</li>
              </ul>
              <p className="font-semibold">This is considered special category data under UK GDPR.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Legal Basis for Processing</h2>
              <p className="mb-4">Under UK GDPR, we rely on:</p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Explicit Consent</h3>
              <p className="mb-2">For processing:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>health data</li>
                <li>interpreter needs</li>
                <li>domestic abuse details</li>
                <li>child safeguarding information</li>
              </ul>
              <p className="mb-4">You give consent by checking the box during registration or form submission.</p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Contractual Necessity</h3>
              <p className="mb-2">To:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>create and maintain your account</li>
                <li>generate your document</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Legitimate Interests</h3>
              <p className="mb-2">To:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>operate, improve, and secure the Service</li>
                <li>temporarily store data so you can return and continue</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.4 Legal Obligations</h3>
              <p>If ever required by law enforcement or a court order.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="mb-2">We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>generate your family court document</li>
                <li>save your progress</li>
                <li>allow you to download your completed summary</li>
                <li>maintain and secure your account</li>
                <li>improve the Service</li>
              </ul>
              <p className="mb-2 font-semibold">We do not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>sell your data</li>
                <li>use your information for advertising</li>
                <li>share your data with third parties except where absolutely required by law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Special Category Data Handling</h2>
              <p className="mb-2">Because you may submit sensitive information, we:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>encrypt data during transmission</li>
                <li>restrict access to authorised personnel only</li>
                <li>automatically delete questionnaire data after the retention period</li>
                <li>store data securely in the UK or EU-compliant servers</li>
              </ul>
              <p>We do not use or share sensitive data for analytics, marketing, or profiling.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Third-Party Data</h2>
              <p className="mb-2">You may enter data about:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>your children</li>
                <li>the other parent/party</li>
                <li>social workers</li>
              </ul>
              <p className="mb-2">You confirm you have lawful authority to provide this information.</p>
              <p>We process it solely to generate your document.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>User specific questionnaire data is deleted automatically after 30 days.</li>
                <li>Account data (email/password) is retained until you delete your account.</li>
                <li>Backups, if any, are cleared within 30 days.</li>
              </ul>
              <p className="font-semibold">After deletion, your data cannot be recovered.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Security</h2>
              <p className="mb-2">We use:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>encryption (HTTPS/TLS)</li>
                <li>secure authentication</li>
                <li>hashed password</li>
                <li>restricted-access storage</li>
                <li>regular security reviews</li>
              </ul>
              <p className="font-semibold">However, no online service can guarantee absolute security.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Parents or legal guardians may enter information about their children only for lawful purposes.</li>
                <li>Children cannot create accounts or use the Service directly.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Your Rights (UK GDPR)</h2>
              <p className="mb-2">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>access your data</li>
                <li>correct inaccurate data</li>
                <li>request deletion</li>
                <li>withdraw consent</li>
                <li>object to processing</li>
                <li>request data export</li>
              </ul>
              <p>To exercise your rights, contact us at [Family Court Helper.io].</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Cookies</h2>
              <p className="mb-2">We use essential cookies only for:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>login</li>
                <li>session management</li>
                <li>security</li>
              </ul>
              <p>We do not use tracking or advertising cookies.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Sharing Your Data</h2>
              <p className="mb-2">We only share your data:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>when required by law (e.g., court order, police request)</li>
                <li>with service providers who host or secure the website (under strict agreements)</li>
              </ul>
              <p className="font-semibold">We do not sell or trade personal information.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. International Transfers</h2>
              <p className="mb-2">If data is processed outside the UK, we ensure:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>UK GDPR-compliant safeguards</li>
                <li>adequacy decisions, SCCs, or equivalent protections</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to This Policy</h2>
              <p>We may update this Policy. Continued use of the Service means you accept the revised version.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Us</h2>
              <p className="mb-2">If you have questions about this Privacy Policy or your rights, contact:</p>
              <p className="font-semibold">Family Court Helper.io</p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link href="/register">
              <Button variant="outline">Back to Registration</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
