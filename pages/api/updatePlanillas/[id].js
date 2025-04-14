import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' })
  }

  const { id } = req.query
  const updateData = req.body

  try {
    const { db } = await connectToDatabase()
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' })
    }

    // Remove _id from updateData to avoid MongoDB error
    delete updateData._id

    // Convert date strings to Date objects
    if (updateData.eventDate) {
      updateData.eventDate = new Date(updateData.eventDate)
    }
    if (updateData.functions) {
      updateData.functions = updateData.functions.map(func => ({
        ...func,
        date: func.date ? new Date(func.date) : null
      }))
    }

    const result = await db.collection('planillas').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Planilla no encontrada' })
    }

    if (result.modifiedCount === 0) {
      return res.status(200).json({ success: true, message: 'No se realizaron cambios en la planilla' })
    }

    res.status(200).json({ success: true, message: 'Planilla actualizada correctamente' })
  } catch (error) {
    console.error('Error updating planilla:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor al actualizar la planilla', error: error.message })
  }
}