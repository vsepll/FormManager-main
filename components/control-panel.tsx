import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Link, Trash2, Eye, Plus, Archive, RotateCcw } from 'lucide-react'
import { Spinner } from "@/components/ui/spinner"
import toast, { Toaster } from 'react-hot-toast'
import { format } from 'date-fns'
import axios from 'axios'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"

interface Planilla {
  _id: string
  commercialAgreement: {
    percentage1: number
    percentage2: number
    percentage3: number
  }
  eventName: string
  venue: string
  eventDate: Date | undefined
  eventTime: string
  duration: string
  functions: Array<{
    date: Date | undefined
    time: string
  }>
  sectors: Array<{
    type: "general" | "numbered"
    name: string
    capacity?: number
    rows?: number
    seats?: number
    price: number
  }>
  discounts: Array<{
    sectors: string
    percentage: number
    validity: {
      from: Date | undefined
      to: Date | undefined
    }
  }>
  extraData: string
  salesMethods: {
    onlineOnly: boolean
    onlineAndPhysical: boolean
    physicalOnly: boolean
  }
  minorsAllowed: boolean
  minorsAgeLimit: string
  pointsOfSale: Array<{
    location: string
    dateRange: {
      from: Date | undefined
      to: Date | undefined
    }
    hasStaff: boolean
  }>
  showAccreditations: boolean
  accreditations: {
    onlineOnly: boolean
    onlineAndPhysical: boolean
    physicalOnly: boolean
  }
  accreditationSectors: Array<{ name: string; capacity?: number }>
  deliveryPoints: Array<{
    location: string
    dateRange: {
      from: Date | undefined
      to: Date | undefined
    }
    hasStaff: boolean
  }>
  showAccessControl: boolean
  accessControl: {
    entry: boolean
    entryAndExit: boolean
  }
  doorCount?: number
  simultaneousSale: boolean
  hasAccessControlStaff: boolean
  billing: {
    enabled: boolean
    businessName: string
    taxId: string
  }
  collectionAccount: string
  productionData: {
    supervisorEmail: string
    responsibleName: string
    responsiblePhone: string
  }
  encargado: string
  createdAt: string
  isArchived: boolean
}

