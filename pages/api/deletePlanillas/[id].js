import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const { method } = req
  const { id } = req.query

  const { db } = await connectToDatabase()

  switch (method) {
    case 'DELETE':
      try {
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ success: false, message: 'ID inválido' })
        }

        const result = await db.collection('planillas').deleteOne({ _id: new ObjectId(id) })

        if (result.deletedCount === 0) {
          return res.status(404).json({ success: false, message: 'Planilla no encontrada' })
        }

        res.status(200).json({ success: true, message: 'Planilla eliminada correctamente' })
      } catch (error) {
        console.error('Error deleting planilla:', error)
        res.status(500).json({ success: false, message: 'Error al eliminar la planilla' })
      }
      break

    default:
      res.setHeader('Allow', ['DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}