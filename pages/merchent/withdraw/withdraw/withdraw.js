const app = getApp()
Page({
  data: {
    isBank: true,
    money: '',
    blance: 0,
    active:0,
    banList:'',
    show:false,
    serviceCharge:0,
    serviceChargeLimit:1,

    type:4,// 1 用户 
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.setData({
      money: options.money!='undefined'? options.money:0,
      blance: options.money,
      type: options.type,

    })
  },
  //监听页面显示
  onShow: function () {
    this.getBankList();
    this.getServerPrice()
  },
  getServerPrice(){
    app.request.post({
      url: "general/query/public/serviceBank",
      myType:1,
      params: {
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
 //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  bindMoney(e){
    this.setData({
      money: e.detail.value
    })
  },
  openShow(){
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
  toWithdraw(){
    wx.showToast({title: '提现中...',icon: 'loading',mask: true,duration: 5000})
    if(!this.data.banList.length){
      wx.showToast({title: '请先绑定银行卡',icon: 'none',mask: true,duration: 2000})
      return
    }
    app.request.post({
      url: 'mt/info/cashOut',
      myType:1,
      params: {
        amount: this.data.money,
        merchantBankId:this.data.banList[this.data.active].id
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

  goBnak(){
    wx.navigateTo({
      url: '/pages/merchent/withdraw/bank/bank?id=1',
    })
  },
  deliveryChange(e){
    this.setData({
        active:e.detail.value
    })
  },
  
  getBankList(){
    app.request.post({
      url: "mt/info/getBank",
			myType: 1,
      success: res => {
        this.setData({
					banList: res,
				});
        if(res.length==0){
          wx.showModal({
            title: '提示',
            content: '检测到您没有绑定银行卡，是否前往绑定？',
            success: res=>{
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/merchent/withdraw/bank/bank',
                })
              } else if (res.cancel) {
                wx.navigateBack({
                  delta: 1,
                })
              }
            }
          })
        }
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