"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

interface JunaebStatsProps {
  data: any[]
}

export default function JunaebStats({ data }: JunaebStatsProps) {
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null

    // Análisis por estado de multas
    const estadoStats = data.reduce(
      (acc, item) => {
        const estado = item.estado || "No especificado"
        if (!acc[estado]) {
          acc[estado] = { count: 0, monto: 0 }
        }
        acc[estado].count++
        acc[estado].monto += findMontoNotificado(item)
        return acc
      },
      {} as Record<string, { count: number; monto: number }>,
    )

    // Análisis por tipo de multa
    const tipoStats = data.reduce(
      (acc, item) => {
        const tipo = item.tipo || "No especificado"
        if (!acc[tipo]) {
          acc[tipo] = { count: 0, monto: 0 }
        }
        acc[tipo].count++
        acc[tipo].monto += findMontoNotificado(item)
        return acc
      },
      {} as Record<string, { count: number; monto: number }>,
    )

    // Análisis temporal (si hay fechas)
    const fechaStats = data.reduce(
      (acc, item) => {
        if (item.fecha) {
          const fecha = new Date(item.fecha)
          if (!isNaN(fecha.getTime())) {
            const año = fecha.getFullYear()
            const mes = fecha.getMonth() + 1
            const periodo = `${año}-${mes.toString().padStart(2, "0")}`

            if (!acc[periodo]) {
              acc[periodo] = { count: 0, monto: 0 }
            }
            acc[periodo].count++
            acc[periodo].monto += findMontoNotificado(item)
          }
        }
        return acc
      },
      {} as Record<string, { count: number; monto: number }>,
    )

    return {
      estadoStats,
      tipoStats,
      fechaStats,
      totalMultas: data.length,
      empresasUnicas: new Set(data.map((item) => item.empresa)).size,
    }
  }, [data])

  if (!stats) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumen General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total de multas:</span>
              <Badge variant="secondary">{stats.totalMultas}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Empresas involucradas:</span>
              <Badge variant="secondary">{stats.empresasUnicas}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(stats.estadoStats).map(([estado, data]) => (
              <div key={estado} className="flex justify-between items-center">
                <span className="text-sm">{estado}</span>
                <div className="text-right">
                  <Badge variant="outline" className="mb-1">
                    {data.count}
                  </Badge>
                  <div className="text-xs text-muted-foreground">{formatCurrency(data.monto)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(stats.tipoStats)
              .slice(0, 5)
              .map(([tipo, data]) => (
                <div key={tipo} className="flex justify-between items-center">
                  <span className="text-sm truncate">{tipo}</span>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      {data.count}
                    </Badge>
                    <div className="text-xs text-muted-foreground">{formatCurrency(data.monto)}</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Función auxiliar (duplicada para este componente)
function findMontoNotificado(item: any): number {
  const possibleKeys = [
    "montoNotificado",
    "monto_notificado",
    "MontoNotificado",
    "MONTO NOTIFICADO",
    "Monto Notificado",
    "monto notificado",
    "multa",
    "Multa",
    "MULTA",
    "monto_multa",
    "MontoMulta",
    "valor_multa",
    "ValorMulta",
  ]

  for (const key of possibleKeys) {
    if (item[key] !== undefined && !isNaN(Number(item[key]))) {
      return Number(item[key])
    }
  }

  for (const key in item) {
    const lowerKey = key.toLowerCase()
    if (
      (lowerKey.includes("notificado") || lowerKey.includes("multa") || lowerKey.includes("monto")) &&
      !isNaN(Number(item[key]))
    ) {
      return Number(item[key])
    }
  }

  return 0
}
