// components/confirm/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onConfirm(){
      // 响应给父组件
      this.triggerEvent('change', 'confirm')
    },
    onCancel(){
      // 响应给父组件
      this.triggerEvent('change', 'cancel')
    },
  }
})
