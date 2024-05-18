// components/imgCode/imgCode.js
Component({
  // 启用插槽
  options: {
    multipleSlots: true
  },

  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    imgData: '',
    sgin: ''
  },

  ready(){
    this.getCode()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getCode(){
      getApp().request.get({
        url: 'public/verifyCode',
        responseType: 'arraybuffer',
        success: (result, res) =>{
          this.setData({
            imgData: wx.arrayBufferToBase64(result)
          })
          // 响应给父组件
          this.triggerEvent('sign', res.header.sign)
        }
      })
    }
  }
})
