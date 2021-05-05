<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-button type="primary" @click="addDialogVisible = true">创建角色</el-button>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" stripe border>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="slot">
            <el-row :class="['bdbottom', index1 == 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, index1) in slot.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag>{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二和三级权限 -->
              <el-col :span="19">
                <el-row :class="[index2 == 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, index2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRightById(slot.row, item3.id)">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column prop="level" label="操作" width="300px">
          <template v-slot="slot">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(slot.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(slot.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(slot.row)">分配角色</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="创建角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色对话框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
      <!-- 分配权限对话框 -->
    </el-dialog>
    <el-dialog title="提示" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClose">
      <el-tree :data="rightsList" :props="defaultProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="deKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { request } from "../../network/index.js";
export default {
  data() {
    return {
      rolesList: [],
      addForm: {
        roleName: "",
        roleDesc: "",
      },
      editForm: {
        roleName: "",
        roleDesc: "",
      },
      deKeys: [],
      rightsList: [],
      // 添加角色对话框显示隐藏
      addDialogVisible: false,
      // 修改角色对话框显示隐藏
      editDialogVisible: false,
      // 分配角色对话框
      setRightDialogVisible: false,
      // 获取分配角色ID
      roleId: "",
      // 表单规则
      addFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 2,
            max: 7,
            message: "长度在 2 到 7 个字符",
            trigger: "blur",
          },
        ],
        roleDesc: [{ required: true, message: "请输入角色描述", trigger: "blur" }],
      },
      // 树形组件配置
      defaultProps: {
        children: "children",
        label: "authName",
      },
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      const res = await request({
        method: "get",
        url: "roles",
      });
      if (res.meta.status !== 200) return this.$message.error(res.meta.mag);
      this.rolesList = res.data;
    },
    // 添加角色
    async addRole() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const res = await request({
          method: "post",
          url: "roles",
          data: this.addForm,
        });
        if (res.meta.status !== 201) return this.$message.error("创建角色失败");
        this.$message.success("创建角色成功");
        this.addDialogVisible = false;
        this.getRolesList();
      });
    },
    // 监听添加角色对话框的关闭事件 重置
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    // 查询角色信息
    async showEditDialog(id) {
      const res = await request({
        method: "get",
        url: "roles/" + id,
      });
      if (res.meta.status !== 200) return this.$message.error("查询角色信息失败");
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 监听修改用户对话框的关闭事件 重置
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    // 修改角色信息
    editRoleInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const res = await request({
          method: "put",
          url: "roles/" + this.editForm.roleId,
          data: {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc,
          },
        });
        if (res.meta.status !== 200) return this.$message.error("修改角色信息失败");
        this.getRolesList();
        this.$message.success("修改角色信息成功");
        this.editDialogVisible = false;
      });
    },
    // 删除角色信息
    async removeRoleById(id) {
      const confirmResult = await this.$confirm("此操作将永久删除该角色, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).catch((err) => err);
      if (confirmResult !== "confirm") return this.$message.info("已取消删除");

      const res = await request({
        method: "delete",
        url: "roles/" + id,
      });
      if (res.meta.status !== 200) return this.$message.error("删除角色失败");
      this.getRolesList();
      this.$message.success("删除角色成功");
    },
    // 删除权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm("此操作将永久删除该角色权限, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).catch((err) => err);

      if (confirmResult !== "confirm") return this.$message.info("已取消删除");

      const res = await request({
        method: "delete",
        url: `roles/${role.id}/rights/${rightId}`,
      });
      if (res.meta.status !== 200) return this.$message.error("删除角色权限失败");
      role.children = res.data;
      this.$message.success("删除角色权限成功");
    },
    // 获取角色权限
    async showSetRightDialog(role) {
      this.roleId = role.id;
      const res = await request({
        method: "get",
        url: "rights/tree",
      });
      if (res.meta.status !== 200) return this.$message.error("获取角色权限失败");
      this.rightsList = res.data;
      this.getLeafKeys(role, this.deKeys);
      this.setRightDialogVisible = true;
    },
    // 利用递归获取角色3级权限id
    getLeafKeys(node, arr) {
      if (!node.children) return arr.push(node.id);
      node.children.forEach((item) => this.getLeafKeys(item, arr));
    },
    setRightDialogClose() {
      this.deKeys = [];
    },
    async allotRight() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()];
      const idStr = keys.join(",");
      const res = await request({
        method: "post",
        url: `roles/${this.roleId}/rights`,
        data: {
          rids: idStr,
        },
      });
      if (res.meta.status !== 200) return this.$message.error("授权角色权限失败");
      console.log(res);
      this.$message.success("授权角色权限成功");
      this.getRolesList();
      this.setRightDialogVisible = false;
    },
  },
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
