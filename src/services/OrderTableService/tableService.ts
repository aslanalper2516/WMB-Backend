import { Table } from "./models/table";

export class TableService {
  static async createTable(data: { number: number; branch: string; name?: string; status?: string }) {
    return await Table.create(data);
  }

  static async getTables(branchId?: string) {
    const query: any = { isActive: true };
    if (branchId) query.branch = branchId;
    return await Table.find(query).populate("branch");
  }

  static async getTableById(id: string) {
    return await Table.findById(id).populate("branch");
  }

  static async updateTable(id: string, data: Partial<{ number: number; name: string; status: string; isActive: boolean }>) {
    return await Table.findByIdAndUpdate(id, data, { new: true }).populate("branch");
  }

  static async deleteTable(id: string) {
    return await Table.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }
}
