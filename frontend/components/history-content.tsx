"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircularScore } from "@/components/circular-score"
import { ChevronRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { getUserSavedWebsites, WebsiteWithDetails } from "@/lib/website-service"

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
  const [websites, setWebsites] = useState<WebsiteWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    async function loadWebsites() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await getUserSavedWebsites(user.id)
        setWebsites(data)
        setError(null)
      } catch (err) {
        console.error('Error loading websites:', err)
        setError('Failed to load websites')
      } finally {
        setLoading(false)
      }
    }

    loadWebsites()
  }, [user])

  const filteredWebsites = websites.filter((website) => 
    website.website_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    website.domain.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <h1 className="text-3xl font-bold font-heading text-gray-900 mb-2">History</h1>
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
          <CardTitle className="font-subheading">Your Agreements ({filteredWebsites.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading your websites...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : filteredWebsites.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No websites found matching your search.' : 'No saved websites yet.'}
            </div>
          ) : (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {filteredWebsites.map((website) => (
              <motion.div key={website.snapshot_id} variants={itemVariants}>
                <Link
                  href={`/history/${website.snapshot_id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <CircularScore score={website.score} size={50} />
                  
                  {/* Website Favicon */}
                  <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${website.domain}&sz=64`}
                      alt={website.domain}
                      className="w-6 h-6"
                      onError={(e) => {
                        // Fallback to first letter if favicon fails
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                    <div className="hidden text-gray-500 font-semibold text-sm">
                      {website.domain.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold font-subheading text-gray-900 group-hover:text-green-700 transition-colors truncate">
                      {website.website_url}
                    </h3>
                    <p className="text-sm text-gray-500">Saved: {website.date}</p>
                  </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-700 transition-colors shrink-0" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
          )}
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  )
}