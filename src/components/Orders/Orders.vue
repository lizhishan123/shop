<template>
  <div>
    <breadcrumb :titleList="['订单管理','订单列表']"/>
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="ordersList" stripe border highlight-current-row style="width: 100%">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column label="是否付款">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.order_pay === '0'">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货">
        </el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">{{scope.row.update_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
            <el-button size="mini" type="success" icon="el-icon-location" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 展示物流进度的对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in activities"
          :key="index"
          :timestamp="activity.ftime">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '../Breadcrumb.vue'
export default {
  data () {
    return {
      ordersList: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      progressVisible: false,
      activities: []
    }
  },
  methods: {
    async getOrdersList () {
      const { data } = await this.$http.get('orders', { params: this.queryInfo })
      this.ordersList = data.data.goods
      this.total = data.data.total
    },
    handleSizeChange (newVal) {
      this.queryInfo.pagesize = newVal
      this.getOrdersList()
    },
    handleCurrentChange (newVal) {
      this.queryInfo.pagenum = newVal
      this.getOrdersList()
    },
    async showProgressBox () {
      const { data } = await this.$http.get('/kuaidi/804909574412544580')
      this.activities = data.data
      this.progressVisible = true
    }
  },
  mounted () {
    this.getOrdersList()
  },
  components: { Breadcrumb }
}
</script>
