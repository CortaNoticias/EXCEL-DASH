"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { formatCurrency } from "@/lib/utils"

interface TemporalAnalysisProps {
  data: Record<string, any[]>
  sheetNames: string[]
}

export default function TemporalAnalysis({ data, sheetNames }: TemporalAnalysisProps) {
  const temporalData = useMemo(() => {
    return sheetNames
      .map((year) => {
        const yearData = data[year] || []

        const totalNotificado = yearData.reduce((sum, item) => sum + findMontoNotificado(item), 0)
        const totalEjecutado = yearData.reduce((sum, item) => sum + findMontoEjecutado(item), 0)
        const totalRegistros = yearData.length
        const empresasUnicas = new Set(yearData.map((item) => item.empresa)).size

        return {
          year,
          totalNotificado,
          totalEjecutado,
          diferencia: totalNotificado - totalEjecutado,
          porcentajeEjecucion: totalNotificado > 0 ? (totalEjecutado / totalNotificado) * 100 : 0,
          totalRegistros,
          empresasUnicas,
        }
      })
      .sort((a, b) => a.year.localeCompare(b.year))
  }, [data, sheetNames])

  const monthlyData = useMemo(() => {
    const monthlyStats: Record<string, any> = {}

    sheetNames.forEach((year) => {
      const yearData = data[year] || []

      yearData.forEach((item) => {
        if (item.fecha) {
          try {
            const date = new Date(item.fecha)
            if (!isNaN(date.getTime())) {
              const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

              if (!monthlyStats[monthKey]) {
                monthlyStats[monthKey] = {
                  month: monthKey,
                  totalNotificado: 0,
                  totalEjecutado: 0,
                  count: 0,
                }
              }

              monthlyStats[monthKey].totalNotificado += findMontoNotificado(item)
              monthlyStats[monthKey].totalEjecutado += findMontoEjecutado(item)
              monthlyStats[monthKey].count += 1
            }
          } catch (error) {
            // Ignorar fechas inválidas
          }
        }
      })
    })

    return Object.values(monthlyStats)
      .sort((a: any, b: any) => a.month.localeCompare(b.month))
      .slice(-24) // Últimos 24 meses
  }, [data, sheetNames])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Análisis Temporal por Año</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={temporalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "porcentajeEjecucion") {
                      return [`${Number(value).toFixed(2)}%`, "Porcentaje de Ejecución"]
                    }
                    return [formatCurrency(value as number), name]
                  }}
                />
                <Legend />
                <Bar dataKey="totalNotificado" name="Monto Notificado" fill="#8884d8" />
                <Bar dataKey="totalEjecutado" name="Monto Ejecutado" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Ejecución por Año</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={temporalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`, "Porcentaje de Ejecución"]} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="porcentajeEjecucion"
                  stroke="#ff7300"
                  strokeWidth={3}
                  name="% Ejecución"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {monthlyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Evolución Mensual (Últimos 24 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Line type="monotone" dataKey="totalNotificado" stroke="#8884d8" name="Notificado" />
                  <Line type="monotone" dataKey="totalEjecutado" stroke="#82ca9d" name="Ejecutado" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Estadísticas por Año</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {temporalData.map((yearStats) => (
              <div key={yearStats.year} className="p-4 border rounded-lg">
                <h3 className="font-bold text-lg mb-2">{yearStats.year}</h3>
                <div className="space-y-1 text-sm">
                  <div>
                    Registros: <span className="font-medium">{yearStats.totalRegistros}</span>
                  </div>
                  <div>
                    Empresas: <span className="font-medium">{yearStats.empresasUnicas}</span>
                  </div>
                  <div>
                    Notificado: <span className="font-medium">{formatCurrency(yearStats.totalNotificado)}</span>
                  </div>
                  <div>
                    Ejecutado: <span className="font-medium">{formatCurrency(yearStats.totalEjecutado)}</span>
                  </div>
                  <div>
                    % Ejecución: <span className="font-medium">{yearStats.porcentajeEjecucion.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Funciones auxiliares
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

function findMontoEjecutado(item: any): number {
  const possibleKeys = [
    "montoEjecutado",
    "monto_ejecutado",
    "MontoEjecutado",
    "MontoEjecuta",
    "MONTO EJECUTADO",
    "Monto Ejecutado",
    "monto ejecutado",
    "pagado",
    "Pagado",
    "PAGADO",
    "monto_pagado",
    "MontoPagado",
    "valor_pagado",
    "ValorPagado",
    "cobrado",
    "Cobrado",
    "COBRADO",
  ]

  for (const key of possibleKeys) {
    if (item[key] !== undefined && !isNaN(Number(item[key]))) {
      return Number(item[key])
    }
  }

  for (const key in item) {
    const lowerKey = key.toLowerCase()
    if (
      (lowerKey.includes("ejecuta") || lowerKey.includes("pagado") || lowerKey.includes("cobrado")) &&
      !isNaN(Number(item[key]))
    ) {
      return Number(item[key])
    }
  }

  return 0
}
