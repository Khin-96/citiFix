"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { api, type Notification } from "@/lib/api"
import NavbarWrapper from "@/components/navbar-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Bell, CheckCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) router.push("/login")
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) fetchNotifications()
  }, [user])

  async function fetchNotifications() {
    try {
      setLoading(true)
      const data = await api.getNotifications()
      setNotifications(data.data)
    } catch (error) {
      toast({ title: "Error", description: "Failed to load notifications", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(id: string) {
    try {
      await api.markNotificationRead(id)
      fetchNotifications()
    } catch (error) {
      toast({ title: "Error", description: "Failed to mark as read", variant: "destructive" })
    }
  }

  async function markAllAsRead() {
    try {
      await api.markAllNotificationsRead()
      fetchNotifications()
      toast({ title: "Success", description: "All notifications marked as read" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to mark all as read", variant: "destructive" })
    }
  }

  if (authLoading || !user) return null

  const unreadCount = notifications.filter((n) => !n.read_at).length

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarWrapper />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-[family-name:var(--font-space-grotesk)]">
              Notifications
            </h1>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white transition"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <Card className="bg-white/20 backdrop-blur-md">
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No notifications yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-colors ${
                  !notification.read_at
                    ? "bg-black/10 border-black/30 backdrop-blur-md"
                    : "bg-white"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2 rounded-full flex-shrink-0 ${
                        !notification.read_at ? "bg-black/20" : "bg-gray-200"
                      }`}
                    >
                      <Bell
                        className={`h-5 w-5 ${
                          !notification.read_at ? "text-black" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900">{notification.data.message}</p>
                      {notification.data.issue_id && (
                        <Link
                          href={`/issues/${notification.data.issue_id}`}
                          className="text-black hover:underline mt-1 inline-block"
                        >
                          View Issue: {notification.data.issue_title}
                        </Link>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read_at && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-black hover:bg-black hover:text-white"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
