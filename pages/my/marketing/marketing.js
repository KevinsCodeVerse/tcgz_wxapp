const app = getApp()
Page({
  data: {
    searchValue: '',
    title: '',
    active: '',
    categoryList: [],
    goodslist: [],
    pageNo: 1,
    pageSize: 10,
    categoryId: "",
    islist: false
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.getCategory();
    this.getgoodslist()
  },
  //监听页面显示
  onShow: function () {

  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  searchChange(e) {
    this.setData({
      searchValue: e.detail
    })
  },
  onSearch() {
    this.setData({
      title: this.data.searchValue
    })
    this.getgoodslist()
  },
  // 
  navgoodsPage(e) {
    let baseurl
    switch (e.currentTarget.dataset.type) {
      case 1:
        baseurl = '/pages/goods/detail/detail'
        break;
      case 2:
        baseurl = '/pages/goods/detail/detail'
        break;
      case 3:
        baseurl = '/pages/goods/detail/detail'
        break;
      default:
        break;
    }
    wx.navigateTo({
      url: baseurl + `?id=${e.currentTarget.dataset.id}&type=${e.currentTarget.dataset.type}`
    })
  },
  // 获取分类
  getCategory() {
    app.request.post({
      url: 'user/info/public/proCategory',
      success: result => {
        this.setData({
          categoryList: result,
          active: '-1'
        })
      }
    })
  },
  tabChange(e) {
    this.setData({
      active: e.detail.name
    })
    this.data.pageNo = 1
    this.getgoodslist()
  },

  // 获取商品数据
  getgoodslist() {
    wx.showLoading({
      title: '加载中',
    })
    app.request.post({
      url: 'user/invite/list',
      params: {
        categoryId: this.data.active == -1 ? '' : this.data.active,
        pageNo: this.data.pageNo,
        pageSize: this.data.pageSize,
        keyWord:this.data.searchValue
      },
      success: result => {
        if (this.data.pageSize != result.list.length) {
          this.data.islist = true
        }
        this.setData({
          goodslist: result.list,
          pages: result.total,
          total: result.total,
          islist: this.data.islist
        })
      },
      finally:()=>{
        wx.hideLoading()
      }
    })
  },
  // 分享数据
  getShareInfo(e) {
    console.log(e);
    this.setData({
      id: e.currentTarget.dataset.id,
      cover:e.currentTarget.dataset.cover,
      text:e.currentTarget.dataset.name,
      proId: e.currentTarget.dataset.id,
      type: e.currentTarget.dataset.type,
    })
    let child = this.selectComponent('#goodscanvas')
    child.go()
    if(e.currentTarget.dataset.id!=child.data.id){
      child.data.shareImagePath=""
    }
    child.setData({
      shareImagePath: child.data.shareImagePath,
      show: false,
      id: e.currentTarget.dataset.id
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
  onReachBottom: function () {
    if (this.data.islist) {
      return
    }
    this.data.pageNo++
    app.request.post({
      url: 'user/invite/list',
      params: {
        categoryId: this.data.active == -1 ? '' : this.data.active,
        pageNo: this.data.pageNo,
        pageSize: this.data.pageSize,
        adCode:wx.getStorageSync('adcode')
      },
      success: result => {
        if (this.data.pageSize != result.list.length) {
          this.data.islist = true
        }
        this.data.goodslist.push(...result.list)
        this.setData({
          goodslist: this.data.goodslist,
          pages: result.total,
          total: result.total,
          islist: this.data.islist
        })
      }
    })
  },
  //用户点击右上角转发
  onShareAppMessage() {
   let agentId = wx.getStorageSync('userId')
    return {
      path: `pages/goods/detail/detail?agentId=${agentId}&id=${this.data.proId}&type=${this.data.type}`,
      title: this.data.text,
      imageUrl:app.common.fullPath(this.data.cover)
    }
  },
})