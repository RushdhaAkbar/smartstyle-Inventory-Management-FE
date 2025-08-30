import type React from "react"
import { useState, useEffect } from "react"
import InventoryForm from "../components/InventoryForm"
import ProductList from "../components/ProductList"
import SystemStatus from "../components/SystemStatus"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Package, Plus, BarChart3 } from "lucide-react"
import { useGetProductsQuery, useCreateProductMutation, useDeleteProductMutation, useUpdateProductMutation } from '../lib/api'

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

const Inventory: React.FC = () => {
  const { data: productsData, isLoading } = useGetProductsQuery()
  const [createProduct] = useCreateProductMutation()
  const [deleteProduct] = useDeleteProductMutation()
  const [updateProduct] = useUpdateProductMutation()
  const [status, setStatus] = useState({ lastUpdated: new Date().toString() })

  const products: Product[] = productsData?.map(p => ({
    ...p,
    id: p._id || p.id,
    price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
    sizes: p.sizes || [],
    colors: p.colors || [],
    categoryId: p.categoryId, // populated object
  })) || []

  useEffect(() => {
    setStatus({ lastUpdated: new Date().toString() })
  }, [productsData])

  const addProduct = async (newProduct: Omit<Product, 'id' | 'categoryId'> & { categoryId: string }) => {
    try {
      await createProduct(newProduct).unwrap()
    } catch (error) {
      console.error('Failed to add product:', error)
    }
  }

  const removeProduct = async (id: string) => {
    try {
      await deleteProduct(id).unwrap()
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  const setAvailability = async (id: string, availability: boolean) => {
    try {
      await updateProduct({ id, updates: { availability } }).unwrap()
    } catch (error) {
      console.error('Failed to update availability:', error)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  const totalProducts = products.length
  const availableProducts = products.filter((p) => p.availability).length
  const totalValue = products.reduce((sum, p) => sum + p.price, 0)

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600">Manage your products and track inventory status</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">{availableProducts} available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Items</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableProducts}</div>
              <p className="text-xs text-muted-foreground">{totalProducts - availableProducts} out of stock</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <span className="text-sm">$</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Inventory value</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="add-product" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Inventory</CardTitle>
                <CardDescription>View and manage your product inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductList products={products} onDelete={removeProduct} onSetAvailability={setAvailability} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-product" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Product</CardTitle>
                <CardDescription>Add a new product to your inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <InventoryForm onAdd={addProduct} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* System Status */}
        <SystemStatus lastUpdated={status.lastUpdated} />
      </div>
    </div>
  )
}

export default Inventory