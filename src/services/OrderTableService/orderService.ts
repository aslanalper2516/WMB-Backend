import { Order } from "./models/order";
import { Branch } from "../CompanyBranchService/models/branch";
import { Table } from "./models/table";

export class OrderService {
  static async createOrder(data: any) {
    // Şube kontrolü
    const branch = await Branch.findById(data.branch);
    if (!branch) {
      throw new Error("Şube bulunamadı");
    }
    if (branch.isDeleted) {
      throw new Error("Şube silinmiş durumda");
    }
    
    // Eğer table belirtilmişse, table-branch ilişkisi kontrolü
    if (data.table) {
      const table = await Table.findById(data.table);
      if (!table) {
        throw new Error("Masa bulunamadı");
      }
      if (table.branch.toString() !== data.branch) {
        throw new Error("Seçilen masa, belirtilen şubeye ait değil");
      }
    }
    
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
    // Eğer branch veya table değiştiriliyorsa, ilişki kontrolü
    if (data.branch || data.table) {
      const existingOrder = await Order.findById(id);
      if (!existingOrder) {
        throw new Error("Sipariş bulunamadı");
      }
      
      const branchId = data.branch || existingOrder.branch;
      
      // Şube kontrolü
      const branch = await Branch.findById(branchId);
      if (!branch) {
        throw new Error("Şube bulunamadı");
      }
      if (branch.isDeleted) {
        throw new Error("Şube silinmiş durumda");
      }
      
      // Table değiştiriliyorsa, table-branch ilişkisi kontrolü
      if (data.table) {
        const table = await Table.findById(data.table);
        if (!table) {
          throw new Error("Masa bulunamadı");
        }
        if (table.branch.toString() !== branchId.toString()) {
          throw new Error("Seçilen masa, belirtilen şubeye ait değil");
        }
      }
    }
    
    return await Order.findByIdAndUpdate(id, data, { new: true })
      .populate("user branch table paymentMethod currencyUnit createdBy approvedBy preparedBy deliveredBy cancelledBy");
  }

  static async deleteOrder(id: string) {
    return await Order.findByIdAndDelete(id);
  }
}
