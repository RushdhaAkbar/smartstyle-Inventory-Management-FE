// File: src/components/InventoryForm.tsx
import type React from "react"
import { useState, useRef } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Plus, Upload, QrCode, Barcode } from "lucide-react"
import { useGetCategoriesQuery, useCreateCategoryMutation } from '../lib/api'

interface Product {
  id: string
  name: string
  sizes: string[]
  colors: string[]
  price: number
  availability: boolean
  categoryId: { _id: string; name: string }
  qrCode: string
  barcode: string
  image: string
  description: string
  stock: number
}

interface InventoryFormProps {
  onAdd: (newProduct: Omit<Product, 'id' | 'categoryId'> & { categoryId: string }) => Promise<void>
}

const InventoryForm: React.FC<InventoryFormProps> = ({ onAdd }) => {
  const { data: categories, refetch: refetchCategories } = useGetCategoriesQuery()
  const [createCategory] = useCreateCategoryMutation()
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [newCategoryName, setNewCategoryName] = useState<string>('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'categoryId'>>({
    name: "",
    sizes: [],
    colors: [],
    price: 0,
    availability: true,
    qrCode: "",
    barcode: "",
    image: "",
    description: "",
    stock: 0,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewProduct((prev) => {
      const updated = { ...prev };
      if (name === "color") {
        updated.colors = value ? [value] : [];
      } else if (name === "price") {
        updated.price = parseFloat(value) || 0;
      } else if (name === "stock") {
        updated.stock = parseInt(value) || 0;
      } else {
        // @ts-ignore
        updated[name] = value;
      }
      return updated;
    })
  }

  const handleSelectChange = (name: keyof Omit<Product, 'id' | 'categoryId'>, value: string) => {
    setNewProduct((prev) => ({ ...prev, [name]: name === "sizes" ? [value] : name === "colors" ? [value] : value }))
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

  const handleAddCategory = async () => {
    if (!newCategoryName) return
    try {
      const result = await createCategory({ name: newCategoryName })
      if (result.error) {
        console.error('Failed to create category:', result.error)
        return
      }
      const newCat = result.data
      if (!newCat || !newCat._id) {
        console.error('New category data is invalid or null')
        return
      }
      await refetchCategories()
      setSelectedCategory(newCat._id)
      setNewCategoryName('')
      setShowNewCategory(false)
    } catch (error) {
      console.error('Exception while creating category:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProduct.name || newProduct.price <= 0 || !selectedCategory) {
      return
    }

    const { qrCode, barcode } = generateCodes(newProduct.name)

    const productToAdd = {
      ...newProduct,
      categoryId: selectedCategory,
      qrCode: newProduct.qrCode || qrCode,
      barcode: newProduct.barcode || barcode,
      image: newProduct.image || `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(newProduct.name)}`,
      sizes: newProduct.sizes,
      colors: newProduct.colors,
    }

    await onAdd(productToAdd)
    setNewProduct({
      name: "",
      sizes: [],
      colors: [],
      price: 0,
      availability: true,
      qrCode: "",
      barcode: "",
      image: "",
      description: "",
      stock: 0,
    })
    setSelectedCategory('')
    setNewCategoryName('')
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
          <Label htmlFor="category">Category *</Label>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map(cat => (
                  <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" onClick={() => setShowNewCategory(true)}>
              Add New
            </Button>
          </div>
        </div>

        {showNewCategory && (
          <div className="space-y-2">
            <Label htmlFor="newCategoryName">New Category Name *</Label>
            <div className="flex gap-2">
              <Input
                id="newCategoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
              />
              <Button type="button" onClick={handleAddCategory}>Add</Button>
              <Button type="button" variant="outline" onClick={() => setShowNewCategory(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <Select value={newProduct.sizes[0] || ''} onValueChange={(value) => handleSelectChange("sizes", value)}>
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
          <Input id="color" name="color" placeholder="Enter color" value={newProduct.colors[0] || ''} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock *</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            placeholder="0"
            value={newProduct.stock || ""}
            onChange={handleChange}
            required
          />
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
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" placeholder="Enter description" value={newProduct.description} onChange={handleChange} />
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