import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Terms of Service - Family Court Helper',
  description: 'Terms of Service for Family Court Helper application',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <p className="text-sm text-gray-600 mb-8">Last updated: 28/11/2025</p>

            <p>Welcome to Family Court Helper ("we", "our", "the Service"). These Terms of Service ("Terms") explain the rules for using our website and tools. By creating an account or using the Service, you agree to these Terms.</p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
              <p className="font-semibold text-yellow-800">General disclaimer:</p>
              <p className="text-yellow-700">This Service is operated for educational and informational purposes and is not a law firm. We do not provide legal advice.</p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Our Service Does</h2>
              <p className="mb-4">Family Court Helper is a free tool that helps UK parents:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>organise information about their family situation</li>
                <li>prepare summaries for child custody applications</li>
                <li>generate a Word document based on their responses</li>
              </ul>
              <p className="mb-4">The Service does not:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>provide legal advice</li>
                <li>file court applications on your behalf</li>
                <li>guarantee any legal or court outcome</li>
                <li>review your information for accuracy</li>
              </ul>
              <p className="font-semibold">You are fully responsible for the information you enter and any decisions you make using the generated documents.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Eligibility</h2>
              <p className="mb-4">To use the Service, you must:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>be at least 18 years old</li>
                <li>create an account with accurate information</li>
                <li>use the Service only for lawful purposes related to your own family situation or with lawful authority</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Your Responsibilities</h2>
              <p className="mb-4">You agree to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>provide truthful and accurate information.</li>
                <li>not misuse the Service to harass, intimidate, or falsely accuse another person.</li>
                <li>only upload information you are legally entitled to share.</li>
                <li>safeguard your password and account.</li>
                <li>comply with court rules and UK law when using any generated documents.</li>
              </ul>
              <p>We may restrict or terminate access if these responsibilities are breached.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Sensitive Information You Provide</h2>
              <p className="mb-4">you may enter highly sensitive information, including:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>your identity, address, and contact details</li>
                <li>information about children (names, ages, health, SEN, social worker involvement)</li>
                <li>information about the other parent or party</li>
                <li>allegations of domestic abuse, violence, threats, and controlling behaviour</li>
                <li>risks of abduction or harm</li>
                <li>disabilities or health information</li>
                <li>interpreter or language needs</li>
                <li>social services involvement</li>
              </ul>
              <p className="mb-4">By using the Service, you understand that for family court preparation, :</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>this information is entered entirely by you</li>
                <li>we do not verify it, investigate it, or pass it to authorities</li>
                <li>the generated document is not reviewed by a lawyer</li>
              </ul>
              <p>See our Privacy Policy for details about how your data is stored and protected.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Safeguarding & Emergency Situations</h2>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="font-semibold text-red-800">We do not provide emergency assistance.</p>
              </div>
              <p className="mb-4">If you or a child is at immediate risk of harm, you must contact:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>999 (police/emergency services)</li>
                <li>Local social services</li>
                <li>National Domestic Abuse Helpline (0808 2000 247)</li>
              </ul>
              <p>We do not monitor user submissions, review allegations, or intervene in emergencies.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. No Legal Advice</h2>
              <p className="mb-4">Nothing on this website:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>constitutes legal advice</li>
                <li>creates a solicitor–client relationship</li>
                <li>guarantees a legal outcome</li>
              </ul>
              <p className="font-semibold">You should consult a qualified solicitor for legal advice about your case.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Account Creation and Security</h2>
              <p className="mb-4">To create an account, you must provide:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>email</li>
                <li>password</li>
              </ul>
              <p className="mb-4">You are responsible for:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>keeping your password secure</li>
                <li>all activity under your account</li>
                <li>notifying us of unauthorised access</li>
              </ul>
              <p>We may suspend an account if we detect misuse or risk.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Retention and Deletion</h2>
              <p className="mb-4">To allow you to return and complete your form, your questionnaire data may be temporarily stored.</p>
              <p className="mb-4">We automatically delete questionnaire responses after 30 days, unless you choose to save progress for longer (where applicable).</p>
              <p>Once deleted, your answers cannot be recovered.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Licence to Use the Service</h2>
              <p className="mb-4">We grant you a personal, non-exclusive, non-transferable licence to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>access the website</li>
                <li>complete the questionnaire</li>
                <li>download your generated document</li>
              </ul>
              <p className="mb-4">You may not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>copy, redistribute, or reproduce the website or its templates</li>
                <li>sell or commercially exploit the generated documents</li>
                <li>reverse-engineer or attempt to access the source code</li>
                <li>interfere with the operation of the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Prohibited Uses</h2>
              <p className="mb-4">You must not use the Service to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>submit false, malicious, or defamatory information</li>
                <li>impersonate another person</li>
                <li>breach protective orders or confidentiality obligations</li>
                <li>harass or threaten another person</li>
                <li>upload viruses, scripts, or harmful code</li>
                <li>attempt to bypass security measures</li>
                <li>gather data for commercial, research, or surveillance purposes without permission</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Service Availability</h2>
              <p className="mb-4">We strive to provide reliable access but cannot guarantee:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>uninterrupted service</li>
                <li>error-free operation</li>
                <li>permanent availability of features</li>
              </ul>
              <p>We may update, pause, or discontinue parts of the Service at any time.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Limitation of Liability</h2>
              <p className="mb-4">To the fullest extent allowed by law:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>We do not accept liability for actions you take based on the generated documents.</li>
                <li>We are not responsible for inaccuracies, omissions, or misuse of the Service.</li>
                <li>We are not liable for court decisions or legal consequences.</li>
                <li>We do not guarantee that the Service will be secure or free from bugs.</li>
              </ul>
              <p className="font-semibold">Your use of the Service is at your own risk.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Warranties Disclaimer</h2>
              <p className="mb-4">The Service is provided "as is" and "as available", without warranties of any kind, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>fitness for a particular purpose</li>
                <li>accuracy</li>
                <li>completeness</li>
                <li>availability</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Modifications to the Terms</h2>
              <p>We may update these Terms. Continued use after changes means you accept the updated Terms.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Governing Law</h2>
              <p className="mb-4">These Terms are governed by the laws of England and Wales.</p>
              <p>Disputes will be resolved exclusively by the courts of England and Wales.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Contact Us</h2>
              <p>If you have questions about these Terms, contact:</p>
              <p className="font-semibold mt-2">Family Court Helper.io</p>
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
