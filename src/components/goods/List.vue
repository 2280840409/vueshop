<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model.trim="queryInfo.query" clearable @clear="getGoodList">
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="
                handleCurrentChange(1);
                getGoodList;
              "
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>
      <!--商品列表区域-->
      <el-table :data="goodsList" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格" width="95px"></el-table-column>
        <el-table-column prop="goods_number" label="商品数量" width="70px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70px"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="140px">
          <template v-slot="slot">
            {{ slot.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <!--修改按钮区域-->
        <el-table-column label="操作" width="130px">
          <template v-slot="slot">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removegoodById(slot.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      goodsList: [],
      total: 0,
    };
  },
  created() {
    this.getGoodList();
  },
  methods: {
    async getGoodList() {
      const res = await this.request({
        url: "goods",
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) return this.$message.error("获取商品列表失败");
      this.goodsList = res.data.goods;
      this.total = res.data.total;
      // console.log(this.goodList);
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodList();
    },
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum;
      this.getGoodList();
    },
    // 删除
    async removegoodById(goods_id) {
      const confirmResult = await this.$confirm("此操作将永久删除该商品, 是否继续?", "提示", {
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
        url: `goods/${goods_id}`,
      });
      if (res.meta.status !== 200) return this.$message.error("删除此商品失败");
      this.$message.success("删除此商品成功");
      this.getGoodList();
    },
    goAddpage() {
      this.$router.push("/goods/add");
    },
  },
};
</script>

<style scoped></style>
