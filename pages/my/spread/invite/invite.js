const app = getApp()
import urls from "../../../../utils/common.js";
Page({
  data: {
    invite: '',
    ewm: '',
    usId: '',
    shareShow:false,
    indexs:0,
    message:'',
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.setData({invite: options.invite})
    this.getQrcode();
  },
  //监听页面显示
  onShow: function () {
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  // 复制
  copyCode() {
    wx.setClipboardData({  
      data: this.data.invite,
      success: () => {
        wx.showToast({
          title: '复制成功',
        })
      }
    })
  },
  // 显示海报
  shareShowFunc(){
    this.setData({
      shareShow:true
  })
  },
  // 关闭弹窗
  onClose(){
    this.setData({
        shareShow:false
    })
  },
  handtapSave() { //先授权相册
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.writePhotosAlbum']) { //未授权的话发起授权
          console.log(res);
          if(res.authSetting['scope.writePhotosAlbum']===false){
            wx.openSetting({
              success (res) {
                console.log(res.authSetting)
              }
            })
          }
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: (res) => { //用户允许授权，保存到相册
              this.saveImg();
              console.log(res);
            },
            fail: () => { //用户拒绝授权，然后就引导授权（这里的话如果用户拒绝，不会立马弹出引导授权界面，坑就是上边所说的官网原因）
              wx.openSetting({
                success: () => {
                  wx.authorize({
                    scope: 'scope.writePhotosAlbum',
                    succes: () => { //授权成功，保存图片
                      this.saveImg();

                    }
                  })
                }
              })
            }
          })
        } else { //已经授权
          this.saveImg();
        }
      }
    })
  },
  saveImg() { //保存到相册
    console.log("22");
    let url = urls.imgUrl+this.data.ewm
    console.log(url);
      wx.downloadFile({ //这里如果有报错就按照上边的解决方案来处理
        url: url,
        success: (res) => {
          console.log(res);
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: (res) => {
                wx.showToast({
                  title: '保存成功！'
                })
            },
            faile: (err) => {
              console.log('失败！')
            }
          })
        }
      })
  },
  shareImg(e){
    this.data.indexs = e.currentTarget.dataset.index
    console.log(e);
    this.setData({
        indexs:e.currentTarget.dataset.index
    })
  },
  // 获取二维码
  getQrcode() {
    var usId = wx.getStorageSync('userId');
    this.setData({usId})
    app.request.post({
      url: 'user/promote/qrCode',
      params: {
        page: 'pages/login/login',
        scene: usId
      },
      success: res => {
        res.poster = res.poster.split(',')
        this.setData({ewm: res})
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
  onShareAppMessage(res) {
    let id = this.data.usId // 分享产品的Id
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    console.log(this.data.indexs);
    console.log(app.common.imgUrls+this.data.ewm.poster[this.data.indexs]);
    return {
      title: this.data.message,
      path: `pages/login/login?scene=${id}`, // 分享后打开的页面
      // imageUrl:'https://www.tcgz.store/'+this.data.ewm.poster[this.data.indexs]
      imageUrl:app.common.imgUrl+this.data.ewm.poster[this.data.indexs]
    }
  },
})