"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { api, type User } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Trophy, Medal, Award, UserIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [leaderboard, setLeaderboard] = useState<User[]>([])
  const [period, setPeriod] = useState("all")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) router.push("/login")
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) fetchLeaderboard()
  }, [user, period])

  async function fetchLeaderboard() {
    try {
      setLoading(true)
      const data = await api.getLeaderboard(period)
      setLeaderboard(data.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load leaderboard",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !user) return null

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />
    return <Award className="h-6 w-6 text-muted-foreground" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-gray-900">Leaderboard</h1>
            <p className="text-gray-600 mt-1">Top contributors in your community</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48 text-gray-900">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Leaderboard List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No leaderboard data available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((member, index) => (
              <Card
                key={member.id}
                className={`transition-all ${
                  member.id === user.id ? "border-primary shadow-lg bg-primary/10" : "bg-white shadow-sm"
                } ${index < 3 ? "bg-gradient-to-r from-yellow-50 to-white" : ""}`}
              >
                <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100">
                      {getRankIcon(index + 1)}
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200">
                      <UserIcon className="h-6 w-6 text-gray-700" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg text-gray-900">{member.name}</h3>
                      {member.id === user.id && (
                        <Badge variant="outline" className="text-xs">
                          You
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">
                        {member.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Issues Reported: <span className="font-medium">{member.issues_reported || 0}</span> | Resolved:{" "}
                      <span className="font-medium">{member.issues_resolved || 0}</span> | Last Active:{" "}
                      <span className="font-medium">{member.last_active || "N/A"}</span>
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-2 justify-end">
                      <Award className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold text-primary">{member.points || 0}</span>
                    </div>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Your Rank */}
        {!loading && leaderboard.length > 0 && (
          <Card className="mt-8 border-primary">
            <CardHeader>
              <CardTitle className="text-lg font-[family-name:var(--font-space-grotesk)]">Your Rank</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Current Position</p>
                <p className="text-3xl font-bold">#{leaderboard.findIndex((m) => m.id === user.id) + 1 || "N/A"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Your Points</p>
                <p className="text-3xl font-bold text-primary">{user.points || 0}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
