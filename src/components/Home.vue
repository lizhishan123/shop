<template>
  <el-container class="home-container">
    <el-header>
      <div class="title">
        <span>
          <ul class="aninmite">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </ul>
        </span>
        <span>电商后台管理系统</span>
      </div>
      <div class="layout">
        <el-button type="info" @click="layout">退出</el-button>
      </div>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '60px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          :default-active="menuPath"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#ffd04b"
          unique-opened
          router
          :collapse="isCollapse"
          :collapse-transition="false">
          <el-submenu :index="item.id + ''" v-for="item in menusList" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item-group v-for="item1 in item.children" :key="item1.id">
              <el-menu-item :index="'/home/'+item1.path" @click="savePath">
                <template slot="title">
                  <i class="el-icon-menu"></i>
                  <span>{{item1.authName}}</span>
                </template>
              </el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      menusList: [],
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false,
      menuPath: ''
    }
  },
  methods: {
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    savePath () {
      this.menuPath = this.$route.path
      sessionStorage.setItem('menupath', this.menuPath)
    },
    async layout () {
      const result = await this.$confirm('确定退出吗, 是否继续?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).catch(error => error)
      if (result === 'cancel') return this.$message.info('取消退出')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('menupath')
      this.$router.push('/login')
      this.$message.success('成功退出')
    }
  },
  async mounted () {
    const { data } = await this.$http.get('menus')
    this.menusList = data.data
    this.menuPath = sessionStorage.getItem('menupath') || ''
  }
}
</script>

<style lang="less" scoped>
.el-container{
  .el-aside{
    background-color: #333744;
    .el-menu {
      border-right: none;
  }
  }
}
.home-container{
  height: 100%;
}
header {
  background-color: #373d41;
  .title {
    color: #fff;
    font-size: 20px;
    float: left;
    line-height: 60px;
    span {
      float: left;
    }
  }
  .layout {
    line-height: 60px;
    float: right;
  }
}
.aninmite {
  width: 60px;
  height: 60px;
  position: relative;
  li {
    width: 6px;
    height: 6px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  li:nth-child(1) {
    background-color: #09f;
  }
  li:nth-child(2) {
    box-shadow: 0 0 9px #09f;
    animation: move 1.8s linear infinite;
  }
  li:nth-child(3) {
    box-shadow: 0 0 9px #09f;
    animation: move 1.8s linear infinite;
    animation-delay: 0.6s;
  }
  li:nth-child(4) {
    box-shadow: 0 0 9px #09f;
    animation: move 1.8s linear infinite;
    animation-delay: 1.2s;
  }
  @keyframes move {
    0% {
    }
    70% {
      width: 30px;
      height: 30px;
      opacity: 1;
    }
    100% {
      width: 60px;
      height: 60px;
      opacity: 0;
    }
  }
}
.iconfont{
  margin-right: 10px;
}
.toggle-button{
  text-align: center;
  line-height: 24px;
  color: #fff;
  background-color: #334258;
}
.el-main{
  background-color: #eaedf1;
}
</style>
