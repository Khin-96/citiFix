"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { api, type DashboardStats } from "@/lib/api"
import Navbar from "@/components/navbar-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  MessageCircle,
  ThumbsUp,
  Download,
  BarChart3,
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Pie,
  PieChart,
  Cell,
} from "recharts"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [trends, setTrends] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [period, setPeriod] = useState("7days")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "officer" && user.role !== "admin"))) {
      router.push("/issues")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && (user.role === "officer" || user.role === "admin")) {
      fetchDashboardData()
    }
  }, [user, period])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      const [statsData, trendsData, categoriesData] = await Promise.all([
        api.getDashboardStats(),
        api.getDashboardTrends(period),
        api.getDashboardCategories(),
      ])
      setStats(statsData.data)
      setTrends(trendsData.data)
      setCategories(categoriesData.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleExport(format: string) {
    try {
      const data = await api.exportData(format)
      toast({
        title: "Export Started",
        description: `Exporting data as ${format.toUpperCase()}...`,
      })
      // In a real app, this would trigger a download
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      })
    }
  }

  if (authLoading || !user || (user.role !== "officer" && user.role !== "admin")) {
    return null
  }

  const COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)]">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor and manage community issues</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => handleExport("json")}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_issues || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">All reported issues</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.pending_issues || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting verification</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <AlertCircle className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.in_progress_issues || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Being worked on</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.resolved_issues || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Successfully fixed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Verified</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.verified_issues || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Community verified</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                  <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_votes || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Community engagement</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_comments || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Community discussions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.active_users || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Contributing citizens</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-[family-name:var(--font-space-grotesk)]">Issue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  {trends.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#059669" name="Issues Reported" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No trend data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Categories Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-[family-name:var(--font-space-grotesk)]">Issues by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {categories.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categories}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {categories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No category data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-[family-name:var(--font-space-grotesk)]">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2 bg-transparent"
                    onClick={() => router.push("/issues?status=pending")}
                  >
                    <Clock className="h-6 w-6" />
                    <span>Review Pending</span>
                    <span className="text-xs text-muted-foreground">{stats?.pending_issues || 0} issues</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2 bg-transparent"
                    onClick={() => router.push("/issues?status=in_progress")}
                  >
                    <TrendingUp className="h-6 w-6" />
                    <span>Track Progress</span>
                    <span className="text-xs text-muted-foreground">{stats?.in_progress_issues || 0} issues</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2 bg-transparent"
                    onClick={() => handleExport("csv")}
                  >
                    <Download className="h-6 w-6" />
                    <span>Export Report</span>
                    <span className="text-xs text-muted-foreground">CSV format</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
