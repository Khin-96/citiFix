"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { api, type Issue } from "@/lib/api"
import { IssueCard } from "@/components/issue-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Search, Filter, PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function IssuesPage() {
  const { user, loading: authLoading } = useAuth()
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [status, setStatus] = useState("all")
  const [priority, setPriority] = useState("all")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) router.push("/login")
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) fetchIssues()
  }, [user, category, status, priority])

  async function fetchIssues() {
    try {
      setLoading(true)
      const params: Record<string, string> = {}
      if (category !== "all") params.category = category
      if (status !== "all") params.status = status
      if (priority !== "all") params.priority = priority

      const data = await api.getIssues(params)
      setIssues(data.data)
    } catch (error) {
      toast({ title: "Error", description: "Failed to load issues", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function handleVote(id: number) {
    try {
      const issue = issues.find((i) => i.id === id)
      if (issue?.user_voted) await api.unvoteIssue(id)
      else await api.voteIssue(id)
      fetchIssues()
    } catch (error) {
      toast({ title: "Error", description: "Failed to vote", variant: "destructive" })
    }
  }

  const filteredIssues = issues.filter(
    (issue) =>
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.description.toLowerCase().includes(search.toLowerCase())
  )

  if (authLoading || !user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with title, description, and Raise Issue button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-[family-name:var(--font-space-grotesk)]">
              Community Issues
            </h1>
            <p className="text-gray-600 mt-2 max-w-xl">
              Browse, support, or raise community issues in your neighborhood. Your feedback helps make your city better!
            </p>
          </div>
          <Link
            href="/issues/new"
            className="flex items-center gap-2 bg-black text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-gray-800 transition"
          >
            <PlusCircle className="w-5 h-5" />
            Raise an Issue
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-6 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-black" />
            <Input
              placeholder="Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-white text-black placeholder-black"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-black" />
              <span className="text-black text-sm font-medium">Filters:</span>
            </div>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px] bg-white text-black">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="pothole">Pothole</SelectItem>
                <SelectItem value="streetlight">Streetlight</SelectItem>
                <SelectItem value="graffiti">Graffiti</SelectItem>
                <SelectItem value="trash">Trash</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px] bg-white text-black">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-[180px] bg-white text-black">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black">
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Issues Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading issues...</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No issues found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onVote={handleVote} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
