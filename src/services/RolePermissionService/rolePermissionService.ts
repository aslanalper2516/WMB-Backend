import { Role } from "./models/role";
import { Permission } from "./models/permission";
import { RolePermission } from "./models/rolePermission";

export const RolePermissionService = {
  /* ---------------------------
   *  PERMISSION OPERATIONS
   * -------------------------*/
  async createPermission(data: { name: string; description?: string }) {
    const exists = await Permission.findOne({ name: data.name });
    if (exists) throw new Error("Permission already exists");
    return await Permission.create(data);
  },

  async getPermissions() {
    return await Permission.find().sort({ createdAt: -1 });
  },

  async updatePermission(
    id: string,
    data: { name?: string; description?: string }
  ) {
    const permission = await Permission.findById(id);
    if (!permission) throw new Error("Permission not found");

    // Eğer yeni bir name verilmişse, duplicate kontrolü
    if (data.name && data.name !== permission.name) {
      const exists = await Permission.findOne({ name: data.name });
      if (exists) throw new Error("Permission name already exists");
    }

    Object.assign(permission, data);
    await permission.save();

    return permission;
  },

  async deletePermission(id: string) {
    return await Permission.findByIdAndDelete(id);
  },

  /* ---------------------------
   *  ROLE OPERATIONS
   * -------------------------*/
  async createRole(data: {
    name: string;
    scope?: "GLOBAL" | "BRANCH";
    branch?: string;
  }) {
    const scope = data.scope || "BRANCH";

    const query: any = { name: data.name, scope };
    if (scope === "BRANCH" && data.branch) {
      query.branch = data.branch;
    }

    const exists = await Role.findOne(query);
    if (exists) throw new Error("Role already exists in this scope/branch");

    const newRole = await Role.create({
      name: data.name,
      scope,
      branch: scope === "BRANCH" ? data.branch : null,
      permissions: [],
    });

    return newRole;
  },

  async getRoles() {
    return await Role.find()
      .populate("permissions")
      .populate("branch");
  },

  async updateRole(
    id: string,
    data: { name?: string; scope?: "GLOBAL" | "BRANCH"; branch?: string }
  ) {
    const role = await Role.findById(id);
    if (!role) throw new Error("Role not found");

    // Eğer isim değişecekse duplicate kontrolü
    if (data.name && data.name !== role.name) {
      const exists = await Role.findOne({
        name: data.name,
        scope: data.scope || role.scope,
        branch: data.branch || role.branch,
      });
      if (exists) throw new Error("Another role with this name already exists in the same scope/branch");
    }

    Object.assign(role, data);
    await role.save();

    return role;
  },

  async deleteRole(id: string) {
    await RolePermission.deleteMany({ role: id });
    return await Role.findByIdAndDelete(id);
  },

  /* ---------------------------
   *  ROLE-PERMISSION ASSIGNMENTS
   * -------------------------*/
  async assignPermissionToRole(data: {
    roleId: string;
    permissionId: string;
    branch?: string;
  }) {
    const { roleId, permissionId, branch } = data;

    const role = await Role.findById(roleId);
    if (!role) throw new Error("Role not found");

    // Eğer rol BRANCH tipindeyse branch zorunlu
    let branchToUse = null;
    if (role.scope === "BRANCH") {
      branchToUse = branch || role.branch;
      if (!branchToUse) throw new Error("Branch is required for branch-level roles");
    }

    const exists = await RolePermission.findOne({
      role: roleId,
      permission: permissionId,
      branch: branchToUse,
    });
    if (exists) throw new Error("This permission already assigned to this role");

    const assignment = await RolePermission.create({
      role: roleId,
      permission: permissionId,
      branch: branchToUse,
    });

    await Role.findByIdAndUpdate(roleId, {
      $addToSet: { permissions: permissionId },
    });

    return assignment;
  },

  async removePermissionFromRole(roleId: string, permissionId: string) {
    await RolePermission.deleteOne({ role: roleId, permission: permissionId });
    await Role.findByIdAndUpdate(roleId, {
      $pull: { permissions: permissionId },
    });
    return { message: "Permission removed from role" };
  },

  async getRolePermissions(roleId: string) {
    return await RolePermission.find({ role: roleId })
      .populate("permission")
      .populate("branch");
  },
};
