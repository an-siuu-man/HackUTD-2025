"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircularScore } from "@/components/circular-score"
import { ChevronRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

// Mock data
const websites = [
  { id: "1", name: "Amazon", score: 85, date: "2025-01-15" },
  { id: "2", name: "Facebook", score: 62, date: "2025-01-14" },
  { id: "3", name: "Netflix", score: 91, date: "2025-01-13" },
  { id: "4", name: "Discord", score: 45, date: "2025-01-12" },
  { id: "5", name: "Spotify", score: 88, date: "2025-01-11" },
  { id: "6", name: "Twitter", score: 58, date: "2025-01-10" },
  { id: "7", name: "LinkedIn", score: 79, date: "2025-01-09" },
  { id: "8", name: "Instagram", score: 64, date: "2025-01-08" },
  { id: "9", name: "TikTok", score: 52, date: "2025-01-07" },
  { id: "10", name: "YouTube", score: 82, date: "2025-01-06" },
]

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 }
  }
}

export function HistoryContent() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredWebsites = websites.filter((website) => website.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">History</h1>
        <p className="text-gray-600">View all your analyzed terms and conditions</p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-6"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search websites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Website List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card>
        <CardHeader>
          <CardTitle>Your Agreements ({filteredWebsites.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {filteredWebsites.map((website) => (
              <motion.div key={website.id} variants={itemVariants}>
                <Link
                  href={`/history/${website.id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                <div className="flex items-center gap-4 flex-1">
                  <CircularScore score={website.score} size={50} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                      {website.name}
                    </h3>
                    <p className="text-sm text-gray-500">Signed up: {website.date}</p>
                  </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-700 transition-colors" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  )
}