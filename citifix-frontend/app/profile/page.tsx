"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { api, type Issue } from "@/lib/api"
import Navbar from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { User, Award, MapPin, TrendingUp, ThumbsUp, MessageCircle } from "lucide-react"
import { IssueCard } from "@/components/issue-card"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [myIssues, setMyIssues] = useState<Issue[]>([])
  const [votedIssues, setVotedIssues] = useState<Issue[]>([])
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
      fetchUserIssues()
    }
  }, [user])

  async function fetchUserIssues() {
    try {
      setLoading(true)
      const [myIssuesData, votedIssuesData] = await Promise.all([
        api.getIssues({ user_id: user?.id.toString() || "" }),
        api.getIssues({ voted: "true" }),
      ])
      setMyIssues(myIssuesData.data)
      setVotedIssues(votedIssuesData.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleVote(id: number) {
    try {
      const issue = votedIssues.find((i) => i.id === id)
      if (issue?.user_voted) {
        await api.unvoteIssue(id)
      } else {
        await api.voteIssue(id)
      }
      fetchUserIssues()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to vote",
        variant: "destructive",
      })
    }
  }

  if (authLoading || !user) {
    return null
  }

  const totalVotes = myIssues.reduce((sum, issue) => sum + issue.votes_count, 0)
  const totalComments = myIssues.reduce((sum, issue) => sum + issue.comments_count, 0)
  const resolvedIssues = myIssues.filter((issue) => issue.status === "resolved").length

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-12 w-12 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)]">{user.name}</h1>
                <p className="text-muted-foreground mt-1">{user.email}</p>
                <div className="flex items-center gap-4 mt-4">
                  <Badge className="bg-primary/10 text-primary capitalize">{user.role}</Badge>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{user.points || 0} Points</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Issues Reported</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myIssues.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resolvedIssues}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVotes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalComments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Issues Tabs */}
        <Tabs defaultValue="my-issues" className="space-y-6">
          <TabsList>
            <TabsTrigger value="my-issues">My Issues ({myIssues.length})</TabsTrigger>
            <TabsTrigger value="voted">Voted Issues ({votedIssues.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="my-issues">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : myIssues.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">You haven't reported any issues yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myIssues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} onVote={handleVote} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="voted">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : votedIssues.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ThumbsUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">You haven't voted on any issues yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {votedIssues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} onVote={handleVote} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
