const app = getApp()
Page({
  data: {
    id: '',
    active: 0,
    info: {
      
    },
    newsList: [],
    isJoin: -1,
    isFrim: '-1',
    day: '' ,
    bannerList:[]    
  }, 
  //监听页面初次加载
  onLoad: function (options) {
    this.setData({id: options.id})
    this.getNews(options.id)
  },
  //监听页面显示
  onShow: function () {
    this.getDetail(this.data.id)
    this.setData({
      isFrim: wx.getStorageSync('isFirm')
    })
    var pages = getCurrentPages();//页面指针数组
    var prepage = pages[pages.length - 2];//上一页
    if(pages.length>=2){
      if(prepage.route=='pages/attention/attention'){
        wx.setStorageSync('backFind', 1)
      }
    }
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  goJoin(){
    if(!wx.getStorageSync('token')){
      wx.navigateTo({
        url: '/pages/login/login?type=1',
      })
      return
    }
    if(this.data.day===0){
      wx.showToast({
        title: '该集体已过试用期，激活集体后方能加入该集体',
        icon: 'none',
        mask: true,
        duration: 3000
      })
      return
    }
    wx.navigateTo({
      url: '/pages/collective/join/join?id='+this.data.id,
    })
  },
  goInformation(e){
    var id= e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/collective/news_detail/news_detail?id='+id,
    })
  },
  toPublicJoin(){
    wx.navigateTo({
      url: '/pages/collective/settled/settled',
    })
  },
  // 打电话
  freeTell(){
    if(!this.data.info.phone){
      wx.showToast({
        title: '没有电话',
        icon: 'none'
      })
      return
    }
    wx.makePhoneCall({
      phoneNumber: this.data.info.phone,
    })
  },
  // 导航
  toOpenNav(){
    let latitude= parseFloat(this.data.info.latitude)
    let longitude= parseFloat(this.data.info.longitude)
    let name= this.data.info.name
    let address= this.data.info.address
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      name: name,
      address: address,
      scale: 16
    })
  },

  // 激活集体 (微信支付)
  toEnable(){
    wx.showLoading({title: '支付中',mask: true})
    app.request.post({
      url: 'wx/pay/activation',
      params: {
        firmId: this.data.id,
      },
      success: res => {
        var that= this;
        wx.requestPayment({
          timeStamp: res.timeStamp,
          nonceStr: res.nonceStr,
          package: res.packageValue,
          signType: 'MD5',
          paySign: res.paySign,
          success (result) {
            wx.showToast({
              title: '激活成功',
              icon: 'success',
              duration: 2000
            })
            that.setData({
              day: ''
            })
          },
          fail (res) {
            wx.showToast({
              title: '支付失败',
              icon: 'none',
              duration: 2000
            })
          }
        })
      },
    })
  },

  // 获取组织资讯
  getNews(id){
    app.request.post({
      url: 'user/firm/public/news/list',
      params: {
        firmId: id,
        pageNo: 1,
        pageSize: 1000
      },
      success: res => {
        this.setData({
          newsList: res.list
        })
      },
    })
  },

  // 获取详情
  getDetail(id){
    app.request.post({
      url: 'user/firm/public/info/details',
      params: {
        id: id,
      },
      success: res => {
        this.setData({
            bannerList: res.firmBanners
        });
        if(res.firmInfo.description){
          res.firmInfo.description = res.firmInfo.description.replace(/\<img/g,'<img style="max-width:100%;height:auto;display:block;" class="graphic"')
        }
        this.setData({
          info: res.firmInfo,
          isJoin : res.status,
          day: res.day!==''? res.day: ''
        })
      },
      finally: () => {
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
  onShareAppMessage: function () {
    let id = this.data.id // 分享产品的Id
    return {
      title: this.data.info.name,
      path: `pages/collective/detail/detail?id=${id}` // 分享后打开的页面
    }
  },
})