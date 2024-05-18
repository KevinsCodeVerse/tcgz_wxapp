const app = getApp()
Page({
  data: {
    id: '',
    news: '',
    name: '',
    showShare: true,
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.getDetail(options.id)
    this.setData({id: options.id})
  },
  //监听页面显示
  onShow: function () {
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  shareColse(){
    this.setData({showShare: false})
  },
  getDetail(newsId){
    wx.showLoading({
      title: '加载中...',
    })
    app.request.post({
      url: 'user/firm/public/news/details',
      params: {
        newsId
      },
      success: res => {
        wx.hideLoading()
        var firmNews= res.firmNews
        firmNews.content = firmNews.content.replace(/\<img/g,'<img style="max-width:100%;height:auto;display:block;" class="graphic"')
        console.log(firmNews.content)
        this.setData({
          news: firmNews,
          name: res.firmInfo.name
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
  onShareAppMessage: function () {
    let id = this.data.id // 分享产品的Id
    return {
      title: '同城关注-资讯分享',
      path: `pages/collective/news_detail/news_detail?id=${id}` // 分享后打开的页面
    }
  },
})