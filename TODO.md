# TODO: Fix Error in inventory.tsx

- [x] Update Product interface: Change 'id' to '_id: string'
- [x] Update addProduct function: Change 'id' to '_id' and generate '_id' instead of 'id'
- [x] Update Product interface in ProductList.tsx: Change 'id' to '_id'
- [x] Update Product interface in InventoryForm.tsx: Change 'id' to '_id'
- [x] Update deleteProduct function: Change parameter to '_id' and filter by 'p._id !== _id'
- [x] Update setAvailability function: Change parameter to '_id' and map by 'p._id === _id'
- [x] Adjust useEffect mapping: Ensure categoryId is correctly mapped from string to object
- [x] Fix Select component error: Change empty string value to 'all' for "All Categories" option
- [x] Implement API call for addProduct: Use createProduct mutation instead of local state update
- [x] Fix TypeScript errors: Resolve Product type conflicts and price validation issues
