"use client"

import { Button } from "@/components/ui/button"
import { FileSpreadsheet } from "lucide-react"

interface MockDataLoaderProps {
  onLoad: (data: any) => void
}

export default function MockDataLoader({ onLoad }: MockDataLoaderProps) {
  const loadMockData = () => {
    // Datos de ejemplo para cuando no se puede cargar el archivo real
    const mockData = {
      sheetNames: ["Hoja1", "Hoja2", "Hoja3", "Hoja4"],
      data: {
        Hoja1: generateMockSheetData("Empresa"),
        Hoja2: generateMockSheetData("Proveedor"),
        Hoja3: generateMockSheetData("Contratista"),
        Hoja4: generateMockSheetData("Empresa"),
      },
    }

    onLoad(mockData)
  }

  return (
    <Button onClick={loadMockData} variant="secondary" className="mt-4">
      <FileSpreadsheet className="mr-2 h-4 w-4" />
      Cargar datos de ejemplo
    </Button>
  )
}

function generateMockSheetData(empresaLabel: string) {
  const empresas = [
    "Alimentos del Sur S.A.",
    "Servicios Escolares Ltda.",
    "Distribuidora Central",
    "Cocina Express",
    "Alimentación Escolar S.A.",
  ]

  const estados = ["Notificado", "Ejecutado", "En proceso", "Pendiente"]
  const tipos = ["Multa por atraso", "Multa por calidad", "Multa por incumplimiento", "Multa administrativa"]

  return Array.from({ length: 20 }, (_, i) => ({
    [empresaLabel]: empresas[Math.floor(Math.random() * empresas.length)],
    institucion: "JUNAEB",
    fecha: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
    estado: estados[Math.floor(Math.random() * estados.length)],
    tipo: tipos[Math.floor(Math.random() * tipos.length)],
    rut: `${Math.floor(Math.random() * 30000000) + 5000000}-${Math.floor(Math.random() * 9)}`,
    montoNotificado: Math.floor(Math.random() * 10000000) + 500000,
    montoEjecutado: Math.floor(Math.random() * 8000000),
  }))
}
