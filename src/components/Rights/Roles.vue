<template>
  <div>
    <breadcrumb :titleList="['权限管理', '角色列表']" />
    <el-card>
      <el-row>
        <el-col class="addBtn">
          <el-button type="primary" @click="isShowDialog(true)">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" style="width: 100%" border el-icon-edit stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1, index1) in scope.row.children" :key="item1.id" class="center bottom-border" :class="index1 === 0 ? 'top-border':''">
              <el-col :span="5">
                <el-tag closable @close='removeTag(scope.row, item1.id)'>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row v-for="(item2, index2) in item1.children" :key="item2.id" :class="index2 !== 0 ? 'top-border':'' " class="center">
                  <el-col :span="6">
                    <el-tag type="success" @close='removeTag(scope.row, item2.id)' closable>{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag closable type="warning" @close='removeTag(scope.row, item3.id)' v-for="item3 in item2.children" :key="item3.id">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="日期"></el-table-column>
        <el-table-column prop="roleDesc" label="姓名"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="isShowDialog(false, scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="delRole(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="getRights(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      :title="isAdd?'添加角色':'编辑角色'"
      :visible.sync="isDialogVisible"
      width="50%"
      @close='closeDialog'>
      <el-form ref="dialogFormRef" :model="dialogForm" label-width="80px" :rules="dialogFormRules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="dialogForm.roleName" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="dialogForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="isDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogFormSub">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="分配权限"
      :visible.sync="isRightsDialogVisible"
      width="50%">
      <el-tree
        :data="rightsList"
        show-checkbox
        node-key="id"
        :default-checked-keys="defKeys"
        :props="defaultProps"
        default-expand-all
        ref="treeRef">
      </el-tree>
      <span slot="footer">
        <el-button @click="isRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="RightsDialogSub">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '../Breadcrumb.vue'

export default {
  data () {
    return {
      rolesList: [],
      isAdd: true,
      isDialogVisible: false,
      dialogForm: {
        roleName: '',
        roleDesc: ''
      },
      dialogFormRules: {
        roleName: [{ required: true, message: '请填入角色名称', trggier: 'blur' }]
      },
      currentRoleId: '',
      rightsList: [],
      defaultProps: {
        label: 'authName',
        children: 'children'
      },
      isRightsDialogVisible: false,
      defKeys: []
    }
  },
  methods: {
    async getRolesList () {
      const { data } = await this.$http.get('roles')
      this.rolesList = data.data
    },
    async removeTag (role, rightId) {
      const result = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).catch(err => err)
      if (result === 'cancel') return this.$message.info('取消删除角色权限')
      const { data } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (data.meta.status !== 200) return this.$message.error('删除角色权限失败')
      this.$message.success('成功删除角色权限')
      role.children = data.data
    },
    async isShowDialog (isAdd, roleId) {
      this.isAdd = isAdd
      if (!isAdd && roleId) {
        const { data } = await this.$http.get(`roles/${roleId}`)
        if (data.meta.status !== 200) return this.$message.error('编辑角色信息查询失败')
        this.dialogForm.roleName = data.data.roleName
        this.dialogForm.roleDesc = data.data.roleDesc
        this.currentRoleId = data.data.roleId
      } else {
        this.dialogForm.roleName = ''
        this.dialogForm.roleDesc = ''
      }
      this.isDialogVisible = true
    },
    dialogFormSub () {
      this.$refs.dialogFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请认真填表单')
        if (this.isAdd) {
          const { data } = await this.$http.post('roles', this.dialogForm)
          if (data.meta.status !== 201) return this.$message.error('添加角色失败')
          this.$message.success('成功添加角色')
        } else {
          const { data } = await this.$http.put(`roles/${this.currentRoleId}`, this.dialogForm)
          if (data.meta.status !== 200) return this.$message.error('编辑角色失败')
          this.$message.success('成功编辑角色')
        }
        this.getRolesList()
        this.isDialogVisible = false
      })
    },
    async delRole (roleId) {
      const result = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).catch(err => err)
      if (result === 'cancel') return this.$message.info('取消删除角色')
      const { data } = await this.$http.delete(`roles/${roleId}`)
      if (data.meta.status !== 200) return this.$message.error('删除角色失败')
      this.$message.success('成功删除角色')
      this.getRolesList()
    },
    closeDialog () {
      this.$refs.dialogFormRef.resetFields()
    },
    async getRights (role) {
      const { data } = await this.$http.get('rights/tree')
      this.rightsList = data.data
      this.isRightsDialogVisible = true
      this.currentRoleId = role.id
      this.getDefKey(role, this.defKeys)
    },
    getDefKey (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getDefKey(item, arr))
    },
    async RightsDialogSub () {
      // 树形图选中节点
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const { data } = await this.$http.post(`roles/${this.currentRoleId}/rights`, { rids: keys.join(',') })
      if (data.meta.status !== 200) return this.$message.error('角色授权失败')
      this.$message.success('成功授权')
      this.getRolesList()
      this.isRightsDialogVisible = false
    }
  },
  mounted () {
    this.getRolesList()
  },
  components: {
    Breadcrumb
  }
}
</script>

<style lang="less" scoped>
.addBtn {
  text-align: right;
}
.center{
  display: flex;
  align-items: center;
  justify-content: center;
}
.el-tag {
  margin: 7px;
}
.bottom-border {
  border-bottom: 1px solid #eee;
}
.top-border {
  border-top: 1px solid #eee;
}
</style>
