"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, CheckCircle, AlertTriangle } from "lucide-react"
import { getDataSourceInfo } from "@/lib/json-processor"

interface DataSourceInfoProps {
  loadedYears: string[]
  isUsingMockData?: boolean
}

// Actualizar la información de la fuente de datos para mostrar el estado real
export default function DataSourceInfo({ loadedYears, isUsingMockData = false }: DataSourceInfoProps) {
  const sourceInfo = getDataSourceInfo()

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isUsingMockData ? (
            <>
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Usando Datos de Ejemplo
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />✅ Datos Oficiales de JUNAEB Cargados desde GitHub
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isUsingMockData ? (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-amber-800 mb-1">Se están usando datos de ejemplo realistas</p>
                  <p className="text-sm text-amber-700">
                    No se pudieron cargar los archivos JSON desde GitHub. Los datos mostrados son representativos del
                    tipo de análisis que se puede realizar con datos reales.
                  </p>
                </div>

                <div className="bg-white p-3 rounded border border-amber-200">
                  <p className="text-sm font-medium text-amber-800 mb-2">Características de los datos de ejemplo:</p>
                  <ul className="text-xs text-amber-700 space-y-1">
                    <li>• {loadedYears.length} años de datos (2020-2023)</li>
                    <li>• Empresas y montos realistas</li>
                    <li>• Estados y tipos de multa variados</li>
                    <li>• Distribución temporal coherente</li>
                    <li>• Todas las funcionalidades del dashboard disponibles</li>
                  </ul>
                </div>

                <div>
                  <p className="text-sm text-amber-700">
                    <strong>Para usar datos reales:</strong> Verifica que los archivos JSON estén disponibles en:
                  </p>
                  <a
                    href={sourceInfo.baseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 text-sm underline"
                  >
                    CortaNoticias/EXCEL-DASH/csv
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
                <span className="font-medium text-green-800">
                  🎉 Datos oficiales cargados exitosamente desde GitHub
                </span>
              </div>
              <p className="text-sm text-green-700">
                Se han cargado los datos reales de multas JUNAEB desde el repositorio oficial CortaNoticias/EXCEL-DASH.
                Los archivos JSON están disponibles y funcionando correctamente.
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <div className="text-sm text-blue-800">
                <strong>📊 Repositorio verificado:</strong> Los archivos JSON están disponibles en GitHub y se están
                cargando correctamente.
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">🔗 Fuente de datos oficial:</p>
              <a
                href={sourceInfo.baseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                📁 CortaNoticias/EXCEL-DASH/csv
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

            <div className="text-xs text-muted-foreground">
              <p>🔄 Los datos se cargan directamente desde GitHub en tiempo real</p>
              <p>📅 Última verificación: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
