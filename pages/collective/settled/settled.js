const app = getApp()
// 引入SDK核心类
var QQMapWX = require('../../../libs/qqmap-wx-jssdk.min.js');
// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: 'L63BZ-6CDLU-WCVVN-2OL5O-2K4I2-ZEBNB' // 必填
});


const citys = {
  '商标/专利': ['商标担保注册', '专利查询', '版权登记'],
  '品牌设计': ['威尼斯', '清雅'],
};
const rsa= require('../../../utils/encryption')
import Toast from '../../../miniprogram/miniprogram_npm/@vant/weapp/toast/toast';

Page({
  data: {
    flag: false,

    detail: '',
    // 行业筛选
    showIndustry: false,
    industryName: '',
    industryArr: [],
    inviteFlag: false,
    columns: [
      // {
      //   values: Object.keys(citys),
      //   className: 'column1',
      // },
      // {
      //   values: citys['商标/专利'],
      //   className: 'column2',
      //   // defaultIndex: 2,
      // },
    ],
    // 提交数据
    firmId: '',
    name: '',
    account: '',
    password: '',
    inviteCode: '',
    address: '',
    longitude: '',
    latitude: '',
    industryId: '',
    parentIndustryId: '',
    type: '',

    // 验证手机数据
    phone: '',
    verifyCode: '',
    verifySign: '',
    code: '',
    phoneSign: '',
    smsShow: true,
    getVerification: '60s后重新获取'
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.setData({firmId: options.id})
    this.getIndustryList();
    this.getNoticeList();
  },
  //监听页面显示
  onShow: function () {
  },
  // 填写信息绑定-------------------------------------------------------------
  bindName(e){
    this.setData({
      name: e.detail.value
    })
  },
  bindAccount(e){
    let pwd = e.detail.value
    pwd = pwd.replace(/[^\w\/]/ig,'')
    this.setData({
      account: pwd
    })
  },
  bindPwd(e){
    this.setData({
      password: e.detail.value
    })
  },
  bindInviteCode(e){
    this.setData({
      inviteCode: e.detail.value
    })
  },
  bindDetail(e){
    this.setData({
      detail: e.detail.value
    })
  },
  typeChange({ detail }){
    this.setData({ type: detail });
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前-------------------------------------
  // 同意拒绝协议
  toAgree(){
    this.setData({flag: !this.data.flag})
  },
  // 地址选择
  addressChange(e){
    let arr= e.detail.value
    this.setData({address: arr.join('-')})
  },
  // 行业选择
  toIndustryCal(){
    this.setData({showIndustry: !this.data.showIndustry})
  },
  toIndustryCrm(e){
    let index= e.detail.index
    if(e.detail.value){
      this.setData({industryName: e.detail.value})
    }
    this.setData({showIndustry: !this.data.showIndustry})
    let industryId= this.data.industryArr[index].id
    this.setData({
      industryId
    })
  },
  onChange(event) {
    const { picker, value, index } = event.detail;
    picker.setColumnValues(1, citys[value[0]]);
  },
  
  //移动选点
  moveToLocation() {
    var that = this;
    wx.chooseLocation({
      success: function (res) {    
        console.log(res);
        let address= res.address.split('市')[0]+'市'
        let detail= res.address + res.name
        console.log(address)
        that.setData({
          address: address,
          detail: detail,
          longitude: res.longitude,
          latitude: res.latitude,
        })
      },
      fail: function (err) {
        console.log(err)
      }
    });
  },
  // ---------------------------------------------接口---------------------------------------------------
  // 提交
  toSubmit(){
    if(!this.data.name){
      wx.showToast({title: '请输入姓名',icon: 'none'})
      return
    }
    if(!this.data.industryName){
      wx.showToast({title: '请选择集体类别',icon: 'none'})
      return
    }
    if(!this.data.address){
      wx.showToast({title: '请选择所在地区',icon: 'none'})
      return
    }
    if(!this.data.detail){
      wx.showToast({title: '请输入详细地址',icon: 'none'})
      return
    }
    if(!this.data.account){
      wx.showToast({title: '请输入集体账号',icon: 'none'})
      return
    }
    if(!this.data.password){
      wx.showToast({title: '请输入密码',icon: 'none'})
      return
    }
    if(!this.data.latitude){
      wx.showToast({title: '请输入选择定位位置',icon: 'none'})
      return
    }
    if(!this.data.code){
      wx.showToast({title: '请输入短信验证码',icon: 'none'})
      return
    }
    if(!this.data.flag){
      wx.showToast({title: '请先阅读集体入驻协议并勾选同意',icon: 'none'})
      return
    }
    

    Toast.loading({message: '提交中...',forbidClick: true,duration: 0});
    app.request.post({
      url: 'wx/pay/createPromoterAudit',
      params: {
        name: this.data.name,
        account: rsa.cryptStr(this.data.account),
        password: rsa.cryptStr(this.data.password),
        inviteCode: this.data.inviteCode,
        cityName: this.data.address,
        address: this.data.detail,
        longitude: this.data.longitude,
        latitude: this.data.latitude,
        industryName: this.data.industryName,
        industryId: this.data.industryId,
        parentIndustryId: this.data.parentIndustryId,
        type: this.data.type,
        phone: rsa.cryptStr(this.data.phone),
        phoneSign: this.data.phoneSign,
        phoneCode: rsa.cryptStr(this.data.code)
      },
      success: res => {
        if(this.data.type == ''){
          // 微信支付
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
                wx.redirectTo({
                  url: '/pages/collective/firmlink/firmlink?type=1&account='+that.data.account,
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
        }else{
          wx.showToast({
            title: '试用入驻成功',
            icon: 'success',
            duration: 2000
          })
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/collective/firmlink/firmlink?type=1&account='+this.data.account,
            })
          }, 1500);
        }
      },
      finally: res =>{
        this.selectComponent("#imgCode").getCode();
        Toast.clear()
      }
    })
  },

  getNoticeList(){
    app.request.post({
      url: 'user/firm/intoTheCarousel',
      success: res => {
        this.setData({
          noticeList: res.userPromoterAudits,
          inviteCode: res.inviteCode? res.inviteCode: '',
          inviteFlag: res.inviteCode? true: false,
        })
      }
    })
  },

  // 获取行业列表
  getIndustryList(){
    app.request.post({
      url: 'user/sysIndustry/public/list',
      success: res => {
        let columns = [];
        res.forEach(item => {
          columns.push(item.name)
        });
        this.setData({
          columns: columns,
          industryArr: res
        })

      }
    })
  },

  // ------------------------短信验证相关方法---------------------------
  getSms() {
    if(!/^1[3-9]\d{9}$/.test(this.data.phone)) {
      wx.showToast({title: '手机号格式错误',icon: 'none'})
      return;
    }
    if(!this.data.verifyCode) {
      wx.showToast({title: '请填写图片验证码',icon: 'none'})
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
        this.setData({phoneSign: result})
        wx.showToast({title: '短信发送成功',});
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