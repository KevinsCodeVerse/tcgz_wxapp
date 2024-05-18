const app = getApp()
// const rsa= require('../../../../utils/encryption')
// const Toast= require('../../../../miniprogram/miniprogram_npm/@vant/weapp/toast/toast')
import Toast from '../../../../miniprogram/miniprogram_npm/@vant/weapp/toast/toast';

Page({
  data: {
    id: '',
    cardName: '',
    cardNum: '',
    name: '',
    activeBank:[],
    banList:[],
  },
  //监听页面初次加载
  onLoad: function (options) {
    if(options.id){
      wx.setNavigationBarTitle({
        title: '查看/修改卡号信息',
      })
      this.setData({id: options.id})
    }else{
      wx.setNavigationBarTitle({
        title: '提交卡号信息',
      })
    }
  },
  //监听页面显示
  onShow: function () {
    this.getPublicBanklist()
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  bankChange(e) {
		this.setData({
			activeBank: this.data.banList[e.detail.value],
		});
	},
  getPublicBanklist() {
		app.request.post({
			url: "general/query/public/bankList",
			myType: 1,
			success: (res) => {
        this.getBankList();
				this.setData({
					banList: res,
				});
			},
		});
	},
  bindCardName(e){
    this.setData({
      cardName: e.detail.value
    })
  },
  bindCardNum(e){
    this.setData({
      cardNum: e.detail.value
    })
  },
  bindName(e){
    this.setData({
      name: e.detail.value
    })
  },

  getBankList(){
    app.request.post({
      url: 'user/bankCard/list',
      success: res => {
        if(res.length>0){
          this.setData({
            id: res[0].id,
            cardNum: res[0].cardNum,
            name: res[0].name,
            activeBank:{
              bank:res[0].cardName,
              bankId:res[0].bankId,
            }
          })
        }
      }
    })
  },

  // 提交
  toSubmit(){
    if(!this.data.activeBank.bank){
      wx.showToast({title: '请选择银行',icon: 'none'})
      return
    }
    Toast.loading({message: '提交中...',forbidClick: true,duration: 0});
    app.request.post({
      url: 'user/bankCard/addOrUpdate',
      params: {
        id: this.data.id,
        bankId: this.data.activeBank.bankId,
        cardNum: this.data.cardNum,
        name: this.data.name,
      },
      success: res => {
        wx.showToast({
          title: '提交成功',
          success: ()=>{
            setTimeout(() => {
              wx.navigateBack({delta: 1})
            }, 1500);
          }
        })
      },
      finally: res =>{
        Toast.clear()
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