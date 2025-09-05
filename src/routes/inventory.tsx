import type React from "react"
import { useState, useEffect } from "react"
import InventoryForm from "../components/InventoryForm"
import ProductList from "../components/ProductList"
import SystemStatus from "../components/SystemStatus"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Package, Plus, BarChart3 } from "lucide-react"
import { useGetProductsQuery, useGetCategoriesQuery, useCreateProductMutation } from '../lib/api'
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import type { Product } from '../types/product'

interface Variant {
  color: string
  image: string
}

const Inventory: React.FC = () => {
  const { data: productsData } = useGetProductsQuery()
  const { data: categories } = useGetCategoriesQuery()
  const [createProduct] = useCreateProductMutation()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [status, setStatus] = useState({ lastUpdated: new Date().toString() })
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [filterCategory, setFilterCategory] = useState('all') // Default to 'all'

  useEffect(() => {
    if (productsData) {
      const mappedProducts = productsData.map(p => ({
        ...p,
        categoryId: { _id: p.categoryId, name: categories?.find(c => c._id === p.categoryId)?.name || 'Unknown' },
        subcategory: p.subcategory || '',
      }));
      setProducts(mappedProducts)
      setFilteredProducts(mappedProducts)
    }
    setStatus({ lastUpdated: new Date().toString() });
  }, [productsData, categories]);

  useEffect(() => {
    let filtered = products
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(p => filterCategory === 'all' || p.categoryId._id === filterCategory); // Handle 'all'

    filtered = filtered.sort((a, b) => {
      if (sortBy === 'price') return Number(a.price) - Number(b.price);
      if (sortBy === 'stock') return a.stock - b.stock;
      return a.name.localeCompare(b.name);
    });

    setFilteredProducts(filtered);
  }, [searchTerm, filterCategory, sortBy, products]);

  const addProduct = async (newProduct: Omit<Product, '_id' | 'categoryId'> & { categoryId: string }) => {
    try {
      const result = await createProduct(newProduct);
      if (result.error) {
        console.error('Failed to create product:', result.error);
        return;
      }
      // The product will be automatically added to the list via RTK Query cache invalidation
      setStatus({ lastUpdated: new Date().toString() });
    } catch (error) {
      console.error('Exception while creating product:', error);
    }
  };

  const deleteProduct = (_id: string) => {
    setProducts(products.filter((p) => p._id !== _id));
    setStatus({ lastUpdated: new Date().toString() });
  };

  const setAvailability = (_id: string, availability: boolean) => {
    setProducts(products.map((p) => (p._id === _id ? { ...p, availability } : p)));
    setStatus({ lastUpdated: new Date().toString() });
  };

  const totalProducts = products.length;
  const availableProducts = products.filter((p) => p.availability).length;
  const totalValue = products.reduce((sum, p) => sum + Number(p.price), 0);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto p-6 space-y-8">
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
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <Input
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories?.map(cat => (
                        <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="stock">Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ProductList
                  products={filteredProducts}
                  onDelete={deleteProduct}
                  onSetAvailability={setAvailability}
                />
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
                <InventoryForm
                  onAdd={addProduct}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <SystemStatus lastUpdated={status.lastUpdated} />
      </div>
    </div>
  )
}

export default Inventory
