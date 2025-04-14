import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const { method } = req
  const { id } = req.query

  if (method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' })
  }

  try {
    const { db } = await connectToDatabase()
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' })
    }

    const { encargado } = req.body

    if (!encargado) {
      return res.status(400).json({ success: false, message: 'El encargado es requerido' })
    }

    const result = await db.collection('planillas').updateOne(
      { _id: new ObjectId(id) },
      { $set: { encargado } }
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Planilla no encontrada' })
    }

    res.status(200).json({ success: true, message: 'Encargado actualizado correctamente' })
  } catch (error) {
    console.error('Error updating encargado:', error)
    res.status(500).json({ success: false, message: 'Error al actualizar el encargado' })
  }
}