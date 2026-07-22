import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Product, ProductsData } from '@/lib/types'
import bundledData from '@data/products.json'
import { resolveFeaturedProducts } from '@/lib/products'
import { useRemoteData, type RemoteDataStatus } from '@/hooks/useRemoteData'

interface ProductsContextValue {
  products: Product[]
  /** Featured products, already ordered by the ranking map. */
  featured: Product[]
  status: RemoteDataStatus
}

const FALLBACK = bundledData as unknown as ProductsData

const ProductsContext = createContext<ProductsContextValue>({
  products: FALLBACK.products,
  featured: resolveFeaturedProducts(FALLBACK.featured, FALLBACK.products),
  status: 'bundled',
})

/**
 * Provides the active product list + featured ranking to the whole app.
 * Starts from the bundled products.json and, when a GitHub data base is
 * configured, swaps in the newest committed version at runtime.
 */
export function ProductsProvider({ children }: { children: ReactNode }) {
  const { data, status } = useRemoteData<ProductsData>(
    'products.json',
    FALLBACK
  )

  const products = data.products ?? []
  const featured = useMemo(
    () => resolveFeaturedProducts(data.featured, products),
    [data]
  )

  return (
    <ProductsContext.Provider value={{ products, featured, status }}>
      {children}
    </ProductsContext.Provider>
  )
}

/** The active product list (bundled or remote). */
export function useProducts(): Product[] {
  return useContext(ProductsContext).products
}

/** Featured products, ordered by the ranking map in products.json. */
export function useFeaturedProducts(): Product[] {
  return useContext(ProductsContext).featured
}

/** Where the current product list came from. */
export function useProductsStatus(): RemoteDataStatus {
  return useContext(ProductsContext).status
}
