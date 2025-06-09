"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SheetOverviewProps {
  sheetNames: string[]
  data: Record<string, any[]>
}

export default function SheetOverview({ sheetNames, data }: SheetOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {sheetNames.map((sheetName) => {
        const sheetData = data[sheetName] || []
        const recordCount = sheetData.length

        // Detectar columnas principales
        const columns = sheetData.length > 0 ? Object.keys(sheetData[0]) : []
        const hasMontoColumn = columns.some(
          (col) =>
            col.toLowerCase().includes("monto") ||
            col.toLowerCase().includes("multa") ||
            col.toLowerCase().includes("valor"),
        )

        return (
          <Card key={sheetName}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium truncate" title={sheetName}>
                {sheetName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Registros:</span>
                  <Badge variant="secondary">{recordCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Columnas:</span>
                  <Badge variant="outline">{columns.length}</Badge>
                </div>
                {hasMontoColumn && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Tiene montos:</span>
                    <Badge variant="default" className="bg-green-500">
                      ✓
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
