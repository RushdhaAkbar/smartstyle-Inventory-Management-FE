import type React from "react"
import { useState, useRef } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Plus, Upload, QrCode, Barcode } from "lucide-react"

interface Product {
  id: string
  name: string
  size: string
  color: string
  price: number
  availability: boolean
  type: string
  qrCode: string
  barcode: string
  image: string
}

interface InventoryFormProps {
  onAdd: (newProduct: Product) => void
}

const InventoryForm: React.FC<InventoryFormProps> = ({ onAdd }) => {
  const [newProduct, setNewProduct] = useState<Product>({
    id: "",
    name: "",
    size: "",
    color: "",
    price: 0,
    availability: true,
    type: "",
    qrCode: "",
    barcode: "",
    image: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewProduct((prev) => ({
      ...prev,
      [name]: name === "price" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewProduct((prev) => ({ ...prev, [name]: value }))
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateCodes = (productName: string) => {
    const timestamp = Date.now()
    const qrCode = `QR-${productName.replace(/\s+/g, "").toUpperCase()}-${timestamp}`
    const barcode = `${timestamp}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`
    return { qrCode, barcode }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setNewProduct((prev) => ({ ...prev, image: imageUrl }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProduct.name || !newProduct.type || newProduct.price <= 0) {
      return
    }

    const { qrCode, barcode } = generateCodes(newProduct.name)

    const productToAdd = {
      ...newProduct,
      id: Date.now().toString(),
      qrCode: newProduct.qrCode || qrCode,
      barcode: newProduct.barcode || barcode,
      image: newProduct.image || `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(newProduct.name)}`,
    }

    onAdd(productToAdd)
    setNewProduct({
      id: "",
      name: "",
      size: "",
      color: "",
      price: 0,
      availability: true,
      type: "",
      qrCode: "",
      barcode: "",
      image: "",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter product name"
            value={newProduct.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Product Type *</Label>
          <Select value={newProduct.type} onValueChange={(value) => handleSelectChange("type", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select product type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Casual">Casual</SelectItem>
              <SelectItem value="Formal">Formal</SelectItem>
              <SelectItem value="Sports">Sports</SelectItem>
              <SelectItem value="Accessories">Accessories</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <Select value={newProduct.size} onValueChange={(value) => handleSelectChange("size", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="XS">XS</SelectItem>
              <SelectItem value="S">S</SelectItem>
              <SelectItem value="M">M</SelectItem>
              <SelectItem value="L">L</SelectItem>
              <SelectItem value="XL">XL</SelectItem>
              <SelectItem value="XXL">XXL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input id="color" name="color" placeholder="Enter color" value={newProduct.color} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price ($) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={newProduct.price || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="qrCode" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            QR Code (Auto-generated)
          </Label>
          <Input
            id="qrCode"
            name="qrCode"
            placeholder="Will be auto-generated"
            value={newProduct.qrCode}
            onChange={handleChange}
            className="bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="barcode" className="flex items-center gap-2">
            <Barcode className="h-4 w-4" />
            Barcode (Auto-generated)
          </Label>
          <Input
            id="barcode"
            name="barcode"
            placeholder="Will be auto-generated"
            value={newProduct.barcode}
            onChange={handleChange}
            className="bg-gray-50"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Product Image</Label>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Input
                name="image"
                placeholder="Enter image URL"
                value={newProduct.image}
                onChange={handleChange}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            {newProduct.image && (
              <div className="mt-2">
                <img
                  src={newProduct.image || "/placeholder.svg"}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded border"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full md:w-auto">
        <Plus className="h-4 w-4 mr-2" />
        Add Product
      </Button>
    </form>
  )
}

export default InventoryForm
