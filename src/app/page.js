import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Prepare Your Child Custody
              <span className="block text-blue-600">Court Documents</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Free tool to help UK parents organize and summarize information about their family
              situation for child custody court applications. Not a substitute for legal advice.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 items-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">Create Free Account</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">Login</Button>
              </Link>
            </div>
            <div className="mt-4 text-center">
              <Link href="/application/guest">
                <Button variant="link" className="text-blue-600 hover:text-blue-700">
                  Try without registration →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">
              Three simple steps to organize your information
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <CardTitle>Answer Questions</CardTitle>
                <CardDescription>
                  Complete a guided questionnaire about your family situation, children, and
                  proposed custody arrangements. Save progress and return anytime.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <CardTitle>Review and Edit</CardTitle>
                <CardDescription>
                  Preview all your answers in a clear format. Make changes to any section
                  before generating the final document.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Step 3 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <CardTitle>Download Your Document</CardTitle>
                <CardDescription>
                  Generate a Word document with all your information clearly organized.
                  Download it for your own records or to share with your solicitor.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Use Family Court Helper?</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Privacy Focused</CardTitle>
                <CardDescription>
                  Your data is automatically deleted after 30 days. We prioritize your privacy
                  and security.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Save Progress</CardTitle>
                <CardDescription>
                  Not ready to finish? Save your progress and come back later to complete
                  your application.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Well-Organized</CardTitle>
                <CardDescription>
                  Information is structured clearly to help you and your legal representative
                  understand your situation.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Completely Free</CardTitle>
                <CardDescription>
                  No hidden fees, no subscriptions. This service is completely free to use
                  for all parents.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-amber-50 border-t border-b border-amber-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              {/* Warning icon */}
              <div className="flex-shrink-0 mt-1">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Legal Disclaimer</h3>
                <p className="text-gray-700 leading-relaxed">
                  <strong>This tool does NOT replace professional legal advice.</strong> It is designed to help you
                  organize information about your family situation. The generated document is a summary for your
                  reference only and to help you communicate your circumstances to legal professionals.
                  <span className="block mt-2">
                    For specific legal guidance regarding your custody case, please consult a qualified
                    solicitor or legal advisor. This service does not constitute legal representation.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Create your free account and begin organizing your information today.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
