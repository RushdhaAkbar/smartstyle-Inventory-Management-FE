import type React from "react"
import { Card, CardContent } from "./ui/card"
import { Clock, CheckCircle } from "lucide-react"

interface SystemStatusProps {
  lastUpdated: string
}

const SystemStatus: React.FC<SystemStatusProps> = ({ lastUpdated }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="bg-green-50 border-green-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-900">System Status</h3>
              <p className="text-sm text-green-700">All systems operational</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-green-700">
            <Clock className="h-4 w-4" />
            <span>Last updated: {formatDate(lastUpdated)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SystemStatus
