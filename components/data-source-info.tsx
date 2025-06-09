"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, ExternalLink, CheckCircle } from "lucide-react"
import { getDataSourceInfo } from "@/lib/json-processor"

interface DataSourceInfoProps {
  loadedYears: string[]
  isUsingMockData?: boolean
}

export default function DataSourceInfo({ loadedYears, isUsingMockData = false }: DataSourceInfoProps) {
  const sourceInfo = getDataSourceInfo()

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Datos Reales de JUNAEB Cargados
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
                  Para usar datos reales, verifica que los archivos estén disponibles en el repositorio.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Datos oficiales cargados exitosamente</span>
              </div>
              <p className="text-sm text-green-700">
                Se han cargado los datos reales de multas JUNAEB desde el repositorio oficial.
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Fuente de datos:</p>
              <a
                href={sourceInfo.baseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
              >
                CortaNoticias/EXCEL-DASH/csv
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">
                Años disponibles ({loadedYears.length} de {sourceInfo.totalYears}):
              </p>
              <div className="flex gap-2 flex-wrap">
                {sourceInfo.files.map((file) => {
                  const isLoaded = loadedYears.includes(file.year)
                  return (
                    <Badge key={file.year} variant={isLoaded ? "default" : "secondary"}>
                      {file.year} {isLoaded && "✓"}
                    </Badge>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <p className="font-medium mb-1">Archivos procesados:</p>
                <ul className="space-y-1">
                  {sourceInfo.files
                    .filter((file) => loadedYears.includes(file.year))
                    .map((file) => (
                      <li key={file.year} className="truncate">
                        • {file.filename}
                      </li>
                    ))}
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Información técnica:</p>
                <ul className="space-y-1">
                  <li>• Formato: JSON</li>
                  <li>• Actualización: Automática</li>
                  <li>• Fuente: Repositorio GitHub</li>
                  <li>• Período: 2020-2023</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
