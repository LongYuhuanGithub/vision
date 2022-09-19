export default class WebSocketService {
  static instance = null // 存放这个类的实例
  ws = null // 存放 WebSocket 的实例
  callbackMapping = {} // 存放回调函数
  connected = false // 是否连接成功
  sendRetryCount = 0 // 发送的重试次数
  connectRetryCount = 0 // 连接的重试次数

  // 单例模式
  static get getInstance() {
    if (!this.instance) this.instance = new WebSocketService()
    return this.instance
  }

  // 连接服务器的函数
  connect() {
    if (!window.WebSocket) return console.log('您的浏览器不支持 WebSocket')
    this.ws = new window.WebSocket('ws://localhost:9999')
    this.ws.onopen = () => {
      this.connected = true
      this.connectRetryCount = 0
      console.log('连接 WebSocket 服务器成功')
    }
    this.ws.onclose = () => {
      this.connected = false
      console.log('连接 WebSocket 服务器失败')
      setTimeout(() => this.connect(), ++this.connectRetryCount * 500) // 连接失败，递归调用自己重试，重试次数越多延迟时间越长
    }
    this.ws.onmessage = ({ data }) => {
      data = JSON.parse(data)
      console.log(data)
      const socketType = data.socketType
      if (this.callbackMapping[socketType]) { // 判断回调函数是否存在
        if (data.action === 'getData') this.callbackMapping[socketType](data.data) // 判断是 getData，调用对应组件中的 getData()
        else if (data.action === 'fullScreen') this.callbackMapping[socketType](data) // 判断是 fullScreen，
        else if (data.action === 'themeChange') this.callbackMapping[socketType]() // 判断是 themeChange，不用传参
      }
    }
  }

  // 注册某一个回调函数
  registerCallback(socketType, callback) {
    this.callbackMapping[socketType] = callback
  }

  // 取消某一个回调函数
  unRegisterCallback(socketType) {
    this.callbackMapping[socketType] = null
  }

  // 发送数据的函数
  send(data) {
    if (this.connected) { // 如果连接成功，发送数据
      this.sendRetryCount = 0 // 重置重试次数
      this.ws.send(JSON.stringify(data))
    } else { // 如果连接失败，延迟一会儿再递归调用自己重试
      setTimeout(() => this.send(data), ++this.sendRetryCount * 500) // 重试次数越多延迟时间越长
    }
  }
}
