// pages/merchent/advertising/advertising.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
      list:[]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      this.getList()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },
    toAdTop(){
        wx.navigateTo({
          url: '/pages/merchent/adTop/adTop',
        })
    },
    toCityPush(){
      wx.navigateTo({
        url: '/pages/merchent/cityPush/cityPush',
      })
  },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },
    getList(){
      getApp().request.post({
        url: "mt/app/list",
        myType:1,
        params: {
          type:2
        },
        success: (res) => {
          console.log(res);
          this.setData({
              list:res
          })
        },
        fail: (err) => {
          
        },
        finally: () => {
          
        },
      });
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

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