"use client"

import { motion } from "framer-motion"

interface CircularScoreProps {
  score: number
  size?: number
}

export function CircularScore({ score, size = 120 }: CircularScoreProps) {
  const strokeWidth = size > 100 ? 12 : 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#22c55e" // Green
    if (score >= 60) return "#84cc16" // Lime
    if (score >= 40) return "#f59e0b" // Yellow
    return "#ef4444" // Red
  }

  const color = getScoreColor(score)

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.2
      }}
      className="relative inline-flex items-center justify-center"
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e5e7eb" strokeWidth={strokeWidth} fill="none" />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.5s ease",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-bold"
          style={{
            fontSize: size > 100 ? "2.5rem" : "1.25rem",
            color: color,
          }}
        >
          {score}
        </span>
      </div>
    </motion.div>
  )
}
