const app = getApp()
Page({
  data: {
    // 分页列表
    list: [],
    loading: false,
    finish: false,
    pageNo: 0,
    pageSize: 10,
  },
  //监听页面初次加载
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.level==2? '黄金会员礼包':'合伙人礼包'
    })
    this.getList(options.level)
  },
  //监听页面显示
  onShow: function () {
    
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  goDetail(e){
    wx.navigateTo({
      url: '/pages/goods/gift_detail/index?id='+e.currentTarget.dataset.id,
    })
  },

  // 获取列表
  getList(type) {
    if(this.data.loading || this.data.finish) return;
    this.setData({
      pageNo: this.data.pageNo + 1,
      loading: true
    })
    app.request.post({
      url: 'user/promote/upGradeProList',
      params: {
        pageNo: this.data.pageNo,
        pageSize: this.data.pageSize,
        type
      },
      success: res => {
        if(res.list.length < this.data.pageSize) {
          this.setData({
            finish: true
          })
        }
        let list = this.data.list.concat(res.list);
        this.setData({
          list: list
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
  onReachBottom: function () {
    this.getList()
  },
  //用户点击右上角转发
  onshareAppMessage: function () {},
})