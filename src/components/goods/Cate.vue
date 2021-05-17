<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      <!-- 表格区域 -->
      <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index border>
        <template v-slot:isok="slot">
          <i class="el-icon-success" v-if="slot.row.cat_deleted === false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <template v-slot:order="slot">
          <el-tag size="mini" v-if="slot.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="slot.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <template v-slot:opt="slot">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(slot.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCatebyId(slot.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
      <el-form :model="addCateForm" :rules="addCateRules" ref="addCateRuleFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父类名称" prop="cat_name">
          <!-- options为数据源 -->
          <!-- props为配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children', checkStrictly: true }"
            @change="parentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑对话框 -->
    <el-dialog title="修改名称" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editCateForm" :rules="editRules" ref="editRuleFormRef" label-width="120px">
        <el-form-item label="修改父类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 商品分类数据
      cateList: [],
      total: 0,
      // 父级商品分类数据
      parentCateList: [],
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          type: "template",
          template: "isok",
        },
        {
          label: "是否有效",
          type: "template",
          template: "order",
        },
        {
          label: "操作",
          type: "template",
          template: "opt",
        },
      ],
      // 添加对话框的显示隐藏
      addCateDialogVisible: false,
      // 修改对话框的显示隐藏
      editDialogVisible: false,
      addCateForm: {
        cat_name: "",
        // 父分类Id
        cat_pid: 0,
        // 分类等级默认为一级分类
        cat_level: 0,
      },
      addCateRules: {
        cat_name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
      },
      // 选中的父级分类ID数组
      selectedKeys: [],
      editCateForm: "",
      editRules: {
        cat_name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const res = await this.request({
        method: "get",
        url: "categories",
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) return this.$message.error("获取商品分类数据失败");
      this.cateList = res.data.result;
      this.total = res.data.total;
    },
    // 监听pagesize的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听pagenum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 添加分类对话框
    showAddCateDialog() {
      this.addCateDialogVisible = true;
      this.getParentCatelist();
    },
    // 获取父级商品分类数据
    async getParentCatelist() {
      const res = await this.request({
        url: "categories",
        params: {
          type: 2,
        },
      });
      if (res.meta.status !== 200) return this.$message.error("获取父级商品分类数据失败");
      // console.log(res.data);
      this.parentCateList = res.data;
    },
    parentCateChange() {
      // console.log(this.selectedKeys);
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
        this.addCateForm.cat_level = this.selectedKeys.length;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    // 添加商品分类
    addCate() {
      this.$refs.addCateRuleFormRef.validate(async (valid) => {
        if (!valid) return;
        const res = await this.request({
          method: "post",
          url: "categories",
          data: this.addCateForm,
        });
        if (res.meta.status !== 201) return this.$message.error("添加商品分类数据失败");
        this.$message.success("添加商品分类数据成功");
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },
    // 监听对话框关闭事件，重置表单
    addCateDialogClosed() {
      this.$refs.addCateRuleFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    // ID查询数据
    async showEditDialog(id) {
      const res = await this.request({
        url: "categories/" + id,
      });
      if (res.meta.status !== 200) return this.$message.error("获取父类商品数据失败");
      this.editCateForm = res.data;
      // console.log(this.editCateForm);
      this.editDialogVisible = true;
    },
    // 修改父类名称
    editCateInfo() {
      this.$refs.editRuleFormRef.validate(async (valid) => {
        if (!valid) return;
        const res = await this.request({
          method: "put",
          url: "categories/" + this.editCateForm.cat_id,
          data: {
            cat_name: this.editCateForm.cat_name,
          },
        });
        if (res.meta.status !== 200) return this.$message.error("修改父类商品数据失败");
        this.getCateList();
        this.$message.success("修改父类商品数据成功");
        this.editDialogVisible = false;
      });
    },
    // 删除分类
    async removeCatebyId(id) {
      const confirmResult = await this.$confirm("此操作将永久删除该分类, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).catch((err) => err);
      // 如果用户确认删除，则返回值为字符串confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      // console.log(confirmResult);
      if (confirmResult !== "confirm") return this.$message.info("已取消删除");

      const res = await this.request({
        method: "delete",
        url: "categories/" + id,
      });
      if (res.meta.status !== 200) return this.$message.error("删除此分类失败");
      this.queryInfo.pagenum = 1;
      this.$message.success("删除此分类成功");
      this.getCateList();
    },
  },
};
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
