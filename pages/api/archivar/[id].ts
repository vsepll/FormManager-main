// pages/api/planillas/[id]/archivar.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    try {
      const { db } = await connectToDatabase()
      const { id } = req.query

      const result = await db.collection('planillas').updateOne(
        { _id: new ObjectId(id as string) },
        { $set: { isArchived: true } }
      )

      if (result.modifiedCount === 1) {
        res.status(200).json({ message: 'Planilla archivada correctamente' })
      } else {
        res.status(404).json({ message: 'Planilla no encontrada' })
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al archivar la planilla' })
    }
  } else {
    res.setHeader('Allow', ['PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}