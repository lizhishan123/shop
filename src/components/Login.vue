<template>
  <div class="main">
    <div class="login">
      <div class="header">
        <img src="../assets/logo.png" alt />
      </div>
      <el-form
        :model="queryInfo"
        ref="loginFromRef"
        :rules="rules"
      >
        <el-form-item prop="username">
          <el-input placeholder="请输入用户名" prefix-icon="el-icon-user-solid" v-model="queryInfo.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input placeholder="请输入密码" type="password" prefix-icon="el-icon-circle-check" v-model="queryInfo.password"></el-input>
        </el-form-item>
        <el-form-item class="btn">
          <el-button type="primary" @click="handleLogin">登陆</el-button>
          <el-button type="info" @click="resetLoginInput">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        username: 'admin',
        password: '123456'
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', tirrger: 'blur' },
          { min: 2, max: 10, message: '用户名应该输入2-10位', tirrger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetLoginInput () {
      this.$refs.loginFromRef.resetFields()
    },
    handleLogin () {
      this.$refs.loginFromRef.validate(async (result) => {
        if (!result) return this.$message.error('请输入正确格式')
        const { data } = await this.$http.post('login', this.queryInfo)
        if (data.meta.status !== 200) return this.$message.error('登陆失败')
        this.$message.success('登陆成功')
        sessionStorage.setItem('token', data.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.main {
  background-color: #09f;
  height: 100%;
  position: relative;
  .login {
    width: 450px;
    height: 300px;
    background-color: #fff;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .header {
      width: 150px;
      height: 150px;
      background-color: #fff;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 12px #ddd;
      position: absolute;
      left: 50%;
      top: -25%;
      transform: translate(-50%, 0);
      img {
        width: 100%;
        background-color: #ccc;
        border-radius: 50%;
      }
    }
    form{
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 20px;
      .btn{
        text-align: right;
      }
    }
  }
}
</style>
