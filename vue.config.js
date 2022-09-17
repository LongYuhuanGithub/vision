const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '' // 部署应用包时的基本 URL，默认是 '/' 只有在一个域名上才能访问，将值改为 '' 或 './'，这样所有的资源都会被链接为相对路径，这样打出来的包可以在任意路径上访问
})
