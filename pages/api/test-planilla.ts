import { MongoClient } from 'mongodb'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 1. Connect with explicit database name
    const uri = process.env.MONGODB_URI
    if (!uri?.includes('forms')) {
      console.log('Adding database name to URI...')
      const baseUri = uri?.split('?')[0] || ''
      const params = uri?.split('?')[1] || ''
      process.env.MONGODB_URI = `${baseUri}/forms?${params}`
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI!)
    const db = client.db()

    // 2. Create collection if it doesn't exist
    const collections = await db.listCollections().toArray()
    if (!collections.find(c => c.name === 'planillas')) {
      console.log('Creating planillas collection...')
      await db.createCollection('planillas')
      
      // 3. Insert a test document
      await db.collection('planillas').insertOne({
        nombre: 'Test Planilla',
        createdAt: new Date(),
        campos: []
      })
    }

    // 4. Verify setup
    const count = await db.collection('planillas').countDocuments()
    const allCollections = await db.listCollections().toArray()

    await client.close()

    return res.status(200).json({
      success: true,
      message: 'Database setup complete',
      databaseName: db.databaseName,
      collections: allCollections.map(c => c.name),
      planillasCount: count
    })

  } catch (error) {
    console.error('Setup error:', error)
    return res.status(500).json({
      success: false,
      message: 'Database setup failed',
      error: error.message
    })
  }
} 