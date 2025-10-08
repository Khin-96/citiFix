"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { api, type Issue, type Comment } from "@/lib/api"
import Navbar from "@/components/navbar-wrapper"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ThumbsUp, MessageCircle, MapPin, Calendar, User, Camera, X, Edit, Trash2, CheckCircle2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function IssueDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [issue, setIssue] = useState<Issue | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState("")
  const [commentFiles, setCommentFiles] = useState<File[]>([])
  const [commentPreviews, setCommentPreviews] = useState<string[]>([])
  const [submittingComment, setSubmittingComment] = useState(false)
  const [editingStatus, setEditingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && params.id) {
      fetchIssue()
      fetchComments()
    }
  }, [user, params.id])

  async function fetchIssue() {
    try {
      const data = await api.getIssue(Number(params.id))
      setIssue(data.data)
      setNewStatus(data.data.status)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load issue",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function fetchComments() {
    try {
      const data = await api.getComments(Number(params.id))
      setComments(data.data)
    } catch (error) {
      console.error("Failed to load comments:", error)
    }
  }

  async function handleVote() {
    if (!issue) return
    try {
      if (issue.user_voted) {
        await api.unvoteIssue(issue.id)
      } else {
        await api.voteIssue(issue.id)
      }
      fetchIssue()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to vote",
        variant: "destructive",
      })
    }
  }

  const handleCommentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const newFiles = [...commentFiles, ...selectedFiles].slice(0, 3)
    setCommentFiles(newFiles)
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
    setCommentPreviews(newPreviews)
  }

  const removeCommentFile = (index: number) => {
    setCommentFiles(commentFiles.filter((_, i) => i !== index))
    setCommentPreviews(commentPreviews.filter((_, i) => i !== index))
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim()) return

    setSubmittingComment(true)
    try {
      const formData = new FormData()
      formData.append("content", commentText)
      commentFiles.forEach((file, index) => {
        formData.append(`media[${index}]`, file)
      })

      await api.createComment(Number(params.id), formData)
      setCommentText("")
      setCommentFiles([])
      setCommentPreviews([])
      fetchComments()
      fetchIssue() // Refresh to update comment count
      toast({
        title: "Comment posted",
        description: "Your comment has been added",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      })
    } finally {
      setSubmittingComment(false)
    }
  }

  async function handleDeleteComment(commentId: number) {
    try {
      await api.deleteComment(Number(params.id), commentId)
      fetchComments()
      fetchIssue()
      toast({
        title: "Comment deleted",
        description: "Your comment has been removed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      })
    }
  }

  async function handleUpdateStatus() {
    if (!issue) return
    try {
      await api.updateIssue(issue.id, { status: newStatus } as Partial<Issue>)
      setEditingStatus(false)
      fetchIssue()
      toast({
        title: "Status updated",
        description: "Issue status has been changed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    }
  }

  async function handleDeleteIssue() {
    if (!issue) return
    try {
      await api.deleteIssue(issue.id)
      toast({
        title: "Issue deleted",
        description: "The issue has been removed",
      })
      router.push("/issues")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete issue",
        variant: "destructive",
      })
    }
  }

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Issue not found</p>
        </div>
      </div>
    )
  }

  const canEdit = user.role === "officer" || user.role === "admin" || user.id === issue.user.id

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">
                      {issue.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-primary/10 text-primary">{issue.category}</Badge>
                      <Badge
                        className={
                          issue.status === "resolved"
                            ? "bg-green-500/10 text-green-700"
                            : issue.status === "in_progress"
                              ? "bg-purple-500/10 text-purple-700"
                              : "bg-yellow-500/10 text-yellow-700"
                        }
                      >
                        {issue.status}
                      </Badge>
                      <Badge
                        className={
                          issue.priority === "high"
                            ? "bg-red-500/10 text-red-700"
                            : issue.priority === "medium"
                              ? "bg-orange-500/10 text-orange-700"
                              : "bg-gray-500/10 text-gray-700"
                        }
                      >
                        {issue.priority} priority
                      </Badge>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => setEditingStatus(true)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Issue?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the issue and all its comments.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteIssue}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Media Gallery */}
                {issue.media && issue.media.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {issue.media.map((media) => (
                      <div key={media.id} className="relative h-64 rounded-lg overflow-hidden bg-muted">
                        {media.file_type.startsWith("image") ? (
                          <img
                            src={`http://localhost:8000/storage/${media.file_path}`}
                            alt="Issue media"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={`http://localhost:8000/storage/${media.file_path}`}
                            controls
                            className="w-full h-full"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{issue.description}</p>
                </div>

                {/* Location */}
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{issue.address}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {issue.latitude}, {issue.longitude}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Reported by {issue.user.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <Button variant={issue.user_voted ? "default" : "outline"} onClick={handleVote} className="gap-2">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{issue.votes_count} Votes</span>
                  </Button>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span>{issue.comments_count} Comments</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Update Dialog */}
            {editingStatus && (
              <Card>
                <CardHeader>
                  <CardTitle>Update Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateStatus}>Update</Button>
                    <Button variant="outline" onClick={() => setEditingStatus(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}
            <Card id="comments">
              <CardHeader>
                <CardTitle className="font-[family-name:var(--font-space-grotesk)]">
                  Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Comment Form */}
                <form onSubmit={handleSubmitComment} className="space-y-4">
                  <Textarea
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                  />

                  {/* Comment Media Upload */}
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      id="comment-media"
                      accept="image/*"
                      multiple
                      onChange={handleCommentFileChange}
                      className="hidden"
                    />
                    <label htmlFor="comment-media">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span className="cursor-pointer">
                          <Camera className="h-4 w-4 mr-2" />
                          Add Photos
                        </span>
                      </Button>
                    </label>
                    <Button type="submit" disabled={submittingComment || !commentText.trim()}>
                      {submittingComment ? "Posting..." : "Post Comment"}
                    </Button>
                  </div>

                  {/* Comment Preview */}
                  {commentPreviews.length > 0 && (
                    <div className="flex gap-2">
                      {commentPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeCommentFile(index)}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="border-l-2 border-primary/20 pl-4 py-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{comment.user.name}</span>
                              {comment.user.role === "officer" && (
                                <Badge variant="outline" className="text-xs">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Officer
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                            {comment.media && comment.media.length > 0 && (
                              <div className="flex gap-2 mt-2">
                                {comment.media.map((media) => (
                                  <img
                                    key={media.id}
                                    src={`http://localhost:8000/storage/${media.file_path}`}
                                    alt="Comment media"
                                    className="w-32 h-32 object-cover rounded"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          {user.id === comment.user.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your comment.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteComment(comment.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reporter Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reported By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{issue.user.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{issue.user.role}</p>
                    {issue.user.points !== undefined && (
                      <p className="text-xs text-primary font-semibold">{issue.user.points} points</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assignment */}
            {issue.assigned_to && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assigned To</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{issue.assigned_to.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{issue.assigned_to.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Issue Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Votes</span>
                  <span className="font-semibold">{issue.votes_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Comments</span>
                  <span className="font-semibold">{issue.comments_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Updated</span>
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(issue.updated_at), { addSuffix: true })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
