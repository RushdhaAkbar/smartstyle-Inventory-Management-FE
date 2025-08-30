
import type React from "react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Switch } from "../components/ui/switch"
import { Trash2, Package, QrCode, Barcode } from "lucide-react"

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

interface ProductListProps {
  products: Product[]
  onDelete: (id: string) => void
  onSetAvailability: (id: string, availability: boolean) => void
}

const ProductList: React.FC<ProductListProps> = ({ products, onDelete, onSetAvailability }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500">Add your first product to get started.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Image</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Sizes</TableHead>
            <TableHead>Colors</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Codes</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded border"
                />
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{product.name}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{product.categoryId?.name}</Badge>
              </TableCell>
              <TableCell>{product.sizes.join(', ') || "N/A"}</TableCell>
              <TableCell>{product.colors.join(', ') || "N/A"}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell className="font-medium">${product.price}</TableCell>
              <TableCell>
                <div className="space-y-1 text-xs">
                  {product.qrCode && (
                    <div className="flex items-center gap-1">
                      <QrCode className="h-3 w-3" />
                      <span className="truncate max-w-20" title={product.qrCode}>
                        {product.qrCode}
                      </span>
                    </div>
                  )}
                  {product.barcode && (
                    <div className="flex items-center gap-1">
                      <Barcode className="h-3 w-3" />
                      <span className="truncate max-w-20" title={product.barcode}>
                        {product.barcode}
                      </span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={product.availability}
                    onCheckedChange={(checked) => onSetAvailability(product.id, checked)}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <Badge variant={product.availability ? "default" : "secondary"} className="text-xs">
                    {product.availability ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(product.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default ProductList