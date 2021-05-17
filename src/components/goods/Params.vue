<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-alert show-icon title="注意：只允许为第三级分类设置相关参数" type="warning" :closable="false"> </el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader v-model="selectedCateKeys" :options="cateList" :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children' }" @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- Tabs标签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabsClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBenDisabled" @click="addDialogVisible = true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableDate" border stripe>
            <el-table-column type="expand">
              <!-- 循环添加tag标签 -->
              <template v-slot="slot">
                <el-tag v-for="(item, i) in slot.row.attr_vals" :key="i" closable @close="handleclose(i, slot.row)">{{ item }}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="slot.row.inputVisible"
                  v-model="slot.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slot.row)"
                  @blur="handleInputConfirm(slot.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(slot.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="slot">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(slot.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParamsbyId(slot.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBenDisabled" @click="addDialogVisible = true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableDate" border stripe>
            <el-table-column type="expand">
              <!-- 循环添加tag标签 -->
              <template v-slot="slot">
                <el-tag v-for="(item, i) in slot.row.attr_vals" :key="i" closable @close="handleclose(i, slot.row)">{{ item }}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="slot.row.inputVisible"
                  v-model="slot.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slot.row)"
                  @blur="handleInputConfirm(slot.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(slot.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="slot">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(slot.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParamsbyId(slot.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改对话框 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      // 级联选择器选中ID
      selectedCateKeys: [],
      activeName: "many",
      // 动态数据
      manyTableDate: [],
      // 静态数据
      onlyTableDate: [],
      addDialogVisible: false,
      editDialogVisible: false,
      // tag输入框显示与隐藏
      inputVisible: false,
      addForm: {
        attr_name: "",
      },
      editForm: {},
      inputValue: "",
      addFormRules: {
        attr_name: [{ required: true, message: "请输入参数名称", trigger: "blur" }],
      },
    };
  },
  created() {
    this.getCatelist();
  },
  methods: {
    async getCatelist() {
      const res = await this.request({
        url: "categories",
      });
      if (res.meta.status !== 200) return this.$message.error("获取商品分类失败");
      this.cateList = res.data;
      // console.log(this.cateList);
    },
    // 级联选择器变化触发
    handleChange() {
      this.gitParamsData();
    },
    // tabs标签点击事件
    handleTabsClick() {
      // console.log(this.activeName);
      this.gitParamsData();
    },
    async gitParamsData() {
      // 证明选中不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = [];
        this.manyTableDate = [];
        this.onlyTableDate = [];
        return;
      }
      // console.log(this.selectedCateKeys);
      const res = await this.request({
        url: `categories/${this.cateId}/attributes`,
        params: {
          sel: this.activeName,
        },
      });
      if (res.meta.status !== 200) return this.$message.error("获取参数列表失败");
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        item.inputVisible = false;
        item.inputValue = "";
      });
      if (this.activeName === "many") {
        this.manyTableDate = res.data;
      } else {
        this.onlyTableDate = res.data;
      }
      console.log(res.data);
    },
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    // 添加
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const res = await this.request({
          method: "post",
          url: `categories/${this.cateId}/attributes`,
          data: {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          },
        });
        if (res.meta.status !== 201) return this.$message.error("添加参数失败");
        this.$message.success("添加参数成功");
        this.gitParamsData();
        this.addDialogVisible = false;
      });
    },
    async showEditDialog(attr_id) {
      const res = await this.request({
        url: `categories/${this.cateId}/attributes/${attr_id}`,
        params: {
          attr_sel: this.activeName,
        },
      });
      if (res.meta.status !== 200) return this.$message.error("获取参数信息失败");
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 修改
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const res = await this.request({
          method: "put",
          url: `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          data: {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          },
        });
        if (res.meta.status !== 200) return this.$message.error("修改参数信息失败");
        this.gitParamsData();
        this.$message.success("修改参数信息成功");
        this.editDialogVisible = false;
      });
    },
    // 删除
    async removeParamsbyId(attr_id) {
      const confirmResult = await this.$confirm("此操作将永久删除该参数, 是否继续?", "提示", {
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
        url: `categories/${this.cateId}/attributes/${attr_id}`,
      });
      if (res.meta.status !== 200) return this.$message.error("删除此参数失败");
      this.$message.success("删除此参数成功");
      this.gitParamsData();
    },
    // tag输入框事件
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false;
        row.inputValue = "";
        return;
      }
      row.attr_vals.push(row.inputValue.trim());
      row.inputVisible = false;
      row.inputValue = "";
      this.saveAttrVals(row);
    },
    // 将attr_vals的操作，保存的数据库
    async saveAttrVals(row) {
      const res = await this.request({
        method: "put",
        url: `categories/${this.cateId}/attributes/${row.attr_id}`,
        data: {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        },
      });
      if (res.meta.status !== 200) return this.$message.error("修改参数项失败");
      this.$message.success("修改参数项成功");
    },
    handleclose(i, row) {
      row.attr_vals.splice(i, 1);
      this.saveAttrVals(row);
    },
    // 展示输入框
    showInput(row) {
      row.inputVisible = true;
      // 自动焦点
      // nextTick方法的作用，就是当页面上的元素被重新渲染后，执行回调
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
  },
  computed: {
    isBenDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true;
      }
      return false;
    },
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2];
      }
      return null;
    },
    // 动态计算标题文本
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      }
      return "静态属性";
    },
  },
};
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px;
}
.el-tag {
  margin: 5px;
}
.input-new-tag {
  width: 150px;
}
</style>
