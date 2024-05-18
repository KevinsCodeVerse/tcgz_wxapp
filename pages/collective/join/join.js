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
    flag: true,

    detail: '',
    // 行业筛选
    showIndustry: false,
    industryName: '',
    industryArr: [],
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
    phone: '',
    password: '',
    shopName: '',
    address: '',
    longitude: '',
    latitude: '',
    industryId: '',
    parentIndustryId: '',
    remark: '',
    
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.setData({firmId: options.id})
    this.getIndustryList();
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
  bindPhone(e){
    this.setData({
      phone: e.detail.value
    })
  },
  bindPwd(e){
    this.setData({
      password: e.detail.value
    })
  },
  bindShopName(e){
    this.setData({
      shopName: e.detail.value
    })
  },
  bindDetail(e){
    this.setData({
      detail: e.detail.value
    })
  },
  bindRemark(e){
    this.setData({
      remark: e.detail.value
    })
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
    wx.getSetting({
      success(res) {
        if(!res.authSetting['scope.userLocation']){
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              // 用户已经同意
              //其他操作...
              console.log("用户已经同意位置授权");
            },
            fail(){
              console.log("用户已经拒绝位置授权");
              that.openConfirm();//如果拒绝，在这里进行再次获取授权的操作
            }
          })
        }else{
          wx.chooseLocation({
            success: function (res) {    
              console.log(res);
              let address= res.address.split('市')[0]+'市'
              let detail= res.address + res.name
              that.setData({
                detail: detail,
                longitude: res.longitude,
                latitude: res.latitude,
              })
            }
          });
        }
      }
    })
  },

  openConfirm(){
    wx.showModal({
      content: '检测到您没打开此小程序的定位权限，是否去设置打开？',
      confirmText: "确认",
      cancelText: "取消",
      success: function (res) {
        console.log(res);
        //点击“确认”时打开设置页面
        if (res.confirm) {
          console.log('用户点击确认')
          wx.openSetting({
            success: (res) => { }
          })
        } else {
          console.log('用户点击取消')
        }
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
    if(!this.data.phone){
      wx.showToast({title: '请输入手机号码',icon: 'none'})
      return
    }
    // if(!this.data.password){
    //   wx.showToast({title: '请输入登录密码',icon: 'none'})
    //   return
    // }
    if(!this.data.shopName){
      wx.showToast({title: '请输入店铺或公司名称',icon: 'none'})
      return
    }
    if(!this.data.industryName){
      wx.showToast({title: '请选择行业',icon: 'none'})
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
    if(!this.data.remark){
      wx.showToast({title: '请输入验证信息',icon: 'none'})
      return
    }
    if(!this.data.longitude){
      wx.showToast({title: '请选择定位',icon: 'none'})
      return
    }
    if(!this.data.flag){
      wx.showToast({title: '请同意商户入驻协议',icon: 'none'})
      return
    }
    

    Toast.loading({message: '提交中...',forbidClick: true,duration: 0});
    app.request.post({
      url: 'user/firm/joinFirm',
      params: {
        firmId: this.data.firmId,
        name: this.data.name,
        phone: rsa.cryptStr(this.data.phone),
        password: rsa.cryptStr(this.data.password),
        shopName: this.data.shopName,
        cityName: this.data.address,
        address: this.data.detail,
        longitude: this.data.longitude,
        latitude: this.data.latitude,
        industryName: this.data.industryName,
        industryId: this.data.industryId,
        parentIndustryId: this.data.parentIndustryId,
        remark: this.data.remark,
      },
      success: res => {
        wx.showToast({
          title: '保存成功',
          success: ()=>{
            setTimeout(() => {
              wx.navigateBack({delta: 1})
            }, 1000);
          }
        })
      },
      finally: res =>{
        Toast.clear()
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