import { OrderItem } from "./models/orderItem";

export class OrderItemService {
  static async createOrderItem(data: any) {
    return await OrderItem.create(data);
  }

  static async getOrderItems(filter: any = {}) {
    return await OrderItem.find(filter)
      .populate("order product createdBy approvedBy preparedBy deliveredBy cancelledBy paymentMethod currencyUnit");
  }

  static async getOrderItemById(id: string) {
    return await OrderItem.findById(id)
      .populate("order product createdBy approvedBy preparedBy deliveredBy cancelledBy paymentMethod currencyUnit");
  }

  static async updateOrderItem(id: string, data: any) {
    return await OrderItem.findByIdAndUpdate(id, data, { new: true })
      .populate("order product createdBy approvedBy preparedBy deliveredBy cancelledBy paymentMethod currencyUnit");
  }

  static async deleteOrderItem(id: string) {
    return await OrderItem.findByIdAndDelete(id);
  }
}
