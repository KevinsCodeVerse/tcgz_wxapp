const app = getApp()
Page({
  data: {
    type: 3,
    active: '',
    list: [],
    pageNo: 0,
    pageSize: 10,
    finish: false,
    loading: false,
    statusList: [
      {name: '待支付',id: 0},
      {name: '待使用',id: 1},
      {name: '待发货',id: 10},
      {name: '待收货',id: 11},
      {name: '团购待成团',id: 5},
      {name: '待评价',id: 2},
      {name: '已完成',id: 3},
      {name: '已退款',id: -1},
      {name: '已取消',id: -2},
      { name: "已申请退款", id: 20 },
			{ name: "已申请退货退款", id: 21 },
			{ name: "已退款", id: 22 },
			{ name: "退款失败", id: 23 },
    ],
  },
  //监听页面初次加载
  onLoad: function (options) {
    
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
  // 查看邀请码
  toEwm(e){
    this.setData({
      show: true,
      qrCode: e.currentTarget.dataset.qrcode
    })
  },
  // 关闭二维码
  onClose() {
    this.setData({ 
      show: false,
      qrCode: ''
    });
  },
  // 进入详情
  goDetail(e){
    wx.navigateTo({
      url: `/pages/order/detail_group/index?id=${e.currentTarget.dataset.id}`,
    })
  },
  // 跳转评论页面
  goEvaluate(e){
    let obj= e.currentTarget.dataset.obj;
    wx.navigateTo({
      url: '/pages/order/evaluate/evaluate?type='+ obj.type +'&id='+obj.id,
    })
  },
  // 获取订单
  getList() {
    if(this.data.loading || this.data.finish) return;
    this.setData({
      pageNo: this.data.pageNo + 1,
      loading: true
    })
    app.request.post({
      url: 'user/order/list',
      params: {
        pageNo: this.data.pageNo,
        pageSize: this.data.pageSize,
        status: this.data.active,
        type: this.data.type,

      },
      success: res => {
        console.log("11");
        res.list.forEach(item=>{
          item.proInfo= JSON.parse(item.userOrderPay.proInfo)
          let arr=this.data.statusList.filter(i=> i.id==item.userOrderPay.status)
          if(arr.length>0) item.textStatus= arr[0].name
        })

        let list = this.data.list.concat(res.list);
        this.setData({
          list: list
        })
        console.log("22");
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