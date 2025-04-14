import { MongoClient } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiResponse, res: NextApiResponse) {
  try {
    console.log('Attempting connection...')
    const client = await MongoClient.connect(process.env.MONGODB_URI!)
    await client.db().command({ ping: 1 })
    await client.close()
    
    return res.status(200).json({ message: 'Connection successful!' })
  } catch (error) {
    console.error('Connection error:', error)
    return res.status(500).json({ error: error.message })
  }
} 