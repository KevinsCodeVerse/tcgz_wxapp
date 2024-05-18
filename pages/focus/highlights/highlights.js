const app = getApp()
Page({
  data: {
    list: [], // 用户数据
    params: {
      count: false,
      pageNo: 1,
      pageSize: 5,
    },
    total: 0,
    pages: 0,
    istit: true
  },
  // ------------------------ 自定义 方法 ---------------------------
  getlist() {
    let adCode = wx.getStorageSync('adcode');
    this.data.params.adCode = adCode
    app.request.post({
      url: 'user/videoCollect/public/list',
      params: this.data.params,
      success: result => {
        this.setData({
          list: result.list,
          total: result
        })
        console.log(result);
      }
    })
    
  },
  //监听页面初次加载 --------------------- 生命周期函数 --------------------
  onLoad: function () {
    this.getlist()
  },

  //监听页面显示
  onShow: function () {
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
    let a = this.data.params.pageNo * this.data.params.pageSize
    if (this.data.total < a) {
      this.setData({
        istit: true
      })
      return
    }
    this.data.params.pageNo++
    this.setData({
      istit: false
    })
    app.request.post({
      url: 'user/videoCollect/public/list',
      params: this.data.params,
      success: result => {
        this.setData({
          list: [...this.data.list, ...result.list],
          total: result.total,
          pages: result.pages
        })
      }
    })

  },
  //用户点击右上角转发
  onshareAppMessage: function () {},
})