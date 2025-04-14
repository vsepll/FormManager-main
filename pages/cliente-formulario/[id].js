import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import axios from 'axios'
import FormularioCliente from '@/components/cliente-formulario'
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'

export default function ClienteFormularioPage() {
  const router = useRouter()
  const { id } = router.query
  const [formData, setFormData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (id) {
      fetchFormData()
    }
  }, [id])

  const fetchFormData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/getPlanillas/${id}`)
      setFormData(response.data.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching form data:', err)
      setError('Error al cargar los datos del formulario')
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
        <Button
          onClick={() => router.push('/cliente-formulario')}
          className="mt-4"
        >
          Volver a la lista de formularios
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
<div className="flex flex-col items-center justify-center  bg-white p-4">
      <h1 className="text-4xl font-bold mb-8" color="black">Formulario de carga</h1>
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/png-01-uZHWp6bZ16NNUZAqP9DFXViu2LEjmU.png"
        alt="Auto Entrada Logo"
        className="w-32 h-32 object-contain"
      />
    </div>
      {formData ? (
        <FormularioCliente initialData={formData} />
      ) : (
        <p>No se encontraron datos del formulario.</p>
      )}
    </div>
  )
}