"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { User, Mail, Shield } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"

interface ProfileStats {
  totalAgreements: number
  averageScore: number
  criticalIssues: number
}

export function ProfileContent() {
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState<ProfileStats>({
    totalAgreements: 0,
    averageScore: 0,
    criticalIssues: 0
  })

  useEffect(() => {
    if (user) {
      setEmail(user.email || "")
      // Get user metadata for name
      const metadata = user.user_metadata
      setName(metadata?.name || metadata?.full_name || "")
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Get total agreements
      const { count: totalCount } = await supabase
        .from('user_saved_websites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true)

      // Get all analyses for calculating average score and critical issues
      const { data: websites } = await supabase
        .from('user_saved_websites')
        .select(`
          snapshot_id,
          terms_snapshots!inner (
            snapshot_id,
            analyses!inner (
              overall_score,
              analysis_items (
                flag
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)

      let totalScore = 0
      let scoreCount = 0
      let criticalCount = 0

      if (websites && websites.length > 0) {
        websites.forEach((item: any) => {
          const snapshot = item.terms_snapshots
          if (snapshot && snapshot.analyses) {
            const analysis = Array.isArray(snapshot.analyses) ? snapshot.analyses[0] : snapshot.analyses
            
            if (analysis) {
              totalScore += analysis.overall_score
              scoreCount++

              // Count critical issues
              const items = analysis.analysis_items || []
              const criticalItems = items.filter((item: any) => item.flag === 'critical')
              criticalCount += criticalItems.length
            }
          }
        })
      }

      setStats({
        totalAgreements: totalCount || 0,
        averageScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
        criticalIssues: criticalCount
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setSaving(true)

      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: { name }
      })

      if (error) throw error

      setIsEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="p-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold font-heading text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </motion.div>

      {!user ? (
        <div className="text-center py-20">
          <p className="text-gray-500">Please log in to view your profile</p>
        </div>
      ) : (
        <div className="max-w-2xl">
          {/* Profile Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-subheading">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="w-10 h-10 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold font-subheading text-gray-900">
                    {name || 'Anonymous User'}
                  </h3>
                  <p className="text-sm text-gray-500">{email}</p>
                </div>
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!isEditing}
                      className="pl-10"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="pl-10 bg-gray-50"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                ) : (
                  <>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false)
                        // Reset name to original
                        const metadata = user.user_metadata
                        setName(metadata?.name || metadata?.full_name || "")
                      }}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="font-subheading">Account Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading statistics...</div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium font-subheading text-gray-900">Total Agreements</p>
                        <p className="text-sm text-gray-500">Websites analyzed</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stats.totalAgreements}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium font-subheading text-gray-900">Average Safety Score</p>
                        <p className="text-sm text-gray-500">Across all sites</p>
                      </div>
                    </div>
                    <span className={`text-2xl font-bold ${
                      stats.averageScore >= 80 ? 'text-green-600' : 
                      stats.averageScore >= 60 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {stats.averageScore || '--'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-medium font-subheading text-gray-900">Critical Issues Found</p>
                        <p className="text-sm text-gray-500">Require attention</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-red-600">{stats.criticalIssues}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  )
}
