const theme = {
  chalk: {
    backgroundColor: '#161522', // 背景颜色
    titleColor: '#fff', // 标题的文字颜色
    themeSrc: 'qiehuan_dark.png', // 切换主题按钮的图片路径
    headerBorderSrc: 'header_border_dark.png' // 页面顶部的边框图片
  },
  vintage: {
    backgroundColor: '#eee', // 背景颜色
    titleColor: '#000', // 标题的文字颜色
    themeSrc: 'qiehuan_light.png', // 切换主题按钮的图片路径
    headerBorderSrc: 'header_border_light.png' // 页面顶部的边框图片
  }
}

export function getThemeValue(themeName) {
  return theme[themeName]
}
