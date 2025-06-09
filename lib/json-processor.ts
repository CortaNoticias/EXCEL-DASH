// Eliminar completamente la carga desde GitHub y usar solo datos de ejemplo
// Ya que los archivos JSON no existen o no son accesibles

export async function loadJSONData(year?: string) {
  console.log("=== CARGANDO DATOS DE DEMOSTRACIÓN ===")
  console.log("ℹ️ Los archivos JSON no están disponibles en GitHub")
  console.log("🎭 Generando datos de ejemplo realistas para JUNAEB...")

  // Usar directamente datos de ejemplo sin intentar GitHub
  return generateEnhancedMockData(year)
}

// Generar datos de ejemplo más completos y realistas
function generateEnhancedMockData(specificYear?: string) {
  console.log("🎭 Generando datos de ejemplo para JUNAEB...")

  const empresas = [
    "Alimentos del Sur S.A.",
    "Servicios Escolares Ltda.",
    "Distribuidora Central",
    "Cocina Express",
    "Alimentación Escolar S.A.",
    "Proveedores Unidos",
    "Catering Escolar",
    "Nutrición Infantil S.A.",
    "Servicios Alimentarios del Norte",
    "Comidas Escolares Premium",
    "Distribuidora Educacional",
    "Alimentos Frescos S.A.",
    "Cocinas Industriales Chile",
    "Alimentación Saludable Ltda.",
    "Servicios Nutricionales Spa",
    "Catering Metropolitano",
    "Alimentos Escolares del Sur",
    "Distribuidora Nacional",
    "Servicios de Alimentación Integral",
    "Cocinas Centrales Chile",
    "Proveedores Alimentarios Unidos",
    "Catering Educacional",
    "Alimentos Nutritivos S.A.",
    "Servicios Gastronómicos Escolares",
    "Distribuidora Alimentaria Nacional",
  ]

  const estados = ["Notificado", "Ejecutado", "En Proceso", "Pendiente", "Resuelto", "Anulado", "Vigente", "Vencido"]

  const tipos = [
    "Multa por atraso en entrega",
    "Multa por calidad deficiente",
    "Multa por incumplimiento contractual",
    "Multa administrativa",
    "Multa por higiene",
    "Multa por documentación",
    "Multa por temperatura inadecuada",
    "Multa por cantidad insuficiente",
    "Multa por especificaciones técnicas",
    "Multa por manipulación de alimentos",
    "Multa por envases inadecuados",
    "Multa por etiquetado incorrecto",
  ]

  const regiones = [
    "Región Metropolitana",
    "Valparaíso",
    "Biobío",
    "Araucanía",
    "Los Lagos",
    "Maule",
    "O'Higgins",
    "Antofagasta",
    "Coquimbo",
    "Tarapacá",
    "Atacama",
    "Aysén",
    "Magallanes",
    "Arica y Parinacota",
    "Los Ríos",
  ]

  const comunas = [
    "Santiago",
    "Valparaíso",
    "Concepción",
    "La Serena",
    "Antofagasta",
    "Temuco",
    "Rancagua",
    "Talca",
    "Arica",
    "Iquique",
    "Puerto Montt",
    "Chillán",
    "Los Ángeles",
    "Valdivia",
    "Osorno",
    "Quillota",
    "Curicó",
    "Linares",
    "Ovalle",
    "Calama",
    "Copiapó",
    "Puerto Aysén",
    "Punta Arenas",
    "Puente Alto",
    "Maipú",
    "Las Condes",
    "Providencia",
    "Ñuñoa",
    "San Bernardo",
    "Quilicura",
    "Peñalolén",
    "La Florida",
  ]

  const availableYears = ["2020", "2021", "2022", "2023"]
  const yearsToGenerate = specificYear ? [specificYear] : availableYears

  const mockData: Record<string, any[]> = {}

  // Generar muchos más registros por año para ser más realista
  yearsToGenerate.forEach((year) => {
    const yearNum = Number.parseInt(year)
    // Aumentar significativamente: 150-250 registros por año
    const recordCount = 150 + Math.floor(Math.random() * 100) // 150-250 registros

    mockData[year] = Array.from({ length: recordCount }, (_, i) => {
      // Generar montos en pesos chilenos realistas
      const montoNotificado = Math.floor(Math.random() * 30000000) + 500000 // $500.000 - $30.500.000 CLP
      const porcentajeEjecucion = Math.random() * 0.9 + 0.05 // 5% - 95%
      const montoEjecutado = Math.floor(montoNotificado * porcentajeEjecucion)

      // Generar fechas realistas para el año
      const mes = Math.floor(Math.random() * 12) + 1
      const dia = Math.floor(Math.random() * 28) + 1
      const fecha = `${year}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`

      return {
        // Identificadores
        id: `DEMO-${year}-${String(i + 1).padStart(3, "0")}`,
        numeroMulta: `M-${year}-${String(i + 1).padStart(4, "0")}`,

        // Datos principales
        empresa: empresas[Math.floor(Math.random() * empresas.length)],
        institucion: "JUNAEB",
        rut: `${Math.floor(Math.random() * 30000000) + 5000000}-${Math.floor(Math.random() * 9)}`,

        // Fechas
        fecha: fecha,
        fechaNotificacion: fecha,
        fechaVencimiento: `${year}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,

        // Ubicación
        region: regiones[Math.floor(Math.random() * regiones.length)],
        comuna: comunas[Math.floor(Math.random() * comunas.length)],

        // Clasificación
        estado: estados[Math.floor(Math.random() * estados.length)],
        tipo: tipos[Math.floor(Math.random() * tipos.length)],

        // Montos en pesos chilenos
        montoNotificado,
        montoEjecutado,
        diferencia: montoNotificado - montoEjecutado,
        porcentajeEjecucion: Number((porcentajeEjecucion * 100).toFixed(2)),

        // Datos temporales
        año: yearNum,
        trimestre: Math.ceil(mes / 3),
        mes: mes,

        // Campos adicionales específicos de JUNAEB
        programa: ["PAE", "PAP"][Math.floor(Math.random() * 2)],
        modalidad: ["Terceros", "Manipulación"][Math.floor(Math.random() * 2)],
        establecimiento: `Escuela ${Math.floor(Math.random() * 1000) + 1}`,

        // Indicadores de gestión
        prioridad: ["Alta", "Media", "Baja"][Math.floor(Math.random() * 3)],
        responsable: ["Área Técnica", "Área Legal", "Área Administrativa"][Math.floor(Math.random() * 3)],
        gravedad: ["Leve", "Moderada", "Grave", "Muy Grave"][Math.floor(Math.random() * 4)],

        // Campos adicionales
        reincidencia: Math.random() > 0.7,
        resuelto: Math.random() > 0.3,
        observaciones:
          i % 8 === 0
            ? "Multa recurrente"
            : i % 12 === 0
              ? "Caso especial"
              : i % 15 === 0
                ? "Requiere seguimiento"
                : "",

        // Datos de contacto (simulados)
        telefono: `+56 9 ${Math.floor(Math.random() * 90000000) + 10000000}`,
        email: `contacto@${empresas[Math.floor(Math.random() * empresas.length)].toLowerCase().replace(/[^a-z]/g, "")}.cl`,

        // Información del contrato
        numeroContrato: `C-${year}-${String(Math.floor(Math.random() * 1000) + 1).padStart(3, "0")}`,
        montoContrato: montoNotificado * (2 + Math.random() * 8), // 2-10 veces el monto de la multa

        // Fechas del proceso
        fechaInspeccion: `${year}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
        fechaResolucion:
          Math.random() > 0.5
            ? `${year}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`
            : null,
      }
    })
  })

  const totalRecords = Object.values(mockData).reduce((sum, arr) => sum + arr.length, 0)
  console.log(`🎭 Datos generados exitosamente:`)
  console.log(`   📊 ${Object.keys(mockData).length} años`)
  console.log(`   📈 ${totalRecords.toLocaleString()} registros totales`)
  console.log(`   💰 Montos en pesos chilenos (CLP)`)
  console.log(`   🏢 ${empresas.length} empresas diferentes`)
  console.log(`   📍 ${regiones.length} regiones de Chile`)

  return {
    sheetNames: Object.keys(mockData).sort(),
    data: mockData,
  }
}

export function getAvailableYears(): string[] {
  return ["2020", "2021", "2022", "2023"]
}

export function getDataSourceInfo() {
  return {
    baseUrl: "https://github.com/CortaNoticias/EXCEL-DASH/tree/main/csv",
    files: [
      { year: "2020", url: "N/A", filename: "datos_demo_2020.json" },
      { year: "2021", url: "N/A", filename: "datos_demo_2021.json" },
      { year: "2022", url: "N/A", filename: "datos_demo_2022.json" },
      { year: "2023", url: "N/A", filename: "datos_demo_2023.json" },
    ],
    totalYears: 4,
  }
}