export default function ControlPanel() {
  const [planillas, setPlanillas] = useState<Planilla[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showArchived, setShowArchived] = useState(false)
  const router = useRouter()
  const itemsPerPage = 10

  useEffect(() => {
    fetchPlanillas()
  }, [currentPage, showArchived])

  const fetchPlanillas = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/planillas?page=${currentPage}&limit=${itemsPerPage}&showArchived=${showArchived}`)
      if (!response.ok) {
        throw new Error('Failed to fetch planillas')
      }
      const data = await response.json()
      setPlanillas(data.planillas)
      setTotalPages(Math.ceil(data.total / itemsPerPage))
    } catch (error) {
      console.error('Error fetching planillas:', error)
      toast.error("No se pudieron cargar las planillas")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePlanilla = async () => {
    try {
      setIsLoading(true)
  
      const newPlanilla = {
        commercialAgreement: {
          percentage1: 0,
          percentage2: 0,
          percentage3: 0,
        },
        eventName: 'Nueva Planilla',
        venue: '',
        eventDate: null,
        eventTime: '',
        duration: '',
        functions: [{ date: null, time: '' }],
        sectors: [{ type: 'general', name: '', capacity: null, price: 0 }],
        discounts: [{ sectors: '', percentage: 0, validity: { from: null, to: null } }],
        extraData: '',
        salesMethods: {
          onlineOnly: false,
          onlineAndPhysical: false,
          physicalOnly: false,
        },
        minorsAllowed: false,
        minorsAgeLimit: '',
        pointsOfSale: [{ location: '', dateRange: { from: null, to: null }, hasStaff: false }],
        showAccreditations: false,
        accreditations: {
          onlineOnly: false,
          onlineAndPhysical: false,
          physicalOnly: false,
        },
        accreditationSectors: [{ name: '', capacity: null }],
        deliveryPoints: [{ location: '', dateRange: { from: null, to: null }, hasStaff: false }],
        showAccessControl: false,
        accessControl: {
          entry: false,
          entryAndExit: false,
        },
        doorCount: null,
        simultaneousSale: false,
        hasAccessControlStaff: false,
        billing: {
          enabled: false,
          businessName: '',
          taxId: '',
        },
        collectionAccount: '',
        productionData: {
          supervisorEmail: '',
          responsibleName: '',
          responsiblePhone: '',
        },
        encargado: '',
        createdAt: new Date(),
        isArchived: false,
      }
  
      const response = await fetch('/api/planillas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlanilla),
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }
  
      const result = await response.json()
      
      if (!result.planilla || typeof result.planilla !== 'object') {
        throw new Error('La respuesta del servidor no contiene una planilla válida')
      }
  
      const createdPlanilla = result.planilla
  
      setPlanillas(prevPlanillas => [createdPlanilla, ...prevPlanillas])
  
      toast.success("Se ha creado una nueva planilla en blanco")
      console.log('Planilla creada:', createdPlanilla)
  
    } catch (error) {
      console.error('Error creating planilla:', error)
      toast.error(`No se pudo crear la planilla: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const planillaToDelete = planillas.find(p => p._id === id)
    if (!planillaToDelete || !planillaToDelete.isArchived) {
      toast.error("Solo se pueden eliminar planillas archivadas")
      return
    }

    if (window.confirm('¿Estás seguro de que quieres eliminar esta planilla archivada?')) {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/deletePlanillas/${id}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          throw new Error('Failed to delete planilla')
        }
        toast.success("La planilla ha sido eliminada")
        setPlanillas(prevPlanillas => prevPlanillas.filter(planilla => planilla._id !== id))
      } catch (error) {
        console.error('Error deleting planilla:', error)
        toast.error("No se pudo eliminar la planilla")
      } finally {
        setIsLoading(false)
      }
    }
  }
  
  const handleDownload = async (id: string) => {
    const downloadFile = async (type: 'pdf' | 'excel') => {
      const fileExtension = type === 'excel' ? 'xlsx' : 'pdf';
      const fileName = `planilla_${id}.${fileExtension}`;
  
      try {
        toast.loading(`Descargando ${type.toUpperCase()}...`);
  
        const response = await axios.get(`/api/planillas/${id}/downloads?type=${type}`, {
          responseType: 'blob',
        });
  
        if (response.data.size === 0) {
          throw new Error(`El archivo ${type.toUpperCase()} descargado está vacío`);
        }
  
        const blob = new Blob([response.data], { 
          type: type === 'excel' 
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            : 'application/pdf' 
        });
  
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
  
        toast.dismiss();
        toast.success(`${type.toUpperCase()} descargado correctamente`);
      } catch (error) {
        console.error(`Error downloading ${type}:`, error);
        toast.dismiss();
        if (axios.isAxiosError(error) && error.response) {
          toast.error(`Error al descargar ${type.toUpperCase()}: ${error.response.data.message || 'Revise la planilla'}`);
        } else {
          toast.error(`Error al descargar ${type.toUpperCase()}: ${(error as Error).message || 'Error desconocido'}`);
        }
      }
    };
  
    // Download PDF
    await downloadFile('pdf');
    
    // Download Excel
    await downloadFile('excel');
  };

  const handleShare = (id: string) => {
    const currentURL = window.location.origin
    const shareURL = `${currentURL}/cliente-formulario/${id}`
   
    navigator.clipboard.writeText(shareURL)
      .then(() => {
        console.log('URL copiada:', shareURL)
        toast.success("Enlace copiado al portapapeles")
      })
      .catch((err) => {
        console.error('Error al copiar el enlace:', err)
        toast.error("Error al copiar el enlace")
      })
  }

  const handleEncargadoChange = async (id: string, encargado: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/encargados/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ encargado }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update encargado')
      }
      const data = await response.json()
      toast.success(data.message || "Encargado actualizado correctamente")
      setPlanillas(prevPlanillas => 
        prevPlanillas.map(planilla => 
          planilla._id === id ? { ...planilla, encargado } : planilla
        )
      )
    } catch (error) {
      console.error('Error updating encargado:', error)
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el encargado")
    } finally {
      setIsLoading(false)
    }
  }

  const handleView = (id: string) => {
    router.push(`/cliente-formulario/${id}`)
  }

  const handleArchive = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/archivar/${id}`, {
        method: 'PUT',
      })
      if (!response.ok) {
        throw new Error('Failed to archive planilla')
      }
      toast.success("La planilla ha sido archivada")
      if (!showArchived) {
        setPlanillas(prevPlanillas => prevPlanillas.filter(planilla => planilla._id !== id))
      } else {
        setPlanillas(prevPlanillas => 
          prevPlanillas.map(planilla => 
            planilla._id === id ? { ...planilla, isArchived: true } : planilla
          )
        )
      }
    } catch (error) {
      console.error('Error archiving planilla:', error)
      toast.error("No se pudo archivar la planilla")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnarchive = async (id: string) => {
    try {
      setIsLoading(true)
        const response = await fetch(`/api/desarchivar/${id}`, {
        method: 'PUT',
      })
      if (!response.ok) {
        throw new Error('Failed to unarchive planilla')
      }
      toast.success("La planilla ha sido desarchivada")
      setPlanillas(prevPlanillas => 
        prevPlanillas.map(planilla => 
          planilla._id === id ? { ...planilla, isArchived: false } : planilla
        )
      )
    } catch (error) {
      console.error('Error unarchiving planilla:', error)
      toast.error("No se pudo desarchivar la planilla")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPlanillas = showArchived ? planillas : planillas.filter(planilla => !planilla.isArchived)

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      <h1 className="text-4xl font-bold mb-2">Panel de control</h1>
      <p className="text-xl text-gray-600 mb-8">Administre las planillas de carga</p>

      <div className="flex justify-between items-center mb-6">
        <Button className="flex items-center gap-2" onClick={handleCreatePlanilla} disabled={isLoading}>
          <Plus size={20} />
          Crea una nueva planilla
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={showArchived}
              onCheckedChange={setShowArchived}
              id="show-archived"
            />
            <label htmlFor="show-archived" className="text-sm font-medium">
              Mostrar archivadas
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Eye size={20} />
            <span className="font-semibold">Admin</span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-32">
          <Spinner className="text-primary" />
        </div>
      )}

      {!isLoading && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {filteredPlanillas.map((planilla) => (
            <Card key={planilla._id} className={`flex flex-col ${planilla.isArchived ? 'opacity-50' : ''}`}>
              <CardContent className="flex-grow p-6">
                <h2 className="text-lg font-semibold mb-2">{planilla.eventName}</h2>
                <p className="text-gray-600 mb-2">Encargado: {planilla.encargado}</p>
                <p className="text-gray-600 mb-2">Lugar: {planilla.venue}</p>
                <p className="text-gray-600 mb-2">Fecha: {format(new Date(planilla.createdAt), 'dd/MM/yyyy')}</p>
                {planilla.isArchived && <p className="text-yellow-600 font-semibold">Archivada</p>}
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <Select onValueChange={(value) => handleEncargadoChange(planilla._id, value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={planilla.encargado || "Seleccionar encargado"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Miguel">Miguel</SelectItem>
                    <SelectItem value="Caro">Caro</SelectItem>
                    <SelectItem value="Mari">Mari</SelectItem>
                    <SelectItem value="Sofia">Sofia</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleDownload(planilla._id)}>
                    <Download size={20} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleShare(planilla._id)}>
                    <Link size={20} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleView(planilla._id)}>
                    <Eye size={20} />
                  </Button>
                  {planilla.isArchived ? (
                    <Button variant="outline" size="icon" onClick={() => handleUnarchive(planilla._id)}>
                      <RotateCcw size={20} />
                    </Button>
                  ) : (
                    <Button variant="outline" size="icon" onClick={() => handleArchive(planilla._id)}>
                      <Archive size={20} />
                    </Button>
                  )}
                  {planilla.isArchived && (
                    <Button variant="outline" size="icon" onClick={() => handleDelete(planilla._id)}>
                      <Trash2 size={20} />
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-center items-center gap-2">
        {[...Array(Math.min(5, totalPages))].map((_, index) => (
          <Button
            key={index}
            variant={currentPage === index + 1 ? "default" : "outline"}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </Button>
        ))}
        {totalPages > 5 && (
          <>
            <span>...</span>
            <Button variant="outline" onClick={() => setCurrentPage(totalPages - 1)}>{totalPages - 1}</Button>
            <Button variant="outline" onClick={() => setCurrentPage(totalPages)}>{totalPages}</Button>
          </>
        )}
      </div>
    </div>
  )
}