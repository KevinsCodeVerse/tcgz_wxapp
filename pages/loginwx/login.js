// pages/login/login.js
const rsa = require('../../utils/encryption')

const app = getApp()
Page({
  data: {
    userInfo: {},
    parentId: '',
    phone: '',
    agentId: '',
    type: '',
    id: '',
  },
  //监听页面初次加载
  onLoad: function (options) {
    

    this.setData({
      phone: options.phone ? options.phone : '',
      parentId: options.scene ? options.scene : '',
      agentId: options.agentId || '',
      id: options.id || '',
      type: options.type || '',
    })
    this.data.parentId&&wx.setStorageSync('parentId', this.data.parentId)
    options.agentId&&wx.setStorageSync('agentIdoptions', options)
    console.log(options)
    this.getUserInfo();

    // wx.redirectTo({
    //   url: `/pages/goods/detail/detail?&id=${this.data.id}&type=1`,
    // })
  },
  //监听页面显示
  onShow: function () {

  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前

  // 判断是否新用户
  isNew() {
    app.request.post({
      url: 'user/invite/isNew',
      success: (res) => {
        console.log('isNew:' + res);
        if (res == 1 ){
          this.data.agentId && this.binding(this.data.agentId);
          // if(this.data.type==1){
          //   wx.redirectTo({
          //     url: `/pages/goods/detail/detail?&id=${this.data.id}&type=1`,
          //   })
          // }
        } else {
        }
      }
    })
  },

  // 获取信息系
  getUserInfo(e) {
    wx.login({
      success: res => {
        if (res.code) {
          // 拿到code, 请求给后台
          wx.showLoading({
            title: '微信授权登录中...',
            mask: true
          })
          app.request.post({
            url: 'wx/ma/user/public/login',
            params: {
              code: res.code,
              phone: this.data.phone
            },
            success: result => {
              this.setData({
                encryption: result.encryption
              })
              wx.setStorageSync('token', result.token);
              // this.isNew()
              wx.hideLoading();
            },
            allError: (err) => {
              console.log(err);
              wx.hideLoading();
            },
            fail: (err) => {
              wx.hideLoading();
              wx.showToast({
                title: '授权失败',
                icon: 'none'
              })
            },
          })
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '授权失败',
            icon: 'none'
          })
        }
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showToast({
          title: '授权失败',
          icon: 'none'
        })
      },
    })
  },
  // getUserInfo(e){
  //   if(this.data.loading) return;
  //   this.setData({
  //     loading: true
  //   })
  //   wx.login({
  //     success: res => {
  //       var userInfo = e.detail.userInfo
  //       if (res.code) {
  //         wx.getUserInfo({
  //           success: result => {
  //             // 拿到code, 请求给后台
  //             wx.showLoading({
  //               title: '微信授权登录中...',
  //               mask: true
  //             })
  //             wx.getStorage({
  //               key: 'parentId',
  //               success:res=>{
  //                 this.setData({
  //                   parentId:res.data
  //                 })
  //               }
  //             })
  //             app.request.post({
  //               url: 'wx/ma/user/public/login',
  //               params: {
  //                 code: res.code,
  //                 phone: this.data.phone
  //               },
  //               success: resu => {
  //                 wx.setStorageSync('token', resu.token);
  //                 app.request.post({
  //                   url: 'wx/ma/user/info',
  //                   params: {
  //                     encryptedData: result.encryptedData,
  //                     encryption: resu.encryption,
  //                     iv: result.iv,
  //                     rawData: result.rawData,
  //                     signature: result.signature,
  //                     parentId: this.data.parentId,

  //                   },
  //                   success: resul => {
  //                     this.setData({
  //                       loading: false
  //                     })
  //                     wx.showToast({
  //                       title: '新代码',
  //                     })
  //                     wx.setStorageSync('phone', resul.mobile)
  //                     wx.switchTab({
  //                       url: '/pages/focus/focus',
  //                     })
  //                     // if(resul.mobile) {
  //                     //   wx.setStorageSync('hasPhone', 1)
  //                     //   wx.switchTab({
  //                     //     url: '/pages/index/index',
  //                     //   })
  //                     // } else {
  //                     //   wx.setStorageSync('hasPhone', -1)
  //                     //   wx.redirectTo({
  //                     //     url: '/pages/bindphone/bindphone'
  //                     //   })
  //                     // }
  //                   },
  //                   allError: () => {
  //                     this.setData({
  //                       loading: false
  //                     })
  //                     wx.hideLoading();
  //                   }
  //                 })
  //               },
  //               allError: err => {
  //                 this.setData({
  //                   loading: false
  //                 })
  //                 wx.hideLoading();
  //               }
  //             })
  //           },
  //           fail: err => {
  //             this.setData({
  //               loading: false
  //             })
  //           }
  //         })
  //       }
  //     },
  //     fail: function (res) {
  //       this.setData({
  //         loading: false
  //       })
  //       wx.hideLoading();
  //     }
  //   })
  // },

  getUserProfile() {
    let agentIdoptions = wx.getStorageSync('agentIdoptions')||{}
    let parentIds = wx.getStorageSync('parentId')||""
    this.setData({
      parentId: parentIds,
      agentId:agentIdoptions.agentId||'',
      type:agentIdoptions.type||'',
      id:agentIdoptions.id||'',
    })
   
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.setData({
          encryptedData: res.encryptedData,
        })
        let params={
          encryptedData: res.encryptedData,
          encryption: this.data.encryption,
          iv: res.iv,
          rawData: res.rawData,
          signature: res.signature,
          parentId: this.data.parentId
        }
        app.request.post({
          url: 'wx/ma/user/info',
          params: {
            encryptedData: res.encryptedData,
            encryption: this.data.encryption,
            iv: res.iv,
            rawData: res.rawData,
            signature: res.signature,
            parentId: this.data.parentId||agentIdoptions.agentId||''
          },
          success: resul => {
            wx.showToast({
              title: '授权成功',
              icon: 'success',
              duration: 1500
            })
            this.setData({
              loading: false
            })
            wx.setStorageSync('phone', resul.mobile)
            parentIds&&this.binding(parentIds);
            agentIdoptions.agentId&&this.binding(agentIdoptions.agentId);
            // 获取用户信息
            this.getInfo()  //用户信息
            this.getAddressList() // 定位信息
              wx.switchTab({
                url: '/pages/focus/focus',
              })
              // wx.navigateBack({
              //   delta: 3,
              // })
          },
          allError: (err) => {
            console.log(err);
          }
        })

      },
      allError: (err) => {
        console.log(err);
      }
    })
  },

  // 模拟登录
  toLogin() {
    app.request.post({
      url: 'user/info/public/authority',
      params: {
        account: rsa.cryptStr('15797735521'),
        password: rsa.cryptStr('123456'),
      },
      success: res => {
        console.log(res.token)
        wx.setStorageSync('token', res.token)
      },
    })
  },
  goCancel() {
    wx.navigateBack({
      delta: 1,
    })
  },
  // 绑定上级
  binding(agentId) {
    app.request.post({
      url: 'user/invite/binding',
      params: {
        agentId,
      },
      success: () => {
        console.log('绑定成功!' + agentId);
      }
    })
  },
  // 个人信息
  getInfo() {
    app.request.post({
      url: 'user/info/totalAssets',
      success: res => {
        this.setData({
          info: res
        })
        wx.setStorageSync('userId', res.id)
        console.log(info);
      },
    })
  },
  // 获取列表
	getAddressList() {
		app.request.post({
			url: "user/info/addressList",
			success: (res) => {
				wx.setStorageSync("shippingAddress", res.filter((item) => item.isDefault)[0]);
				if (!res.result && !res[0]) {
					wx.setStorageSync("shippingAddress", res.result);
				}
			},
		});
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