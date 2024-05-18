// components/referrer/referrer.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    name: {
      type: String,
      value: '',
    },
    avatar: {
      type: String,
      value: '',
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    mystyle: 'animation: fade-in .5s',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onConfirm(){
      // 响应给父组件
      this.triggerEvent('change', 'confirm')
    },
  }
})
