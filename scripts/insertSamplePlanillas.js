require('dotenv').config({ path: '.env.local' })
const { MongoClient } = require('mongodb')

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('MONGODB_URI is not set in .env.local file')
  process.exit(1)
}

const client = new MongoClient(uri)

async function run() {
  try {
    await client.connect()
    console.log('Connected successfully to server')
    
    const database = client.db()
    const planillas = database.collection('planillas')
    
    const samplePlanillas = [
      {
        eventName: "Concierto de Rock",
        venue: "Estadio Nacional",
        eventDate: new Date("2024-06-15"),
        eventTime: "20:00",
        duration: "3 hours",
        sectors: [
          { type: "general", name: "General", capacity: 5000, price: 50 },
          { type: "numbered", name: "VIP", rows: 20, seats: 50, price: 100 }
        ],
        salesMethods: {
          onlineOnly: true,
          onlineAndPhysical: false,
          physicalOnly: false
        },
        minorsAllowed: true,
        minorsAgeLimit: "16"
      },
      {
        eventName: "Festival de Jazz",
        venue: "Parque Central",
        eventDate: new Date("2024-07-20"),
        eventTime: "18:00",
        duration: "6 hours",
        sectors: [
          { type: "general", name: "Entrada General", capacity: 2000, price: 30 },
          { type: "general", name: "Zona VIP", capacity: 500, price: 80 }
        ],
        salesMethods: {
          onlineOnly: false,
          onlineAndPhysical: true,
          physicalOnly: false
        },
        minorsAllowed: false
      }
    ]
    
    const result = await planillas.insertMany(samplePlanillas)
    console.log(`${result.insertedCount} planillas were inserted`)
    
    const count = await planillas.countDocuments()
    console.log(`Total number of planillas: ${count}`)
    
  } finally {
    await client.close()
  }
}

run().catch(console.dir)