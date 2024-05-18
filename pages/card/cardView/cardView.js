// pages/card/cardView/cardView.js
const utils = require("../.../../../../utils/common");
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    exchanged: 0,
    exchangedCard: 1,
    // 是否本人标识
    isMe: false,
    // 判断本人是否创建卡片
    userCards: null,
    myCardId: null,
    myAvatar: "",
    myBackgroundImg: "",
    myCompany: "",
    myPosition: [],
    myAddress: "",
    myPhone: "",
    myName: "",
    Wxshow: false,
    id: "",
    userId: "",
    avatar: "",
    name: "",
    phone: "",
    wxQrcode: "",
    position: [],
    company: "",
    address: "",
    introduction: "",
    identity: "1",
    isEdit: 1, //1创建 2编辑
    isVip: 0,
    isSubscribe: 0, // 是否关注,
    influenceScore: 0,
    businessCreditScore: 0,
    baseScore: 0,
    contactsNumScore: 0,
    vipScore: 0,
    sixNum: 0,
    reputationNum: 0,
    totalNum: 0,
    ClassArr: [],
    industryArr: [],
    cardNeedResource: [],
    merchantInfos: [],
    socialContactRecord: {},
    RequirementData: [],
    AssetsData: [],
    cardPicture: [],
    merchant: [],
    show: false,
    showCard: false,
    addCardShow: false,
    tempFilePath: "",
  },

  async onLoad(options) {
    console.log("卡片详情options", options);
    wx.showLoading({
      title: "加载中...",
    });
    if (options.pId) {
      wx.setStorageSync("pId", options.pId);
    }
    let id = options.id;

    if (id) {
      this.Browsinghistory(id);
      this.setData({
        id,
      });
      wx.setStorageSync("isShare", id);
      this.getMyCard();
      this.getdefalut();
      this.getIndustryList();
      this.getClassList(id);
    } else {
      wx.showToast({
        title: "请检查ID或重试",
        icon: "error",
      });
    }
  },
  getUserCard(id) {
    if (id) {
      this.setData({
        id,
      });
      let latitude=wx.getStorageSync('latitude')
      let longitude=wx.getStorageSync('longitude')
      console.log("lat,lng",latitude,longitude);
      app.request.post({
        url: "us/cardInfo/getInfo",
        params: {
          id,
          longitude,
          latitude
        },
        success: (res) => {
          console.log("res信息", res);
          res.cardInfo.position = res.cardInfo.position.split(",");
          if (res) {
            wx.setNavigationBarTitle({
              title: res.cardInfo.name,
            });
            const myUserId = wx.getStorageSync("userId");
            if (myUserId && myUserId === res.cardInfo.userId) {
              console.log("myUserId", myUserId);
              console.log("res.cardInfo.userId", res.cardInfo.userId);
              this.setData({
                isMe: true,
                exchangedCard: 1,
              });
            } else {
              console.log("res", res);
              // exchanged 1接收 0 没接收
              this.setData({
                exchangedCard: res.exchangedCard,
                exchanged: res.exchanged,
              });
              console.log("this.exchangedCard", this.data.exchangedCard);
            }
            const cardNeedResources = res.cardNeedResources;
            const merchantInfos = res.merchantInfos;
            const {
              userId,
              id,
              avatar,
              name,
              phone,
              position,
              company,
              address,
              introduction,
              identity,
              wxQrcode,
              backgroundImg,
            } = res.cardInfo;
            const {
              influenceScore,
              businessCreditScore,
              baseScore,
              contactsNumScore,
              vipScore,
            } = res.userCreditScores;
            if (cardNeedResources.length > 0) {
              cardNeedResources.forEach((item) => {
                if (item.type === "1") {
                  this.data.RequirementData.push(item);
                } else {
                  this.data.AssetsData.push(item);
                }
              });
            }

            this.setData({
              cardSocialContacts: res.cardSocialContacts,
              socialContactRecord: res.socialContactRecord,
              isSubscribe: res.isSubscribe,
              cardPictures: res.cardPictures,
              RequirementData: this.data.RequirementData,
              AssetsData: this.data.AssetsData,
              merchantInfos,
              isVip: res.isVip,
              userId,
              id,
              avatar: utils.default.fullPath(avatar),
              name,
              phone,
              position,
              company,
              address,
              introduction,
              identity,
              wxQrcode,
              backgroundImg: utils.default.fullPath(backgroundImg),
              influenceScore,
              businessCreditScore,
              baseScore,
              contactsNumScore,
              vipScore,
              sixNum: contactsNumScore + influenceScore,
              reputationNum: businessCreditScore + vipScore,
            });
            console.log("this.data.sixNum", this.data.sixNum);
            console.log("this.data.reputationNum", this.data.reputationNum);

            this.setData({
              totalNum:
                this.data.sixNum +
                this.data.reputationNum +
                this.data.baseScore,
            });
          }
        },
      });
    }
  },
  getMyCard() {
    app.request.post({
      url: "us/cardInfo/getPinTopInfo",
      success: (res) => {
        console.log("getMyCardres", res);
        if (typeof res.cardInfo.position == "string") {
          res.cardInfo.position = res.cardInfo.position.split();
          console.log("res.cardInfo.position=", res.cardInfo.position);
        }
        this.setData({
          myCardId: res.cardInfo.id,
          myAvatar: utils.default.fullPath(res.cardInfo.avatar),
          myBackgroundImg: utils.default.fullPath(res.cardInfo.backgroundImg),
          myCompany: res.cardInfo.company,
          myPosition: res.cardInfo.position,
          myAddress: res.cardInfo.address,
          myPhone: res.cardInfo.phone,
          myName: res.cardInfo.name,
        });
      },
    });
  },
  Browsinghistory(id) {
    app.request.post({
      url: "us/cardInfo/addPopularity",
      params: {
        id,
      },
    });
  },
  visitAdd(id) {
    app.request.post({
      url: "us/cardInfo/socialContact",
      params: {
        id,
        type: 4,
        status: 1,
      },
    });
  },
  getdefalut() {
    app.request.post({
      url: "us/cardInfo/getUserInfo",
      success: (res) => {
        wx.hideLoading();
        console.log("userCards", res.userCards);
        if (res) {
          this.setData({
            userCards: res.userCards,
          });
        }
      },
    });
  },
  // 获取资源和需求分类列表
  getClassList(id) {
    app.request.post({
      url: "us/cardInfo/resourceClass",
      success: (res) => {
        if (res) {
          let modifiedRes = res.flatMap((item) => {
            if (
              item.children &&
              Array.isArray(item.children) &&
              item.children.length > 0
            ) {
              // 如果存在 children 属性，直接返回 children 数组中的所有元素
              return item.children.map((child) => ({
                ...child,
                parentName: item.name,
              }));
            } else {
              // 如果不存在 children 属性，直接返回包含原始对象的数组
              return [item];
            }
          });
          this.setData({
            ClassArr: modifiedRes,
          });
          this.getUserCard(id);
        }
      },
    });
  },
  // 获取行业列表
  getIndustryList() {
    app.request.post({
      url: "user/sysIndustry/public/list",
      success: (res) => {
        this.setData({
          industryArr: res,
        });
      },
    });
  },
  // <!-- type 1收藏 2点赞 3踩 4访问 5关注 -->
  // 收藏
  star(e) {
    if (this.data.isMe === true) {
      return;
    } else {
      const item = e.currentTarget.dataset.item;
      const socialContactRecord = this.data.socialContactRecord;
      console.log("socialContactRecord", socialContactRecord);
      app.request.post({
        url: "us/cardInfo/socialContact",
        params: {
          id: item.cardId,
          type: 5,
          status: socialContactRecord.isFavorites === -1 ? 1 : -1,
        },
        success: (res) => {
          if (res) {
            wx.showToast({
              title:
                socialContactRecord.isFavorites === -1
                  ? "关注成功"
                  : "已取消关注",
            });
            this.getUserCard(this.data.id);
          }
        },
      });
    }
  },
  // 点赞
  like(e) {
    if (this.data.isMe === true) {
      return;
    } else {
      const item = e.currentTarget.dataset.item;
      const socialContactRecord = this.data.socialContactRecord;
      app.request.post({
        url: "us/cardInfo/socialContact",
        params: {
          id: item.cardId,
          type: 1,
          status: socialContactRecord.isLikes === -1 ? 1 : -1,
        },
        success: (res) => {
          if (res) {
            wx.showToast({
              title:
                socialContactRecord.isLikes === -1 ? "点赞成功" : "取消点赞",
            });
            this.getUserCard(this.data.id);
          }
        },
      });
    }
  },
  // 踩
  Dislikes(e) {
    if (this.data.isMe === true) {
      return;
    } else {
      const item = e.currentTarget.dataset.item;
      const socialContactRecord = this.data.socialContactRecord;
      app.request.post({
        url: "us/cardInfo/socialContact",
        params: {
          id: item.cardId,
          type: 2,
          status: socialContactRecord.isDislikes === -1 ? 1 : -1,
        },
        success: (res) => {
          if (res) {
            this.getUserCard(this.data.id);
          }
        },
      });
    }
  },
  addContact(e) {
    var that = this;
    const {
      avatar,
      name,
      phone,
      position,
      company,
      address,
      introduction,
      identity,
      wxQrcode,
    } = this.data;
    // 请求通讯录权限

    wx.authorize({
      scope: "scope.addPhoneContact",
      success: () => {
        // 用户同意授权，调用添加联系人的方法
        wx.addPhoneContact({
          firstName: name,
          lastName: name,
          mobilePhoneNumber: phone,
          organization: company,
          title: position,
          success: (res) => {
            wx.showToast({
              title: "添加联系人成功",
            });
          },
          fail: (res) => {
            console.error("添加联系人失败", res);
          },
          complete: (res) => {
            console.log("添加联系人完成", res);
          },
        });
      },
      fail: () => {
        // 用户拒绝授权
        console.error("用户拒绝授权通讯录权限");
        this.getContact();
        wx.showToast({
          title: "需要通讯录权限才能添加联系人",
          icon: "none",
          duration: 2000,
        });
      },
    });
  },
  getContact() {
    // 引导用户打开设置页面进行授权
    wx.openSetting({
      success(settingRes) {
        if (settingRes.authSetting["scope.addressBook"]) {
          console.log("用户已经同意访问通讯录");
          // 在这里调用 wx.addPhoneContact 或其他相关的通讯录操作
        } else {
          console.log("用户依然拒绝访问通讯录");
          // 可以进一步提示用户或执行其他逻辑
        }
      },
    });
  },
  // 收下名片
  haveCard() {
    if (this.data.id) {
      if (this.data.userCards !== 1) {
        this.setData({
          addCardShow: true,
        });
      } else {
        app.request.post({
          url: "us/cardInfo/focusOn",
          params: {
            id: this.data.id,
          },
          success: (res) => {
            if (res) {
              this.getUserCard(this.data.id);
              wx.showToast({
                title: "已收下名片",
                icon: "none",
              });
            }
          },
        });
      }
    } else {
      wx.showToast({
        title: "请检查用户id是否正确",
        icon: "error",
      });
    }
  },
  showWx() {
    this.setData({
      Wxshow: !this.data.Wxshow,
    });
  },
  // closeWx()
  CreatedCard() {
    wx.navigateTo({
      url: "/pages/card/addCard/addCard?isShareId=" + this.data.id,
    });
  },
  onCreatedClose() {
    this.setData({
      addCardShow: false,
    });
  },
  // 店铺详情
  toDetail(e) {
    wx.navigateTo({
      url: "/pages/shop/detail/detail?id=" + e.currentTarget.dataset.id,
    });
  },
  roolBack() {
    wx.showToast({
      title: "暂无开放该功能",
      icon: "none",
    });
  },

  CreateShaleCard() {
    return new Promise((resolve, reject) => {
      const that = this;
      const query = wx.createSelectorQuery().in(this);
      query
        .select("#myCanvas")
        .fields({
          node: true,
          size: true,
        })
        .exec(async function (res) {
          console.log("data", that.data);
          const canvas = res[0].node;
          const ctx = canvas.getContext("2d");

          const dpr = wx.getSystemInfoSync().pixelRatio;
          canvas.width = res[0].width * dpr;
          canvas.height = res[0].height * dpr;
          ctx.scale(dpr, dpr);

          const bj = canvas.createImage();

          bj.src = that.data.myBackgroundImg;
          await new Promise((resolve) => {
            bj.onload = resolve;
          });
          const fm = canvas.createImage();
          fm.src = "/img/card/card-bgc.png";
          await new Promise((resolve) => {
            fm.onload = resolve;
          });

          const avatar = canvas.createImage();
          avatar.src = that.data.myAvatar;
          await new Promise((resolve) => {
            avatar.onload = resolve;
          });

          const phoneImg = canvas.createImage();
          phoneImg.src = "/img/card/card-phone.png";
          await new Promise((resolve) => {
            phoneImg.onload = resolve;
          });

          const companyImg = canvas.createImage();
          companyImg.src = "/img/card/corporation.png";
          await new Promise((resolve) => {
            companyImg.onload = resolve;
          });

          const locationImg = canvas.createImage();
          locationImg.src = "/img/card/orientation.png";
          await new Promise((resolve) => {
            locationImg.onload = resolve;
          });

          const scale = 0.58;
          const scaledWidth = 420 * scale;
          const scaledHeight = 336 * scale;

          ctx.drawImage(bj, 10, 10, scaledWidth, scaledHeight);
          ctx.drawImage(fm, 0, 0, 210, 168);
          ctx.save();

          ctx.beginPath();
          ctx.arc(210 - 36 / 2 - 23, 36 / 2 + 20, 36 / 2, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(avatar, 210 - 36 - 23, 20, 36, 36);
          ctx.restore();
          ctx.fillStyle = "white";
          ctx.font = "12px Arial";
          ctx.fillText(that.data.myName, 23, 30);
          ctx.font = "7px Arial";

          if (that.data.myPosition.length === 0 || !that.data.myPosition) {
            ctx.fillText("暂无职务", 23, 40);
          } else {
            that.data.myPosition.forEach((position, index) => {
              ctx.fillText(position, 23, 40 + index * 8);
            });
          }
          // ctx.fillText(that.data.myPosition, 23, 40);
          ctx.drawImage(phoneImg, 23, 60, 7, 7);
          ctx.fillText(that.data.myPhone, 32, 65);
          ctx.drawImage(companyImg, 23, 70, 7, 7);
          ctx.fillText(that.data.myCompany, 32, 75);
          ctx.drawImage(locationImg, 23, 80, 7, 7);
          ctx.fillText(that.data.myAddress, 32, 85);
          // 生成图片
          wx.canvasToTempFilePath({
            canvas,
            success: (res) => {
              // 生成的图片临时文件路径
              const tempFilePath = res.tempFilePath;
              that.setData({
                tempFilePath,
              });
              resolve(tempFilePath); // 传递生成的图片路径
            },
            fail: (err) => {
              console.error("canvasToTempFilePath 失败", err);
              reject(err);
            },
          });
        });
    });
  },
  //用户点击右上角转发
  async onShareAppMessage(e) {
    const that = this;

    if (e.from === "button") {
      wx.showLoading({
        title: "正在生成名片...",
      });
      const id = e.target.dataset.id;
      if (that.data.userCards !== 1) {
        that.setData({
          addCardShow: true,
        });
        return;
      }
      const tempFilePath = await that.CreateShaleCard();
      if (tempFilePath) {
        wx.hideLoading();
        return {
          title: "这是我的数字名片，请收下",
          path: `/pages/card/cardView/cardView?id=${id}&isShare=1`,
          imageUrl: tempFilePath,
        };
      }
    }
  },
});
