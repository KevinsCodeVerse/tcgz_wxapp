const app = getApp()
Page({
  data: {
    active: '',
    show: false,
    qrCode: '',
    // 分页参数
    list: [],
    pageNo: 0,
    pageSize: 10,
    finish: false,
    loading: false,
    statusList: [
      {name: '待支付',id: 0},
      {name: '待发货',id: 1},
      {name: '待收货',id: 2},
      {name: '待评价',id: 3},
      {name: '已完成',id: 4},
      {name: '已取消',id: -2},
    ],
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.setData({
      type: options.type
    })
  },
  //监听页面显示
  onShow: function () {
    this.setData({
      pageNo: 0,
      loading: false,
      finish: false,
      list: []
    })
    this.getList();
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  toTabs(e){
    this.setData({
      active: e.currentTarget.dataset.status,
      pageNo: 0,
      loading: false,
      finish: false,
      list: []
    })
    this.getList()
  },
  goDetail(e){
    wx.navigateTo({
      url: '/pages/order/detail_gift/index?id='+e.currentTarget.dataset.id,
    })
  },
  goEvaluate(e){
    wx.navigateTo({
      url: '/pages/order/evaluate/evaluate?type=4&id='+e.currentTarget.dataset.id,
    })
  },
  toEwm(e){
    this.setData({
      show: true,
      qrCode: e.currentTarget.dataset.qrcode
    })
  },
  onClose() {
    this.setData({ 
      show: false,
      qrCode: ''
    });
  },
  // 获取订单
  getList() {
    if(this.data.loading || this.data.finish) return;
    this.setData({
      pageNo: this.data.pageNo + 1,
      loading: true
    })
    app.request.post({
      url: 'user/promote/orderList',
      params: {
        pageNo: this.data.pageNo,
        pageSize: this.data.pageSize,
        status: this.data.active
      },
      success: res => {
        res.list.forEach(item=>{
          item.proInfo= JSON.parse(item.userOrderPay.proInfo)
          let arr=this.data.statusList.filter(i=> i.id==item.userOrderPay.status)
          if(arr.length>0) item.textStatus= arr[0].name
        })
        let list = this.data.list.concat(res.list);
        this.setData({
          list: list
        })
        if(res.list.length < this.data.pageSize) {
          this.setData({
            finish: true
          })
        }
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