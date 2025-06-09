"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Database, Info, TrendingUp, Users, MapPin, WifiOff } from "lucide-react"

interface DataSourceInfoProps {
  loadedYears: string[]
  isUsingRealData?: boolean
}

export default function DataSourceInfo({ loadedYears, isUsingRealData = false }: DataSourceInfoProps) {
  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Info className="h-5 w-5" />
          Dashboard de Análisis de Multas PAE-PAP
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Estado de conexión */}
          <Alert className="border-amber-200 bg-amber-50">
            <WifiOff className="h-4 w-4 text-amber-600" />
            <AlertDescription>
              <div className="text-sm text-amber-800">
                <div>
                  <p className="font-medium mb-1">⚠️ Usando datos de demostración</p>
                  <p>
                    Este dashboard utiliza datos simulados que replican la estructura real del sistema PAE-PAP de
                    JUNAEB. Todas las funcionalidades están disponibles para explorar.
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Estadísticas de datos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Datos</span>
              </div>
              <p className="text-xs text-blue-700">{loadedYears.length} años de multas PAE-PAP cargados</p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Análisis</span>
              </div>
              <p className="text-xs text-blue-700">Gráficos interactivos y tendencias temporales</p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Empresas</span>
              </div>
              <p className="text-xs text-blue-700">Múltiples empresas del sector alimentario</p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Cobertura</span>
              </div>
              <p className="text-xs text-blue-700">Regiones de Chile con datos detallados</p>
            </div>
          </div>

          {/* Navegación rápida */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="text-sm text-blue-800">
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
            <p className="text-sm font-medium mb-2">📈 Años disponibles ({loadedYears.length} de 4):</p>
            <div className="flex gap-2 flex-wrap">
              {loadedYears.map((year) => (
                <Badge key={year} variant="default" className="bg-blue-600">
                  {year} 📊
                </Badge>
              ))}
            </div>
          </div>

          {/* Nota sobre datos */}
          <div className="bg-blue-100 p-3 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>ℹ️ Nota:</strong> Los datos de demostración replican fielmente la estructura real del sistema
              PAE-PAP. Todas las funcionalidades del dashboard están disponibles para explorar.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
