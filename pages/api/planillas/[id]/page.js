import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import axios from 'axios'
import PlanillaForm from '@/components/cliente-formulario'
import { Spinner } from '@/components/ui/spinner'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// This is the client-side component
export default function EditPlanillaPage({ params }) {
  const router = useRouter()
  const { id } = params
  const [planillaData, setPlanillaData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (id) {
      fetchPlanillaData()
    }
  }, [id])

  const fetchPlanillaData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/planillas/${id}`)
      setPlanillaData(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching planilla data:', err)
      setError('Error al cargar los datos de la planilla')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-8">
        <p>{error}</p>
        <button
          onClick={() => router.push('/planillas')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Volver a la lista de planillas
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Editar Planilla</h1>
      {planillaData && <PlanillaForm initialData={planillaData} />}
    </div>
  )
}

// This is the server-side API route
export async function GET(request, { params }) {
  const { id } = params

  try {
    const { db } = await connectToDatabase()
    const planilla = await db.collection('planillas').findOne({ _id: new ObjectId(String(id)) })
    
    if (!planilla) {
      return new Response(JSON.stringify({ success: false, error: 'Planilla no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    return new Response(JSON.stringify(planilla), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function PUT(request, { params }) {
  const { id } = params
  const body = await request.json()

  try {
    const { db } = await connectToDatabase()
    const result = await db.collection('planillas').updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    )
    
    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Planilla no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function DELETE(request, { params }) {
  const { id } = params

  try {
    const { db } = await connectToDatabase()
    const result = await db.collection('planillas').deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Planilla no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    return new Response(JSON.stringify({ success: true, data: {} }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}