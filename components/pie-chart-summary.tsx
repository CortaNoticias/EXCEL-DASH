"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { formatCurrency } from "@/lib/utils"

interface PieChartSummaryProps {
  data: any[]
  title: string
}

export default function PieChartSummary({ data, title }: PieChartSummaryProps) {
  const regionData = useMemo(() => {
    const regionCount = data.reduce(
      (acc, item) => {
        const region = item.region || "No especificada"
        acc[region] = (acc[region] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(regionCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8) // Top 8 regiones
  }, [data])

  const montosPorTrimestre = useMemo(() => {
    const trimestreData = data.reduce(
      (acc, item) => {
        let trimestre = "No especificado"

        if (item.fecha) {
          try {
            const fecha = new Date(item.fecha)
            if (!isNaN(fecha.getTime())) {
              const mes = fecha.getMonth() + 1
              trimestre = `Q${Math.ceil(mes / 3)}`
            }
          } catch (error) {
            // Usar trimestre por defecto
          }
        } else if (item.trimestre) {
          trimestre = `Q${item.trimestre}`
        }

        if (!acc[trimestre]) {
          acc[trimestre] = { monto: 0, count: 0 }
        }

        acc[trimestre].monto += findMontoNotificado(item)
        acc[trimestre].count += 1

        return acc
      },
      {} as Record<string, { monto: number; count: number }>,
    )

    return Object.entries(trimestreData)
      .map(([name, data]) => ({ name, monto: data.monto, count: data.count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [data])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#8DD1E1"]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Región</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={regionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, "Cantidad"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Montos por Trimestre</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={montosPorTrimestre}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="monto"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {montosPorTrimestre.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Función auxiliar
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
