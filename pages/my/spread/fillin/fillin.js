const app = getApp()
const rsa= require('../../../../utils/encryption')
import Toast from '../../../../miniprogram/miniprogram_npm/@vant/weapp/toast/toast';

Page({
  data: {
    fileList: [],
    typeList: ['市级运营账号','集体'],
    typeName: '',
    show: false,
    // 提交数据
    account: '',
    name: '',
    password: '',
    price: '',
    channel: '',
    bankCard: [],
    type: '',
    showIndustry:false,
    detail:'',//详细地址
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.getBank();
  },
  //监听页面显示
  onShow: function () {
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  bindAccount(e){
    this.setData({
      account: e.detail.value
    })
  },
  bindName(e){
    this.setData({
      name: e.detail.value
    })
  },
  bindPwd(e){
    this.setData({
      password: e.detail.value
    })
  },
  bindPrice(e){
    this.setData({
      price: e.detail.value
    })
  },
  bindChannel(e){
    this.setData({
      channel: e.detail.value
    })
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
  
  typeChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      typeName: this.data.typeList[e.detail.value],
      type: parseFloat(e.detail.value)+1
    })
  },
  // 详细地址
  bindDetail(e){
    this.setData({
      detail: e.detail.value
    })
  },
  // 图片上传
  afterRead(event) {
    const { file } = event.detail
    let base64 = wx.getFileSystemManager().readFileSync(file.path, 'base64')
    base64 = 'data:image/jpeg;base64,' + base64
    // 上传完成需要更新 fileList
    var fileList = this.data.fileList;
    fileList.push({ ...file, url: base64 });
    this.setData({
      fileList: fileList
    })
    console.log(fileList)
    
  },
  // 图片删除
  removeImg(event){
    let index = event.currentTarget.dataset.index
    var fileList = this.data.fileList;
    fileList.splice(event.detail.index,1)
    this.setData({ 
      fileList
     });
  },
  // 查看收款信息
  toPayee(){  
    this.setData({show: !this.data.show})
  },
  // ---------------------------------------------接口---------------------------------------------------
  // 提交
  toSubmit(){
    if(!this.data.account){
      wx.showToast({title: '请输入账号',icon: 'none'})
      return
    }
    if(!this.data.name){
      wx.showToast({title: '请输入集体名称',icon: 'none'})
      return
    }
    if(!this.data.password){
      wx.showToast({title: '请输入初始密码',icon: 'none'})
      return
    }
    if(!this.data.price){
      wx.showToast({title: '请输入打款金额',icon: 'none'})
      return
    }
    if(!this.data.channel){
      wx.showToast({title: '请输入支付渠道',icon: 'none'})
      return
    }
    if(!this.data.address){
      wx.showToast({title: '请选择地区',icon: 'none'})
      return
    }
    if(!this.data.detail){
      wx.showToast({title: '请输入详细地址',icon: 'none'})
      return
    }
    
    let img='';
    if(this.data.fileList.length>0){
      img = this.data.fileList[0].url
    }else{
      wx.showToast({title: '请输入上传凭证',icon: 'none'})
      return
    }

    Toast.loading({message: '提交中...',forbidClick: true,duration: 0});
    app.request.post({
      url: 'user/info/applyOrder',
      params: {
        account: this.data.account,
        name: this.data.name,
        password: rsa.cryptStr(this.data.password),
        money: this.data.price,
        paymentChannel: this.data.channel,
        collectionAccount: this.data.bankCard[0],
        cityName:this.data.address,
        address:this.data.detail,
        type: this.data.type,
        longitude: this.data.longitude,
        latitude: this.data.latitude,
        img
      },
      success: res => {
        wx.showToast({
          title: '提交成功',
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

  getBank(){
    app.request.post({
      url: 'user/sysParams/getAgreement',
      params: {
        type: 4,
      },
      success: res => {
        this.setData({
          bankCard: res
        })
      },
    })
  },

  // -----------------------------------跳转-------------------------------------
  goFillinFlow(){
    wx.navigateTo({
      url: '/pages/my/spread/fillin_flow/index',
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