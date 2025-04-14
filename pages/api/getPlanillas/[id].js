import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const { method } = req
  const { id } = req.query

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${method} Not Allowed`)
  }

  try {
    const { db } = await connectToDatabase()

    const planilla = await db.collection('planillas').findOne({ _id: new ObjectId(id) })
    
    if (!planilla) {
      return res.status(404).json({ success: false, error: 'Planilla no encontrada' })
    }

    res.status(200).json({ success: true, data: planilla })
  } catch (error) {
    console.error('Error fetching planilla:', error)
    res.status(500).json({ success: false, error: 'Error al obtener la planilla' })
  }
}