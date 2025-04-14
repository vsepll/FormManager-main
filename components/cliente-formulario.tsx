import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Trash2, Upload } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { toast } from "react-hot-toast"

type SectorType = "general" | "numbered"

interface Sector {
  type: SectorType
  name: string
  capacity?: number
  rows?: number
  seats?: number
  price: number
}

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface PointOfSale {
  location: string
  dateRange: DateRange
  hasStaff: boolean
}

interface DeliveryPoint {
  location: string
  dateRange: DateRange
  hasStaff: boolean
}

interface Discount {
  sectors: string
  percentage: number
  validity: DateRange
}

interface Function {
  date: Date | undefined
  endDate: Date | undefined
  time: string
}

interface PlanillaFormProps {
  initialData?: any
}

export default function PlanillaForm({ initialData }: PlanillaFormProps) {
  const router = useRouter()
  const { id } = router.query

  const [formData, setFormData] = useState({
    commercialAgreement: {
      percentage1: 0,
      percentage2: 0,
      percentage3: 0,
    },
    eventName: "",
    venue: "",
    eventDate: undefined as Date | undefined,
    eventTime: "",
    duration: "",
    functions: [{ date: undefined, endDate: undefined, time: "" }] as Function[],
    sectors: [{ type: "general" as SectorType, name: "", capacity: undefined, price: 0 }] as Sector[],
    discounts: [{ sectors: "", percentage: 0, validity: { from: undefined, to: undefined } }] as Discount[],
    extraData: "",
    salesMethods: {
      onlineOnly: false,
      onlineAndPhysical: false,
      physicalOnly: false,
    },
    minorsAllowed: false,
    minorsAgeLimit: "",
    pointsOfSale: [{ location: "", dateRange: { from: undefined, to: undefined }, hasStaff: false }] as PointOfSale[],
    showAccreditations: false,
    accreditations: {
      onlineOnly: false,
      onlineAndPhysical: false,
      physicalOnly: false,
    },
    accreditationSectors: [{ name: "", capacity: undefined }],
    deliveryPoints: [{ location: "", dateRange: { from: undefined, to: undefined }, hasStaff: false }] as DeliveryPoint[],
    showAccessControl: false,
    accessControl: {
      entry: false,
      entryAndExit: false,
    },
    doorCount: undefined as number | undefined,
    simultaneousSale: false,
    hasAccessControlStaff: false,
    billing: {
      enabled: false,
      businessName: "",
      taxId: "",
    },
    collectionAccount: {
      type: "propia",
      details: "",
      merchantNumber: "",
    },
    productionData: {
      supervisorEmail: "",
      responsibleName: "",
      responsiblePhone: "",
    },
    excelFileUrl: '',
    isArchived: false,
    serviceChargeIncluded: false,
    paymentMethodIncluded: false,
  })
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isUpdated, setIsUpdated] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData(prevData => ({
        ...prevData,
        ...initialData,
        eventDate: initialData.eventDate ? new Date(initialData.eventDate) : undefined,
        functions: initialData.functions.map((func: any) => ({
          ...func,
          date: func.date ? new Date(func.date) : undefined,
          endDate: func.endDate ? new Date(func.endDate) : undefined,
        })),
        discounts: initialData.discounts.map((discount: any) => ({
          ...discount,
          validity: {
            from: discount.validity.from ? new Date(discount.validity.from) : undefined,
            to: discount.validity.to ? new Date(discount.validity.to) : undefined,
          },
        })),
        pointsOfSale: initialData.pointsOfSale.map((point: any) => ({
          ...point,
          dateRange: {
            from: point.dateRange.from ? new Date(point.dateRange.from) : undefined,
            to: point.dateRange.to ? new Date(point.dateRange.to) : undefined,
          },
        })),
        deliveryPoints: initialData.deliveryPoints.map((point: any) => ({
          ...point,
          dateRange: {
            from: point.dateRange.from ? new Date(point.dateRange.from) : undefined,
            to: point.dateRange.to ? new Date(point.dateRange.to) : undefined,
          },
        })),
      }))
    }
  }, [initialData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string) => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const handleCheckboxChange = (section: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [name]: !prev[section][name] },
    }))
  }

  const addSector = () => {
    setFormData((prev) => ({
      ...prev,
      sectors: [...prev.sectors, { type: "general", name: "", capacity: undefined, price: 0 }],
    }))
  }

  const removeSector = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sectors: prev.sectors.filter((_, i) => i !== index),
    }))
  }

  const addAccreditationSector = () => {
    setFormData((prev) => ({
      ...prev,
      accreditationSectors: [...prev.accreditationSectors, { name: "", capacity: undefined }],
    }))
  }

  const removeAccreditationSector = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      accreditationSectors: prev.accreditationSectors.filter((_, i) => i !== index),
    }))
  }

  const addPointOfSale = () => {
    setFormData((prev) => ({
      ...prev,
      pointsOfSale: [...prev.pointsOfSale, { location: "", dateRange: { from: undefined, to: undefined }, hasStaff: false }],
    }))
  }

  const removePointOfSale = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      pointsOfSale: prev.pointsOfSale.filter((_, i) => i !== index),
    }))
  }

  const addDeliveryPoint = () => {
    setFormData((prev) => ({
      ...prev,
      deliveryPoints: [...prev.deliveryPoints, { location: "", dateRange: { from: undefined, to: undefined }, hasStaff: false }],
    }))
  }

  const removeDeliveryPoint = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      deliveryPoints: prev.deliveryPoints.filter((_, i) => i !== index),
    }))
  }

  const addFunction = () => {
    setFormData((prev) => ({
      ...prev,
      functions: [...prev.functions, { date: undefined, endDate: undefined, time: "" }],
    }))
  }

  const removeFunction = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      functions: prev.functions.filter((_, i) => i !== index),
    }))
  }

  const addDiscount = () => {
    setFormData((prev) => ({
      ...prev,
      discounts: [...prev.discounts, { sectors: "", percentage: 0, validity: { from: undefined, to: undefined } }],
    }))
  }

  const removeDiscount = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      discounts: prev.discounts.filter((_, i) => i !== index),
    }))
  }

  const calculateTotalPercentage = () => {
    const { percentage1, percentage2 } = formData.commercialAgreement
    let totalPercentage = percentage2 // Always include service charge percentage

    if (!formData.paymentMethodIncluded) {
      totalPercentage += percentage1 // Add payment method percentage if not included
    }

    return totalPercentage / 100
  }

  const calculateAdditionalPrice = (price: number) => {
    const { percentage1, percentage2, percentage3 } = formData.commercialAgreement
    const totalPercentage = calculateTotalPercentage()
    let additionalPrice: number

    if (formData.serviceChargeIncluded) {
      // If service charge is included, calculate the base price
      const basePrice = (price - percentage3) / (1 + totalPercentage)
      additionalPrice = price - basePrice
    } else {
      // If service charge is not included, calculate the additional amount
      additionalPrice = price * totalPercentage + percentage3
    }

    // Round to 2 decimal places
    return Number(additionalPrice.toFixed(2))
  }

  const showPointsOfSale = formData.salesMethods.onlineAndPhysical || formData.salesMethods.physicalOnly
  const showDeliveryPoints = formData.showAccreditations && !(formData.salesMethods.onlineOnly || formData.salesMethods.physicalOnly)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted"); // Debugging line
    try {
      let fileUrl = formData.excelFileUrl

      if (excelFile) {
        fileUrl = await handleFileSubmit()
      }

      const dataToSend = {
        ...formData,
        excelFileUrl: fileUrl,
      }

      if (initialData && initialData._id) {
        await axios.put(`/api/updatePlanillas/${initialData._id}`, dataToSend);

      } else {
        await axios.post("/api/planillas", dataToSend)

      }

      // Mostrar mensaje de confirmación
      setIsUpdated(true)

      // Ocultar mensaje después de unos segundos, si lo deseas
      setTimeout(() => setIsUpdated(false), 3000)
    } catch (error) {
      console.error("Error al guardar la planilla:", error)
      toast.error("Error al guardar la planilla")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setExcelFile(e.target.files[0])
    }
  }

  const handleFileSubmit = async () => {
    if (!excelFile) {
      toast.error("Por favor, seleccione un archivo Excel")
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', excelFile)

    try {
      const response = await axios.post('/api/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setFormData(prev => ({ ...prev, excelFileUrl: response.data.fileUrl }))
      toast.success("Archivo subido exitosamente")
      return response.data.fileUrl
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error("Error al subir el archivo")
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold text-center">
          {initialData ? "Editar Planilla" : "Nueva Planilla"}
        </h1>
        <p className="text-center text-gray-600">
          Complete los datos y un asesor se contactará a la brevedad
        </p>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Acuerdo comercial</h2>
          <p className="text-left text-gray-600">
          Esto lo completara su asesor
        </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="percentage1">Medios de pago</Label>
              <Input
                id="percentage1"
                type="number"
                value={formData.commercialAgreement.percentage1}
                onChange={(e) => setFormData((prev) => ({
                  ...prev,
                  commercialAgreement: {
                    ...prev.commercialAgreement,
                    percentage1: parseFloat(e.target.value) || 0
                  }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="percentage2">Service charge</Label>
              <Input
                id="percentage2"
                type="number"
                value={formData.commercialAgreement.percentage2}
                onChange={(e) => setFormData((prev) => ({
                  ...prev,
                  commercialAgreement: {
                    ...prev.commercialAgreement,
                    percentage2: parseFloat(e.target.value) || 0
                  }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="percentage3">Service fijo</Label>
              <Input
                id="percentage3"
                type="number"
                value={formData.commercialAgreement.percentage3}
                onChange={(e) => setFormData((prev) => ({
                  ...prev,
                  commercialAgreement: {
                    ...prev.commercialAgreement,
                    percentage3: parseFloat(e.target.value) || 0
                  }
                }))}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              
              id="serviceChargeIncluded"
              checked={formData.serviceChargeIncluded}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, serviceChargeIncluded: checked }))}
            />
            <Label htmlFor="serviceChargeIncluded">
              {formData.serviceChargeIncluded ? "Service charge incluido en el precio" : "Service charge adicional al precio"}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="paymentMethodIncluded"
              checked={formData.paymentMethodIncluded}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, paymentMethodIncluded: checked }))}
            />
            <Label htmlFor="paymentMethodIncluded">
              {formData.paymentMethodIncluded ? "Medio de pago a cargo del productor" : "Medio de pago incluido en el precio"}
            </Label>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Datos del evento</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="eventName">Nombre del evento</Label>
              <Input
                id="eventName"
                name="eventName"
                value={formData.eventName}
                onChange={handleInputChange}
                placeholder="Ingrese el nombre del evento"
              />
            </div>
            <div>
              <Label htmlFor="venue">Sala o dirección</Label>
              <Input
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                placeholder="Ingrese la sala o dirección"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="eventDate">Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {formData.eventDate ? format(formData.eventDate, "PPP") : "Fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.eventDate}
                    onSelect={(date) => setFormData((prev) => ({ ...prev, eventDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="eventTime">Horario</Label>
              <Input
                id="eventTime"
                name="eventTime"
                type="time"
                value={formData.eventTime}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="duration">Duración</Label>
              <Input
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="Duración"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Funciones</h2>
          {formData.functions.map((func, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="flex-grow grid grid-cols-3 gap-4">
                <div>
                  <Label>Desde</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        {func.date ? format(func.date, "PPP") : "Fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={func.date}
                        onSelect={(date) => {
                          const newFunctions = [...formData.functions]
                          newFunctions[index].date = date
                          setFormData((prev) => ({ ...prev, functions: newFunctions }))
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Hasta</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        {func.endDate ? format(func.endDate, "PPP") : "Fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={func.endDate}
                        onSelect={(date) => {
                          const newFunctions = [...formData.functions]
                          newFunctions[index].endDate = date
                          setFormData((prev) => ({ ...prev, functions: newFunctions }))
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Horario</Label>
                  <Input
                    type="time"
                    value={func.time}
                    onChange={(e) => {
                      const newFunctions = [...formData.functions]
                      newFunctions[index].time = e.target.value
                      setFormData((prev) => ({ ...prev, functions: newFunctions }))
                    }}
                  />
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeFunction(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button onClick={addFunction} variant="outline" className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" /> Agregar función
          </Button>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Aforo</h2>
          {formData.sectors.map((sector, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={sector.type === "numbered"}
                  onCheckedChange={() => {
                    const newSectors = [...formData.sectors]
                    newSectors[index].type = sector.type === "general" ? "numbered" : "general"
                    setFormData((prev) => ({ ...prev, sectors: newSectors }))
                  }}
                />
                <Label>{sector.type === "general" ? "General" : "Numerado"}</Label>
              </div>
              <div className="grid grid-cols-12 gap-4 items-center">
                <Input
                  className="col-span-4"
                  placeholder="Nombre del sector"
                  value={sector.name}
                  onChange={(e) => {
                    const newSectors = [...formData.sectors]
                    newSectors[index].name = e.target.value
                    setFormData((prev) => ({ ...prev, sectors: newSectors }))
                  }}
                />
                {sector.type === "general" ? (
                  <Input
                    className="col-span-2"
                    type="number"
                    placeholder="Capacidad"
                    value={sector.capacity}
                    onChange={(e) => {
                      const newSectors = [...formData.sectors]
                      newSectors[index].capacity = e.target.value ? parseInt(e.target.value) : undefined
                      setFormData((prev) => ({ ...prev, sectors: newSectors }))
                    }}
                  />
                ) : (
                  <>
                    <Input
                      className="col-span-1"
                      type="number"
                      placeholder="Filas"
                      value={sector.rows}
                      onChange={(e) => {
                        const newSectors = [...formData.sectors]
                        newSectors[index].rows = e.target.value ? parseInt(e.target.value) : undefined
                        setFormData((prev) => ({ ...prev, sectors: newSectors }))
                      }}
                    />
                    <Input
                      className="col-span-1"
                      type="number"
                      placeholder="Butacas"
                      value={sector.seats}
                      onChange={(e) => {
                        const newSectors = [...formData.sectors]
                        newSectors[index].seats = e.target.value ? parseInt(e.target.value) : undefined
                        setFormData((prev) => ({ ...prev, sectors: newSectors }))
                      }}
                    />
                  </>
                )}
                <div className="col-span-4 flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Precio"
                    value={sector.price}
                    onChange={(e) => {
                      const newSectors = [...formData.sectors]
                      newSectors[index].price = e.target.value ? parseFloat(e.target.value) : 0
                      setFormData((prev) => ({ ...prev, sectors: newSectors }))
                    }}
                  />
                  <span className="text-sm font-medium whitespace-nowrap">
                    {formData.serviceChargeIncluded ? 'Incluye' : '+'} {calculateAdditionalPrice(sector.price)}
                  </span>
                </div>
                <Button className="col-span-1" variant="ghost" size="icon" onClick={() => removeSector(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button onClick={addSector} variant="outline" className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" /> Agregar sector
          </Button>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Descuentos</h2>
          {formData.discounts.map((discount, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 items-center">
              <Input
                placeholder="Sectores"
                value={discount.sectors}
                onChange={(e) => {
                  const newDiscounts = [...formData.discounts]
                  newDiscounts[index].sectors = e.target.value
                  setFormData((prev) => ({ ...prev, discounts: newDiscounts }))
                }}
              />
              <Input
                type="number"
                placeholder="Porcentaje"
                value={discount.percentage}
                onChange={(e) => {
                  const newDiscounts = [...formData.discounts]
                  newDiscounts[index].percentage = e.target.value ? parseInt(e.target.value) : 0
                  setFormData((prev) => ({ ...prev, discounts: newDiscounts }))
                }}
              />
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      {discount.validity.from ? format(discount.validity.from, "dd/MM/yyyy") : "Desde"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={discount.validity.from}
                      onSelect={(date) => {
                        const newDiscounts = [...formData.discounts]
                        newDiscounts[index].validity.from = date
                        setFormData((prev) => ({ ...prev, discounts: newDiscounts }))
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      {discount.validity.to ? format(discount.validity.to, "dd/MM/yyyy") : "Hasta"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={discount.validity.to}
                      onSelect={(date) => {
                        const newDiscounts = [...formData.discounts]
                        newDiscounts[index].validity.to = date
                        setFormData((prev) => ({ ...prev, discounts: newDiscounts }))
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeDiscount(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button onClick={addDiscount} variant="outline" className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" /> Agregar descuento
          </Button>
        </div>

        <div className="space-y-4">
          <Label htmlFor="extraData">Datos extra (Bloqueos, Pedidos especiales, sectores con preventa, etc.)</Label>
          <Textarea
            id="extraData"
            name="extraData"
            value={formData.extraData}
            onChange={handleInputChange}
            placeholder="Ingrese datos adicionales"
          />
        </div>

        <div className="space-y-4">
          <Label htmlFor="excelUpload">Cargar excel del mapa</Label>
          <div className="flex items-center space-x-4">
            <Input
              id="excelUpload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="w-full"
            />
            <Button type="button" onClick={() => document.getElementById('excelUpload')?.click()}>
              <Upload className="mr-2 h-4 w-4" /> Subir Excel
            </Button>
          </div>
          {excelFile && (
            <p className="text-sm text-green-600">Archivo seleccionado: {excelFile.name}</p>
          )}
          {formData.excelFileUrl && (
            <p className="text-sm text-blue-600">Archivo actual: {formData.excelFileUrl}</p>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Modalidad de ventas</h2>
          <div className="flex space-x-4">
            <Checkbox
              id="onlineOnly"
              checked={formData.salesMethods.onlineOnly}
              onCheckedChange={() => handleCheckboxChange("salesMethods", "onlineOnly")}
            />
            <Label htmlFor="onlineOnly">Solo Online</Label>
          </div>
          <div className="flex space-x-4">
            <Checkbox
              id="onlineAndPhysical"
              checked={formData.salesMethods.onlineAndPhysical}
              onCheckedChange={() => handleCheckboxChange("salesMethods", "onlineAndPhysical")}
            />
            <Label htmlFor="onlineAndPhysical">Online + físicos</Label>
          </div>
          <div className="flex space-x-4">
            <Checkbox
              id="physicalOnly"
              checked={formData.salesMethods.physicalOnly}
              onCheckedChange={() => handleCheckboxChange("salesMethods", "physicalOnly")}
            />
            <Label htmlFor="physicalOnly">Físicos</Label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="minorsAllowed"
              checked={formData.minorsAllowed}
              onCheckedChange={(checked) => { // @ts-ignore
                setFormData((prev) => ({ ...prev, minorsAllowed: checked }))
              }}
            />
            <Label htmlFor="minorsAllowed">Menores de edad pagan</Label>
          </div>
          {formData.minorsAllowed && (
            <div className="flex items-center space-x-2">
              <Label htmlFor="minorsAgeLimit">Desde edad:</Label>
              <Input
                id="minorsAgeLimit"
                name="minorsAgeLimit"
                type="number"
                value={formData.minorsAgeLimit}
                onChange={handleInputChange}
                placeholder="Ingrese la edad"
                className="w-24"
              />
            </div>
          )}
        </div>

        {showPointsOfSale && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Puntos de venta</h2>
            {formData.pointsOfSale.map((point,index) => (
              <div key={index} className="grid grid-cols-3 gap-4 items-center">
                <div>
                  <Input
                    placeholder="Ubicación del punto de venta"
                    value={point.location}
                    onChange={(e) => {
                      const newPoints = [...formData.pointsOfSale]
                      newPoints[index].location = e.target.value
                      setFormData((prev) => ({ ...prev, pointsOfSale: newPoints }))
                    }}
                  />
                </div>
                <div className="flex space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        {point.dateRange.from ? format(point.dateRange.from, "dd/MM/yyyy") : "Desde"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={point.dateRange.from}
                        onSelect={(date) => {
                          const newPoints = [...formData.pointsOfSale]
                          newPoints[index].dateRange.from = date
                          setFormData((prev) => ({ ...prev, pointsOfSale: newPoints }))
                          // Automatically open the "hasta" calendar
                          document.getElementById(`hasta-pos-${index}`)?.click()
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button id={`hasta-pos-${index}`} variant="outline">
                        {point.dateRange.to ? format(point.dateRange.to, "dd/MM/yyyy") : "Hasta"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={point.dateRange.to}
                        onSelect={(date) => {
                          const newPoints = [...formData.pointsOfSale]
                          newPoints[index].dateRange.to = date
                          setFormData((prev) => ({ ...prev, pointsOfSale: newPoints }))
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={point.hasStaff}
                    onCheckedChange={() => {
                      const newPoints = [...formData.pointsOfSale]
                      newPoints[index].hasStaff = !newPoints[index].hasStaff
                      setFormData((prev) => ({ ...prev, pointsOfSale: newPoints }))
                    }}
                  />
                  <Label className="whitespace-nowrap">Dispone de personal</Label>
                  <Button variant="ghost" size="icon" onClick={() => removePointOfSale(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button onClick={addPointOfSale} variant="outline" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar punto de venta
            </Button>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center space-x-2"  >
          </div>

          {formData.showAccreditations && (
            <>
              <h2 className="text-xl font-semibold">Acreditaciones</h2>
              <div className="flex space-x-4">
                <Checkbox
                  id="accreditationsOnlineOnly"
                  checked={formData.accreditations.onlineOnly}
                  onCheckedChange={() => handleCheckboxChange("accreditations", "onlineOnly")}
                />
                <Label htmlFor="accreditationsOnlineOnly">Solo Online</Label>
              </div>
              <div className="flex space-x-4">
                <Checkbox
                  id="accreditationsOnlineAndPhysical"
                  checked={formData.accreditations.onlineAndPhysical}
                  onCheckedChange={() => handleCheckboxChange("accreditations", "onlineAndPhysical")}
                />
                <Label htmlFor="accreditationsOnlineAndPhysical">Online + físicos</Label>
              </div>
              <div className="flex space-x-4">
                <Checkbox
                  id="accreditationsPhysicalOnly"
                  checked={formData.accreditations.physicalOnly}
                  onCheckedChange={() => handleCheckboxChange("accreditations", "physicalOnly")}
                />
                <Label htmlFor="accreditationsPhysicalOnly">Físicos</Label>
              </div>

              <h3 className="text-lg font-semibold">Sectores de acreditaciones</h3>
              {formData.accreditationSectors.map((sector, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 items-center">
                  <Input
                    placeholder="Nombre del sector"
                    value={sector.name}
                    onChange={(e) => {
                      const newSectors = [...formData.accreditationSectors]
                      newSectors[index].name = e.target.value
                      setFormData((prev) => ({ ...prev, accreditationSectors: newSectors }))
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Capacidad"
                    value={sector.capacity}
                    onChange={(e) => {
                      const newSectors = [...formData.accreditationSectors] // @ts-ignore
                      newSectors[index].capacity = e.target.value ? parseInt(e.target.value) : undefined // @ts-ignore
                      setFormData((prev) => ({ ...prev, accreditationSectors: newSectors }))
                    }}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeAccreditationSector(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={addAccreditationSector} variant="outline" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Agregar sector de acreditación
              </Button>
            </>
          )}
        </div>

        {showDeliveryPoints && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Puntos de entrega</h2>
            {formData.deliveryPoints.map((point, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 items-center">
                <div>
                  <Input
                    placeholder="Ubicación del punto de entrega"
                    value={point.location}
                    onChange={(e) => {
                      const newPoints = [...formData.deliveryPoints]
                      newPoints[index].location = e.target.value
                      setFormData((prev) => ({ ...prev, deliveryPoints: newPoints }))
                    }}
                  />
                </div>
                <div className="flex space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        {point.dateRange.from ? format(point.dateRange.from, "dd/MM/yyyy") : "Desde"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={point.dateRange.from}
                        onSelect={(date) => {
                          const newPoints = [...formData.deliveryPoints]
                          newPoints[index].dateRange.from = date
                          setFormData((prev) => ({ ...prev, deliveryPoints: newPoints }))
                          // Automatically open the "hasta" calendar
                          document.getElementById(`hasta-dp-${index}`)?.click()
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button id={`hasta-dp-${index}`} variant="outline">
                        {point.dateRange.to ? format(point.dateRange.to, "dd/MM/yyyy") : "Hasta"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={point.dateRange.to}
                        onSelect={(date) => {
                          const newPoints = [...formData.deliveryPoints]
                          newPoints[index].dateRange.to = date
                          setFormData((prev) => ({ ...prev, deliveryPoints: newPoints }))
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={point.hasStaff}
                    onCheckedChange={() => {
                      const newPoints = [...formData.deliveryPoints]
                      newPoints[index].hasStaff = !newPoints[index].hasStaff
                      setFormData((prev) => ({ ...prev, deliveryPoints: newPoints }))
                    }}
                  />
                  <Label className="whitespace-nowrap">Dispone de personal</Label>
                  <Button variant="ghost" size="icon" onClick={() => removeDeliveryPoint(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button onClick={addDeliveryPoint} variant="outline" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar punto de entrega
            </Button>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
          </div>

          {formData.showAccessControl && (
            <>
              <h2 className="text-xl font-semibold">Control de acceso</h2>
              <div className="flex space-x-4">
                <Checkbox
                  id="accessControlEntry"
                  checked={formData.accessControl.entry}
                  onCheckedChange={() => handleCheckboxChange("accessControl", "entry")}
                />
                <Label htmlFor="accessControlEntry">Entrada</Label>
              </div>
              <div className="flex space-x-4">
                <Checkbox
                  id="accessControlEntryAndExit"
                  checked={formData.accessControl.entryAndExit}
                  onCheckedChange={() => handleCheckboxChange("accessControl", "entryAndExit")}
                />
                <Label htmlFor="accessControlEntryAndExit">Entrada y salida</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="doorCount">Cantidad de puertas:</Label>
                <Input
                  id="doorCount"
                  name="doorCount"
                  type="number"
                  value={formData.doorCount}
                  onChange={handleInputChange}
                  placeholder="Ingrese la cantidad de puertas"
                  className="w-24"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="simultaneousSale"
                  checked={formData.simultaneousSale}
                  onCheckedChange={() => handleSwitchChange("simultaneousSale")}
                />
                <Label htmlFor="simultaneousSale">Venta simultánea</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasAccessControlStaff"
                  checked={formData.hasAccessControlStaff}
                  onCheckedChange={() => handleSwitchChange("hasAccessControlStaff")}
                />
                <Label htmlFor="hasAccessControlStaff">Dispone de personal para control de acceso</Label>
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Facturación</h2>
          <div className="flex items-center space-x-2">
            <Switch
              id="billingEnabled"
              checked={formData.billing.enabled}
              onCheckedChange={() => {
                setFormData((prev) => ({
                  ...prev,
                  billing: { ...prev.billing, enabled: !prev.billing.enabled },
                }))
              }}
            />
            <Label htmlFor="billingEnabled">Habilitar facturación</Label>
          </div>
          {formData.billing.enabled && (
            <>
              <div>
                <Label htmlFor="businessName">Razón social</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={formData.billing.businessName}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      billing: { ...prev.billing, businessName: e.target.value },
                    }))
                  }}
                  placeholder="Ingrese la razón social"
                />
              </div>
              <div>
                <Label htmlFor="taxId">CUIT</Label>
                <Input
                  id="taxId"
                  name="taxId"
                  value={formData.billing.taxId}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      billing: { ...prev.billing, taxId: e.target.value },
                    }))
                  }}
                  placeholder="Ingrese el CUIT"
                />
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recaudación</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="collectionAccountType">Tipo de cuenta de recaudación</Label>
              <Select
                value={formData.collectionAccount.type}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  collectionAccount: {
                    ...prev.collectionAccount,
                    type: value
                  }
                }))}
              >
                <SelectTrigger id="collectionAccountType">
                  <SelectValue placeholder="Seleccione el tipo de cuenta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="propia">Propia</SelectItem>
                  <SelectItem value="terceros">Autoentrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              {formData.collectionAccount.type === "propia" && (
                <div>
                  <Label htmlFor="merchantNumber">Número de comercio</Label>
                  <Input
                    id="merchantNumber"
                    name="merchantNumber"
                    value={formData.collectionAccount.merchantNumber || ""}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      collectionAccount: {
                        ...prev.collectionAccount,
                        merchantNumber: e.target.value
                      }
                    }))}
                    placeholder="Ingrese el número de comercio"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Datos de producción</h2>
          <div>
            <Label htmlFor="supervisorEmail">Email del supervisor</Label>
            <Input
              id="supervisorEmail"
              name="supervisorEmail"
              type="email"
              value={formData.productionData.supervisorEmail}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  productionData: { ...prev.productionData, supervisorEmail: e.target.value },
                }))
              }}
              placeholder="Ingrese el email del supervisor"
            />
          </div>
          <div>
            <Label htmlFor="responsibleName">Nombre del responsable</Label>
            <Input
              id="responsibleName"
              name="responsibleName"
              value={formData.productionData.responsibleName}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  productionData: { ...prev.productionData, responsibleName: e.target.value },
                }))
              }}
              placeholder="Ingrese el nombre del responsable"
            />
          </div>
          <div>
            <Label htmlFor="responsiblePhone">Teléfono del responsable</Label>
            <Input
              id="responsiblePhone"
              name="responsiblePhone"
              value={formData.productionData.responsiblePhone}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  productionData: { ...prev.productionData, responsiblePhone: e.target.value },
                }))
              }}
              placeholder="Ingrese el teléfono del responsable"
            />
          </div>
        </div>

        <Button type="submit" className="w-full">
          {initialData ? "Actualizar planilla" : "Crear planilla"}
        </Button>
        {isUpdated && <p className="text-green-500">Planilla actualizada exitosamente</p>}
      </form>

    </>
  )
}