const app = getApp()
Page({
  data: {
    active: '',
    // 分页参数
    pageNo: 0,
    pageSize: 10,
    finish: false,
    loading: false,
    list: [],
    // goodsList: [
    //   {
    //     id: '1',
    //     type: 1,
    //     title: '栋企鸡团购特惠限时拼团59元享原价119',
    //     cover: 'https://www.tcgz.store/files/index/index-04.png',
    //     limit: 3,
    //     inventory: 462,
    //     countrymen:59,
    //     currentPrice: 69,
    //     originalPrice: 119,
    //     sales: 99
    //   },
    // ]
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.getList();
  },
  //监听页面显示
  onShow: function () {
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
  // 跳转商品详情
  goDetail(e){
    let obj= e.currentTarget.dataset.obj
    if(obj.type==3){
      wx.navigateTo({
        url: '/pages/goods/group_detail/group_detail?id='+obj.id,
      })
    }else if(obj.type==2){
      wx.navigateTo({
        url: '/pages/goods/seckill_detail/seckill_detail?id='+obj.id,
      })
    }
    else{
      wx.navigateTo({
        url: '/pages/goods/detail/detail?id='+obj.id+ '&type='+obj.type,
      })
    }
  },
  
  // -------------------------------------------------------接口----------------------------------------------------
  getList(){
    if(this.data.loading || this.data.finish) {
      return;
    }
    this.setData({
      loading: true,
      pageNo: this.data.pageNo + 1
    })
    app.request.post({
      url: 'user/info/favoriteList',
      params: {
        pageNo: this.data.pageNo,
        pageSize: this.data.pageSize,
        type: this.data.active
      },
      success: res => {
        this.setData({
          list: res.list,
        })
      },
      finally: res=>{
        this.setData({
          loading: false,
          finish: true
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
  onReachBottom: function () {},
  //用户点击右上角转发
  onshareAppMessage: function () {},
})