const app = getApp()
Page({
  data: {
    value: 3,
    // 分页参数
    list: [],
    pageNo: 0,
    pageSize: 10,
    finish: false,
    loading: false,
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.getList(options.id)
  },
  //监听页面显示
  onShow: function () {
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  // 获取订单
  getList(id) {
    id= id?id: 51
    if(this.data.loading || this.data.finish) return;
    this.setData({
      pageNo: this.data.pageNo + 1,
      loading: true
    })
    app.request.post({
      url: 'user/pro/public/evaList',
      params: {
        id: id,
        pageNo: this.data.pageNo,
        pageSize: this.data.pageSize
      },
      success: res => {
        
        res.list.forEach(item=>{
          if(item.img) {
            item.imgArr= item.img.split(',')
          } else {
            item.imgArr= []
          }
        })
        let list = this.data.list.concat(res.list);
        if(res.list.length < this.data.pageSize) {
          this.setData({
            finish: true
          })
        }
        this.setData({
          list: list
        })
      },
      finally: () => {
        this.setData({
          loading: false
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