/**
 * Fields in a request to create a single DISH item.
 */
export interface CreateDishRequest {
  dishName: string
  ingridients?: string
  price: number
  photoUrl?: string
}
