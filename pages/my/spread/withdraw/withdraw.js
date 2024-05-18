const app = getApp()
Page({
  data: {
    isBank: true,
    money: '',
    blance: 0,

    show:false,
    serviceCharge:0,
    serviceChargeLimit:1,
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.setData({
      money: options.money!='undefined'? options.money:0,
      blance: options.money
    })
  },
  //监听页面显示
  onShow: function () {
    this.getServerPrice()
    this.getBankList();

  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  openShow(){
    if(this.data.banList.length==0){
      wx.showModal({
        title: '提示',
        content: '检测到您没有绑定银行卡，是否前往绑定？',
        success: res=>{
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/my/spread/bank/bank',
            })
          } else if (res.cancel) {
           
          }
        }
      })
      return
    }
    if(this.data.money<10){
      wx.showToast({
        title: '最低提现10元!',
        icon:'none'
      })
      return
    }
    this.setData({
        show:true
    })
  },
  onClose(){
    this.setData({
        show:false
    })
  },
  // 提现
  toWithdrawBank(){
    wx.showToast({title: '提现中...',icon: 'loading',mask: true,duration: 5000})
    
    app.request.post({
      url: 'user/bankCard/withdraw',
      params: {
        money: this.data.money,
        type:2
      },
      success: res => {
        this.setData({
            show:false
        })
        wx.showToast({
          title: '提现成功,请等待审核',
          mask: true,
          success: res=>{
            setTimeout(() => {
              wx.navigateBack({
                delta: 1,
              })
            }, 1500);
          }
        })
      }
    })
  },
  getServerPrice(){
    app.request.post({
      url: "general/query/public/serviceBank",
      params: {
        type:0
      },
      success: (res) => {
        console.log(res);
        this.setData({
          serviceCharge:res.serviceCharge,
          serviceChargeLimit:res.serviceChargeLimit,
        })
      },
      fail: (err) => {
        
      },
      finally: () => {
        
      },
    });
  },
  bindMoney(e){
    this.setData({
      money: e.detail.value
    })
  },
 
  // 提现
  toWithdraw(){
    wx.showToast({title: '提现中...',icon: 'loading',mask: true,duration: 5000})
    app.request.post({
      url: 'user/bankCard/withdraw',
      params: {
        money: this.data.money,
        type:1
      },
      success: res => {
        wx.showToast({
          title: '提现成功,请等待审核',
          mask: true,
          icon:"none",
          success: res=>{
            setTimeout(() => {
              wx.navigateBack({
                delta: 1,
              })
            }, 2500);
          }
        })
      }
    })
  },

  goBnak(){
    wx.navigateTo({
      url: '/pages/my/spread/bank/bank?id=1',
    })
  },
  getBankList(){
    app.request.post({
      url: 'user/bankCard/list',
      success: res => {
        this.setData({
            banList:res
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