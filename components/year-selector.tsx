"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Download, Database } from "lucide-react"
import { getAvailableYears } from "@/lib/json-processor"

interface YearSelectorProps {
  onYearSelect: (year: string | "all") => void
  isLoading: boolean
  loadedYears: string[]
}

export default function YearSelector({ onYearSelect, isLoading, loadedYears }: YearSelectorProps) {
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const availableYears = getAvailableYears()

  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    onYearSelect(year)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Seleccionar Período de Análisis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Año a analizar:</label>
            <Select value={selectedYear} onValueChange={handleYearChange} disabled={isLoading}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Seleccionar año" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Todos los años (2020-2023)
                  </div>
                </SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    Año {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => handleYearChange("all")} disabled={isLoading} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Cargar Todos
            </Button>
          </div>
        </div>

        {loadedYears.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">
              Años cargados ({loadedYears.length} de {availableYears.length}):
            </p>
            <div className="flex gap-2 flex-wrap">
              {loadedYears.map((year) => (
                <Badge key={year} variant="default" className="bg-green-600">
                  {year} ✓
                </Badge>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">Cargando datos oficiales de JUNAEB desde GitHub...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
