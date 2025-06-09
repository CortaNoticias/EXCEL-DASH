"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, Info, TrendingUp, Users, MapPin } from "lucide-react"

interface DataSourceInfoProps {
  loadedYears: string[]
  isUsingMockData?: boolean
}

export default function DataSourceInfo({ loadedYears, isUsingMockData = true }: DataSourceInfoProps) {
  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Info className="h-5 w-5" />
          ¿Cómo funciona este dashboard?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Datos</span>
              </div>
              <p className="text-xs text-blue-700">
                {loadedYears.length} años de multas PAE-PAP con más de 600 registros totales
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Análisis</span>
              </div>
              <p className="text-xs text-green-700">Gráficos interactivos, tendencias temporales y comparaciones</p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-800">Empresas</span>
              </div>
              <p className="text-xs text-purple-700">25 empresas del sector alimentario escolar</p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-800">Cobertura</span>
              </div>
              <p className="text-xs text-orange-700">15 regiones de Chile con datos detallados</p>
            </div>
          </div>

          <Alert className="border-amber-200 bg-amber-50">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription>
              <div className="text-sm text-amber-800">
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

          <div className="bg-blue-100 p-3 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>⚠️ Datos de demostración:</strong> La información mostrada es ficticia y generada para demostrar
              las capacidades del dashboard. Montos en pesos chilenos (CLP).
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
