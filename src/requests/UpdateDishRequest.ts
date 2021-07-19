/**
 * Fields in a request to update a single RESTAURANT item.
 */
export interface UpdateDishRequest {
  dishName: string
  ingridients?: string
  price: number
}
