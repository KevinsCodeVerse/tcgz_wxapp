const app = getApp()
Page({
  data: {
    id: '',
    type: 1,
    status: 1,
    order: {},
    shop: {},
    goods: {},
    evaluate: {},
    timedown: 0,
    statusList: [
      {name: '待支付',id: 0},
      {name: '待发货',id: 1},
      {name: '待收货',id: 2},
      {name: '待评价',id: 3},
      {name: '已完成',id: 4},
      {name: '已取消',id: -2},
    ],
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.setData({
      type: options.type,
      id: options.id
    })
    this.getDetail(options.id);
  },
  //监听页面显示
  onShow: function () {
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  goEvaluate(){
    wx.navigateTo({
      url: '/pages/order/evaluate/evaluate?type=4&id='+this.data.id,
    })
  },
  goShopDetail(){
    wx.navigateTo({
      url: '/pages/shop/detail/detail?id='+this.data.shop.id,
    })
  },
  // 复制
  toCopy() {
    wx.setClipboardData({  
      data: this.data.id,
      success: () => {
        wx.showToast({
          title: '复制成功',
        })
      }
    } )
  },
  // 打电话
  freeTell(){
    if(!this.data.shop.phone){
      wx.showToast({title: '没有电话',icon: 'none'})
      return
    }
    wx.makePhoneCall({
      phoneNumber: this.data.shop.phone,
    })
  },
  // 导航
  toOpenNav(){
    let latitude= parseFloat(this.data.shop.latitude)
    let longitude= parseFloat(this.data.shop.longitude)
    let name= this.data.shop.name
    let address= this.data.shop.address
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      name: name,
      address: address,
      scale: 16
    })
  },
  // -----------------------------------------接口-----------------------------------------------
  toDelivery(){
    app.request.post({
      url: 'user/promote/signFor',
      params: {
        id: this.data.id
      },
      success: res => {
        this.getDetail(this.data.id)
        wx.showToast({
          title: '确认收货成功',
        })
      },
    })
  },

  // 微信支付
  wechatPay(){
    wx.showLoading({title: '支付中',mask: true})
    app.request.post({
      url: 'wx/pay/orderPay',
      params: {
        id: this.data.id,
        type: 4,
      },
      success: res => {
        var that= this;
        wx.requestPayment({
          timeStamp: res.timeStamp,
          nonceStr: res.nonceStr,
          package: res.packageValue,
          signType: 'MD5',
          paySign: res.paySign,
          success (result) {
            wx.showToast({
              title: '支付成功',
              icon: 'success',
              duration: 2000
            })
            setTimeout(() => {
              wx.navigateBack({
                delta: 2,
              })
            }, 1500);
          },
          fail (res) {
            wx.showToast({
              title: '支付失败',
              icon: 'none',
              duration: 2000
            })
          }
        })
      },
    })
  },

  getDetail(id){
    id= id?id: 88900141981098
    wx.showLoading({
      title: '加载中...',
    })
    app.request.post({
      url: 'user/promote/details',
      params: {
        id
      },
      success: res => {
        wx.hideLoading()
        let goods= JSON.parse(res.userOrderPay.proInfo)
        let arr=this.data.statusList.filter(i=> i.id==res.userOrderPay.status)
        if(arr.length>0) res.userOrderPay.textStatus= arr[0].name
        if(res.evaluation) res.evaluation.imgArr= res.evaluation.img ? res.evaluation.img.split(','): []
        this.setData({
          order: res.userOrderPay,
          goods: goods,
          evaluate: res.evaluation? res.evaluation: {},
          status: res.userOrderPay.status,
          timedown: res.time
        })
      },
    })
  },
  
  //监听页面初次加载完成
  onReady: function () {},
  //监听页面隐藏
  onHide: function () {},
  //监听页面卸载
  onUnload: function () {},
  //监听用户下拉动作
  onPullDownRefresh: function () {},
  //监听用户下拉动作
  onPullDownRefresh: function () {},
  //用户上拉触底事件的处理函数
  onReachBottom: function () {},
  //用户点击右上角转发
  onshareAppMessage: function () {},
})