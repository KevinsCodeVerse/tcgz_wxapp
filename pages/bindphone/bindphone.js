// pages/bindphone/bindphone.js
//获取应用实例
const app = getApp()
const rsa= require('../../utils/encryption')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',
    verifyCode: '',
    verifySign: '',
    code: '',
    phoneSign: '',
    smsShow: true,
    getVerification: '60s后重新获取'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  bind() {
    if(!/^1[3-9]\d{9}$/.test(this.data.phone)) {
      wx.showToast({
        title: '手机号格式错误',
        icon: 'none'
      })
      return;
    }
    if(!this.data.code) {
      wx.showToast({
        title: '请填写手机验证码',
        icon: 'none'
      })
      return;
    }
    app.request.post({
      url: 'user/info/bindPhone',
      params: {
        phone: rsa.cryptStr(this.data.phone),
        phoneCode: this.data.code,
        phoneSign: rsa.cryptStr(this.data.phoneSign)
      },
      success: result => {
        setTimeout(() => {
          wx.showToast({
            title: '绑定成功',
          });
        }, 1000);
        wx.setStorageSync('hasPhone', 1)
        wx.switchTab({
          url: '/pages/index/index',
        })
      },
      allError:res=>{
        this.selectComponent("#imgCode").getCode();
      }
    })
  },
  
  getSms() {
    if(!/^1[3-9]\d{9}$/.test(this.data.phone)) {
      wx.showToast({
        title: '手机号格式错误',
        icon: 'none'
      })
      return;
    }
    if(!this.data.verifyCode) {
      wx.showToast({
        title: '请填写图片验证码',
        icon: 'none'
      })
      return;
    }
    app.request.post({
      url: 'sms/public/sendCode',
      params: {
        phone: this.data.phone,
        verifyCode: this.data.verifyCode,
        verifySign: this.data.verifySign
      },
      success: (result,res) => {
        this.setData({
          phoneSign: result
        })
        wx.showToast({
          title: '短信发送成功',
        });
        var time = 60;
        this.setData({
          smsShow: false,
          getVerification: '60s后重新获取'
        })
        var Time = setInterval(() => {
          if(time == 1){
            this.setData({
              smsShow: true
            })
            time = 60;
            clearTimeout(Time);
          }else{
            time -- ;
            this.setData({
              getVerification: time + 's后重新获取'
            })
          }
        },1000);
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

  setPhone(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  setVerifyCode(e) {
    this.setData({
      verifyCode: e.detail.value
    })
  },

  setCode(e) {
    this.setData({
      code: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
  onShareAppMessage: function () {

  }
})