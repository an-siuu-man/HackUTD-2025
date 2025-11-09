"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircularScore } from "@/components/circular-score"
import { AlertBox } from "@/components/alert-box"
import { ChatWindow } from "@/components/chat-window"
import { ArrowLeft, Calendar, ExternalLink, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getWebsiteBySnapshotId, WebsiteWithDetails } from "@/lib/website-service"

export function WebsiteDetailContent({ websiteId }: { websiteId: string }) {
  const [data, setData] = useState<WebsiteWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadWebsite() {
      try {
        setLoading(true)
        console.log('Loading website with ID:', websiteId)
        const snapshotId = parseInt(websiteId, 10)
        
        if (isNaN(snapshotId)) {
          console.error('Invalid snapshot ID:', websiteId)
          setError('Invalid website ID')
          setLoading(false)
          return
        }

        console.log('Fetching snapshot ID:', snapshotId)
        const websiteData = await getWebsiteBySnapshotId(snapshotId)
        
        if (!websiteData) {
          console.error('No website data found for snapshot ID:', snapshotId)
          setError('Website not found')
          setLoading(false)
          return
        }

        console.log('Website data loaded:', websiteData)
        setData(websiteData)
        setError(null)
      } catch (err) {
        console.error('Error loading website:', err)
        setError('Failed to load website data')
      } finally {
        setLoading(false)
      }
    }

    loadWebsite()
  }, [websiteId])

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-20">
          <p className="text-gray-500">Loading website details...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <Link
          href="/history"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to History</span>
        </Link>
        <div className="text-center py-20">
          <p className="text-red-500">{error || 'Website not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Back Button */}
      <Link
        href="/history"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to History</span>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold font-heading text-gray-900">{data.website_name}</h1>
          <Button variant="outline" asChild>
            <a href={data.website_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Website
            </a>
          </Button>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">Saved: {data.date}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Score and Alerts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Safety Score */}
          <Card>
            <CardHeader>
              <CardTitle className="font-subheading">Safety Score</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <CircularScore score={data.score} size={180} />
            </CardContent>
          </Card>

          {/* AI Summary */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="font-subheading flex items-center gap-2 text-blue-900">
                <Sparkles className="w-5 h-5 text-blue-600" />
                AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800 leading-relaxed">{data.summary}</p>
            </CardContent>
          </Card>

          {/* Flagged Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="font-subheading">Privacy & Terms Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.alerts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No issues found</p>
              ) : (
                data.alerts
                  .sort((a: any, b: any) => {
                    // Sort by severity: critical > warning > info > good
                    const order = { critical: 0, warning: 1, info: 2, good: 3 }
                    return order[a.type as keyof typeof order] - order[b.type as keyof typeof order]
                  })
                  .map((alert: any, index: number) => (
                    <AlertBox key={index} type={alert.type} title={alert.title} description={alert.description} />
                  ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Chat Window */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="font-subheading">Ask Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <ChatWindow websiteName={data.website_name} snapshotId={data.snapshot_id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
