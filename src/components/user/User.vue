<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片-->
    <el-card>
      <!--搜索与添加区域-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="SearchList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!--用户列表区域-->
      <el-table :data="userList" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="联系方式"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="slot">
            <el-switch v-model="slot.row.mg_state" @change="userStateChanged(slot.row)"></el-switch>
          </template>
        </el-table-column>
        <!--修改按钮区域-->
        <el-table-column label="操作" width="180px">
          <template v-slot="slot">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(slot.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(slot.row.id)"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRoleDialog(slot.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--页码区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="dialogVisibleClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="联系方式" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="联系方式" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClose">
      <div>
        <p>当前用户： {{ userInfo.username }}</p>
        <p>当前角色： {{ userInfo.role_name }}</p>
        <p>
          分配新角色：
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id"> </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { request } from "../../network/index.js";

export default {
  data() {
    // 验证邮箱
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (regEmail.test(value)) return cb();
      cb(new Error("请输入正确邮箱"));
    };
    // 验证联系方式
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[189]))\d{8}$/;
      if (regMobile.test(value)) return cb();
      cb(new Error("请输入正确手机号码"));
    };
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2,
      },
      userList: [],
      total: 0,
      // 添加用户对话框控制
      dialogVisible: false,
      // 修改用户对话框控制
      editDialogVisible: false,
      // 分配用户对话框控制
      setRoleDialogVisible: false,
      // 表单属性
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      // 分配用户信息
      userInfo: {},
      // 角色列表
      roleList: [],
      // 分配新角色ID
      selectRoleId: "",
      // 表单规则
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 10,
            message: "长度在 6 到 10 个字符",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入联系方式", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      editForm: "",
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const res = await request({
        method: "get",
        url: "/users",
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 监听pagenum改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    async userStateChanged(userinfo) {
      await request({
        method: "put",
        url: `users/${userinfo.id}/state/${userinfo.mg_state}`,
      }).then((res) => {
        console.log(res);
        if (res.meta.status !== 200) {
          userinfo.mg_state = !userinfo.mg_state;
          return this.$message.error("更新用户状态失败");
        }
        this.$message.success("更新用户状态成功");
      });
    },
    // 搜索内容
    SearchList() {
      this.queryInfo.pagenum = 1;
      this.getUserList();
    },
    // 监听添加用户对话框的关闭事件
    dialogVisibleClose() {
      this.$refs.addFormRef.resetFields();
    },
    // 添加用户
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const res = await request({
          method: "post",
          url: "users",
          data: this.addForm,
        });
        if (res.meta.status !== 201) return this.$message.error("添加用户失败");
        this.$message.success("添加用户成功");
        this.dialogVisible = false;
        this.getUserList();
      });
    },
    // 查询用户信息
    async showEditDialog(id) {
      const res = await request({
        method: "get",
        url: "users/" + id,
      });
      if (res.meta.status !== 200) return this.$message.error("查询用户信息失败");
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 监听修改用户对话框的关闭事件
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    // 修改用户信息
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        const res = await request({
          method: "put",
          url: "users/" + this.editForm.id,
          data: {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          },
        });
        if (res.meta.status !== 200) return this.$message.error("修改用户信息失败");
        this.getUserList();
        this.$message.success("修改用户信息成功");
        this.editDialogVisible = false;
      });
    },
    // 删除用户信息
    async removeUserById(id) {
      const confirmResult = await this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).catch((err) => err);
      // 如果用户确认删除，则返回值为字符串confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      // console.log(confirmResult);
      if (confirmResult !== "confirm") return this.$message.info("已取消删除");

      const res = await request({
        method: "delete",
        url: "users/" + id,
      });
      if (res.meta.status !== 200) return this.$message.error("删除用户失败");
      this.getUserList();
      this.$message.success("删除用户成功");
    },
    // 分配角色对话框获取角色列表
    async showSetRoleDialog(userInfo) {
      this.userInfo = userInfo;
      this.setRoleDialogVisible = true;
      const res = await request({
        method: "get",
        url: "roles",
      });
      if (res.meta.status !== 200) return this.$message.error("获取角色列表失败");
      this.roleList = res.data;
    },
    // 分配角色
    async allotRole() {
      const res = await request({
        method: "put",
        url: `users/${this.userInfo.id}/role`,
        data: {
          rid: this.selectRoleId,
        },
      });
      if (res.meta.status !== 200) return this.$message.error("分配角色失败");
      this.getUserList();
      this.setRoleDialogVisible = false;
      this.$message.success("分配用户成功");
    },
    setRoleDialogClose() {
      this.userInfo = {};
      this.selectRoleId = "";
    },
  },
};
</script>

<style scoped></style>
