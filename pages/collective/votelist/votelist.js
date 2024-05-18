const app = getApp()
Page({
  data: {
    list: [],
    name: '',
    activityType:1,
    id:''
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.setData({
      activityType:options.options||1,
      id:options.id
    })
    this.getList()
  },
  //监听页面显示
  onShow: function () {
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  getList(){
    let url = this.data.activityType==1?"user/article/getVote/list":'user/firm/getVote/list'
    app.request.post({
      url: url,
      params: {
        voteId: this.data.id
      },
      success: res => {
        this.setData({
          list: res.firmActivityGetVotes,
          name: res.firmActivityVote.name
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
  onshareAppMessage: function () {},
})