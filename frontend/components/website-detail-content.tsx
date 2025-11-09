"use client"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircularScore } from "@/components/circular-score"
import { AlertBox } from "@/components/alert-box"
import { ChatWindow } from "@/components/chat-window"
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock data
const websiteData: Record<string, any> = {
  "1": {
    name: "Amazon",
    score: 85,
    date: "2025-01-15",
    url: "https://amazon.com",
    summary:
      "Amazon's terms and conditions are generally user-friendly with clear language about purchases, returns, and account management. The company provides reasonable data protection measures and transparent policies regarding third-party sellers.",
    alerts: [
      {
        type: "info",
        title: "Data Collection",
        description:
          "Amazon collects extensive browsing and purchase history data to improve recommendations and services. This data is shared with subsidiaries and may be used for advertising purposes.",
      },
      {
        type: "warning",
        title: "Automatic Renewals",
        description:
          "Prime memberships and subscriptions automatically renew unless cancelled. Amazon charges your payment method on file without additional notice before each renewal period.",
      },
    ],
  },
  "2": {
    name: "Facebook",
    score: 62,
    date: "2025-01-14",
    url: "https://facebook.com",
    summary:
      "Facebook's terms include broad data collection and usage rights. The platform reserves extensive rights to your content and can modify the service at any time.",
    alerts: [
      {
        type: "critical",
        title: "Content Rights",
        description:
          "By posting content, you grant Facebook a non-exclusive, transferable, sub-licensable, royalty-free, worldwide license to use any content you post. This includes the right to modify and distribute your content.",
      },
      {
        type: "critical",
        title: "Data Sharing",
        description:
          "Facebook shares your data with third-party advertisers and affiliated companies. Your activity is tracked across websites and apps to build advertising profiles.",
      },
      {
        type: "warning",
        title: "Account Termination",
        description:
          "Facebook can terminate your account at any time without prior notice if they determine you have violated their terms, with limited appeal options.",
      },
    ],
  },
  "3": {
    name: "Netflix",
    score: 91,
    date: "2025-01-13",
    url: "https://netflix.com",
    summary:
      "Netflix maintains clear, concise terms with strong consumer protections. The service offers transparent pricing and straightforward cancellation policies.",
    alerts: [
      {
        type: "info",
        title: "Viewing History",
        description:
          "Netflix collects and stores your viewing history to provide personalized recommendations. This data may be used for content development decisions.",
      },
    ],
  },
  "4": {
    name: "Discord",
    score: 45,
    date: "2025-01-12",
    url: "https://discord.com",
    summary:
      "Discord's terms contain several concerning clauses regarding user content and liability limitations. The platform has broad content moderation powers.",
    alerts: [
      {
        type: "critical",
        title: "Forced Arbitration",
        description:
          "Users waive the right to participate in class action lawsuits. All disputes must be resolved through individual arbitration, limiting your legal options.",
      },
      {
        type: "critical",
        title: "Content Monitoring",
        description:
          "Discord reserves the right to monitor, scan, and review all content shared on the platform, including private messages, without prior notice.",
      },
      {
        type: "warning",
        title: "Age Restrictions",
        description:
          "Users must be 13 or older to use Discord. The platform may request age verification at any time and terminate accounts of underage users.",
      },
      {
        type: "info",
        title: "Server Liability",
        description:
          "Discord is not responsible for content in servers. Server owners and moderators have significant control over your experience and data within their servers.",
      },
    ],
  },
}

export function WebsiteDetailContent({ websiteId }: { websiteId: string }) {
  const data = websiteData[websiteId] || websiteData["1"]

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
          <h1 className="text-3xl font-bold font-heading text-gray-900">{data.name}</h1>
          <Button variant="outline" asChild>
            <a href={data.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Website
            </a>
          </Button>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">Signed up: {data.date}</span>
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
          <Card>
            <CardHeader>
              <CardTitle className="font-subheading">AI Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{data.summary}</p>
            </CardContent>
          </Card>

          {/* Flagged Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="font-subheading">Flagged Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.alerts.map((alert: any, index: number) => (
                <AlertBox key={index} type={alert.type} title={alert.title} description={alert.description} />
              ))}
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
              <ChatWindow websiteName={data.name} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
