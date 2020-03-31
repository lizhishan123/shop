<template>
  <div>
    <breadcrumb :titleList="['商品管理', '商品列表']"/>
    <el-card>
      <el-row>
        <el-col class="addBtn">
          <el-button type="primary" @click="$router.push('/goods/add')">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodsList" stripe style="width: 100%" border highlight-current-row>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称" width="650"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="90"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="90"></el-table-column>
        <el-table-column prop="upd_time" label="创建时间">
          <template slot-scope="scope">
            {{scope.row.upd_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.goods_id)"></el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeGood(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 30, 50, 100]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 编辑商品区域 -->
    <el-dialog title="编辑商品" :visible.sync="isDialogVisible" width="50%" @close="dialogClosed">
      <el-form ref="editGoodFormRef" :model="editGoodForm" label-width="80px" :rules="editGoodFormRules">
        <el-form-item label="商品名称">
          <el-input v-model="editGoodForm.goods_name" disabled></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editGoodForm.goods_price" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="editGoodForm.goods_number" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editGoodForm.goods_weight" type="number"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGood">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '../Breadcrumb.vue'

export default {
  data () {
    const validatorPrice = (rule, value, callback) => {
      if (value - 0 >= 0) {
        callback()
      } else {
        callback(new Error('请输入大于0的值'))
      }
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      goodsList: [],
      total: 0,
      isDialogVisible: false,
      editGoodForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0
      },
      EditGoodId: 0,
      editGoodFormRules: {
        goods_price: [
          { validator: validatorPrice, trigger: 'blur' }
        ],
        goods_number: [
          { validator: validatorPrice, trigger: 'blur' }
        ],
        goods_weight: [
          { validator: validatorPrice, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async getGoodsList () {
      const { data } = await this.$http.get('goods', { params: this.queryInfo })
      this.goodsList = data.data.goods
      this.total = data.data.total
    },
    handleSizeChange (newVal) {
      this.queryInfo.pagesize = newVal
      this.getGoodsList()
    },
    handleCurrentChange (newVal) {
      this.queryInfo.pagenum = newVal
      this.getGoodsList()
    },
    async showEditDialog (goodId) {
      const { data } = await this.$http.get(`goods/${goodId}`)
      this.editGoodForm.goods_name = data.data.goods_name
      this.editGoodForm.goods_price = data.data.goods_price
      this.editGoodForm.goods_weight = data.data.goods_weight
      this.editGoodForm.goods_number = data.data.goods_number
      this.EditGoodId = data.data.goods_id
      this.isDialogVisible = true
    },
    dialogClosed () {
      this.$refs.editGoodFormRef.resetFields()
    },
    editGood () {
      this.$refs.editGoodFormRef.validate(async vaild => {
        if (!vaild) return this.$message.error('请真正编辑商品')
        await this.$http.put(`goods/${this.EditGoodId}`, this.editGoodForm)
        this.$message.success('编辑商品成功')
      })
    },
    async removeGood (goodsId) {
      const result = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).catch(err => err)
      if (result === 'cancel') return this.$message.info('取消删除')
      const { data } = await this.$http.delete(`goods/${goodsId}`)
      if (data.meta.status !== 200) return this.$message.error('删除商品失败')
      this.$message.success('删除商品成功')
      this.getGoodsList()
    }
  },
  mounted () {
    this.getGoodsList()
  },
  components: {
    Breadcrumb
  }
}
</script>

<style scoped>
.addBtn {
  text-align: right;
}
.el-table {
  font-size: 12px;
}
</style>
