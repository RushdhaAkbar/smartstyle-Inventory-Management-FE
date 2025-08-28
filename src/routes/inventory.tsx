"use client"

import type React from "react"
import { useState } from "react"
import InventoryForm from "../components/InventoryForm"
import ProductList from "../components/ProductList"
import SystemStatus from "../components/SystemStatus"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Package, Plus, BarChart3 } from "lucide-react"

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

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Blue Shirt",
      size: "M",
      color: "Blue",
      price: 20,
      availability: true,
      type: "Casual",
      qrCode: "QR1",
      barcode: "BAR1",
      image: "/blue-shirt.png",
    },
    {
      id: "2",
      name: "Red Dress",
      size: "S",
      color: "Red",
      price: 50,
      availability: false,
      type: "Formal",
      qrCode: "QR2",
      barcode: "BAR2",
      image: "/woman-in-red-dress.png",
    },
  ])
  const [status, setStatus] = useState({ lastUpdated: new Date().toString() })

  const addProduct = (newProduct: Product) => {
    setProducts([...products, newProduct])
    setStatus({ lastUpdated: new Date().toString() })
  }

  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id))
    setStatus({ lastUpdated: new Date().toString() })
  }

  const setAvailability = (id: string, availability: boolean) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, availability } : p)))
    setStatus({ lastUpdated: new Date().toString() })
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
              <div className="text-2xl font-bold">${totalValue}</div>
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
                <ProductList products={products} onDelete={deleteProduct} onSetAvailability={setAvailability} />
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
