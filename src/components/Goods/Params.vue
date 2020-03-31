<template>
  <div>
    <breadcrumb :titleList="['商品管理', '参数列表']" />
    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
      <el-row class="selectBox">
        <el-col>
          <span>选择商品分类：</span>
          <span>
            <el-cascader
              v-model="selectId"
              :options="categoriesList"
              :props="props"
              @change="handleChange"
            ></el-cascader>
          </span>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" @click="showDialogForm(true)" :disabled="!cateId && activeName === 'many'">添加动态参数</el-button>
          <el-table :data="manyTableList" stripe style="width: 100%">
              <el-table-column type="expand">
                <template slot-scope="scope">
                    <el-tag
                      :key="index"
                      v-for="(tag,index) in scope.row.attr_vals"
                      closable
                      :disable-transitions="false"
                      @close="handleClose(scope.row, index)"
                    >{{tag}}</el-tag>
                    <el-input
                      class="input-new-tag"
                      v-if="inputVisible"
                      v-model="inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)"
                    ></el-input>
                    <el-button v-else size="small" class="button-new-tag" @click="showInput">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column prop="attr_name" label="参数名称"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="showDialogForm(false, scope.row.attr_id)">编辑</el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="delAttr(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" @click="showDialogForm(true)" :disabled="!cateId && activeName === 'only'">添加静态属性</el-button>
          <el-table :data="onlyTableList" stripe style="width: 100%">
              <el-table-column type="expand">
                <template slot-scope="scope">
                    <el-tag
                      :key="index"
                      v-for="(tag,index) in scope.row.attr_vals"
                      closable
                      :disable-transitions="false"
                      @close="handleClose(scope.row, index)"
                    >{{tag}}</el-tag>
                    <el-input
                      class="input-new-tag"
                      v-if="inputVisible"
                      v-model="inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)"
                    ></el-input>
                    <el-button v-else size="small" class="button-new-tag" @click="showInput">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column prop="attr_name" label="属性名称"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="showDialogForm(false, scope.row.attr_id)">编辑</el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="delAttr(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="isDialogVisible"
      width="50%"
      @close="dialogClosed">
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogFormRules" label-width="80px">
        <el-form-item label="参数名称" prop="params">
          <el-input v-model="dialogForm.params" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="sumDialogForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '../Breadcrumb.vue'

export default {
  data () {
    return {
      selectId: [],
      categoriesList: null,
      props: {
        label: 'cat_name',
        value: 'cat_id',
        expandTrigger: 'hover',
        children: 'children'
      },
      activeName: 'many',
      manyTableList: [],
      onlyTableList: [],
      inputVisible: false,
      inputValue: '',
      tagListL: [],
      isDialogVisible: false,
      isAdd: true,
      dialogForm: {
        params: ''
      },
      dialogFormRules: {
        params: [
          { required: true, message: '请填入参数名', triggle: 'blur' }
        ]
      },
      currentAttrId: null
    }
  },
  methods: {
    async getCategoriesList () {
      const { data } = await this.$http.get('categories')
      this.categoriesList = data.data
    },
    async handleChange () {
      this.getParamsList()
    },
    async getParamsList () {
      if (this.selectId.length !== 3) {
        this.selectId = []
        return
      }
      const { data } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      data.data.forEach(item => { item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : [] })
      if (this.activeName === 'many') {
        this.manyTableList = data.data
      } else {
        this.onlyTableList = data.data
      }
    },
    handleClick (tab) {
      this.activeName = tab.name
      this.getParamsList()
    },
    showInput () {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleInputConfirm (row) {
      if (this.inputValue.trim().length !== 0) {
        row.attr_vals.push(this.inputValue)
        this.saveAttr_vals(row)
        this.inputValue = ''
      }
      this.inputVisible = false
    },
    handleClose (row, index) {
      row.attr_vals.splice(index, 1)
      this.saveAttr_vals(row)
    },
    // 保存修改后的参数
    async saveAttr_vals (row) {
      const { data } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(',')
        })
      if (data.meta.status !== 200) return this.$message.error('修改参数失败')
      this.$message.success('修改参数成功')
    },
    sumDialogForm () {
      this.$refs.dialogFormRef.validate(async valid => {
        if (valid) {
          if (this.isAdd) {
            const { data } = await this.$http.post(
              `categories/${this.cateId}/attributes`,
              {
                attr_name: this.dialogForm.params,
                attr_sel: this.activeName
              })
            if (data.meta.status !== 201) return this.$message.error('添加参数失败')
            this.$message.success('添加参数成功')
          } else {
            const { data } = await this.$http.put(
              `categories/${this.cateId}/attributes/${this.currentAttrId}`,
              {
                attr_name: this.dialogForm.params,
                attr_sel: this.activeName
              })
            if (data.meta.status !== 200) return this.$message.error('编辑参数失败')
            this.$message.success('编辑参数成功')
          }
          this.getParamsList()
          this.isDialogVisible = false
        }
      })
    },
    dialogClosed () {
      this.$refs.dialogFormRef.resetFields()
    },
    async showDialogForm (isAdd, attrId) {
      this.isAdd = isAdd
      this.dialogForm.params = ''
      if (!isAdd) {
        this.currentAttrId = attrId
        const { data } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`)
        this.dialogForm.params = data.data.attr_name
      }
      this.isDialogVisible = true
    },
    async delAttr (attrId) {
      const result = await this.$confirm('此操作将永久删除该属性, 是否继续?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).catch(err => err)
      if (result === 'cancel') return this.$message.info('取消删除')
      const { data } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if (data.meta.status !== 200) return this.$message.error('删除属性失败')
      this.$message.success('删除属性成功')
      this.getParamsList()
    }
  },
  mounted () {
    this.getCategoriesList()
  },
  components: {
    Breadcrumb
  },
  computed: {
    cateId () {
      if (this.selectId.length === 3) return this.selectId[2]
      return null
    },
    dialogTitle () {
      if (this.activeName === 'many') {
        return this.isAdd ? '添加动态参数' : '编辑动态参数'
      } else {
        return this.isAdd ? '添加静态属性' : '编辑静态属性'
      }
    }
  }
}
</script>

<style scoped>
.selectBox {
  margin: 15px 0;
}
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
