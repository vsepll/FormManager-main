require('dotenv').config({ path: '.env.local' })
const { MongoClient, ObjectId } = require('mongodb')

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('MONGODB_URI is not set in .env.local file')
  process.exit(1)
}

console.log('MONGODB_URI:', uri) // Log the URI for debugging (remove in production)

const client = new MongoClient(uri)

async function run() {
  try {
    await client.connect()
    console.log('Connected successfully to server')
    
    const database = client.db()
    const planillas = database.collection('planillas')
    
    // Contar documentos
    const count = await planillas.countDocuments()
    console.log(`Number of planillas: ${count}`)
    
    // Obtener una muestra de planillas
    const sample = await planillas.find().limit(5).toArray()
    console.log('Sample planillas:')
    sample.forEach(planilla => {
      console.log(`ID: ${planilla._id}, Event Name: ${planilla.eventName}`)
    })
    
    // Intentar obtener una planilla específica
    const specificId = '66fd792116951959e35425cb' // Reemplaza con un ID real de tu base de datos
    const specificPlanilla = await planillas.findOne({ _id: new ObjectId(specificId) })
    if (specificPlanilla) {
      console.log(`Found specific planilla: ${JSON.stringify(specificPlanilla)}`)
    } else {
      console.log(`No planilla found with ID: ${specificId}`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.close()
  }
}

run().catch(console.dir)