import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Users, TrendingUp, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-6">
            <MapPin className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 font-[family-name:var(--font-space-grotesk)] text-balance">
            Make Your Community Better
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Report issues, track progress, and work together to improve your neighborhood. Join thousands of citizens
            making a real difference.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register">
              <Button size="lg" className="text-lg">
                Get Started
              </Button>
            </Link>
            <Link href="/issues">
              <Button size="lg" variant="outline" className="text-lg bg-transparent">
                View Issues
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 font-[family-name:var(--font-space-grotesk)]">
            How citiFix Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-[family-name:var(--font-space-grotesk)]">Report Issues</h3>
              <p className="text-muted-foreground">
                Spot a pothole, graffiti, or broken streetlight? Report it with photos and location in seconds.
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-[family-name:var(--font-space-grotesk)]">
                Community Verification
              </h3>
              <p className="text-muted-foreground">
                Vote on issues to verify their importance. The community decides what matters most.
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-[family-name:var(--font-space-grotesk)]">
                Track Progress
              </h3>
              <p className="text-muted-foreground">
                Follow issues from report to resolution. Get notified when your reports are addressed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <Shield className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4 font-[family-name:var(--font-space-grotesk)]">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join your neighbors in creating a better community. Every report counts.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
