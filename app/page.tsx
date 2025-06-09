"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import {
  Loader2,
  AlertCircle,
  Database,
  TrendingUp,
  Wifi,
  Info,
  BarChart3,
  PieChart,
  FileText,
  WifiOff,
} from "lucide-react"
import Dashboard from "@/components/dashboard"
import { loadJSONData } from "@/lib/json-processor"
import SheetOverview from "@/components/sheet-overview"
import ExecutiveSummary from "@/components/executive-summary"
import TemporalAnalysis from "@/components/temporal-analysis"
import DataSourceInfo from "@/components/data-source-info"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [activeSheet, setActiveSheet] = useState<string>("")
  const [sheetNames, setSheetNames] = useState<string[]>([])
  const [isUsingRealData, setIsUsingRealData] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "failed">("checking")
  const [showInfo, setShowInfo] = useState(false)

  // Cargar todos los años al iniciar
  useEffect(() => {
    handleYearSelect("all")
  }, [])

  const handleYearSelect = async (year: string) => {
    setIsLoading(true)
    setError(null)
    setConnectionStatus("checking")

    try {
      console.log("🚀 Iniciando carga para:", year === "all" ? "todos los años" : year)
      const result = await loadJSONData(year === "all" ? undefined : year)

      setData(result.data)
      setSheetNames(result.sheetNames)
      setActiveSheet(result.sheetNames[0])
      setIsUsingRealData(result.usingRealData || false)

      // Siempre usamos datos de demostración ahora
      setConnectionStatus("failed")
      console.log("⚠️ Usando datos de demostración")

      setIsLoading(false)
    } catch (err) {
      console.error("❌ Error al cargar datos:", err)
      setError(err instanceof Error ? err.message : "Error al procesar los datos JSON")
      setConnectionStatus("failed")
      setIsUsingRealData(false)
      setIsLoading(false)
    }
  }

  // Calcular estadísticas rápidas para el header
  const quickStats = data
    ? {
        totalRecords: Object.values(data).reduce((sum: number, yearData: any) => sum + yearData.length, 0),
        totalYears: Object.keys(data).length,
        totalCompanies: new Set(
          Object.values(data)
            .flat()
            .map((item: any) => item.empresa),
        ).size,
      }
    : null

  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      {/* Header compacto */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Dashboard PAE-PAP JUNAEB</h1>
        </div>

        {quickStats && (
          <div className="flex justify-center gap-6 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {quickStats.totalRecords.toLocaleString()} registros
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {quickStats.totalYears} años
            </span>
            <span className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              {quickStats.totalCompanies} empresas
            </span>
          </div>
        )}

        {/* Indicador de estado compacto */}
        <div className="flex justify-center">
          {connectionStatus === "checking" && (
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Cargando datos...</span>
            </div>
          )}
          {connectionStatus === "connected" && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <Wifi className="h-3 w-3" />
              <span>Datos oficiales de GitHub</span>
            </div>
          )}
          {connectionStatus === "failed" && (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <WifiOff className="h-3 w-3" />
              <span>Datos de demostración</span>
            </div>
          )}
        </div>

        {/* Botón para mostrar información */}
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={() => setShowInfo(!showInfo)} className="text-xs">
            <Info className="h-3 w-3 mr-1" />
            {showInfo ? "Ocultar información" : "¿Cómo funciona?"}
          </Button>
        </div>
      </div>

      {/* Información colapsable */}
      <Collapsible open={showInfo} onOpenChange={setShowInfo}>
        <CollapsibleContent className="mb-6">
          <DataSourceInfo loadedYears={sheetNames} isUsingRealData={isUsingRealData} />
        </CollapsibleContent>
      </Collapsible>

      {/* Selector de año más compacto */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Período de análisis:</label>
              <Select value="all" onValueChange={handleYearSelect} disabled={isLoading}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Todos los años (2020-2023)
                    </div>
                  </SelectItem>
                  {["2020", "2021", "2022", "2023"].map((year) => (
                    <SelectItem key={year} value={year}>
                      Año {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {sheetNames.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {sheetNames.map((year) => (
                  <div
                    key={year}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                      isUsingRealData ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    <span>{year}</span>
                    <span className="font-medium">{data[year]?.length.toLocaleString() || 0} registros</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error más compacto */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium">Error de conexión con GitHub</p>
            <p className="text-sm">Usando datos de demostración. Funcionalidad completa disponible.</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading más elegante */}
      {isLoading && (
        <Card className="mb-6">
          <CardContent className="p-6 flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <div>
              <p className="font-medium">Cargando datos...</p>
              <p className="text-sm text-muted-foreground">Preparando visualización</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenido principal */}
      {data && sheetNames.length > 0 && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="temporal" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Temporal</span>
            </TabsTrigger>
            <TabsTrigger value="detailed" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Detallado</span>
            </TabsTrigger>
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Por Año</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ExecutiveSummary data={data} sheetNames={sheetNames} />
            <SheetOverview sheetNames={sheetNames} data={data} />
          </TabsContent>

          <TabsContent value="temporal" className="space-y-6">
            <TemporalAnalysis data={data} sheetNames={sheetNames} />
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Análisis Consolidado 2020-2023
                </CardTitle>
                <CardDescription>
                  Vista unificada con gráficos interactivos •{" "}
                  {isUsingRealData ? "Datos oficiales" : "Datos de demostración"}
                </CardDescription>
              </CardHeader>
            </Card>

            <Dashboard data={Object.values(data).flat()} sheetName="Consolidado (2020-2023)" />
          </TabsContent>

          <TabsContent value="individual" className="space-y-6">
            <div className="mb-6">
              <Select value={activeSheet} onValueChange={setActiveSheet}>
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  {sheetNames.map((sheet) => (
                    <SelectItem key={sheet} value={sheet}>
                      <div className="flex items-center justify-between w-full">
                        <span>Año {sheet}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {data[sheet]?.length.toLocaleString()} registros
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dashboard data={data[activeSheet]} sheetName={`Año ${activeSheet}`} />
          </TabsContent>
        </Tabs>
      )}
    </main>
  )
}
