"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, CheckCircle, Database, Github } from "lucide-react"
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
          {isUsingMockData ? (
            <>
              <Database className="h-5 w-5 text-blue-600" />
              Datos de Demostración Cargados
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              Datos Oficiales de JUNAEB desde GitHub
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isUsingMockData ? (
          <Alert className="border-blue-200 bg-blue-50">
            <Database className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-blue-800 mb-2">🎭 Usando datos de demostración realistas</p>
                  <p className="text-sm text-blue-700">
                    Los archivos JSON no están disponibles en GitHub o hay problemas de conectividad. Se han generado
                    datos de ejemplo que replican fielmente la estructura y patrones de datos reales de JUNAEB.
                  </p>
                </div>

                <div className="bg-white p-4 rounded border border-blue-200">
                  <p className="text-sm font-medium text-blue-800 mb-3">
                    📊 Características de los datos de demostración:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-700">
                    <div>• {loadedYears.length} años completos (2020-2023)</div>
                    <div>• 45-80 registros por año</div>
                    <div>• 15 empresas realistas</div>
                    <div>• 8 estados diferentes</div>
                    <div>• 10 tipos de multas</div>
                    <div>• 15 regiones de Chile</div>
                    <div>• Montos entre $300K - $25M</div>
                    <div>• Fechas distribuidas por año</div>
                    <div>• Porcentajes de ejecución variables</div>
                    <div>• Campos adicionales (RUT, observaciones)</div>
                    <div>• Datos específicos PAE/PAP</div>
                    <div>• Todas las funcionalidades disponibles</div>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded border border-amber-200">
                  <p className="text-sm text-amber-800 mb-2">
                    <strong>💡 Nota importante:</strong>
                  </p>
                  <p className="text-xs text-amber-700">
                    Estos datos son completamente ficticios y generados algorítmicamente. No representan información
                    real de JUNAEB, empresas o multas reales. Su propósito es únicamente demostrar las capacidades del
                    dashboard.
                  </p>
                </div>

                <div>
                  <p className="text-sm text-blue-700 mb-2">
                    <strong>🔗 Para acceder a datos reales:</strong>
                  </p>
                  <a
                    href={sourceInfo.baseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 text-sm underline"
                  >
                    <Github className="h-3 w-3" />
                    Verificar repositorio CortaNoticias/EXCEL-DASH
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">✅ Datos oficiales cargados exitosamente</span>
              </div>
              <p className="text-sm text-green-700">
                Se han cargado los datos reales de multas JUNAEB desde el repositorio oficial.
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">🔗 Fuente de datos:</p>
              <a
                href={sourceInfo.baseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
              >
                <Github className="h-3 w-3" />
                CortaNoticias/EXCEL-DASH/csv
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">
                📈 Años cargados ({loadedYears.length} de {sourceInfo.totalYears}):
              </p>
              <div className="flex gap-2 flex-wrap">
                {sourceInfo.files.map((file) => {
                  const isLoaded = loadedYears.includes(file.year)
                  return (
                    <Badge
                      key={file.year}
                      variant={isLoaded ? "default" : "secondary"}
                      className={isLoaded ? "bg-green-600" : ""}
                    >
                      {file.year} {isLoaded && "✅"}
                    </Badge>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
