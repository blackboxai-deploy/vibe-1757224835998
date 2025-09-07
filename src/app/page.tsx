import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/layout/Navbar"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Professional House
            <span className="text-primary block">Inspection Management</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Streamline your property inspection process. Create houses, manage inspections, 
            upload photos, and track maintenance records all in one professional platform.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/auth/signup">
                Get Started
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/auth/signin">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for property inspections
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Professional tools to manage your inspection workflow efficiently
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="relative">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <div className="w-6 h-6 rounded bg-primary"></div>
                </div>
                <CardTitle>House Management</CardTitle>
                <CardDescription>
                  Organize and manage multiple properties with detailed information and easy navigation.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="relative">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <div className="w-6 h-6 rounded bg-primary"></div>
                </div>
                <CardTitle>Inspection Records</CardTitle>
                <CardDescription>
                  Create detailed inspection reports with notes, dates, and comprehensive documentation.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="relative">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <div className="w-6 h-6 rounded bg-primary"></div>
                </div>
                <CardTitle>Photo Management</CardTitle>
                <CardDescription>
                  Upload, organize, and manage inspection photos with secure cloud storage.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="relative">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <div className="w-6 h-6 rounded bg-primary"></div>
                </div>
                <CardTitle>Secure Access</CardTitle>
                <CardDescription>
                  Your data is protected with user authentication and secure database access.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5 */}
            <Card className="relative">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <div className="w-6 h-6 rounded bg-primary"></div>
                </div>
                <CardTitle>Dashboard Overview</CardTitle>
                <CardDescription>
                  Get insights into your inspection activities with a comprehensive dashboard.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6 */}
            <Card className="relative">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <div className="w-6 h-6 rounded bg-primary"></div>
                </div>
                <CardTitle>Mobile Friendly</CardTitle>
                <CardDescription>
                  Access your inspection data on any device with our responsive design.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Ready to streamline your inspections?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join professionals who trust our platform for their property management needs.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/auth/signup">
                  Start Free Trial
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}