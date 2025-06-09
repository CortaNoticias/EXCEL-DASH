"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import Dashboard from "@/components/dashboard"
import { processExcelData } from "@/lib/excel-processor"
import SheetOverview from "@/components/sheet-overview"
import ExecutiveSummary from "@/components/executive-summary"

export default function Home() {
  const [url, setUrl] = useState(
    "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/Multas%20Junaeb%20-%20Base%20de%20datos%20(TPA).xlsx",
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [activeSheet, setActiveSheet] = useState<string>("")
  const [sheetNames, setSheetNames] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await processExcelData(url)
      setData(result.data)
      setSheetNames(result.sheetNames)
      setActiveSheet(result.sheetNames[0])
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el archivo Excel")
      setIsLoading(false)
    }
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
            <div className="flex flex-col md:flex-row gap-4">
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
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setUrl(
                    "https://raw.githubusercontent.com/CortaNoticias/EXCEL-DASH/main/Multas%20Junaeb%20-%20Base%20de%20datos%20(TPA).xlsx",
                  )
                }
              >
                Cargar JUNAEB
              </Button>
            </div>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
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
