const app = getApp()
Page({
  data: {
    code: '',
    info: {},
    money: {},
    name: '',
    phone: '',
    showRegular: false,
    show: false,
    applyShow: false,
    hasPhone: true,
    level: {},
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.statistics();
    this.getNotice();
  },
  //监听页面显示
  onShow: function () {
    this.getRules();
    this.totalAssets();
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  // 显示规格
  toRegular(){
    this.setData({showRegular: true})
  },
  regularChange(){
    this.setData({showRegular: false})
  },
  // 复制
  copyCode() {
    wx.setClipboardData({  
      data: this.data.info.inviterCode,
      success: () => {
        wx.showToast({
          title: '复制成功',
        })
      }
    })
  },
  // 跳转营销中心
  market(){
    wx.navigateTo({
      url: '/pages/my/marketing/marketing',
    })
  },
  href(e) {
    console.log(e.currentTarget.dataset.url)
    wx.navigateTo({
      url: e.currentTarget.dataset.url
    })
  },
  // 打开邀请码弹窗
  openDialog(e) {
    this.setData({
      show: true
    })
  },
  // 邀请码input绑定
  codeChange(e) {
    console.log(e)
    this.setData({
      code: e.detail.value
    })
  },
  // -------------------------------------------接口----------------------------------------
  // 获取个人信息
  totalAssets() {
    app.request.post({
      url: 'user/info/totalAssets',
      success: res => {
        this.setData({
          info: res,
          applyShow: res.name? false: true
        })
      },
    })
  },
  // 推广统计
  statistics() {
    app.request.post({
      url: 'user/info/statistics',
      success: res => {
        this.setData({
          money: res
        })
      },
    })
  },
  // 获取规则
  getRules(){ 
    app.request.post({
      url: 'user/promote/promoteLevel',
      success: res => {
        this.setData({
          level: res
        })
        console.log(res.directly)
      },
    })
  },
  // 获取开单公告列表
  getNotice(){
    app.request.post({
      url: 'user/info/orderSuccess',
      success: res => {
        this.setData({
          noticeList: res
        })
      },
    })
  },
  // 提交绑定邀请码
  bindCode() {
    if(!this.data.code) {
      wx.showToast({title: '请输入推荐人邀请码'})
      return;
    }
    app.request.post({
      url: 'user/info/bind',
      params: {
        code: this.data.code
      },
      success: res => {
        wx.showToast({
          title: '绑定成功'
        })
        this.totalAssets();
      },
    })
  },
  // ----------------------------业务员弹窗------------------------------
  getStatus() {
    app.request.post({
      url: 'user/info/bind',
      success: res => {
        if(res.phone) {
          this.setData({
            phone: res.phone
          })
        }
        if(res.isSalesman) {
          this.setData({
            applyShow: true
          })
        }
      },
    })
  },
  setName(e) {
    this.setData({
      name: e.detail.value
    })
  },
  setPhone(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  // 申请
  apply() {
    this.setData({applyShow: true})
    if(!this.data.name) {
      wx.showToast({title: '请输入姓名',icon: 'none'})
      return;
    }
    // if(!this.data.phone) {
    //   wx.showToast({title: '请输入手机号',icon: 'none'})
    //   return;
    // }
    app.request.post({
      url: 'user/info/updateName',
      params: {
        name: this.data.name
      },
      success: res => {
        this.setData({applyShow: false})
        wx.showToast({
          title: '申请成功'
        })
      },
    })
  },
  cancel(){
    wx.navigateBack({
      delta: 0,
    })
  },

  // ---------------------------------页面跳转-----------------------
  goInvite(){
    wx.navigateTo({
      url: '/pages/my/spread/invite/invite?invite='+this.data.info.inviterCode,
    })
  },
  goLevel(){
    wx.navigateTo({
      url: '/pages/my/spread/level/level',
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
  },
  //用户点击右上角转发
  onshareAppMessage: function () {
  },
})