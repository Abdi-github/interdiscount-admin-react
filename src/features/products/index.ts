export { productsApi, useGetProductsQuery, useGetProductQuery, useCreateProductMutation, useUpdateProductMutation, useUpdateProductStatusMutation, useDeleteProductMutation } from './products.api';
export { ProductStatusChip } from './components/ProductStatusChip';
export { ProductTable } from './components/ProductTable';
export { ProductsListPage } from './pages/ProductsListPage';
export { ProductCreatePage } from './pages/ProductCreatePage';
export { ProductEditPage } from './pages/ProductEditPage';
export type { Product, ProductStatus, ProductFilters, CreateProductPayload } from './products.types';
