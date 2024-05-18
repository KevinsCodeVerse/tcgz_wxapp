const app = getApp()
Page({
  data: {
    info: {},
  },
  //监听页面初次加载
  onLoad: function (options) {
    console.log(options.mercId)
    this.getInfo(options.mercId)
  },
  //监听页面显示
  onShow: function () {
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  // 获取激活信息
  getInfo(id){
    app.request.post({
      url: 'mt/info/public/activationInfo',
      params: {
        id
      },
      success: res => {
        this.setData({info: res})
      },
      error: res =>{
        
      }
    })
  },

  // 激活店铺（微信支付)
  toEnable(){
    wx.showLoading({title: '支付中',mask: true})
    app.request.post({
      url: 'wx/pay/merchantRenewal',
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
  
  //监听页面初次加载完成
  onReady: function () {},
  //监听页面隐藏
  onHide: function () {},
  //监听页面卸载
  onUnload: function () {},
  //监听用户下拉动作
  onPullDownRefresh: function () {},
  //用户上拉触底事件的处理函数
  onReachBottom: function () {},
  //用户点击右上角转发
  onShareAppMessage: function () {},
})