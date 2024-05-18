const app = getApp()
Page({
  data: {
    account: '',
    type: '',
  },
  //监听页面初次加载
  onLoad: function (options) {
      console.log("type:",options);
    wx.setNavigationBarTitle({
      title: options.type==2?'电脑版商家后台': '电脑版集体后台'
    })
    this.setData({
      account: options.account,
      type: options.type
    })
  },
  //监听页面显示
  onShow: function () {
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  copyCode() {
      console.log("type:",this.data.type);
    let str= this.data.type==2? 'https://www.tcgz.store/merchant':'https://www.tcgz.store/firm'
    wx.setClipboardData({
      data: str,
      success: () => {
        wx.showToast({
          title: '复制成功',
        })
      }
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