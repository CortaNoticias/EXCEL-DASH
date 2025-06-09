"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, ExternalLink } from "lucide-react"

interface DataSourceInfoProps {
  loadedYears: string[]
  isUsingMockData?: boolean
}

export default function DataSourceInfo({ loadedYears, isUsingMockData = false }: DataSourceInfoProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Información de la Fuente de Datos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isUsingMockData ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  <strong>Usando datos de ejemplo:</strong> No se pudieron cargar los archivos JSON desde GitHub.
                </p>
                <p className="text-sm">
                  Para usar datos reales, asegúrate de que los archivos JSON estén disponibles en:
                </p>
                <code className="text-xs bg-muted p-1 rounded">
                  https://github.com/CortaNoticias/EXCEL-DASH/tree/main/csv/
                </code>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Datos cargados desde el repositorio de GitHub:</p>
              <a
                href="https://github.com/CortaNoticias/EXCEL-DASH/tree/main/csv"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
              >
                CortaNoticias/EXCEL-DASH/csv
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Años disponibles:</p>
              <div className="flex gap-2 flex-wrap">
                {loadedYears.map((year) => (
                  <Badge key={year} variant="secondary">
                    {year}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Los datos se actualizan automáticamente desde los archivos JSON en el repositorio.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
