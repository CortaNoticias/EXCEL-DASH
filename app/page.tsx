"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Database, TrendingUp } from "lucide-react"
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

  // Cargar todos los años al iniciar
  useEffect(() => {
    handleYearSelect("all")
  }, [])

  const handleYearSelect = async (year: string) => {
    setIsLoading(true)
    setError(null)
    setIsUsingMockData(false)

    try {
      console.log("Cargando datos para:", year === "all" ? "todos los años" : year)
      const result = await loadJSONData(year === "all" ? undefined : year)
      setData(result.data)
      setSheetNames(result.sheetNames)
      setActiveSheet(result.sheetNames[0])

      // Los datos reales no tendrán el campo 'id' que tienen los datos de ejemplo
      const firstYearData = result.data[result.sheetNames[0]]
      if (firstYearData && firstYearData.length > 0 && firstYearData[0].id?.includes("-")) {
        setIsUsingMockData(true)
      }

      setIsLoading(false)
    } catch (err) {
      console.error("Error al cargar datos:", err)
      setError(err instanceof Error ? err.message : "Error al procesar los datos JSON")
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto py-10 px-4 md:px-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Dashboard de Análisis de Deudas PAE-PAP</h1>
        <p className="text-lg text-muted-foreground">
          Análisis interactivo de multas JUNAEB • Datos oficiales 2020-2023
        </p>
      </div>

      <YearSelector onYearSelect={handleYearSelect} isLoading={isLoading} loadedYears={sheetNames} />

      {data && sheetNames.length > 0 && <DataSourceInfo loadedYears={sheetNames} isUsingMockData={isUsingMockData} />}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>
                <strong>Error:</strong> {error}
              </p>
              <p className="text-sm">
                <strong>Posibles soluciones:</strong>
              </p>
              <ul className="text-sm list-disc list-inside space-y-1">
                <li>Verifica tu conexión a internet</li>
                <li>Los archivos JSON deben estar disponibles públicamente en GitHub</li>
                <li>Intenta recargar la página</li>
                <li>Revisa la consola del navegador para más detalles</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <Card className="mb-6">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p className="text-center font-medium">Cargando datos oficiales de JUNAEB...</p>
            <p className="text-sm text-muted-foreground mt-1">
              Procesando archivos JSON desde el repositorio de GitHub
            </p>
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
                <CardDescription>Vista unificada de todos los datos oficiales de JUNAEB</CardDescription>
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
