<template>
  <div>
    <breadcrumb :titleList="['商品管理', '商品分类']" />
    <el-card>
      <el-row>
        <el-col><el-button type="primary" @click="showDialogForm(true)">添加分类</el-button></el-col>
      </el-row>
      <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" :tree-type="true" border :show-row-hover="false" >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showDialogForm(false, scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="delCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <el-dialog :title="isAdd?'添加分类':'编辑分类'" :visible.sync="dialogVisible" width="50%" @close='dialogClosed'>
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogFormRules" label-position="top">
        <el-form-item label="商品分类" prop="cat_name">
          <el-input v-model="dialogForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader :disabled="!isAdd" expand-trigger="hover" :options="parentCateList" :props="props" v-model="seleteId" @change="handleChange" clearable change-on-select>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="subForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '../Breadcrumb.vue'

export default {
  data () {
    return {
      cateList: [],
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        { label: '是否有效', type: 'template', template: 'isok' },
        { label: '排序', type: 'template', template: 'order' },
        { label: '操作', type: 'template', template: 'opt' }
      ],
      queryInfo: {
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      dialogVisible: false,
      isAdd: true,
      dialogForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      dialogFormRules: {
        cat_name: [
          { required: true, message: '请填入分类名称', trigger: 'blur' }
        ]
      },
      seleteId: [],
      props: {
        checkStrictly: true,
        label: 'cat_name',
        children: 'children',
        value: 'cat_id'
      },
      parentCateList: [],
      activeCateId: 0
    }
  },
  methods: {
    async getCateList () {
      const { data } = await this.$http.get('categories', { params: this.queryInfo })
      this.cateList = data.data.result
      this.total = data.data.total
    },
    async getParentCateList () {
      const { data } = await this.$http.get('categories', { params: { type: 2 } })
      this.parentCateList = data.data
    },
    handleSizeChange (newVal) {
      this.queryInfo.pagesize = newVal
      this.getCateList()
    },
    handleCurrentChange (newVal) {
      this.queryInfo.pagenum = newVal
      this.getCateList()
    },
    async delCate (cateId) {
      const result = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).catch(err => err)
      if (result === 'cancel') return this.$message.info('取消删除')
      const { data } = await this.$http.delete(`categories/${cateId}`)
      if (data.meta.status !== 200) return this.$message.error('删除分类失败')
      this.$message.success('删除分类成功')
      this.getCateList()
    },
    async showDialogForm (isAdd, cateId) {
      this.getParentCateList()
      this.isAdd = isAdd
      if (!isAdd) {
        const { data } = await this.$http.get(`categories/${cateId}`)
        this.dialogForm.cat_name = data.data.cat_name
        this.activeCateId = cateId
        if (data.data.cat_level === 0) {
          this.seleteId = []
        } else if (data.data.cat_level === 1) {
          this.seleteId = [data.data.cat_pid]
        } else if (data.data.cat_level === 2) {
          this.seleteId = [data.data.cat_pid]
          const res = await this.$http.get(`categories/${data.data.cat_pid}`)
          this.seleteId.unshift(res.data.data.cat_pid)
        }
      } else {
        this.dialogForm.cat_name = ''
        this.seleteId = []
      }
      this.dialogVisible = true
    },
    handleChange () {
      const lengths = this.seleteId.length
      if (lengths > 0) {
        this.dialogForm.cat_pid = this.seleteId[lengths - 1]
        this.dialogForm.cat_level = lengths
      } else {
        this.dialogForm.cat_pid = 0
        this.dialogForm.cat_level = 0
      }
    },
    async subForm () {
      if (this.isAdd) {
        const { data } = await this.$http.post('categories', this.dialogForm)
        if (data.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类成功')
      } else {
        await this.$http.put(`categories/${this.activeCateId}`, { cat_name: this.dialogForm.cat_name })
      }
      this.$refs.dialogFormRef.resetFields()
      this.getCateList()
      this.dialogVisible = false
    },
    dialogClosed () {
    }
  },
  mounted () {
    this.getCateList()
  },
  components: { Breadcrumb }
}
</script>

<style scoped>
.treeTable {
  margin-top: 15px;
}
</style>
