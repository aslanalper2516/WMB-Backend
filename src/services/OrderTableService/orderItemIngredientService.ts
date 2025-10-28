import { OrderItemIngredient } from "./models/orderItemIngredient";

export class OrderItemIngredientService {
  static async createIngredient(data: any) {
    return await OrderItemIngredient.create(data);
  }

  static async getIngredients(filter: any = {}) {
    return await OrderItemIngredient.find(filter).populate("orderItem ingredient");
  }

  static async getIngredientById(id: string) {
    return await OrderItemIngredient.findById(id).populate("orderItem ingredient");
  }

  static async updateIngredient(id: string, data: any) {
    return await OrderItemIngredient.findByIdAndUpdate(id, data, { new: true }).populate("orderItem ingredient");
  }

  static async deleteIngredient(id: string) {
    return await OrderItemIngredient.findByIdAndDelete(id);
  }
}
