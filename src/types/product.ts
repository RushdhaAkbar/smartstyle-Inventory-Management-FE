
export interface Variant {
  color: string
  image: string
}

export interface Product {
  _id: string
  name: string
  sizes: string[]
  variants: Variant[]
  price: string | number // Backend returns string, frontend may parse to number
  availability: boolean
  categoryId: { _id: string; name: string }
  subcategory: string
  qrCode: string
  barcode: string
  description: string
  stock: number
}