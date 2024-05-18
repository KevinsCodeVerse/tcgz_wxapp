const app = getApp()
Page({
  data: {
    info: ''
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.getProtocol();
  },
  //监听页面显示
  onShow: function () {
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  getProtocol(){
    app.request.post({
      url: 'user/sysParams/getAgreement',
      params: {
        type: 2,
      },
      success: res => {
        res = res.replace(/\<img(.*?)src/g,'<img style="max-width:100%!important;height:auto;display:block;" src')
        res = res.replace(/\<p/g,'<p style="line-height:1.8;word-break: break-all;"')
        res = res.replace(/\<p style="line-height:1.8;word-break: break-all;"\>\<img/g,'<p><img')
        this.setData({
          info: res
        })
      },
      finally: () => {
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