"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { formatCurrency } from "@/lib/utils"

interface DashboardProps {
  data: any[]
  sheetName: string
}

export default function Dashboard({ data, sheetName }: DashboardProps) {
  const [selectedInstitution, setSelectedInstitution] = useState<string>("todas")

  const institutions = useMemo(() => {
    const uniqueInstitutions = Array.from(new Set(data.map((item) => item.institucion || "No especificada")))
    return ["todas", ...uniqueInstitutions]
  }, [data])

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return []

    let filteredData = data
    if (selectedInstitution !== "todas") {
      filteredData = data.filter((item) => (item.institucion || "No especificada") === selectedInstitution)
    }

    return filteredData.map((item) => {
      // Buscar campos que puedan contener montos notificados y ejecutados
      const montoNotificado = findMontoNotificado(item)
      const montoEjecutado = findMontoEjecutado(item)

      const diferencia = montoNotificado - montoEjecutado
      const porcentajeEjecucion = montoNotificado > 0 ? (montoEjecutado / montoNotificado) * 100 : 0

      return {
        ...item,
        montoNotificado,
        montoEjecutado,
        diferencia,
        porcentajeEjecucion,
      }
    })
  }, [data, selectedInstitution])

  const summaryStats = useMemo(() => {
    if (!processedData || processedData.length === 0)
      return {
        totalNotificado: 0,
        totalEjecutado: 0,
        totalDiferencia: 0,
        porcentajePromedio: 0,
        empresaMaxNotificado: { nombre: "N/A", monto: 0 },
        empresaMaxEjecutado: { nombre: "N/A", monto: 0 },
        empresaMaxDiferencia: { nombre: "N/A", monto: 0 },
      }

    const totalNotificado = processedData.reduce((sum, item) => sum + item.montoNotificado, 0)
    const totalEjecutado = processedData.reduce((sum, item) => sum + item.montoEjecutado, 0)
    const totalDiferencia = totalNotificado - totalEjecutado
    const porcentajePromedio = totalNotificado > 0 ? (totalEjecutado / totalNotificado) * 100 : 0

    // Encontrar empresas con valores máximos
    let empresaMaxNotificado = { nombre: "N/A", monto: 0 }
    let empresaMaxEjecutado = { nombre: "N/A", monto: 0 }
    let empresaMaxDiferencia = { nombre: "N/A", monto: 0 }

    processedData.forEach((item) => {
      const nombreEmpresa = item.empresa || "No especificada"

      if (item.montoNotificado > empresaMaxNotificado.monto) {
        empresaMaxNotificado = { nombre: nombreEmpresa, monto: item.montoNotificado }
      }

      if (item.montoEjecutado > empresaMaxEjecutado.monto) {
        empresaMaxEjecutado = { nombre: nombreEmpresa, monto: item.montoEjecutado }
      }

      if (item.diferencia > empresaMaxDiferencia.monto) {
        empresaMaxDiferencia = { nombre: nombreEmpresa, monto: item.diferencia }
      }
    })

    return {
      totalNotificado,
      totalEjecutado,
      totalDiferencia,
      porcentajePromedio,
      empresaMaxNotificado,
      empresaMaxEjecutado,
      empresaMaxDiferencia,
    }
  }, [processedData])

  const chartData = useMemo(() => {
    return processedData
      .slice(0, 10) // Limitar a 10 empresas para mejor visualización
      .map((item) => ({
        name: truncateText(item.empresa || "No especificada", 15),
        montoNotificado: item.montoNotificado,
        montoEjecutado: item.montoEjecutado,
        diferencia: item.diferencia,
      }))
  }, [processedData])

  const pieData = useMemo(() => {
    const totalNotificado = summaryStats.totalNotificado
    const totalEjecutado = summaryStats.totalEjecutado
    const diferencia = totalNotificado - totalEjecutado

    return [
      { name: "Monto Ejecutado", value: totalEjecutado },
      { name: "Diferencia", value: diferencia },
    ]
  }, [summaryStats])

  const COLORS = ["#0088FE", "#FF8042"]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard de Deudas - {sheetName}</CardTitle>
          <CardDescription>Análisis comparativo entre montos notificados y ejecutados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Filtrar por Institución:</label>
            <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Seleccionar institución" />
              </SelectTrigger>
              <SelectContent>
                {institutions.map((inst) => (
                  <SelectItem key={inst} value={inst}>
                    {inst === "todas" ? "Todas las instituciones" : inst}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Monto Notificado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(summaryStats.totalNotificado)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Monto Ejecutado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(summaryStats.totalEjecutado)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Diferencia Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(summaryStats.totalDiferencia)}</p>
                <p className="text-sm text-muted-foreground">{summaryStats.porcentajePromedio.toFixed(2)}% ejecutado</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="comparacion">
            <TabsList className="mb-4">
              <TabsTrigger value="comparacion">Comparación de Montos</TabsTrigger>
              <TabsTrigger value="diferencias">Diferencias</TabsTrigger>
              <TabsTrigger value="distribucion">Distribución</TabsTrigger>
              <TabsTrigger value="tabla">Tabla Detallada</TabsTrigger>
            </TabsList>

            <TabsContent value="comparacion" className="space-y-4">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="montoNotificado" name="Monto Notificado" fill="#8884d8" />
                    <Bar dataKey="montoEjecutado" name="Monto Ejecutado" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="diferencias" className="space-y-4">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="diferencia" name="Diferencia" fill="#ff8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="distribucion" className="space-y-4">
              <div className="h-[400px] flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="tabla">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Institución</TableHead>
                      <TableHead className="text-right">Monto Notificado</TableHead>
                      <TableHead className="text-right">Monto Ejecutado</TableHead>
                      <TableHead className="text-right">Diferencia</TableHead>
                      <TableHead className="text-right">% Ejecución</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.empresa || "No especificada"}</TableCell>
                        <TableCell>{item.institucion || "No especificada"}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.montoNotificado)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.montoEjecutado)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.diferencia)}</TableCell>
                        <TableCell className="text-right">{item.porcentajeEjecucion.toFixed(2)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estadísticas Destacadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium mb-2">Mayor Monto Notificado</h3>
              <p className="text-lg font-bold">{summaryStats.empresaMaxNotificado.nombre}</p>
              <p>{formatCurrency(summaryStats.empresaMaxNotificado.monto)}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Mayor Monto Ejecutado</h3>
              <p className="text-lg font-bold">{summaryStats.empresaMaxEjecutado.nombre}</p>
              <p>{formatCurrency(summaryStats.empresaMaxEjecutado.monto)}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Mayor Diferencia</h3>
              <p className="text-lg font-bold">{summaryStats.empresaMaxDiferencia.nombre}</p>
              <p>{formatCurrency(summaryStats.empresaMaxDiferencia.monto)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Función para encontrar el monto notificado en un objeto
function findMontoNotificado(item: any): number {
  const possibleKeys = [
    "montoNotificado",
    "monto_notificado",
    "MontoNotificado",
    "MONTO NOTIFICADO",
    "Monto Notificado",
    "monto notificado",
  ]

  for (const key of possibleKeys) {
    if (item[key] !== undefined && !isNaN(Number(item[key]))) {
      return Number(item[key])
    }
  }

  // Buscar cualquier clave que contenga "notificado"
  for (const key in item) {
    if (key.toLowerCase().includes("notificado") && !isNaN(Number(item[key]))) {
      return Number(item[key])
    }
  }

  return 0
}

// Función para encontrar el monto ejecutado en un objeto
function findMontoEjecutado(item: any): number {
  const possibleKeys = [
    "montoEjecutado",
    "monto_ejecutado",
    "MontoEjecutado",
    "MontoEjecuta",
    "MONTO EJECUTADO",
    "Monto Ejecutado",
    "monto ejecutado",
  ]

  for (const key of possibleKeys) {
    if (item[key] !== undefined && !isNaN(Number(item[key]))) {
      return Number(item[key])
    }
  }

  // Buscar cualquier clave que contenga "ejecutado" o "ejecuta"
  for (const key in item) {
    if (
      (key.toLowerCase().includes("ejecuta") || key.toLowerCase().includes("ejecutado")) &&
      !isNaN(Number(item[key]))
    ) {
      return Number(item[key])
    }
  }

  return 0
}

// Función para truncar texto largo
function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
}
