<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-alert title="消息提示的文案" type="info" center show-icon :closable="false"> </el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <!-- Tab栏 -->
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="goodsCateList" :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children' }" @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload class="upload-demo" :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headerObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="AddBtn" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: "0",
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        // 商品所属的分组数组
        goods_cat: [],
        pics: [],
        goods_introduce: "",
        attrs: [],
      },
      addFormRules: {
        goods_name: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
        goods_price: [{ required: true, message: "请输入商品价格", trigger: "blur" }],
        goods_number: [{ required: true, message: "请输入商品数量", trigger: "blur" }],
        goods_weight: [{ required: true, message: "请输入商品重量", trigger: "blur" }],
        goods_cat: [{ required: true, message: "请选择商品分类", trigger: "blur" }],
      },
      goodsCateList: [],
      manyTableData: [],
      onlyTableData: [],
      // 图片上传地址
      uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
      // 图片上传请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      // 图片预览地址
      previewPath: "",
      previewDialogVisible: false,
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const res = await this.request({
        url: "categories",
      });
      if (res.meta.status !== 200) return this.$message.error("获取商品分类列表失败");
      this.goodsCateList = res.data;
      // console.log(this.goodsCateList);
    },
    // 级联选择器
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
        return;
      }
    },
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类");
        return false;
      }
    },
    async tabClicked() {
      if (this.activeIndex === "1") {
        const res = await this.request({
          url: `categories/${this.cateId}/attributes`,
          params: {
            sel: "many",
          },
        });
        if (res.meta.status !== 200) return this.$message.error("获取商品动态属性列表失败");
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyTableData = res.data;
        // console.log(this.manyTableData);
      } else if (this.activeIndex === "2") {
        const res = await this.request({
          url: `categories/${this.cateId}/attributes`,
          params: {
            sel: "only",
          },
        });
        if (res.meta.status !== 200) return this.$message.error("获取商品静态参数列表失败");
        this.onlyTableData = res.data;
        // console.log(this.onlyTableData);
      }
    },
    // 处理图片预览
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      this.previewDialogVisible = true;
    },
    // 处理图片移出
    handleRemove(file) {
      // 1.获取将要移出图片的临时路径
      const filePath = file.response.data.tmp_path;
      // 2.找到其索引值
      const i = this.addForm.pics.findIndex((x) => {
        x.pics = filePath;
      });
      // 移出
      this.addForm.pics.splice("i", 1);
      // console.log(this.addForm);
    },
    // 图片上传成功
    handleSuccess(response) {
      // 拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path };
      this.addForm.pics.push(picInfo);
      // console.log(this.addForm);
    },
    add() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error("请填写必要的表单项");
        }
        this.addForm.goods_cat = this.addForm.goods_cat.join(",");
        // 处理动态属性
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" "),
          };
          this.addForm.attrs.push(newInfo);
        });
        // 处理静态参数
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          };
          this.addForm.attrs.push(newInfo);
        });
        console.log(this.addForm);
        // 请求
        const res = await this.request({
          method: "post",
          url: "goods",
          data: this.addForm,
        });
        if (res.meta.status !== 201) return this.$message.error("添加商品失败");
        this.$message.success("添加商品成功");
        this.$router.push("/goods");
      });
    },
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    },
  },
};
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 7px 0 0 !important;
}

.previewImg {
  width: 100%;
}

.AddBtn {
  margin-top: 15px;
}
</style>
