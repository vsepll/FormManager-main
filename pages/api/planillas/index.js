import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('planillas')

    switch (req.method) {
      case 'GET':
        await handleGet(req, res, collection)
        break
      case 'POST':
        await handlePost(req, res, collection)
        break
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('Error in planillas API:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

async function handleGet(req, res, collection) {
  const { page = 1, limit = 10 } = req.query
  const pageNumber = parseInt(page)
  const limitNumber = parseInt(limit)
  const skip = (pageNumber - 1) * limitNumber

  const planillas = await collection
    .find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber)
    .toArray()

  const total = await collection.countDocuments()

  res.status(200).json({
    planillas,
    total,
    page: pageNumber,
    totalPages: Math.ceil(total / limitNumber)
  })
}

async function handlePost(req, res, collection) {
  const newPlanilla = {
    ...req.body,
    createdAt: new Date(),
  }

  if (!newPlanilla.eventName) {
    return res.status(400).json({ error: 'El nombre del evento es requerido' })
  }

  const result = await collection.insertOne(newPlanilla)

  if (!result.acknowledged) {
    throw new Error('No se pudo crear la planilla')
  }

  const createdPlanilla = { ...newPlanilla, _id: result.insertedId }

  res.status(201).json({ planilla: createdPlanilla })
}