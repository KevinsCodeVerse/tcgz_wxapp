const app = getApp()
Page({
  data: {
    list: {},
    show: false,
    changeIndex: 0,
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.getList(options.id);
    let today= app.utils.formatDate(new Date());
    if(wx.getStorageSync('showTime')!=today){
      this.setData({show: true})
      setTimeout(() => {
        this.setData({show: false})
      }, 2000);
      wx.setStorageSync('showTime', today)
    }
   
    setTimeout(() => {
      this.setData({
        show: false
      })
    }, 2000);
  },
  //监听页面显示
  onShow: function () {
    var pages = getCurrentPages();//页面指针数组
    var prepage = pages[pages.length - 2];//上一页
    if(pages.length>=2){
      if(prepage.route=='pages/index/index'){
        wx.setStorageSync('backGoods', 1)
      }
    }
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  getList(id){
    id= id? id: 16
    wx.showLoading({
      title: '加载中...',
    })
    app.request.post({
      url: 'user/pro/public/videoList',
      params: {
        pageNo: 1,
        pageSize: 1000,
        shopId: id,
				adCode: wx.getStorageSync('adcode'),
      },
      success: res => {
        wx.hideLoading()
        res.list.forEach((item,index)=>{
          if(index==0){
            item.play=true
          }else{
            item.play=false
          }
        })
        this.setData({
          list: res.list,
          goods: res.list[0]
        })
      },
    })
  },

  onClose(){
    this.setData({show: false})
  },
  // 跳转商品详情
  goDetail(){
    if(this.data.goods.type==3){
      wx.navigateTo({
        url: '/pages/goods/group_detail/group_detail?type=1&id='+this.data.goods.id,
      })
    }else{
      wx.navigateTo({
        url: '/pages/goods/detail/detail?type=1&id='+this.data.goods.id
      })
    }
  },

  // 轮播图改变时
  swiperChange(e){
    this.setData({
      changeIndex: e.detail.current 
    })
    let list=[]
    this.data.list.forEach((item,index)=>{
      item.play= false;
      if(index==e.detail.current){
        let goods={
          name: item.name,
          cover: item.cover,
          price: item.price,
          originalPrice: item.originalPrice,
          deal: item.deal,
          id: item.id
        }
        this.setData({goods})
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