"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Users, TrendingUp, Shield, ChevronRight } from "lucide-react"

export default function HomePage() {
  const features = [
    {
      title: "Report Issues",
      description:
        "Spot a pothole, graffiti, or broken streetlight? Report it with photos and location in seconds.",
      icon: MapPin,
    },
    {
      title: "Community Verification",
      description:
        "Vote on issues to verify their importance. The community decides what matters most.",
      icon: Users,
    },
    {
      title: "Track Progress",
      description:
        "Follow issues from report to resolution. Get notified when your reports are addressed.",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-space-grotesk)] overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <div className="absolute inset-0">
          <img
            src="/hero-community.png"
            alt="Community Engagement"
            className="w-full h-full object-cover object-center scale-105 animate-[subtle-zoom_20s_ease-in-out_infinite]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 px-6 max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-block">
            <span className="text-sm tracking-[0.3em] uppercase text-white/60 font-light">
              Community Empowerment
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-light mb-8 tracking-tight leading-[0.9]">
            Make Your
            <br />
            <span className="font-bold italic">Community</span>
            <br />
            Better
          </h1>
          <p className="text-lg md:text-xl mb-12 font-light text-white/80 max-w-2xl mx-auto leading-relaxed">
            Report issues, track progress, and work together to improve your neighborhood. 
            Join thousands of citizens making a real difference.
          </p>
          <div className="flex gap-6 justify-center flex-wrap items-center">
            <Link href="/register">
              <Button
                size="lg"
                className="text-base px-10 py-6 bg-white text-black hover:bg-white/90 rounded-none font-medium tracking-wide transition-all duration-300 hover:scale-105"
              >
                GET STARTED
              </Button>
            </Link>
            <Link href="/issues" className="group flex items-center gap-2 text-white hover:text-white/80 transition-colors duration-300">
              <span className="text-base tracking-wide">View Issues</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full p-1">
            <div className="w-1 h-2 bg-white/60 rounded-full mx-auto animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-black relative">
        {/* Subtle gradient accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
        
        <div className="container mx-auto max-w-6xl relative">
          <div className="mb-20 text-center">
            <span className="text-sm tracking-[0.3em] uppercase text-white/40 font-light mb-4 block">
              The Process
            </span>
            <h2 className="text-4xl md:text-6xl font-light tracking-tight mb-4">
              How <span className="font-bold italic">citiFix</span> Works
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative"
              >
                {/* Number indicator */}
                <div className="absolute -top-4 -left-4 text-8xl font-bold text-white/5 group-hover:text-white/10 transition-colors duration-500">
                  0{index + 1}
                </div>
                
                <div className="relative p-8 border border-white/10 hover:border-white/30 transition-all duration-500 group-hover:translate-y-[-8px]">
                  <div className="mb-6">
                    <feature.icon className="h-10 w-10 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-light mb-4 tracking-wide">{feature.title}</h3>
                  <p className="text-white/60 leading-relaxed font-light">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 px-6 bg-white text-black">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-16 text-center">
            <div className="space-y-2">
              <div className="text-6xl md:text-7xl font-light tracking-tight">10K+</div>
              <div className="text-sm tracking-[0.2em] uppercase text-black/60">Issues Resolved</div>
            </div>
            <div className="space-y-2">
              <div className="text-6xl md:text-7xl font-light tracking-tight">50K+</div>
              <div className="text-sm tracking-[0.2em] uppercase text-black/60">Active Citizens</div>
            </div>
            <div className="space-y-2">
              <div className="text-6xl md:text-7xl font-light tracking-tight">200+</div>
              <div className="text-sm tracking-[0.2em] uppercase text-black/60">Communities</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-black relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent"></div>
        
        <div className="container mx-auto text-center max-w-4xl relative">
          <Shield className="h-16 w-16 mx-auto mb-8 text-white/80" strokeWidth={1} />
          <h2 className="text-5xl md:text-7xl font-light mb-6 tracking-tight leading-tight">
            Ready to Make
            <br />
            <span className="font-bold italic">a Difference?</span>
          </h2>
          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-white/60 font-light leading-relaxed">
            Join your neighbors in creating a better community. Every report counts.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="text-base px-12 py-6 bg-white text-black hover:bg-white/90 rounded-none font-medium tracking-wide transition-all duration-300 hover:scale-105"
            >
              SIGN UP NOW
            </Button>
          </Link>
        </div>
      </section>

      <style jsx>{`
        @keyframes subtle-zoom {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  )
}