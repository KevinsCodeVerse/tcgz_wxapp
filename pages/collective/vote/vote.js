const app = getApp()
Page({
  data: {
    id:'',
    status: 1,
    radio: '',
    icon: {
      normal: '/img/myicon/radio.png',
      active: '/img/myicon/radio_active.png',
    },
    flag: false,
    activity: {},
    list: [],
    currentVote: {
      id: ''
    },
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.setData({
        id:options.id
    })
    this.getList()
  },
  //监听页面显示
  onShow: function () {
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  onChange(event) {
    this.setData({
      radio: event.detail,
    });
  },

  goList(e){
    var id= e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/collective/votelist/votelist?id='+id,
    })
  },

  // 提交
  toSubmit(){
    if(!this.data.radio){
      wx.showToast({title: '请选择',icon: 'none'})
      return
    }
    app.request.post({
      url: 'user/firm/launchVote',
      params: {
        voteId: this.data.radio
      },
      success: res => {
        wx.showToast({
          title: '投票成功',
          success: res=>{
            this.getList();
          }
        })
      },
    })
  },

  // 获取投票明细
  getList(){
    app.request.post({
      url: 'user/article/vote/list',
      params: {
        activityId: this.data.id
      },
      success: res => {
        this.setData({
          activity: res.firmActivity,
          list: res.firmActivityVotes,
          anonymous: res.anonymous,
          currentVote: res.firmActivityGetVote? res.firmActivityGetVote: {}

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