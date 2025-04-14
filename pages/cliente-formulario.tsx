import React from 'react'
import FormularioCliente from '@/components/cliente-formulario'

export default function FormularioClientePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Formulario del Cliente</h1>
      <FormularioCliente />
    </div>
  )
}