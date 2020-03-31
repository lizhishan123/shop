<template>
  <div>
    <Breadcrumb :titleList="['商品列表','添加商品']" />
    <el-card>
      <el-alert title="添加商品信息" show-icon center type="info" :closable="false"></el-alert>
      <el-steps :active="activeIndex - 0" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
      </el-steps>
      <el-form :model="addGoodForm" :rules="addGoodFormRules" label-position="top" ref="addGoodFormRef">
        <el-tabs tab-position="left" @tab-click="tabClick" :before-leave="beforeTabLeave" v-model="activeIndex">
          <el-tab-pane name="0" label="基本信息">
              <el-form-item label="商品名称" prop="goods_name">
                <el-input v-model="addGoodForm.goods_name"></el-input>
              </el-form-item>
              <el-form-item label="商品价格" prop='goods_price'>
                <el-input v-model="addGoodForm.goods_price" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品重量" prop='goods_number'>
                <el-input v-model="addGoodForm.goods_number" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品数量" prop='goods_weight'>
                <el-input v-model="addGoodForm.goods_weight" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品分类" prop='goods_cat'>
                <el-cascader v-model="addGoodForm.goods_cat" :options="cateList" :props="props" @change="handleChange"></el-cascader>
              </el-form-item>
          </el-tab-pane>
          <el-tab-pane name="1" label="商品参数">
            <el-form-item :label="item.attr_name" v-for="item in manyData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="attr" v-for="(attr, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane name="2" label="商品属性">
            <el-form-item :label="item.attr_name" v-for="item in onlyData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane name="3" label="商品图片">
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :headers="headerObj"
              list-type="picture"
              :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane name="4" label="商品内容">
            <quill-editor v-model="addGoodForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '../Breadcrumb.vue'
import _ from 'lodash'

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
      activeIndex: '0',
      addGoodForm: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addGoodFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { validator: validatorPrice, trigger: 'blur' }
        ],
        goods_number: [
          { validator: validatorPrice, trigger: 'blur' }
        ],
        goods_weight: [
          { validator: validatorPrice, trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      cateList: [],
      props: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      manyData: [],
      onlyData: [],
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewVisible: false,
      previewPath: ''
    }
  },
  methods: {
    async tabClick (tab) {
      if (this.activeIndex === '1' && !this.manyData.length) {
        const { data } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        data.data.forEach(item => { item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : [] })
        this.manyData = data.data
      } else if (this.activeIndex === '2' && !this.onlyData.length) {
        const { data } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        // data.data.forEach(item => { item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : [] })
        this.onlyData = data.data
      }
    },
    async getCateList () {
      const { data } = await this.$http.get('categories')
      this.cateList = data.data.slice(0, 10)
    },
    handleChange () {
      if (this.addGoodForm.goods_cat.length !== 3) {
        this.addGoodForm.goods_cat = []
      }
      this.manyData = []
      this.onlyData = []
    },
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addGoodForm.goods_cat.length !== 3) {
        this.$message.error('请选择好分类!')
        return false
      }
    },
    // 点击文件列表中已上传的文件时的钩子，参数为上传的文件
    handlePreview (file) {
      this.previewVisible = true
      this.previewPath = file.url
    },
    // 删除文件之前的钩子，参数为上传的文件和文件列表
    handleRemove (file) {
      const removePath = file.response.data.url
      const index = this.addGoodForm.pics.findIndex(item => item.pic === removePath)
      this.addGoodForm.pics.splice(index, 1)
    },
    // 文件上传成功时的钩子
    handleSuccess (response) {
      if (response.meta.status !== 200) return this.$message.error('上传失败')
      this.addGoodForm.pics.push({ pic: response.data.tmp_path })
    },
    add () {
      this.$refs.addGoodFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请认真填写表单')
        const cloneForm = _.cloneDeep(this.addGoodForm)
        this.manyData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_vals: item.attr_vals.join(',')
          }
          cloneForm.attrs.push(newInfo)
        })
        this.onlyData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_vals: item.attr_vals
          }
          cloneForm.attrs.push(newInfo)
        })
        cloneForm.goods_cat = this.addGoodForm.goods_cat.join(',')
        const { data } = await this.$http.post('goods', cloneForm)
        if (data.meta.status !== 201) return this.$message.error(data.meta.msg)
        this.$message.success('成功添加商品')
        this.$router.push('/home/goods')
      })
    }
  },
  mounted () {
    this.getCateList()
  },
  computed: {
    cateId () {
      return this.addGoodForm.goods_cat[2]
    }
  },
  components: {
    Breadcrumb
  }
}
</script>

<style scoped>
.previewImg{
  width: 100%;
}
</style>
