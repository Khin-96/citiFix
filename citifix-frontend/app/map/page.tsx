"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { api, type Issue } from "@/lib/api"
import Navbar from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Navigation } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function MapPage() {
  const { user, loading: authLoading } = useAuth()
  const [issues, setIssues] = useState<Issue[]>([])
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchIssues()
    }
  }, [user])

  async function fetchIssues() {
    try {
      setLoading(true)
      const data = await api.getIssues()
      setIssues(data.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load issues",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)]">Issue Map</h1>
          <p className="text-muted-foreground mt-1">View all reported issues on the map</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Placeholder */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardContent className="p-0 h-full relative">
                <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                  <div className="text-center space-y-4">
                    <MapPin className="h-16 w-16 mx-auto text-primary" />
                    <div>
                      <p className="font-semibold text-lg">Interactive Map</p>
                      <p className="text-sm text-muted-foreground">
                        Map integration would display all issues with markers
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">Click on markers to view issue details</p>
                    </div>
                  </div>
                </div>
                {/* In a real implementation, you would integrate Google Maps, Mapbox, or Leaflet here */}
              </CardContent>
            </Card>
          </div>

          {/* Issues List */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold font-[family-name:var(--font-space-grotesk)]">Nearby Issues</h2>
                  <Button variant="ghost" size="sm">
                    <Navigation className="h-4 w-4 mr-2" />
                    My Location
                  </Button>
                </div>
                <div className="space-y-3 max-h-[520px] overflow-y-auto">
                  {loading ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
                  ) : issues.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No issues found</p>
                  ) : (
                    issues.slice(0, 10).map((issue) => (
                      <Card
                        key={issue.id}
                        className={`cursor-pointer transition-colors ${
                          selectedIssue?.id === issue.id ? "border-primary" : ""
                        }`}
                        onClick={() => setSelectedIssue(issue)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm line-clamp-1">{issue.title}</h3>
                              <p className="text-xs text-muted-foreground line-clamp-1">{issue.address}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {issue.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {issue.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Link href={`/issues/${issue.id}`}>
                            <Button variant="ghost" size="sm" className="w-full mt-2">
                              View Details
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
