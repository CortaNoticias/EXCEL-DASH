"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

interface ExecutiveSummaryProps {
  data: Record<string, any[]>
  sheetNames: string[]
}

export default function ExecutiveSummary({ data, sheetNames }: ExecutiveSummaryProps) {
  const summary = useMemo(() => {
    let totalRecords = 0
    let totalMontoNotificado = 0
    let totalMontoEjecutado = 0
    const empresasUnicas = new Set<string>()
    const estadosUnicos = new Set<string>()

    sheetNames.forEach((sheetName) => {
      const sheetData = data[sheetName] || []
      totalRecords += sheetData.length

      sheetData.forEach((item) => {
        // Contar empresas únicas
        if (item.empresa) {
          empresasUnicas.add(item.empresa)
        }

        // Contar estados únicos
        if (item.estado) {
          estadosUnicos.add(item.estado)
        }

        // Sumar montos
        const montoNotificado = findMontoNotificado(item)
        const montoEjecutado = findMontoEjecutado(item)

        totalMontoNotificado += montoNotificado
        totalMontoEjecutado += montoEjecutado
      })
    })

    const diferencia = totalMontoNotificado - totalMontoEjecutado
    const porcentajeEjecucion = totalMontoNotificado > 0 ? (totalMontoEjecutado / totalMontoNotificado) * 100 : 0

    return {
      totalRecords,
      totalMontoNotificado,
      totalMontoEjecutado,
      diferencia,
      porcentajeEjecucion,
      empresasUnicas: empresasUnicas.size,
      estadosUnicos: estadosUnicos.size,
      hojas: sheetNames.length,
    }
  }, [data, sheetNames])

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Resumen Ejecutivo - Todas las Hojas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{summary.hojas}</div>
            <div className="text-sm text-muted-foreground">Hojas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{summary.totalRecords}</div>
            <div className="text-sm text-muted-foreground">Registros</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{summary.empresasUnicas}</div>
            <div className="text-sm text-muted-foreground">Empresas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{summary.estadosUnicos}</div>
            <div className="text-sm text-muted-foreground">Estados</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{formatCurrency(summary.totalMontoNotificado)}</div>
            <div className="text-sm text-muted-foreground">Total Notificado</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{formatCurrency(summary.totalMontoEjecutado)}</div>
            <div className="text-sm text-muted-foreground">Total Ejecutado</div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Diferencia Total:</span>
            <span className="text-xl font-bold">{formatCurrency(summary.diferencia)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="font-medium">Porcentaje de Ejecución:</span>
            <Badge variant={summary.porcentajeEjecucion > 80 ? "default" : "destructive"}>
              {summary.porcentajeEjecucion.toFixed(2)}%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Funciones auxiliares (duplicadas para este componente)
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
