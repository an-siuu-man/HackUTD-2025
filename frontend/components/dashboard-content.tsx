"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import { CircularScore } from "@/components/circular-score"
import { motion } from "framer-motion"

// Mock data
const stats = {
  totalAgreements: 24,
  averageScore: 78,
  criticalIssues: 3,
  recentSignups: 5,
}

const recentWebsites = [
  { id: 1, name: "Amazon", score: 85, date: "2025-01-15", status: "good" },
  { id: 2, name: "Facebook", score: 62, date: "2025-01-14", status: "fair" },
  { id: 3, name: "Netflix", score: 91, date: "2025-01-13", status: "excellent" },
  { id: 4, name: "Discord", score: 45, date: "2025-01-12", status: "poor" },
  { id: 5, name: "Spotify", score: 88, date: "2025-01-11", status: "good" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0
  }
}

export function DashboardContent() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-8"
    >
      <motion.div variants={itemVariants} transition={{ duration: 0.4 }} className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your terms and conditions analysis</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} transition={{ duration: 0.4 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-subheading text-gray-600">Total Agreements</CardTitle>
            <Shield className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalAgreements}</div>
            <p className="text-xs text-gray-500 mt-1">Websites analyzed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-subheading text-gray-600">Average Safety Score</CardTitle>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.averageScore}</div>
            <p className="text-xs text-gray-500 mt-1">Out of 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-subheading text-gray-600">Critical Issues</CardTitle>
            <AlertTriangle className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{stats.criticalIssues}</div>
            <p className="text-xs text-gray-500 mt-1">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-subheading text-gray-600">Recent Signups</CardTitle>
            <CheckCircle className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.recentSignups}</div>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Overall Safety Score */}
      <motion.div variants={itemVariants} transition={{ duration: 0.4 }}>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-subheading">Overall Safety Score</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <CircularScore score={stats.averageScore} size={200} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Signups */}
      <motion.div variants={itemVariants} transition={{ duration: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle className="font-subheading">Recent Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
            {recentWebsites.map((website) => (
              <div
                key={website.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <CircularScore score={website.score} size={50} />
                  <div>
                    <h3 className="font-semibold font-subheading text-gray-900">{website.name}</h3>
                    <p className="text-sm text-gray-500">{website.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      website.status === "excellent"
                        ? "bg-green-100 text-green-700"
                        : website.status === "good"
                          ? "bg-lime-100 text-lime-700"
                          : website.status === "fair"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                    }`}
                  >
                    {website.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  )
}
