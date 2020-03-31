<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item><a href="#" @click.prevent="redirectInedx">首页</a></el-breadcrumb-item>
    <el-breadcrumb-item v-for="(item, index) in titleList" :key="index">{{item}}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
export default {
  props: ['titleList'],
  methods: {
    redirectInedx () {
      sessionStorage.removeItem('menupath')
      this.$router.push('/home')
      location.reload()
    }
  }
}
</script>
