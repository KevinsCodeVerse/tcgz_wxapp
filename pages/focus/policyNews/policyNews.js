const app = getApp()
Page({
  data: {
    searchValue: '',
    title: '',
    active: '',
    categoryList: []
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.getCategory();
  },
  //监听页面显示
  onShow: function () {
    
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  searchChange(e) {
    this.setData({
      searchValue: e.detail
    })
  },
  onSearch() {
    this.setData({
      title: this.data.searchValue
    })
  },
  // 获取分类
  getCategory() {
    let adCode = wx.getStorageSync('adcode');
    app.request.post({
      url: 'user/article/public/category/all',
      params: {
        type: 2,
        adCode: adCode
      },
      success: result => {
        this.setData({
          categoryList: result,
          active: '-1'
        })
      }
    })
  },
  tabChange(e) {
    this.setData({
      active: e.detail.name
    })
  },
  
  //监听页面初次加载完成
  onReady: function () {
  },
  //监听页面隐藏
  onHide: function () {
  },
  //监听页面卸载
  onUnload: function () {
  },
  //监听用户下拉动作
  onPullDownRefresh: function () {
  },
  //监听用户下拉动作
  onPullDownRefresh: function () {
  },
  //用户上拉触底事件的处理函数
  onReachBottom: function () {
    this.selectComponent('#newList').getList();
  },
  //用户点击右上角转发
  onshareAppMessage: function () {
  },
})