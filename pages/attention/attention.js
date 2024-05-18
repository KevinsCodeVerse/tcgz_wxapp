const app = getApp()
// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');
// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: 'L63BZ-6CDLU-WCVVN-2OL5O-2K4I2-ZEBNB' // 必填
}); 

Page({
  data: {
    isAttent: 0,
  },
  //监听页面初次加载
  onLoad: function (options) {
    wx.removeStorageSync('backGoods')
    wx.removeStorageSync('backShop')
  },
  //监听页面显示
  onShow: function () {
    this.moveToLocation()
    this.getFirm()
    // 获取关注列表相关
    let noattent= this.selectComponent('#noattent')
    if(noattent && !wx.getStorageSync('backFind')) {
      noattent.getSite()
      noattent.toClear()
    }
    wx.removeStorageSync('backFind')

    if(!wx.getStorageSync('token')){
      // app.login();
      this.setData({isAttent: 10})
      return
    } else {
      this.getAttent();
    }
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  getAttent(){
    app.request.post({
      url: 'user/firm/merchantFocusIn/list',
      success: res => {
        if(res.length>0){
          this.setData({
            firmList: res,
            isAttent: 11
          })
          let attent= this.selectComponent('#attent')
          attent.toReset();
          wx.setStorageSync('isAttent', 11)
        }else{
          this.setData({
            isAttent: 10
          })
        }
      },
    })
  },

  // 隐藏集体
  getFirm(){
    app.request.post({
      url: 'user/firm/public/hide',
      success: res => {
        wx.setStorageSync('isFirm', res.value)
      },
    })
  },

  //定位授权
  moveToLocation() {
    var that = this;
    wx.getSetting({
      success(res) {
        if(!res.authSetting['scope.userLocation']){
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              // 用户已经同意
              //其他操作...
              console.log("用户已经同意位置授权");
              wx.getLocation({
                type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
                success: function (res) {
                  let that= this
                  qqmapsdk.reverseGeocoder({
                    //位置坐标，默认获取当前位置，非必须参数
                    location: {
                      latitude: res.latitude,
                      longitude: res.longitude
                    },
                    success: res => {//成功后的回调
                      var res = res.result;
                      console.log(res)
                      wx.setStorageSync('address', res.ad_info.province+'-'+res.ad_info.city)
                      wx.setStorageSync('cityName', res.ad_info.city)
                    },
                    fail: function (error) {
                      console.error(error);
                    }
                  })
                  wx.setStorageSync('latitude', res.latitude)
                  wx.setStorageSync('longitude', res.longitude)
                }
              })
            },
            fail(){
              console.log("用户已经拒绝位置授权");
              that.openConfirm();//如果拒绝，在这里进行再次获取授权的操作
            }
          })
        }
      }
    })
  },

  openConfirm(){
    wx.showModal({
      content: '检测到您没打开此小程序的定位权限，是否去设置打开？',
      confirmText: "确认",
      cancelText: "取消",
      success: function (res) {
        console.log(res);
        //点击“确认”时打开设置页面
        if (res.confirm) {
          console.log('用户点击确认')
          wx.openSetting({
            success: (res) => { }
          })
        } else {
          console.log('用户点击取消')
        }
      }
    });
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
  onReachBottom: function () {
    let noattent= this.selectComponent('#noattent')
    noattent.getList()
  },
  //用户点击右上角转发
  onshareAppMessage: function () {
    let id = 1 // 分享产品的Id
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '同城关注',
      path: `pages/shop/detail/detail?id=${id}` // 分享后打开的页面
    }
  },
})