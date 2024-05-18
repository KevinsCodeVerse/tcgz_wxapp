// components/goodscanvas/goodscanvas.js
import common from '../../utils/common'
let timerIndex = 1


const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    ids: {
      type: Number,
      value: 72
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    ShareInfo: {},
    // 生成图片的链接
    imgbg: "https://www.tcgz.store/files/default/20210814161723.png",
    imgshop: '',
    goodsimg: '',
    QTimg: '',
    userimg: '',
    shoptitle: '',
    goodsprice: '',
    goodsprice2: '',
    goodsinfo: '',
    uesrname: '',
    shareImagePath: '',
    dialogShow: false,
    show: false,
    newimg: [],
    dpr: "",
    FUNChandtapSave: Function
  },

  /**
   * 组件的方法列表
   */
  ready() {
    const dpr = wx.getSystemInfoSync().pixelRatio

    wx.createSelectorQuery().in(this)
      .select('#canvas')
      .fields({
        node: true,
        size: true,
      })
      .exec(res => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        //新接口需显示设置画布宽高；
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx.scale(dpr, dpr);
        this.setData({
          canvas,
          ctx,
        });
        this.canvasDraw()
      })
  },
  methods: {

    // 执行方法
    go() {
      if (timerIndex==1) {
        console.log("11");
        timerIndex = 0
        this.handtapSave()
        setTimeout(() => {
        timerIndex = 1
        }, 5000);
      } 
      this.setData({
        show: false
      })
    },
    // 生成图片
    circleImg(ctx, img, x, y, r) {
      ctx.save()
      var d = 2 * r;
      var cx = x + r;
      var cy = y + r;
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.clip();
      ctx.drawImage(img, x, y, d, d);
      ctx.restore();
    },
    // 绘制 文本域  
    /**
     * @param {} ctx 画布的上下文环境 
     * @param {} content 需要绘制的文本内容 
     * @param {} drawX 绘制文本的x坐标 
     * @param {} drawY 绘制文本的y坐标 
     * @param {} lineHeight 文本之间的行高 
     * @param {} lineMaxWidth 每行文本的最大宽度 
     * @param {} lineNum 最多绘制的行数 
     */
    textPrewrap(ctx, content, drawX, drawY, lineHeight, lineMaxWidth, lineNum) {

      var drawTxt = ''; // 当前绘制的内容
      var drawLine = 1; // 第几行开始绘制
      var drawIndex = 0; // 当前绘制内容的索引
      ctx.textAlign = 'center';
      // 判断内容是否可以一行绘制完毕
      if (ctx.measureText(content).width <= lineMaxWidth) {
        ctx.fillText(content.substring(drawIndex, i), drawX, drawY);
      } else {
        for (var i = 0; i < content.length; i++) {
          drawTxt += content[i];
          if (ctx.measureText(drawTxt).width >= lineMaxWidth) {
            if (drawLine >= lineNum) {
              ctx.fillText(content.substring(drawIndex, i) + '..', drawX, drawY);
              break;
            } else {
              ctx.fillText(content.substring(drawIndex, i + 1), drawX, drawY);
              drawIndex = i + 1;
              drawLine += 1;
              drawY += lineHeight;
              drawTxt = '';
            }
          } else {
            // 内容绘制完毕，但是剩下的内容宽度不到lineMaxWidth
            if (i === content.length - 1) {
              ctx.fillText(content.substring(drawIndex), drawX, drawY);
            }
          }
        }
      }
    },

    //将小程序码绘制到固定位置
    setQrcode(context) {
      console.log("开始渲染");

      let img_QTimg = this.data.canvas.createImage();
      let img_goodsimg = this.data.canvas.createImage();
      let img_imgshop = this.data.canvas.createImage();
      let img_userimg = this.data.canvas.createImage();

      img_QTimg.src = this.data.QTimg //小程序码
      img_goodsimg.src = this.data.goodsimg //商品
      img_imgshop.src = this.data.imgshop // 店铺
      img_userimg.src = this.data.userimg //用户


      img_QTimg.onload = () => {
        context.drawImage(img_QTimg, 393, 816, 114, 114)
      };
      img_goodsimg.onload = () => {
        context.drawImage(img_goodsimg, 68, 244, 400, 400)
      };
      img_imgshop.onload = () => {
        this.circleImg(context, img_imgshop, 87, 175, 25)
      };
      img_userimg.onload = () => {
        this.circleImg(context, img_userimg, 30, 887, 21)
      };

      // 店铺 名
      // context.setFontSize(40)
      context.font = 'normal 20px sans-serif'
      context.fillStyle = '#222'
      let shopText = this.data.shoptitle.length > 13 ? this.data.shoptitle.slice(0, 13) + "..." : this.data.shoptitle
      context.fillText(shopText, 150, 205)

      // 商品现价
      context.font = 'normal bold 40px sans-serif'
      context.fillStyle = '#ff7800'
      let goodspriceText = this.data.goodsprice
      let width = this.data.ShareInfo.merchantPro.useAmount?160-context.measureText(goodspriceText).width:150
      context.fillText("￥" + goodspriceText, width, 693)

      // 商品原价
      let Wprice2 = context.measureText(goodspriceText).width + width+50;
      context.font = 'normal 28px sans-serif'
      context.fillStyle = '#a3a3a3'
      let goodsprice2Text = "￥" + this.data.goodsprice2
      context.fillText(goodsprice2Text, Wprice2, 689)
      context.beginPath();
      const textWidth = context.measureText(goodsprice2Text).width;
      context.fillStyle = '#a3a3a3';
      context.rect(Wprice2, 679, textWidth, 2);
      context.fill();
      console.log("123123");
      console.log(Wprice2);
      // 优惠券 
      if(this.data.ShareInfo.merchantPro.useAmount){
        let coupon = Wprice2 + context.measureText(goodsprice2Text).width+10;
        context.font = 'normal 20px sans-serif'
        let goodsprice2Text2 = "满" + this.data.ShareInfo.merchantPro.useAmount+'减'+this.data.ShareInfo.merchantPro.amount
        context.fillStyle = "#FF843E"; 　
        let boxW = context.measureText(goodsprice2Text2).width+20
        context.fillRect(coupon,662,boxW,32); 
        context.fillStyle = '#FFFFFF'
        context.fillText(goodsprice2Text2, coupon+10, 686)
      }
      // 商品描述
      context.font = 'normal 31px sans-serif'
      context.fillStyle = '#222'
      let goodsinfoText = this.data.goodsinfo
      this.textPrewrap(context, goodsinfoText, 270, 735, 35, 385, 2)
      context.textAlign = 'left';
      // 用户 名
      context.font = 'normal 19px sans-serif'
      context.fillStyle = '#fff'
      let uesrnameText = this.data.uesrname.length > 4 ? this.data.uesrname.slice(0, 4) + "..." : this.data.uesrname
      context.fillText(uesrnameText, 80, 912)

      console.log("渲染完毕等待生成");

      // context.draw()
      context.save()
    },
    // 画图 背景
    canvasDraw(ctx) {
      
      let img_imgbg = this.data.canvas.createImage();
      img_imgbg.src = this.data.imgbg //背景

      img_imgbg.onload = () => {
        this.data.ctx.drawImage(img_imgbg, 0, 0, 540, 960) //以iPhone 6尺寸大小为标准绘制图片
      }

    },

    createNewImg() {
      // let context = wx.createCanvasContext('mycanvass', this)
      // this.setQrcode(context)
      this.setQrcode(this.data.ctx)
      //将生成好的图片保存到本地，需要延迟一会，绘制期间耗时
      setTimeout(() => {
        let that = this
        wx.canvasToTempFilePath({
          canvas: that.data.canvas,
          x: 0,
          y: 0,
          width: this.data._width,
          height: this.data._height,
          destWidth: this.data._width, //截取canvas的宽度
          destHeight: this.data._height, //截取canvas的高度
          success: (res) => {
            wx.hideLoading()
            console.log(res);
            this.setData({
              shareImagePath: res.tempFilePath,
              dialogShow: true,
              show: true,
              // ShareInfo: {},
              // 生成图片的链接
              imgbg: "https://www.tcgz.store/files/default/20210814161723.png",
              imgshop: '',
              goodsimg: '',
              QTimg: '',
              userimg: '',
              shoptitle: '',
              goodsprice: '',
              goodsprice2: '',
              goodsinfo: '',
              uesrname: '',
            })
            this.triggerEvent('img', res.tempFilePath)
            console.log("生成完毕");
            this.canvasDraw()
            setTimeout(() => {
              timerIndex = 1
            }, 500);
          },
          fail: (res) => {
            console.log(res.errMsg)
          }
        }, this)
      }, 2500)
    },
    // 分享数据
    getShareInfo() {
      wx.showLoading({
        title: '加载中',
      })
      return new Promise((from, rejeck) => {
        if (this.data.shareImagePath) {
          this.setData({
            isShare: true,
            show:true
          })
          timerIndex = 1
          wx.hideLoading()
          return
        }
        app.request.post({
          url: 'user/pro/shareDetails',
          params: {
            id: this.data.ids
          },
          success: (res) => {
            this.setData({
              ShareInfo: res,
              imgshop: common.fullPath(res.merchantShop.shopPhoto),
              goodsimg: common.fullPath(res.merchantPro.cover),
              QTimg: common.fullPath(res.merchantPro.inviteImage),
              userimg: common.fullPath(res.userInfo.avatar),
              shoptitle: res.merchantShop.name,
              goodsprice: res.merchantPro.price,
              goodsprice2: res.merchantPro.originalPrice,
              goodsinfo: res.merchantPro.name,
              uesrname: res.userInfo.nick,
              isShare: true
            })
            // this.saseimg().then(res => {
              from(res)
            // })
          },
          finally:()=>{
            wx.hideLoading()
          }
        })
      })

    },
    // 保存图片
    saseimg() {
      return new Promise((from, reject) => {
        let arr = []
        let newimg = {}

        arr.push({
          name: 'imgbg',
          path: this.data.imgbg
        })
        arr.push({
          name: 'imgshop',
          path: this.data.imgshop
        })
        arr.push({
          name: 'goodsimg',
          path: this.data.goodsimg
        })
        arr.push({
          name: 'userimg',
          path: this.data.userimg
        })
        arr.push({
          name: 'QTimg',
          path: this.data.QTimg
        })
        // console.log(arr);
        console.log(arr);
        arr.forEach(element => {
          wx.getImageInfo({
            src: element.path,
            success: (res) => {
              // console.log(res);
              newimg[element.name] = res.path
              this.setData({
                newimg,
              })
              let newimgarr = Object.keys(newimg);
              // console.log(this.data.newimg);
              console.log(newimgarr);
              if (newimgarr.length == 5) {
                from()
                console.log("图片加载完毕");
              }
            },
            fail: (err) => {
              console.log(err)
            }
          })
        });
      })
    },
    handtapSave() { //先授权相册
      timerIndex = 0
      wx.getSetting({
        success: res => {
          if (!res.authSetting['scope.writePhotosAlbum']) { //未授权的话发起授权
            if (res.authSetting['scope.writePhotosAlbum'] === false) {
              wx.openSetting({
                success(res) {
                  console.log(res.authSetting)
                }
              })
            }
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success: (res) => { //用户允许授权，保存到相册
                // this.saveImg();
                this.getShareInfo().then(res => {
                  this.createNewImg()
                })
              },
              fail: () => { //用户拒绝授权，然后就引导授权（这里的话如果用户拒绝，不会立马弹出引导授权界面，坑就是上边所说的官网原因）
                wx.openSetting({
                  success: () => {
                    wx.authorize({
                      scope: 'scope.writePhotosAlbum',
                      succes: () => { //授权成功，保存图片
                        // this.saveImg();
                        this.getShareInfo().then(res => {
                          this.createNewImg()
                        })
                      }
                    })
                  }
                })
              }
            })
          } else { //已经授权
            // this.saveImg();
            console.log("已授权");
            this.getShareInfo().then(res => {
              console.log("成功执行");
              this.createNewImg()
            })
          }
        }
      })
    },

    saveImg() { //保存到相册
      console.log("22");
      let url = ['https://i.ibb.co/3fW84Vh/image.png', 'https://i.ibb.co/rcbdsjq/image.png'];
      url.forEach((element, index) => {
        wx.downloadFile({ //这里如果有报错就按照上边的解决方案来处理
          url: element,
          success: (res) => {
            console.log(res);
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: (res) => {
                if (element == url[url.length - 1]) {
                  wx.showToast({
                    title: '保存成功！'
                  })
                }
              },
              faile: (err) => {
                console.log('失败！')
              }
            })
          }
        })
      });
    },
    // 显示分享弹窗
    shareShow() {
      this.setData({
        isShare: false
      })
    },
    // 保存海报
    seveImgs() {
      if (!this.data.show) {
        wx.showToast({
          title: "生成完毕后再试!",
          icon: "none"
        })
        return
      }
      wx.saveImageToPhotosAlbum({
        filePath: this.data.shareImagePath,
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
  }
})