const app = getApp()
Page({
  data: {
    goodId: '',  
    type: 1,
    specList: [],
    skuList: [],
    skuInfo: {
      curPrice: 0,
      rioPrice: 0,
      firmPrice: 0,
      cover: ''
    },
    address: {},
    goods: {
      name: ''
    },
    count: 1,
    phone: '',
    isFriend: -1,
    allPrice: 0,
  },
  //监听页面初次加载
  onLoad: function (options) {
    if(options.id){
      this.setData({
        goodId: options.id,
      })
    }
  },
  //监听页面显示
  onShow: function () {
    this.getConfirm(this.data.goodId)
    if(this.data.type==2){
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#ff6040'
      })
    }else{
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#3994FF'
      })
    }
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  bindPhone(e){
    this.setData({phone: e.detail.value})
  },
  goAddress(){
    wx.navigateTo({
      url: '/pages/my/address/address?goodsId='+this.data.goodId,
    })
  },
  //  步进器
  onChange(e) {
    // this.setData({count: e.detail})
  },
  onMinus(){
    let price= this.data.isFriend==1? this.data.skuInfo.firmPrice: this.data.skuInfo.curPrice
    let count= this.data.count-1;
    let allPrice= (count * price).toFixed(2);
    this.setData({
      allPrice,
      count
    })
  },
  onPlus(){
    let price= this.data.isFriend==1? this.data.skuInfo.firmPrice: this.data.skuInfo.curPrice
    let count= this.data.count+1;
    let allPrice= (count * price).toFixed(2);
    this.setData({
      allPrice,
      count
    })
  },
  // 提交订单
  toSubmit(){
    if(!this.data.address.id){
      wx.showToast({title: '请选择地址',mask: true,icon: 'none'})
      return
    }
    wx.showLoading({title: '支付中...',mask: true})
    app.request.post({
      url: 'user/promote/submitOrder',
      params: {
        id: this.data.goodId,
        type: 4,
        count: 1,
        addressId: this.data.address.id,
        specId: this.data.skuInfo.id? this.data.skuInfo.id: '',
      },
      success: res => {
        this.wechatPay(res)
      },
    })
  },
  // 微信支付
  wechatPay(id){
    app.request.post({
      url: 'wx/pay/orderPay',
      params: {
        id,
        type: 4,
      },
      success: res => {
        var that= this;
        wx.requestPayment({
          timeStamp: res.timeStamp,
          nonceStr: res.nonceStr,
          package: res.packageValue,
          signType: 'MD5',
          paySign: res.paySign,
          success (result) {
            wx.showToast({
              title: '支付成功',
              icon: 'success',
              duration: 2000
            })
            setTimeout(() => {
              wx.navigateBack({
                delta: 2,
              })
            }, 1500);
          },
          fail (res) {
            wx.showToast({
              title: '支付失败',
              icon: 'none',
              duration: 2000
            })
          }
        })
      },
    })
  },

  // 获取商品信息
  getConfirm(id){
    id= id?id: 3
    wx.showLoading({
      title: '加载中...',
    })
    app.request.post({
      url: 'user/promote/confirmOrder',
      params: {
        id,
      },
      success: res => {
        wx.hideLoading()
        // 处理spec
        res.arraySpec.forEach(item=>{
          let sonName=[];
          item.sonName.forEach((i,index)=>{
            let obj={
              name: i,
              check: index==0? true: false
            }
            sonName.push(obj)
          })
          item.sonName=sonName
        })
        
        // 处理sku
        let proSkus=''
        if(res.proSkus){
          proSkus= JSON.parse(res.proSkus)
          proSkus.forEach((item,index)=>{
            let sku= []
            let obj= JSON.parse(item.spec)
            for (var i in obj) {
              sku.push(obj[i]); 
            }
            item.sku= sku
            if(index==0){
              this.setData({
                skuInfo: item,
              })
            }
          })
        }else{
          let skuInfo = {
            curPrice: res.adPro.price,
            rioPrice: res.adPro.originalPrice,
            firmPrice: res.adPro.friendPrice,
            cover: res.adPro.cover
          }
          // 计算总价
          let allPrice= res.isFriend==1?  res.adPro.friendPrice: res.adPro.price
          this.setData({
            skuInfo: skuInfo,
            allPrice
          })
        }

        // 地址
        let address= wx.getStorageSync('delivery')
        if(address){
          wx.removeStorageSync('delivery')
        }
        
        this.setData({
          goods: res.adPro,
          specList: res.arraySpec,
          skuList: proSkus,
          isFriend: res.isFriend,
          address: address? address: res.address? res.address: {}
        })
        this.getSkuInfo();
      },
    })
  },


  // -----------------------------规格相关-----------------------------------
  chooseSpec(e){
    let name= e.currentTarget.dataset.name
    let oneIndex= e.currentTarget.dataset.index
    let specList= this.data.specList;
    specList[oneIndex].sonName.forEach(i=>{
      i.check= false
      if(i.name==name) i.check= true
    })
    this.setData({
      specList
    })
    this.getSkuInfo()
  },
  getSkuInfo(){
    let arr=[];
    this.data.specList.forEach(item=>{
      item.sonName.forEach(i=>{
        if(i.check) arr.push(i.name)
      })
    })
    if(arr.length<this.data.specList.length) return
    console.log(arr)
    this.data.skuList.forEach(item=>{
      if(item.sku.join(';')==arr.join(';')){
        // 计算总价
        let allPrice= this.data.isFriend==1?  item.firmPrice: item.curPrice
        allPrice= (this.data.count*allPrice).toFixed(2)
        this.setData({
          skuInfo: item,
          allPrice
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