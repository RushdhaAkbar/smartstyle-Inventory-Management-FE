import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/`,
  }),
  tagTypes: ['Product', 'Category'],
  endpoints: (builder) => ({
    getProducts: builder.query<any[], void>({
      query: () => 'products',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Product' as const, id: _id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
      transformErrorResponse: (response) => {
        console.error('Error fetching products:', response);
        return response;
      },
    }),
    createProduct: builder.mutation<any, Partial<any>>({
      query: (body) => {
        console.log('Sending create product request:', body); // Debug log
        return {
          url: 'products',
          method: 'POST',
          body,
        };
      },
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
      transformErrorResponse: (response) => {
        console.error('Error creating product:', response);
        return response;
      },
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Product', id }, { type: 'Product', id: 'LIST' }],
    }),
    updateProduct: builder.mutation<any, { id: string; updates: Partial<any> }>({
      query: ({ id, updates }) => ({
        url: `products/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }, { type: 'Product', id: 'LIST' }],
    }),
    getCategories: builder.query<any[], void>({
      query: () => `categories`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Category' as const, id: _id })),
              { type: 'Category', id: 'LIST' },
            ]
          : [{ type: 'Category', id: 'LIST' }],
    }),
    createCategory: builder.mutation<any, { name: string }>({
      query: (body) => ({
        url: `categories`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
} = api;