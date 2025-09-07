// src/components/InventoryForm.tsx
import type React from "react"
import { useState, useRef } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { Plus, Upload, QrCode, Barcode, Trash2 } from "lucide-react"
import { useGetCategoriesQuery, useCreateCategoryMutation, useCreateProductMutation } from '../lib/api'

interface Variant {
  color: string
  image: string
}

interface Product {
  _id: string
  name: string
  sizes: string[]
  variants: Variant[]
  price: number
  availability: boolean
  categoryId: { _id: string; name: string }
  qrCode: string
  barcode: string
  description: string
  stock: number
}

interface InventoryFormProps {
  onAdd: (newProduct: Omit<Product, '_id' | 'categoryId'> & { categoryId: string; subcategory: string }) => Promise<void>
}

const InventoryForm: React.FC<InventoryFormProps> = ({ onAdd }) => {
  const { data: categories, refetch: refetchCategories } = useGetCategoriesQuery()
  const [createCategory] = useCreateCategoryMutation()
  const [createProduct] = useCreateProductMutation()
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('')
  const [newCategoryName, setNewCategoryName] = useState<string>('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newProduct, setNewProduct] = useState<Omit<Product, '_id' | 'categoryId'>>({
    name: "",
    sizes: [],
    variants: [],
    price: 0,
    availability: true,
    qrCode: "",
    barcode: "",
    description: "",
    stock: 0,
  })
  const [currentVariant, setCurrentVariant] = useState<Variant>({ color: '', image: '' })
  const [currentSize, setCurrentSize] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getSubcategories = () => {
    if (selectedCategory && categories) {
      const cat = categories.find(c => c._id === selectedCategory);
      return cat ? cat.subcategories || [] : [];
    }
    return [];
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewProduct((prev) => {
      const updated = { ...prev };
      if (name === "price") {
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

  const handleVariantImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setCurrentVariant((prev) => ({ ...prev, image: imageUrl }))
      }
      reader.readAsDataURL(file)
    }
  }

  const addVariant = () => {
    if (currentVariant.color && currentVariant.image) {
      setNewProduct((prev) => ({
        ...prev,
        variants: [...prev.variants, currentVariant],
      }))
      setCurrentVariant({ color: '', image: '' })
    }
  }

  const removeVariant = (index: number) => {
    setNewProduct((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }))
  }

  const addSize = () => {
    if (currentSize && !newProduct.sizes.includes(currentSize)) {
      setNewProduct((prev) => ({
        ...prev,
        sizes: [...prev.sizes, currentSize],
      }))
      setCurrentSize('')
    }
  }

  const removeSize = (index: number) => {
    setNewProduct((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }))
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
    if (!newProduct.name || newProduct.price <= 0 || !selectedCategory || !selectedSubcategory || newProduct.variants.length === 0) {
      console.error('Validation failed: Missing required fields', {
        name: newProduct.name,
        price: newProduct.price,
        categoryId: selectedCategory,
        subcategory: selectedSubcategory,
        variants: newProduct.variants,
      })
      return
    }

    const productToAdd = {
      ...newProduct,
      categoryId: selectedCategory,
      subcategory: selectedSubcategory,
      sizes: newProduct.sizes,
    }

    console.log('Submitting product:', productToAdd) // Debug payload

    try {
      const result = await createProduct(productToAdd).unwrap()
      console.log('Product created successfully:', result)
      await onAdd(productToAdd)
      setNewProduct({
        name: "",
        sizes: [],
        variants: [],
        price: 0,
        availability: true,
        qrCode: "",
        barcode: "",
        description: "",
        stock: 0,
      })
      setSelectedCategory('')
      setSelectedSubcategory('')
      setNewCategoryName('')
    } catch (error) {
      console.error('Failed to create product:', error)
    }
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
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" onClick={() => setShowNewCategory(true)}>
              Add New
            </Button>
          </div>
        </div>

        {selectedCategory && (
          <div className="space-y-2">
            <Label htmlFor="subcategory">Subcategory</Label>
            <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                {getSubcategories().map((sub) => (
                  <SelectItem key={sub.name} value={sub.name}>{sub.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

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
          <Label>Sizes</Label>
          <div className="flex gap-2">
            <Select value={currentSize} onValueChange={setCurrentSize}>
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
            <Button type="button" onClick={addSize}>
              <Plus className="h-4 w-4 mr-2" />
              Add Size
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {newProduct.sizes.map((size, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {size}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-4 w-4 p-0"
                  onClick={() => removeSize(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Variants (Color & Image) *</Label>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Enter color"
                value={currentVariant.color}
                onChange={(e) => setCurrentVariant((prev) => ({ ...prev, color: e.target.value }))}
              />
              <Input
                type="file"
                accept="image/*"
                onChange={handleVariantImageUpload}
                className="hidden"
                ref={fileInputRef}
              />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
              <Button type="button" onClick={addVariant}>
                <Plus className="h-4 w-4 mr-2" />
                Add Variant
              </Button>
            </div>
            {currentVariant.image && (
              <img src={currentVariant.image} alt="Preview" className="w-20 h-20 object-cover rounded border" />
            )}
            <div className="space-y-2">
              {newProduct.variants.map((variant, index) => (
                <div key={index} className="flex items-center gap-4 border p-2 rounded">
                  <span>{variant.color}</span>
                  <img src={variant.image} alt={variant.color} className="w-10 h-10 object-cover" />
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeVariant(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
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
            QR Code (Auto-generated by backend)
          </Label>
          <Input
            id="qrCode"
            name="qrCode"
            placeholder="Will be auto-generated"
            value={newProduct.qrCode}
            onChange={handleChange}
            className="bg-gray-50"
            readOnly
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="barcode" className="flex items-center gap-2">
            <Barcode className="h-4 w-4" />
            Barcode (Auto-generated by backend)
          </Label>
          <Input
            id="barcode"
            name="barcode"
            placeholder="Will be auto-generated"
            value={newProduct.barcode}
            onChange={handleChange}
            className="bg-gray-50"
            readOnly
          />
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