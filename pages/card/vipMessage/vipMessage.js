// const {
//   ColorGradient
// } = require("XrFrame/components/particle/gradient");

const app = getApp();
Page({

  /**
   * 页面的初始数据1
   */
  data: {
    load: true,
    messageList: [],
    params: {
      pageNo: 1,
      pageSize: 1000
    }
  },


  search(e) {
    //搜索
    console.log("e：", e);
    this.setData({
      params: {
        ...this.data.params,
        keyword: e.detail
      }
    })
    this.getList()
  },
  goDetail(obj) {
    console.log(obj);
    wx.navigateTo({
      url: "/pages/card/messageDetail/messageDetail?id=" + obj.currentTarget.dataset.id,
    }).catch(e => {
      console.log("e:", e);
    })
  },
  getList() {
    this.setData({
      load: false
    })
    app.request.post({
      url: "us/cardInfo/pairListNew",
      params: this.data.params,
      success: (res) => {
        this.setData({
          messageList: res.list
        })
        this.setData({
          load: false
        })
      },
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getList()
  },


  onPullDownRefresh() {
    this.getList()
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})