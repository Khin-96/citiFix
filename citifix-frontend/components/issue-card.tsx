// components/issue-card.tsx
import { Issue } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface IssueCardProps {
  issue: Issue
}

export function IssueCard({ issue }: IssueCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{issue.title}</CardTitle>
        <CardDescription>{issue.category}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{issue.description}</p>
      </CardContent>
    </Card>
  )
}
