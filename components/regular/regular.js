// components/regular/regular.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    ruleList: {
      type: Array,
      value: [],
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  ready(){
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
