const app = getApp()
Page({
  data: {
    id: '',
    type: 1,
    status: 1,
    order: {},
    shop: {},
    goods: {},
    evaluate: {},
    timedown: 0,
    statusList: [
      {name: '待支付',id: 0},
      {name: '待使用',id: 1},
      {name: '待评价',id: 2},
      {name: '已完成',id: 3},
      {name: '已退款',id: -1},
      {name: '已取消',id: -2},
    ],
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.setData({
      type: options.type,
      id: options.id
    })
    this.getDetail(options.id);
  },
  //监听页面显示
  onShow: function () {
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  
  goRefund(e){
    if(this.data.order.status ==1&&e.currentTarget.dataset.type==2){
      return wx.showToast({
        title: '请选择仅退款',
        icon:'none'
      })
    }
    console.log(e);
    let type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: '/pages/order/refund/refund?&id='+this.data.id+"&type="+type,
    })
  },
  
  
  
  // -----------------------------------------接口-----------------------------------------------
  

  getDetail(id){
    id= id?id: 88900141981098
    wx.showLoading({
      title: '加载中...',
    })
    app.request.post({
      url: 'user/order/orderDetails',
      params: {
        id
      },
      success: res => {
        wx.hideLoading()
        let goods= JSON.parse(res.userOrderPay.proInfo)
        if(res.evaluation) res.evaluation.imgArr= res.evaluation.img ? res.evaluation.img.split(','): []
        this.setData({
          order: res.userOrderPay,
          shop: res.merchantShop,
          goods: goods,
          evaluate: res.evaluation? res.evaluation: {},
          status: res.userOrderPay.status,
          timedown: res.cancelTime,
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