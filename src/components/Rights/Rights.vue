<template>
  <div>
    <breadcrumb :titleList="['权限管理','权限列表']"/>
    <el-card>
      <el-table :data="rightsList" stripe style="width: 100%" border highlight-current-row>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column label="权限等级">
          <template slot-scope="scope">
            <el-tag type="primary" v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import Breadcrumb from '../Breadcrumb.vue'

export default {
  data () {
    return {
      rightsList: []
    }
  },
  methods: {
    async getRightsList () {
      const { data } = await this.$http.get('rights/list')
      this.rightsList = data.data
    }
  },
  mounted () {
    this.getRightsList()
  },
  components: {
    Breadcrumb
  }
}
</script>
