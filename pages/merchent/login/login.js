const app = getApp()
const rsa= require('../../../utils/encryption')

Page({
  data: {
    phone: '',
    password: '',
    verifyCode: '',
    verifySign: '',
  },
  //监听页面初次加载
  onLoad: function (options) {
    let phone = wx.getStorageSync('ShopPhone')
    if(phone){
      this.setData({
        phone,
      })
    }
        
  },
  //监听页面显示
  onShow: function () {
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  bindPwd(e){
    this.setData({
      password: e.detail.value
    })
  },
  bindPhone(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  bindVerifyCode(e) {
    this.setData({
      verifyCode: e.detail.value
    })
  },

  // 登录
  toLogin(){
    if(!this.data.phone){
      wx.showToast({title: '请输入手机号',icon: 'none'})
      return
    }
    if(!this.data.password){
      wx.showToast({title: '请输入密码',icon: 'none'})
      return
    }
    app.request.post({
      url: 'mt/info/public/userLogin',
      params: {
        account: rsa.cryptStr(this.data.phone),
        password: rsa.cryptStr(this.data.password),
        verifyCode: this.data.verifyCode,
        verifySign: this.data.verifySign,
      },
      success: result => {
        if(result.status==-2){
          wx.showModal({
            title: '您的店铺由于未缴纳保证金,现已被冻结!是否前往缴纳',
            confirmText: '前往缴纳',
            success:res=>{
              if(res.confirm){
                wx.navigateTo({
                  url: '/pages/merchent/enable/enable?mercId='+ result.id,
                })
              }else{
                wx.navigateBack({
                  delta: 1,
                })
              }
            },
          })
        }else{
          console.log('正常登录')
          wx.setStorage({
            data: result.token,
            key: 'merchentToken',
            success: res=>{
              wx.setStorageSync('ShopPhone', this.data.phone)
              wx.navigateBack({
                delta: 1,
              })
            }
          })
        }
      },
      allError:res=>{
        this.selectComponent("#imgCode").getCode();
      }
    })
    
  },
  getSign(e){
    this.setData({
      verifySign: e.detail
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