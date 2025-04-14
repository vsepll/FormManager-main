import { MongoClient } from 'mongodb'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Log connection attempt (without password)
    const uri = process.env.MONGODB_URI!
    console.log('Connecting to:', uri.replace(/:([^@]+)@/, ':****@'))

    const client = await MongoClient.connect(uri)
    const db = client.db('forms')  // use 'forms' database

    // Test by accessing planillas collection
    const planillasCollection = db.collection('planillas')
    const count = await planillasCollection.countDocuments()

    await client.close()

    return res.status(200).json({
      success: true,
      database: 'forms',
      planillasCount: count,
      message: 'Successfully connected to forms database'
    })

  } catch (error) {
    console.error('Connection error:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
} 