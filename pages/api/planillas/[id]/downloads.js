import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import fs from 'fs'
import path from 'path'
import PDFDocument from 'pdfkit'

export default async function handler(req, res) {
  const { id } = req.query
  const { type } = req.query // 'pdf' or 'excel'

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  if (!type || (type !== 'pdf' && type !== 'excel')) {
    return res.status(400).json({ message: 'Invalid or missing type parameter. Must be "pdf" or "excel".' })
  }

  try {
    const { db } = await connectToDatabase()
    const planilla = await db.collection('planillas').findOne({ _id: new ObjectId(id) })

    if (!planilla) {
      return res.status(404).json({ message: 'Planilla no encontrada' })
    }

    if (type === 'excel') {
      if (!planilla.excelFileUrl) {
        return res.status(404).json({ message: 'Archivo Excel no encontrado' })
      }

      const filePath = path.join(process.cwd(), 'public', planilla.excelFileUrl)
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Archivo Excel no encontrado en el servidor' })
      }

      const fileStream = fs.createReadStream(filePath)

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename=${path.basename(planilla.excelFileUrl)}`)

      fileStream.pipe(res)
    } else if (type === 'pdf') {
      const doc = new PDFDocument()
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename=planilla_${id}.pdf`)

      doc.pipe(res)

      // Helper function to add a section to the PDF
      const addSection = (title, content) => {
        doc.fontSize(14).text(title, { underline: true })
        doc.fontSize(12).text(content)
        doc.moveDown()
      }

      // Helper function to format date
      const formatDate = (date) => {
        return date ? new Date(date).toLocaleDateString() : 'No especificada'
      }

      // Helper function to calculate total price with service charge
      const calculateTotalPrice = (price, serviceChargePercentage, serviceChargeFixed) => {
        const serviceChargeAmount = (price * serviceChargePercentage) / 100
        const totalServiceCharge = serviceChargeAmount + serviceChargeFixed
        const totalPrice = price + totalServiceCharge
        return {
          totalPrice: totalPrice,
          serviceChargeAmount: totalServiceCharge
        }
      }
      
      var ServiceSum = planilla.commercialAgreement.percentage2 + planilla.commercialAgreement.percentage1
      // Helper function to format currency
      const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount)
      }

      // Title
      doc.fontSize(18).text('Detalles de la Planilla', { align: 'center' })
      doc.moveDown()

      // Basic Information
      addSection('Información Básica', [
        `Nombre del evento: ${planilla.eventName}`,
        `Lugar: ${planilla.venue}`,
        `Fecha del evento: ${formatDate(planilla.eventDate)}`,
        `Hora del evento: ${planilla.eventTime || 'No especificada'}`,
        `Duración: ${planilla.duration || 'No especificada'}`,
        `Encargado: ${planilla.encargado}`,
        `Creado el: ${new Date(planilla.createdAt).toLocaleString()}`,
      ].join('\n'))

      // Commercial Agreement
      addSection('Acuerdo Comercial', [
        `Medio de pago: ${planilla.commercialAgreement.percentage1}%`,
        `Service charge: ${planilla.commercialAgreement.percentage2}%`,
        `SC monto fijo: ${formatCurrency(planilla.commercialAgreement.percentage3)}`
      ].join('\n'))

      // Functions
      addSection('Funciones', planilla.functions.map((func, index) => 
        `Función ${index + 1}: Desde: ${formatDate(func.date)}, Hasta: ${formatDate(func.endDate)}, Hora: ${func.time || 'No especificada'}`
      ).join('\n'))

      // Sectors
      addSection('Sectores', planilla.sectors.map((sector, index) => {
        const basePrice = sector.price
        const { totalPrice, serviceChargeAmount } = calculateTotalPrice(
          basePrice,
          ServiceSum,
          planilla.commercialAgreement.percentage3
        )
        return `Sector ${index + 1}: ${sector.name || 'Sin nombre'} (${sector.type})
        Capacidad: ${sector.capacity || 'No especificada'}
        Precio base: ${formatCurrency(basePrice)}
        Service charge: ${formatCurrency(serviceChargeAmount)}
        Precio total (incluyendo service charge): ${formatCurrency(totalPrice)}`
      }).join('\n\n'))

      // Discounts
      addSection('Descuentos', planilla.discounts.map((discount, index) => 
        `Descuento ${index + 1}: Sectores: ${discount.sectors || 'Todos'}, Porcentaje: ${discount.percentage}%, Validez: ${formatDate(discount.validity.from)} - ${formatDate(discount.validity.to)}`
      ).join('\n'))

      // Extra Data
      addSection('Datos Adicionales', planilla.extraData || 'No hay datos adicionales')

      // Sales Methods
      addSection('Métodos de Venta', [
        `Solo en línea: ${planilla.salesMethods.onlineOnly ? 'Sí' : 'No'}`,
        `En línea y físico: ${planilla.salesMethods.onlineAndPhysical ? 'Sí' : 'No'}`,
        `Solo físico: ${planilla.salesMethods.physicalOnly ? 'Sí' : 'No'}`
      ].join('\n'))

      // Minors
      addSection('Menores de Edad', [
        `Permitidos: ${planilla.minorsAllowed ? 'Sí' : 'No'}`,
        `Límite de edad: ${planilla.minorsAgeLimit || 'No especificado'}`
      ].join('\n'))

      // Points of Sale
      addSection('Puntos de Venta', planilla.pointsOfSale.map((point, index) => 
        `Punto ${index + 1}: ${point.location || 'Ubicación no especificada'}, Desde: ${formatDate(point.dateRange.from)}, Hasta: ${formatDate(point.dateRange.to)}, Personal: ${point.hasStaff ? 'Sí' : 'No'}`
      ).join('\n'))

      // Accreditations
      addSection('Acreditaciones', [
        `Solo en línea: ${planilla.accreditations.onlineOnly ? 'Sí' : 'No'}`,
        `En línea y físico: ${planilla.accreditations.onlineAndPhysical ? 'Sí' : 'No'}`,
        `Solo físico: ${planilla.accreditations.physicalOnly ? 'Sí' : 'No'}`,
        'Sectores de acreditación:',
        ...planilla.accreditationSectors.map((sector, index) => 
          `  Sector ${index + 1}: ${sector.name || 'Sin nombre'}, Capacidad: ${sector.capacity || 'No especificada'}`
        )
      ].join('\n'))

      // Delivery Points
      addSection('Puntos de Entrega', planilla.deliveryPoints.map((point, index) => 
        `Punto ${index + 1}: ${point.location || 'Ubicación no especificada'}, Desde: ${formatDate(point.dateRange.from)}, Hasta: ${formatDate(point.dateRange.to)}, Personal: ${point.hasStaff ? 'Sí' : 'No'}`
      ).join('\n'))

      // Access Control
      addSection('Control de Acceso', [
        `Mostrar control de acceso: ${planilla.showAccessControl ? 'Sí' : 'No'}`,
        `Entrada: ${planilla.accessControl.entry ? 'Sí' : 'No'}`,
        `Entrada y salida: ${planilla.accessControl.entryAndExit ? 'Sí' : 'No'}`,
        `Número de puertas: ${planilla.doorCount || 'No especificado'}`,
        `Venta simultánea: ${planilla.simultaneousSale ? 'Sí' : 'No'}`,
        `Personal de control de acceso: ${planilla.hasAccessControlStaff ? 'Sí' : 'No'}`
      ].join('\n'))

      // Billing
      addSection('Facturación', [
        `Habilitada: ${planilla.billing.enabled ? 'Sí' : 'No'}`,
        `Nombre comercial: ${planilla.billing.businessName || 'No especificado'}`,
        `NIF/CIF: ${planilla.billing.taxId || 'No especificado'}`
      ].join('\n'))

      // Collection Account
      const collectionAccountType = planilla.collectionAccount && planilla.collectionAccount.type ? 
        planilla.collectionAccount.type === 'propia' ? 'Propia' : 'Autoentrada' : 'No especificada';
      
      const merchantNumber = planilla.collectionAccount && 
                             planilla.collectionAccount.type === 'propia' && 
                             planilla.collectionAccount.merchantNumber ? 
                             planilla.collectionAccount.merchantNumber : 'No especificado';
      
      const collectionAccountInfo = [
        `Tipo: ${collectionAccountType}`
      ];
      
      if (collectionAccountType === 'Propia') {
        collectionAccountInfo.push(`Número de comercio: ${merchantNumber}`);
      }
      
      addSection('Cuenta de Recaudación', collectionAccountInfo.join('\n'))

      // Production Data
      addSection('Datos de Producción', [
        `Email del supervisor: ${planilla.productionData.supervisorEmail || 'No especificado'}`,
        `Nombre del responsable: ${planilla.productionData.responsibleName || 'No especificado'}`,
        `Teléfono del responsable: ${planilla.productionData.responsiblePhone || 'No especificado'}`
      ].join('\n'))

      doc.end()
    }
  } catch (error) {
    console.error('Error downloading planilla:', error)
    res.status(500).json({ message: 'Error al descargar la planilla' })
  }
}