// src/components/ProductList.tsx
import type React from "react"
import { useState } from "react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Switch } from "../components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Trash2, Package, QrCode, Barcode, Download, Image as ImageIcon } from "lucide-react"
import * as QRCodeLib from "qrcode"
import type { Product, Variant } from '../types/product'

interface ProductListProps {
  products: Product[]
  onDelete: (_id: string) => void
  onSetAvailability: (_id: string, availability: boolean) => void
}

const ProductList: React.FC<ProductListProps> = ({ products, onDelete, onSetAvailability }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const downloadImage = (dataUrl: string, fileName: string) => {
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadQR = (qrCode: string, productName: string) => {
    const canvas = document.createElement("canvas")
    QRCodeLib.toCanvas(canvas, qrCode, { width: 200 }, (error) => {
      if (error) console.error(error)
      const dataUrl = canvas.toDataURL("image/png")
      downloadImage(dataUrl, `${productName}_QR.png`)
    })
  }

  const handleDownloadBarcode = (barcode: string, productName: string) => {
    const canvas = document.createElement("canvas")
    canvas.width = 200
    canvas.height = 50
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "black"
      ctx.font = "20px monospace"
      ctx.fillText(barcode, 10, 30)
      const dataUrl = canvas.toDataURL("image/png")
      downloadImage(dataUrl, `${productName}_Barcode.png`)
    }
  }

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
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Image</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Category/Sub</TableHead>
            <TableHead>Sizes</TableHead>
            <TableHead>Variants (Colors)</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Codes</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product._id}>
              <TableCell>
                <div className="relative group">
                  <img
                    src={product.variants[0]?.image || "/placeholder.svg"}
                    alt={`${product.name} - ${product.variants[0]?.color || 'Primary'}`}
                    className="w-12 h-12 object-cover rounded border"
                  />
                  {product.variants.length > 0 && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <ImageIcon className="h-4 w-4 text-blue-600" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>{product.name} - All Images</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 p-4">
                          {product.variants.map((variant, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                              <img
                                src={variant.image || "/placeholder.svg"}
                                alt={`${product.name} - ${variant.color}`}
                                className="w-32 h-32 object-cover rounded border"
                              />
                              <p className="text-sm mt-2">{variant.color}</p>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.description.substring(0, 50)}...</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{`${product.categoryId.name} > ${product.subcategory || 'N/A'}`}</Badge>
              </TableCell>
              <TableCell>{product.sizes.join(', ') || "N/A"}</TableCell>
              <TableCell>
                {product.variants.map(v => v.color).join(', ') || "N/A"}
              </TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell className="font-medium">
                ${typeof product.price === 'string' ? parseFloat(product.price).toFixed(2) : product.price.toFixed(2)}
              </TableCell>
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
                    onCheckedChange={(checked) => onSetAvailability(product._id, checked)}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <Badge variant={product.availability ? "default" : "secondary"} className="text-xs">
                    {product.availability ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadQR(product.qrCode, product.name)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Download className="h-4 w-4 mr-1" /> QR
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadBarcode(product.barcode, product.name)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Download className="h-4 w-4 mr-1" /> Barcode
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(product._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default ProductList