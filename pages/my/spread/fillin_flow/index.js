const app = getApp()
Page({
  data: {
    type: '',
    status: '',
    code: '',
    list: [],
    pageNo: 0,
    pageSize: 10,
    finish: false,
    loading: false,
  },
  //监听页面初次加载
  onLoad: function (options) {
    
  },
  //监听页面显示
  onShow: function () {
    this.getList();
  },
  getList() {
    if(this.data.loading || this.data.finish) {
      return;
    }
    this.setData({
      loading: true,
      pageNo: this.data.pageNo + 1
    })
    app.request.post({
      url: 'user/info/applyList',
      params: {
        accountType: this.data.type,
        status: this.data.status,
        pageNo: this.data.pageNo,
        pageSize: this.data.pageSize,
      },
      success: result => {
        console.log(result.list)
        var list = this.data.list;
        list = list.concat(result.list);
        this.setData({
          list: list,
          loading: false
        })
        if(result.list.length < this.data.pageSize) {
          this.setData({
            finish: true
          })
        }
      }
    })
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  typeChange(e) {
    this.setData({
      type: e.currentTarget.dataset.type,
      pageNo: 0,
      loading: false,
      finish: false,
      list: []
    })
    this.getList();
  },
  statusChange(e) {
    this.setData({
      status: e.currentTarget.dataset.status,
      pageNo: 0,
      loading: false,
      finish: false,
      list: []
    })
    this.getList();
  },
  toEdit(e){
    wx.navigateTo({
      url: '/pages/my/spread/fillin_edit/index?id='+e.currentTarget.dataset.id,
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
    this.getList()
  },
  //用户点击右上角转发
  onshareAppMessage: function () {
  },
})