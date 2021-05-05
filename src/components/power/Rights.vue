<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-table :data="rightList" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template v-slot="slot">
            <el-tag v-if="slot.row.level === '0'">标签一</el-tag>
            <el-tag type="success" v-else-if="slot.row.level === '1'">标签二</el-tag>
            <el-tag type="warning" v-else>标签二</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { request } from "../../network/index.js";
export default {
  name: "Right",
  data() {
    return {
      rightList: [],
    };
  },
  created() {
    this.getRightList();
  },
  methods: {
    async getRightList() {
      const res = await request({
        method: "get",
        url: "rights/list",
      });
      if (res.meta.status !== 200) return this.$message.error(res.meta.mag);
      this.rightList = res.data;
      console.log(this.rightList);
    },
  },
};
</script>

<style scoped></style>
