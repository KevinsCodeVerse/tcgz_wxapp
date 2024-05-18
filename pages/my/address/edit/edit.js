// pages/address/address_add/address_add.js
const app = getApp()
const area= require('../../../../utils/area')

Page({
  data: {
    show: false,
    area: area.default,
    
    id: '',
    name: '',
    phone: '',
    region: '',
    address: '',
    isDefault: 0
  },
  //监听页面初次加载
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.id? '编辑收货地址':'添加收货地址',
    })
    
    if(options.id){
      this.getDetail(options.id)
      this.setData({id: options.id})
    }

  },
  //监听页面显示
  onShow: function () {
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  tosel(){
    this.setData({show: !this.data.show})
  },
  onConfirm(e){
    console.log(e)
    var regionArr= e.detail.values;
    this.setData({
      show: !this.data.show,
      region: regionArr[0].name+ '-'+regionArr[1].name+'-'+regionArr[2].name
    })
  },
  onChange({ detail }) {
    this.setData({ isDefault: detail });
  },

  // 提交
  toSubmit(){
    if(!this.data.name){
      wx.showToast({title: '请输入收货人姓名',icon: 'none'})
      return
    }
    if(!this.data.phone){
      wx.showToast({title: '请输入收货人手机号码',icon: 'none'})
      return
    }
    if(!this.data.region){
      wx.showToast({title: '请选择所在地区',icon: 'none'})
      return
    }
    if(!this.data.address){
      wx.showToast({title: '请输入详细地址',icon: 'none'})
      return
    }

    wx.showLoading({title: '提交中',mask: true})
    app.request.post({
      url: 'user/info/addOrUpdateAddress',
      params: {
        id: this.data.id,
        name: this.data.name,
        phone: this.data.phone,
        region: this.data.region,
        address: this.data.address,
        isDefault: this.data.isDefault,
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
    })
  },

  // 删除
  toRemove(e){
    wx.showModal({
      title: '提示',
      content: '确定要删除该地址吗',
      success: res=>{
        if (res.confirm) {
          app.request.post({
            url: 'user/info/deleteAdderss',
            params: {id: this.data.id},
            success: res => {
              wx.showToast({title: '删除成功'})
              setTimeout(() => {
                wx.navigateBack({delta: 1})
              }, 1500);
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  getDetail(id){
    app.request.post({
      url: 'user/info/addressDetails',
      params: {id},
      success: res => {
        this.setData({
          name: res.name,
          phone: res.phone,
          region: res.region,
          address: res.address,
          isDefault: res.isDefault+ ''
        })
      }
    })
    
  }
  
  
})