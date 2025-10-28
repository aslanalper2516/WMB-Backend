import { Order } from "./models/order";

export class OrderService {
  static async createOrder(data: any) {
    return await Order.create(data);
  }

  static async getOrders(filter: any = {}) {
    return await Order.find(filter)
      .populate("user branch table paymentMethod currencyUnit createdBy approvedBy preparedBy deliveredBy cancelledBy");
  }

  static async getOrderById(id: string) {
    return await Order.findById(id)
      .populate("user branch table paymentMethod currencyUnit createdBy approvedBy preparedBy deliveredBy cancelledBy");
  }

  static async updateOrder(id: string, data: any) {
    return await Order.findByIdAndUpdate(id, data, { new: true })
      .populate("user branch table paymentMethod currencyUnit createdBy approvedBy preparedBy deliveredBy cancelledBy");
  }

  static async deleteOrder(id: string) {
    return await Order.findByIdAndDelete(id);
  }
}
