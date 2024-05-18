const app = getApp()
Page({
  data: {
    id: '',
    goods: {},
    bannerList: [],
    evaList: [],
    evaluate: {},
    
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.setData({
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
      url: '/pages/goods/evaluate/evaluate?id='+this.data.id,
    })
  },
  goSettle(){
    wx.navigateTo({
      url: '/pages/order/confirm/gift/gift?id='+this.data.id,
    })
  },
  
  // -----------------------------------------接口-----------------------------------------------
  getDetail(id){
    id= id?id: 3
    wx.showLoading({
      title: '加载中...',
    })
    app.request.post({
      url: 'user/promote/upGradeProDetails',
      params: {
        id
      },
      success: res => {
        let bannerList= res.adPro.banner.split(',')
        if(res.adPro.description){
          res.adPro.description = res.adPro.description.replace(/\<img/g,'<img style="max-width:100%;height:auto;display:block;" class="graphic"')
        }
        if(res.eva){
          console.log("11");
          res.eva.imgArr= res.eva.img.split(',')
        }
        this.setData({
          goods: res.adPro,
          bannerList,
          evaluate: res.eva
        })
        wx.hideLoading()
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
  // 监听页面滚动
  onPageScroll (e) {},
})