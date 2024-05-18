const app = getApp()
Page({
  data: {
    qrCode: '',
    status:'1',
    pageNo: 0,
    pageSize: 10,
    list: [],
    loading: false,
    finish: false
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.getList();
    this.getParams();
  },
  //监听页面显示
  onShow: function () {
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  saveLocal(){
    console.log(app.common.imgUrl+this.data.qrCode)
    wx.downloadFile({
      url: app.common.imgUrl+this.data.qrCode,
      success: function (res) {
        console.log(res);
        //图片保存到本地
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (data) {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            })
          },
        })
      }
    })
  },

  getList() {
    if(this.data.loading || this.data.finish) {
      return;
    }
    this.setData({
      loading: true,
      pageNo: this.data.pageNo + 1
    })
    app.request.post({
      url: 'user/sysParams/public/list',
      params: {
        pageNo: this.data.pageNo,
        pageSize: this.data.pageSize,
        type:this.data.status
      },
      success: result => {
        console.log(result.list)
        var list = this.data.list;
        list = list.concat(result.list);
        this.setData({
          list: list,
          loading: false
        })
        if(result.list.length < this.data.pageSize) {
          this.setData({
            finish: true
          })
        }
      }
    })
  },
  goDetail(e){
    let type= e.currentTarget.dataset.type
    // let item = e.currentTarget.dataset.item
    // wx.setStorageSync('guideItem', JSON.stringify(item));
    if(type==1){
      wx.navigateTo({
        url: '/pages/my/spread/guide/detail/detail?id='+e.currentTarget.dataset.item.id,
      })
    }else{
      wx.navigateTo({
        url: '/pages/my/spread/guide/detail2/index?id='+e.currentTarget.dataset.item.id,
      })
    }
  },

  // 获取二维码
  getParams(){
    app.request.post({
      url: 'user/sysParams/getAgreement',
      params: {
        type: 6,
      },
      success: res => {
        this.setData({
          qrCode: res
        })
      },
    })
  },
  // 切换 navbar
  onChange(e){
    this.setData({
      status:e.detail.name,
      finish:false,
      pageNo:0,
      list:[]
    })
    this.getList()
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
  onPullDownRefresh: function () {
    
  },
  //用户上拉触底事件的处理函数
  onReachBottom: function () {
    this.getList()
  },
  //用户点击右上角转发
  onshareAppMessage: function () {},
})