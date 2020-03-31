<template>
  <div>
    <breadcrumb :titleList="['用户管理', '用户列表']" />
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="16" class="add_user">
          <el-button type="primary" @click="isFormDialogVisible(true)">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="usersList" style="width: 100%" highlight-current-row stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column label="电话">
          <template slot-scope="scope">
            {{scope.row.mobile ? scope.row.mobile : "空"}}
          </template>
        </el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
           <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="stateChange(scope.row.id,$event)"></el-switch>
           </template>
        </el-table-column>
        <el-table-column label="操作">
           <template slot-scope="scope">
             <el-button type="primary" size="mini" icon="el-icon-edit" @click="isFormDialogVisible(false,scope.row.id)"></el-button>
             <el-button type="danger" size="mini" icon="el-icon-delete" @click="delUser(scope.row.id)"></el-button>
             <el-button type="warning" size="mini" icon="el-icon-setting" @click="isShowRoleDialog(scope.row)"></el-button>
           </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 3, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 表单对话框 -->
    <el-dialog
      :title="isAdd?'添加用户':'编辑用户'"
      :visible.sync="isDialogVisible"
      width="50%">
      <el-form ref="dialogFormRef" :model="dialogForm" label-width="80px" :rules="dialogFormRules" v-if="isAdd">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="dialogForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="dialogForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="dialogForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="dialogForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <el-form ref="dialogFormRef" :model="dialogForm" label-width="80px" :rules="dialogFormRules" v-else>
        <el-form-item label="用户名">
          <el-input v-model="dialogForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="dialogForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="dialogForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleDialogFormSub">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      title='分配角色'
      :visible.sync="isRolesDialogVisible"
      width="50%">
      <div>
        <p>当前的用户：{{currentUser.username}}</p>
        <p>当前的角色：{{currentUser.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="currentUserRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
            </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="subRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '../Breadcrumb.vue'

export default {
  data () {
    return {
      usersList: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 3
      },
      total: 1,
      isDialogVisible: false,
      isAdd: true,
      dialogForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
        role_name: ''
      },
      dialogFormRules: {
        username: [{ required: true, message: '请填入用户名', trigger: 'blur' }, { min: 2, max: 10, message: '位数2-10', trigger: 'blur' }],
        password: [{ required: true, message: '请填入密码', trigger: 'blur' }, { min: 2, max: 10, message: '位数2-10', trigger: 'blur' }],
        email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
        mobile: [{ pattern: /^1[34578]\d{9}$/, message: '目前只支持中国大陆的手机号码', trigger: ['blur', 'change'] }]
      },
      editUserId: 0,
      isRolesDialogVisible: false,
      currentUser: {},
      rolesList: [],
      currentUserRoleId: ''
    }
  },
  methods: {
    async getUsersList () {
      const { data } = await this.$http.get('users', { params: this.queryInfo })
      this.usersList = data.data.users
      this.total = data.data.total
    },
    handleSizeChange (newVal) {
      this.queryInfo.pagesize = newVal
      this.getUsersList()
    },
    handleCurrentChange (newVal) {
      this.queryInfo.pagenum = newVal
      this.getUsersList()
    },
    async isFormDialogVisible (isAdd, id) {
      this.isAdd = isAdd
      this.isDialogVisible = true
      if (isAdd) {
        this.dialogForm.username = ''
        this.dialogForm.mobile = ''
        this.dialogForm.email = ''
      } else {
        const { data } = await this.$http.get(`users/${id}`)
        this.dialogForm.username = data.data.username
        this.dialogForm.mobile = data.data.mobile
        this.dialogForm.email = data.data.email
        this.editUserId = data.data.id
      }
    },
    async handleDialogFormSub () {
      this.$refs.dialogFormRef.validate(async vaild => {
        if (vaild) {
          if (this.isAdd) {
            const { data } = await this.$http.post('users', this.dialogForm)
            if (data.meta.status !== 201) return this.$message.error(data.meta.msg ? data.meta.msg : '添加用户失败')
            this.$message.success('添加用户成功')
            this.getUsersList()
          } else {
            const { data } = await this.$http.put(`users/${this.editUserId}`, { email: this.dialogForm.email, mobile: this.dialogForm.mobile })
            if (data.meta.status !== 200) return this.$http.error('修改用户失败')
            this.$message.success('修改用户成功')
            this.getUsersList()
          }
        } else {
          this.$message.error('表单验证错误')
        }
      })
      this.isDialogVisible = false
    },
    async stateChange (uid, state) {
      const { data } = await this.$http.put(`users/${uid}/state/${state}`)
      if (data.meta.status !== 200) return this.$message.error('更新状态失败')
      this.$message.success('成功更新状态')
      this.getUsersList()
    },
    async isShowRoleDialog (userInfo) {
      this.currentUser = userInfo
      this.isRolesDialogVisible = true
      const { data } = await this.$http.get('roles/')
      if (data.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.rolesList = data.data
    },
    async delUser (id) {
      const result = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).catch(error => error)
      if (result === 'cancel') return this.$message.info('取消删除')
      const { data } = await this.$http.delete(`users/${id}`)
      if (data.meta.status !== 200) return this.$message.error('删除用户失败')
      this.$message.success('成功删除')
      this.getUsersList()
    },
    async subRole () {
      this.isRolesDialogVisible = false
      const { data } = await this.$http.put(`users/${this.currentUser.id}/role`, { rid: this.currentUserRoleId })
      if (data.meta.status !== 200) return this.$message.error('更新角色失败')
      this.$message.success('更新角色成功')
      this.getUsersList()
    }
  },
  mounted () {
    this.getUsersList()
  },
  components: {
    Breadcrumb
  }
}
</script>

<style lang="less" scoped>
  .add_user{
    text-align: right;
  }
  p{
    margin: 15px;
  }
</style>
