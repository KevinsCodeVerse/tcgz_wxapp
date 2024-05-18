const app = getApp()
Page({
  data: {
    list: [],
    order: '',
    goodsId: '',
    deAddress: {},
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.setData({
      order: options.order,
      goodsId: options.goodsId,
      type:options.type,
    })
  },
  //监听页面显示
  onShow: function () {
    this.getList();
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  goOrder(e){
    var id=e.currentTarget.dataset.id;
    if(this.data.goodsId){
      this.data.list.forEach(item=>{
        if(item.id==id){
          wx.setStorageSync('delivery', item)
          wx.navigateBack({
            delta: 1,
          })
          // wx.redirectTo({
          //   // url: '/pages/order/confirm/gift/gift?id='+this.data.goodsId+'&type='+this.data.type,
          //   url: '/pages/order/confirm/order/order?id='+this.data.goodsId+'&type='+this.data.type+'&deliveryType=2&agentId='+this.data.agentId,
          // })
        }
      })
    }
  },

  goAddAddress(e){
    var id=e.currentTarget.dataset.id;
    if(id){
      wx.navigateTo({
        url: '/pages/my/address/edit/edit?id='+id,
      })
    }else{
      wx.navigateTo({
        url: '/pages/my/address/edit/edit',
      })
    }
  },
  
  // 获取列表
  getList(){
    wx.showLoading({title: '加载中...'})
    app.request.post({
      url: 'user/info/addressList',
      success: res => {
        wx.setStorageSync('shippingAddress', res.filter(item=>item.isDefault))
        if(!res.result&&!res[0]){
          wx.setStorageSync('shippingAddress', res.result)
          console.log("11");
        }
        this.setData({list: res})
      },
      finally: res=>{
        wx.hideLoading({
          success: (res) => {},
        })
      }
    })
  },
})