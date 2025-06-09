"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Database, TrendingUp, Wifi, WifiOff } from "lucide-react"
import Dashboard from "@/components/dashboard"
import { loadJSONData } from "@/lib/json-processor"
import SheetOverview from "@/components/sheet-overview"
import ExecutiveSummary from "@/components/executive-summary"
import YearSelector from "@/components/year-selector"
import TemporalAnalysis from "@/components/temporal-analysis"
import DataSourceInfo from "@/components/data-source-info"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [activeSheet, setActiveSheet] = useState<string>("")
  const [sheetNames, setSheetNames] = useState<string[]>([])
  const [isUsingMockData, setIsUsingMockData] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "failed">("checking")

  // Cargar todos los años al iniciar
  useEffect(() => {
    handleYearSelect("all")
  }, [])

  const handleYearSelect = async (year: string) => {
    setIsLoading(true)
    setError(null)
    setIsUsingMockData(false)
    setConnectionStatus("checking")

    try {
      console.log("🚀 Iniciando carga para:", year === "all" ? "todos los años" : year)
      const result = await loadJSONData(year === "all" ? undefined : year)

      setData(result.data)
      setSheetNames(result.sheetNames)
      setActiveSheet(result.sheetNames[0])

      // Detectar si estamos usando datos de ejemplo
      const firstYearData = result.data[result.sheetNames[0]]
      if (firstYearData && firstYearData.length > 0) {
        const firstRecord = firstYearData[0]
        if (firstRecord.id && typeof firstRecord.id === "string" && firstRecord.id.startsWith("MOCK-")) {
          setIsUsingMockData(true)
          setConnectionStatus("failed")
          console.log("⚠️ Usando datos de ejemplo")
        } else {
          setConnectionStatus("connected")
          console.log("✅ Usando datos reales")
        }
      }

      setIsLoading(false)
    } catch (err) {
      console.error("❌ Error al cargar datos:", err)
      setError(err instanceof Error ? err.message : "Error al procesar los datos JSON")
      setConnectionStatus("failed")
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto py-10 px-4 md:px-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Dashboard de Análisis de Deudas PAE-PAP</h1>
        <p className="text-lg text-muted-foreground">Análisis interactivo de multas JUNAEB • Período 2020-2023</p>

        {/* Indicador de estado de conexión */}
        <div className="mt-4 flex justify-center">
          {connectionStatus === "checking" && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Verificando conexión con GitHub...</span>
            </div>
          )}
          {connectionStatus === "connected" && (
            <div className="flex items-center gap-2 text-green-600">
              <Wifi className="h-4 w-4" />
              <span className="text-sm">Conectado a datos oficiales de GitHub</span>
            </div>
          )}
          {connectionStatus === "failed" && (
            <div className="flex items-center gap-2 text-amber-600">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm">Usando datos de ejemplo (GitHub no disponible)</span>
            </div>
          )}
        </div>
      </div>

      <YearSelector onYearSelect={handleYearSelect} isLoading={isLoading} loadedYears={sheetNames} />

      {data && sheetNames.length > 0 && <DataSourceInfo loadedYears={sheetNames} isUsingMockData={isUsingMockData} />}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>
                <strong>Error de conexión:</strong> {error}
              </p>
              <p className="text-sm">No se pudieron cargar los datos desde GitHub. Posibles causas:</p>
              <ul className="text-sm list-disc list-inside ml-4">
                <li>Problemas de conectividad a internet</li>
                <li>Restricciones de CORS del navegador</li>
                <li>Archivos temporalmente no disponibles en GitHub</li>
                <li>Rate limiting de GitHub</li>
              </ul>
              <p className="text-sm font-medium">
                ✅ La aplicación continúa funcionando con datos de ejemplo realistas para demostrar todas las
                funcionalidades.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <Card className="mb-6">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p className="text-center font-medium">Cargando datos de JUNAEB...</p>
            <p className="text-sm text-muted-foreground mt-1">Intentando conectar con GitHub...</p>
            <div className="mt-2 text-xs text-muted-foreground">
              <p>• Verificando URLs alternativas</p>
              <p>• Aplicando timeout de 10 segundos</p>
              <p>• Preparando fallback si es necesario</p>
            </div>
          </CardContent>
        </Card>
      )}

      {data && sheetNames.length > 0 && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="temporal" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Análisis Temporal
            </TabsTrigger>
            <TabsTrigger value="detailed">Análisis Detallado</TabsTrigger>
            <TabsTrigger value="individual">Por Año</TabsTrigger>
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Análisis Consolidado - Período 2020-2023
                </CardTitle>
                <CardDescription>
                  Vista unificada de {isUsingMockData ? "datos de ejemplo" : "datos oficiales"} de JUNAEB
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
                      Año {sheet}
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
