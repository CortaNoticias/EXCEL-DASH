"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, Info, TrendingUp } from "lucide-react"

interface DataSourceInfoProps {
  loadedYears: string[]
  isUsingMockData?: boolean
}

export default function DataSourceInfo({ loadedYears, isUsingMockData = true }: DataSourceInfoProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          Dashboard de Demostración - Datos Simulados JUNAEB
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-blue-800 mb-2">
                  🎭 Dashboard funcionando con datos de demostración realistas
                </p>
                <p className="text-sm text-blue-700">
                  Este dashboard utiliza datos simulados que replican fielmente la estructura y patrones de datos reales
                  del sistema PAE-PAP de JUNAEB. Todos los montos están en <strong>pesos chilenos (CLP)</strong>.
                </p>
              </div>

              <div className="bg-white p-4 rounded border border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-3">
                  📊 Características de los datos de demostración:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-blue-700">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" />
                    <span>{loadedYears.length} años completos (2020-2023)</span>
                  </div>
                  <div>💰 Montos en pesos chilenos (CLP)</div>
                  <div>📈 50-90 registros por año</div>
                  <div>🏢 20 empresas del sector alimentario</div>
                  <div>📋 8 estados de multas diferentes</div>
                  <div>🔍 12 tipos de infracciones</div>
                  <div>📍 15 regiones de Chile</div>
                  <div>💵 Montos: $500K - $30M CLP</div>
                  <div>📅 Fechas distribuidas por año</div>
                  <div>📊 Porcentajes de ejecución variables</div>
                  <div>🆔 RUTs y datos de contacto</div>
                  <div>🎯 Programas PAE y PAP</div>
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="text-sm text-green-800 mb-2">
                  <strong>✅ Funcionalidades disponibles:</strong>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-green-700">
                  <div>• Gráficos de torta interactivos</div>
                  <div>• Análisis temporal 2020-2023</div>
                  <div>• Filtros por región y estado</div>
                  <div>• Comparaciones de montos</div>
                  <div>• Estadísticas ejecutivas</div>
                  <div>• Exportación de insights</div>
                  <div>• Distribuciones por empresa</div>
                  <div>• Análisis de tendencias</div>
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded border border-amber-200">
                <p className="text-sm text-amber-800 mb-2">
                  <strong>⚠️ Importante:</strong>
                </p>
                <p className="text-xs text-amber-700">
                  Los datos mostrados son completamente ficticios y generados algorítmicamente. No representan
                  información real de JUNAEB, empresas o multas reales. Su propósito es únicamente demostrar las
                  capacidades analíticas del dashboard.
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">📈 Años cargados ({loadedYears.length} de 4):</p>
                <div className="flex gap-2 flex-wrap">
                  {loadedYears.map((year) => (
                    <Badge key={year} variant="default" className="bg-blue-600">
                      {year} ✅
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
