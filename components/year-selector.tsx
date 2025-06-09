"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Download } from "lucide-react"
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
                <SelectItem value="all">Todos los años</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
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
            <p className="text-sm text-muted-foreground mb-2">Años cargados:</p>
            <div className="flex gap-2 flex-wrap">
              {loadedYears.map((year) => (
                <Badge key={year} variant="secondary">
                  {year}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
