"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, FileSpreadsheet } from "lucide-react"
import Dashboard from "@/components/dashboard"
import { processExcelData } from "@/lib/excel-processor"
import SheetOverview from "@/components/sheet-overview"
import ExecutiveSummary from "@/components/executive-summary"
import MockDataLoader from "@/components/mock-data-loader"

// URL correcta proporcionada por el usuario
const JUNAEB_URL =
  "https://github.com/CortaNoticias/EXCEL-DASH/raw/refs/heads/main/Multas%20Junaeb%20-%20Base%20de%20datos%20(TPA).xlsx"

export default function Home() {
  const [url, setUrl] = useState(JUNAEB_URL)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [activeSheet, setActiveSheet] = useState<string>("")
  const [sheetNames, setSheetNames] = useState<string[]>([])

  // Cargar automáticamente al iniciar
  useEffect(() => {
    handleLoadJunaeb()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await loadData(url)
  }

  const handleLoadJunaeb = async () => {
    setUrl(JUNAEB_URL)
    await loadData(JUNAEB_URL)
  }

  const loadData = async (urlToLoad: string) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Intentando cargar datos desde:", urlToLoad)
      const result = await processExcelData(urlToLoad)
      setData(result.data)
      setSheetNames(result.sheetNames)
      setActiveSheet(result.sheetNames[0])
      setIsLoading(false)
    } catch (err) {
      console.error("Error al cargar datos:", err)
      setError(err instanceof Error ? err.message : "Error al procesar el archivo Excel")
      setIsLoading(false)
    }
  }

  const handleLoadMockData = (mockData: any) => {
    setData(mockData.data)
    setSheetNames(mockData.sheetNames)
    setActiveSheet(mockData.sheetNames[0])
    setError(null)
  }

  return (
    <main className="container mx-auto py-10 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Dashboard de Análisis de Deudas PAE-PAP</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Cargar Archivo Excel</CardTitle>
          <CardDescription>
            Ingresa la URL del archivo Excel en GitHub para analizar los datos de deudas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <Input
                type="text"
                placeholder="URL del archivo Excel en GitHub (raw)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !url}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Cargar Datos"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleLoadJunaeb} disabled={isLoading}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Cargar JUNAEB
              </Button>
            </div>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>
                    <strong>Error:</strong> {error}
                  </p>
                  <p className="text-sm">
                    <strong>Sugerencias:</strong>
                  </p>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    <li>Verifica que el archivo Excel esté disponible públicamente en GitHub</li>
                    <li>Asegúrate de usar la URL correcta para descargar el archivo</li>
                    <li>Intenta usar el botón "Cargar JUNAEB" para la URL predefinida</li>
                    <li>Si continúas teniendo problemas, puedes usar datos de ejemplo para probar la aplicación</li>
                  </ul>

                  <MockDataLoader onLoad={handleLoadMockData} />
                </div>
              </AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="mt-4 p-6 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p className="text-center">Cargando y procesando el archivo Excel...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Esto puede tomar unos momentos dependiendo del tamaño del archivo
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {data && sheetNames.length > 0 && (
        <>
          <ExecutiveSummary data={data} sheetNames={sheetNames} />
          <SheetOverview sheetNames={sheetNames} data={data} />

          <div className="mb-6">
            <Select value={activeSheet} onValueChange={setActiveSheet}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Seleccionar hoja" />
              </SelectTrigger>
              <SelectContent>
                {sheetNames.map((sheet) => (
                  <SelectItem key={sheet} value={sheet}>
                    {sheet}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dashboard data={data[activeSheet]} sheetName={activeSheet} />
        </>
      )}
    </main>
  )
}
