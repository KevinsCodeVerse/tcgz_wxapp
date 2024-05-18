const app = getApp()
Page({
  data: {
    // 分页参数
    pageNo: 0,
    pageSize: 10,
    finish: false,
    loading: false,
    shopList: []
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.setData({
      latitude: wx.getStorageSync('latitude'),
      longitude: wx.getStorageSync('longitude')
    })
  },
  //监听页面显示
  onShow: function () {
    this.setData({
      pageNo: 0,
      finish: false,
      loading: false,
      shopList: [],
    })
    setTimeout(() => {
      this.getList();
    }, 500);
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  // 店铺详情
  toDetail(e) {
    wx.navigateTo({
      url: '/pages/shop/detail/detail?id='+e.currentTarget.dataset.id,
    })
  },
  // 获取店铺列表
  getList(){
    if(this.data.loading || this.data.finish) return;
    this.setData({
      loading: true,
      pageNo: this.data.pageNo + 1
    })
    app.request.post({
      url: 'user/info/attentionShopList',
      params: {
        latitude: this.data.latitude,
        longitude: this.data.longitude,
        pageNo: this.data.pageNo,
        pageSize: this.data.pageSize
      },
      success: res => {
        if(res.list.length < this.data.pageSize) {
          this.setData({
            finish: true
          })
        }
        let list = this.data.shopList.concat(res.list);
        this.setData({
          shopList: list
        })
      },
      finally: () => {
        this.setData({
          loading: false
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