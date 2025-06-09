"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Database, Info, TrendingUp, Users, MapPin, Github, Wifi, WifiOff } from "lucide-react"

interface DataSourceInfoProps {
  loadedYears: string[]
  isUsingRealData?: boolean
}

export default function DataSourceInfo({ loadedYears, isUsingRealData = false }: DataSourceInfoProps) {
  return (
    <Card
      className={`border-2 ${isUsingRealData ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50" : "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50"}`}
    >
      <CardHeader className="pb-4">
        <CardTitle className={`flex items-center gap-2 ${isUsingRealData ? "text-green-800" : "text-blue-800"}`}>
          {isUsingRealData ? <Wifi className="h-5 w-5" /> : <Info className="h-5 w-5" />}
          {isUsingRealData ? "Datos Oficiales de JUNAEB" : "¿Cómo funciona este dashboard?"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Estado de conexión */}
          <Alert className={`${isUsingRealData ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
            {isUsingRealData ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-amber-600" />
            )}
            <AlertDescription>
              <div className={`text-sm ${isUsingRealData ? "text-green-800" : "text-amber-800"}`}>
                {isUsingRealData ? (
                  <div>
                    <p className="font-medium mb-1">✅ Conectado a GitHub</p>
                    <p>
                      Los datos se cargan directamente desde el repositorio oficial de JUNAEB en GitHub. Información
                      actualizada y verificada.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium mb-1">⚠️ Usando datos de demostración</p>
                    <p>
                      No se pudo conectar a GitHub. El dashboard funciona con datos simulados que replican la estructura
                      real.
                    </p>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {/* Información de fuente de datos */}
          {isUsingRealData && (
            <div className="bg-white p-3 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Github className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Fuente de Datos</span>
              </div>
              <p className="text-xs text-green-700 mb-2">
                Repositorio: <code className="bg-green-100 px-1 rounded">CortaNoticias/EXCEL-DASH</code>
              </p>
              <p className="text-xs text-green-700">Archivos JSON oficiales del sistema PAE-PAP de JUNAEB</p>
            </div>
          )}

          {/* Estadísticas de datos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className={`bg-white p-3 rounded-lg border ${isUsingRealData ? "border-green-200" : "border-blue-200"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Database className={`h-4 w-4 ${isUsingRealData ? "text-green-600" : "text-blue-600"}`} />
                <span className={`font-medium ${isUsingRealData ? "text-green-800" : "text-blue-800"}`}>Datos</span>
              </div>
              <p className={`text-xs ${isUsingRealData ? "text-green-700" : "text-blue-700"}`}>
                {loadedYears.length} años de multas PAE-PAP cargados
              </p>
            </div>

            <div
              className={`bg-white p-3 rounded-lg border ${isUsingRealData ? "border-green-200" : "border-blue-200"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className={`h-4 w-4 ${isUsingRealData ? "text-green-600" : "text-blue-600"}`} />
                <span className={`font-medium ${isUsingRealData ? "text-green-800" : "text-blue-800"}`}>Análisis</span>
              </div>
              <p className={`text-xs ${isUsingRealData ? "text-green-700" : "text-blue-700"}`}>
                Gráficos interactivos y tendencias temporales
              </p>
            </div>

            <div
              className={`bg-white p-3 rounded-lg border ${isUsingRealData ? "border-green-200" : "border-blue-200"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className={`h-4 w-4 ${isUsingRealData ? "text-green-600" : "text-blue-600"}`} />
                <span className={`font-medium ${isUsingRealData ? "text-green-800" : "text-blue-800"}`}>Empresas</span>
              </div>
              <p className={`text-xs ${isUsingRealData ? "text-green-700" : "text-blue-700"}`}>
                Múltiples empresas del sector alimentario
              </p>
            </div>

            <div
              className={`bg-white p-3 rounded-lg border ${isUsingRealData ? "border-green-200" : "border-blue-200"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <MapPin className={`h-4 w-4 ${isUsingRealData ? "text-green-600" : "text-blue-600"}`} />
                <span className={`font-medium ${isUsingRealData ? "text-green-800" : "text-blue-800"}`}>Cobertura</span>
              </div>
              <p className={`text-xs ${isUsingRealData ? "text-green-700" : "text-blue-700"}`}>
                Regiones de Chile con datos detallados
              </p>
            </div>
          </div>

          {/* Navegación rápida */}
          <Alert className={`${isUsingRealData ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"}`}>
            <Info className={`h-4 w-4 ${isUsingRealData ? "text-green-600" : "text-blue-600"}`} />
            <AlertDescription>
              <div className={`text-sm ${isUsingRealData ? "text-green-800" : "text-blue-800"}`}>
                <p className="font-medium mb-1">💡 Navegación rápida:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    • <strong>Resumen:</strong> Estadísticas generales
                  </div>
                  <div>
                    • <strong>Temporal:</strong> Evolución 2020-2023
                  </div>
                  <div>
                    • <strong>Detallado:</strong> Gráficos de torta
                  </div>
                  <div>
                    • <strong>Por Año:</strong> Análisis individual
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Años cargados */}
          <div>
            <p className="text-sm font-medium mb-2">📈 Años cargados ({loadedYears.length} de 4):</p>
            <div className="flex gap-2 flex-wrap">
              {loadedYears.map((year) => (
                <Badge key={year} variant="default" className={isUsingRealData ? "bg-green-600" : "bg-blue-600"}>
                  {year} {isUsingRealData ? "📡" : "🎭"}
                </Badge>
              ))}
            </div>
          </div>

          {/* Nota sobre datos */}
          {!isUsingRealData && (
            <div className="bg-blue-100 p-3 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>ℹ️ Nota:</strong> Los datos de demostración replican fielmente la estructura real del sistema
                PAE-PAP. Todas las funcionalidades del dashboard están disponibles para explorar.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
