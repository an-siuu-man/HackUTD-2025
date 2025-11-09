"use client"

import { AlertCircle, Info, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"

interface AlertBoxProps {
  type: "critical" | "warning" | "info"
  title: string
  description: string
}

export function AlertBox({ type, title, description }: AlertBoxProps) {
  const styles = {
    critical: {
      container: "bg-red-50 border-red-200",
      icon: "text-red-600",
      title: "text-red-900",
      description: "text-red-800",
      IconComponent: AlertCircle,
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200",
      icon: "text-yellow-600",
      title: "text-yellow-900",
      description: "text-yellow-800",
      IconComponent: AlertTriangle,
    },
    info: {
      container: "bg-blue-50 border-blue-200",
      icon: "text-blue-600",
      title: "text-blue-900",
      description: "text-blue-800",
      IconComponent: Info,
    },
  }

  const style = styles[type]
  const Icon = style.IconComponent

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-lg border ${style.container}`}
    >
      <div className="flex gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.icon}`} />
        <div className="flex-1">
          <h4 className={`font-semibold font-subheading mb-1 ${style.title}`}>{title}</h4>
          <p className={`text-sm leading-relaxed ${style.description}`}>{description}</p>
        </div>
      </div>
    </motion.div>
  )
}
