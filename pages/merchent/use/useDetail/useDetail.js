const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    type:'',
    info:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.event.on('useDetail',(e)=>{
      e.content = e.content.replace(/\<img(.*?)src/g,'<img style="max-width:100%!important;height:auto;display:block;" src')
      e.content = e.content.replace(/\<p/g,'<p style="line-height:1.8;text-indent:25px;word-break:break-all;"')
      e.content = e.content.replace(/\<p style="line-height:1.8;text-indent:25px;word-break:break-all;"\>\<img/g,'<p><img')
      this.setData({
        info:e,
        type:options.type
      })
    })
    
  },



  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  
  wechatPay(e) {
    let userId = wx.getStorageSync("userId");
    let info = e.currentTarget.dataset.info
    if(info.status == 1&&this.data.type==1){
        return 
    }
    app.request.post({
        url:'mt/app/maOpen',
        params: {
            appId:info.id,
            userId,
        },
        myType: 1,
        success: res => {
            var that = this;
            if(!info.amount){
                wx.showToast({
                    title: '续费成功!',
                    icon: 'success',
                    duration: 2000
                })
            }
            wx.requestPayment({
                timeStamp: res.timeStamp,
                nonceStr: res.nonceStr,
                package: res.packageValue,
                signType: 'MD5',
                paySign: res.paySign,
                success(result) {
                    wx.showToast({
                        title: '支付成功',
                        icon: 'success',
                        duration: 2000
                    })
                    setTimeout(() => {
                        wx.navigateBack({
                            delta: 1,
                        })
                    }, 1500);
                },
                fail(res) {
                    setTimeout(() => {
                        wx.navigateBack({
                            delta: 1,
                        })
                    }, 500);
                }
            })
        },
    })
},
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.event.off('useDetail')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onshareAppMessage: function () {

  }
})