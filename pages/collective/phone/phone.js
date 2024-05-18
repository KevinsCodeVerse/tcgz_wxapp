// pages/collective/phone/phone.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    firmId: {
      type: String,
      value: ''
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    list: [],
  },

  ready(){
    this.getList();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 打电话
    freeTell(e){
      var phone= e.currentTarget.dataset.phone
      if(!phone) return    
      wx.makePhoneCall({
        phoneNumber: phone,
      })
    },
    // 去店铺详情
    goShop(e){
      var shopId= e.currentTarget.dataset.shopid
      if(!shopId){
        wx.showToast({title: '他还没有店铺哦',icon: 'none'})
        return
      }
      wx.navigateTo({
        url: '/pages/shop/detail/detail?id='+shopId,
      })
    },
    getList(){
      app.request.post({
        url: 'user/firm/account/list',
        params: {
          firmId: this.data.firmId,
          pageNo: 1,
          pageSize: 1000
        },
        success: res => {
          this.setData({
            list: res.list
          })
        },
      })
    },
  },
})
