const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: {
      "all": [],
      "message": [],
      "policy": [],
      "play": [],
      "video": [],
      "collection": [],
    },
    pageNoArr: [],
    pageSizeArr: [],
    type: 6,
    tabIndex: 'all',
    isshow:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    for (let i = 0; i < 7; i++) {
      this.data.pageNoArr[i] = 1
      this.data.pageSizeArr[i] = 6
    }
    this.setData({
      pageNoArr: this.data.pageNoArr,
      pageSizeArr: this.data.pageSizeArr
    })
    this.getlist(6).then(res => {
      this.data.list['all'] = res
      this.setData({
        list: this.data.list
      })
    })
    console.log(this.data.list);
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.event.on('comment', (e) => {
      console.log(this.data.list[this.data.tabIndex]);
      console.log('comment', e);
      let index = this.data.list[this.data.tabIndex].list.findIndex(item => item.id == e.id && item.type == e.type)
      console.log(index);
      if (index != -1) {
        this.data.list[this.data.tabIndex].list[index].comment++
        this.setData({
          list: this.data.list
        })
      }
    })
  },
  
  // 点击tab
  async tabClick(e) {
    let type = e.detail.index
    let index = e.detail.name
    if (type == 0) type = 6
    this.setData({
      tabIndex: index,
      type,
    })
    if (this.data.list[index].list) return
    this.data.list[index] = await this.getlist(type)
    this.setData({
      list: this.data.list,
    })
    console.log("11111");
    console.log(this.data.list);

  },
  // 请求列表
  getlist(type) {
    return new Promise((resolve, reject) => {
      app.request.post({
        url: "user/info/favoriteArticle",
        params: {
          type: type,
          pageNo: this.data.pageNoArr[type],
          pageSize: this.data.pageSizeArr[type]
        },
        success: (res) => {
          res.list.forEach(item=>{
            item.image = item.image.split(",");
          })
          console.log(res);
          
          resolve(res)
        },
        error: (err) => {
          reject(err)
        }
      })
    })
  },

  // 跳转
  handTapNav(e) {
    console.log(e.currentTarget.dataset);
    let type = e.currentTarget.dataset.type
    let isvideo = e.currentTarget.dataset.isvideo

    let id = e.currentTarget.dataset.id
    let index = this.data.list[this.data.tabIndex].list.findIndex(item => item.id == id && item.type == type)
    this.data.list[this.data.tabIndex].list[index].reading++
    this.setData({
      list:this.data.list
    })
    let url
    switch (type) {
      case 5:
        url = "/pages/focus/highlights/detail/detail?id=" + id + '&type=' + type
        break;
      case 4:
        url = "/pages/focus/videoDetail/videoDetail?id=" + id + '&type=' + type
        break;

      default:
        if (isvideo == 1) {
          url = "/pages/focus/videoDetail/videoDetail?id=" + id + '&type=' + type
        } else {
          url = "/pages/focus/newsDetail/newsDetail?id=" + id + '&type=' + type
        }
        break;
    }

    wx.navigateTo({
      url,
    })
  },






  





  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
    wx.event.off('comment')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: async function () {
    this.data.pageNoArr[this.data.type]++
    let type = this.data.type
    if (this.data.list[this.data.tabIndex].total - ((this.data.pageNoArr[type]-1) * this.data.pageSizeArr[type])<0) {
      this.setData({
        isshow: true
      })
      console.log("没有了");
      return
    }
    let res = await this.getlist(type)
    this.data.list[this.data.tabIndex].list=[...this.data.list[this.data.tabIndex].list,...res.list]
    this.setData({
      list:this.data.list
    })
    console.log("下拉后:",this.data.list[this.data.tabIndex].list);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})