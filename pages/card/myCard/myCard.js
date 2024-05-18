// pages/card/myCard/myCard.js
const utils = require("../.../../../../utils/common");
const app = getApp();
Page({
  data: {
    id: "",
    cardInfo: {},
    cardNeedResources: [],
    cardSocialContacts: {},
    cardInfos: [],
    cardPictures: [],
    socialContactRecord: [],
    merchantInfos: [],
    isVip: 0,
    userCards: "",
    userId: "",
    show: false,
    showShare: false,
    options: [{ name: "微信", icon: "wechat", openType: "share" }],
    radioValue: false,
    tempFilePath: "",
    // 开通vip
    flag: false,
    showVip: false,
    showOpenVip: false,
    showCity: false,
    showSociety: false,
    showVipPopup: false,
    SocietyName: "",
    CityName: "",
    SocietyItems: [],
    CityItems: [],
    firmInfo: {},
  },

  onLoad(options) {
    wx.showLoading({
      title: "加载中...",
    });
    this.getdefalut();
    this.getVipInfo();
    this.getSocietyList();
    this.getCityList();

  },
  onShow() {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const currentUrl = `/${currentPage.__displayReporter.showReferpagepath}`;
    if (currentUrl.includes("SelectCardTemplate")) {
      this.getdefalut();
      this.getVipInfo();
      wx.removeStorageSync("pageAData");
    }
  },
  getdefalut() {
    app.request.post({
      url: "us/cardInfo/getPinTopInfo",
      success: (res) => {
        console.log("res", res);
     
        res.cardInfo.position = res.cardInfo.position.split(",");
        if (res.cardInfo) {
          res.cardInfo.backgroundImg = utils.default.fullPath(
            res.cardInfo.backgroundImg
          );
          res.cardInfo.avatar = utils.default.fullPath(res.cardInfo.avatar);
          this.setData({
            cardInfo: res.cardInfo,
            cardNeedResources: res.cardNeedResources,
            cardPictures: res.cardPictures,
            cardSocialContacts: res.cardSocialContacts,
            socialContactRecord: res.socialContactRecord,
          });
        } else {
          wx.reLaunch({
            url: "/pages/card/addCardPage/addCardPage",
          });
        }
      },
    });
 
  },
  getVipInfo() {
    app.request.post({
      url: "user/vip/getInfo",
      success: (res) => {
        console.log("vip信息", res);
        this.setData({
          isVip: res.vipInfo.isVip,
          firmInfo: res.firmInfo,
        });
      },
    });
  },
  getCardList() {
    app.request.post({
      url: "us/cardInfo/getUserInfo",
      success: (res) => {
        console.log("re", res);
        if (res) {
          if (res.userCards === 0) {
            wx.reLaunch({
              url: "/pages/card/addCardPage/addCardPage",
            });
          }
          res.cardInfos = res.cardInfos.map((item, index) => {
            return {
              ...item,
              position: item.position.split(","),
              backgroundImg: utils.default.fullPath(item.backgroundImg),
              checked: item.id === this.data.cardInfo.id ? true : false,
              value: String(index),
            };
          });
          this.setData({
            isVip: res.isVip,
            userCards: res.userCards,
            userId: res.userId,
            cardInfos: res.cardInfos,
            radioValue: true,
          });
        }
      },
    });
  },
  checkboxChange(e) {
    const index = e.currentTarget.dataset.index;
    const isChecked = this.data.cardInfos[index].checked;

    // 先将所有选项的 checked 设置为 false
    this.data.cardInfos.forEach((item) => {
      item.checked = false;
    });

    // 如果当前点击的选项不是已选中状态，则设置为选中
    if (!isChecked) {
      this.data.cardInfos[index].checked = true;
      this.setData({
        radioValue: true,
      });
    } else {
      // 如果点击已选中的项，则取消选中
      this.setData({
        radioValue: false,
      });
    }

    this.setData({
      cardInfos: this.data.cardInfos,
    });
  },
  golookCard() {
    wx.navigateTo({
      url: "/pages/card/cardView/cardView?id=" + this.data.cardInfo.id,
    });
  },
  editCard() {
    wx.navigateTo({
      url: "/pages/card/addCard/addCard?id=" + this.data.cardInfo.id,
    });
    wx.setNavigationBarTitle({
      title: "编辑名片",
    });
  },

  delCard() {
    this.setData({
      showCard: true,
    });
  },
  goSociety() {
    wx.navigateTo({
      url: "/pages/collective/find/find",
    });
  },

  toCrm() {
    let id;
    this.data.cardInfos.forEach((item) => {
      if (item.checked === true) {
        id = item.id;
      }
    });
    if (id) {
      app.request.post({
        url: "us/cardInfo/del",
        params: {
          id,
        },
        success: (res) => {
          if (res) {
            wx.showToast({
              title: "删除成功",
              icon: "success",
            });
            this.getCardList();
            this.setData({
              showCard: false,
            });
          }
        },
      });
    }
  },
  vipShow() {
    this.getVipPrice();
    this.setData({
      showVip: true,
    });
  },
  // 获取vip价格
  getVipPrice() {
    app.request.post({
      url: "user/vip/vipPrice",
      success: (res) => {
        this.setData({
          vipPrice: res,
        });
      },
    });
  },
  getSocietyList() {
    app.request.post({
      url: "user/firm/merchantFocusIn/list",
      success: (res) => {
        if (res) {
          res = res.map((item) => {
            return {
              checked: false,
              value: item.firmId,
              ...item,
            };
          });

          this.setData({
            SocietyItems: res,
          });
          console.log("商协会", this.data.SocietyItems);
        }
      },
    });
  },
  getCityList() {
    app.request.post({
      url: "user/vip/agentInfoList",
      success: (res) => {
        wx.hideLoading()
        const CityItems = res.map((item) => {
          item.cityName = item.cityName + "城市运营商";
          item.cityName = item.cityName.replace(/省/, "");
          return {
            checked: false,
            value: item.id,
            ...item,
          };
        });
        this.setData({
          CityItems,
        });
      },
    });
  },
  openVip() {
    this.setData({
      showVipPopup: !this.data.showVipPopup,
    });
  },
  openSociety() {
    this.setData({
      showSociety: !this.data.showSociety,
    });
  },
  openCity() {
    this.setData({
      showCity: !this.data.showCity,
    });
  },
  // 同意拒绝协议
  toAgree() {
    this.setData({ flag: !this.data.flag });
  },
  onCloseVip() {
    this.setData({
      showVip: false,
    });
  },
  // 购买
  buyVip() {
    let isCity = false;
    let isSociety = false;
    const CityItems = this.data.CityItems;
    const SocietyItems = this.data.SocietyItems;
    let agentId = "";
    let merId = "";
    SocietyItems.forEach((item) => {
      if (item.checked === true) {
        isSociety = true;
        merId = item.firmInfo.id;
      }
    });
    // if (!isSociety) {
    //   wx.showToast({
    //     title: "请选择集体",
    //     icon: "error",
    //   });
    //   return;
    // }
    CityItems.forEach((item) => {
      if (item.checked === true) {
        isCity = true;
        agentId = item.id;
      }
    });
    if (!isCity) {
      wx.showToast({
        title: "请选择城市",
        icon: "error",
      });
      return;
    }

    if (!this.data.flag)
      return wx.showToast({
        title: "请勾选同意协议",
        icon: "error",
      });
    wx.showLoading({ title: "支付中", mask: true });
    app.request.post({
      url: "wx/pay/openVip",
      params: {
        agentId,
        merId,
      },
      success: (res) => {
        console.log("支付res", res);
        var that = this;
        wx.requestPayment({
          timeStamp: res.timeStamp,
          nonceStr: res.nonceStr,
          package: res.packageValue,
          signType: "MD5",
          paySign: res.paySign,
          success(result) {
            wx.showToast({
              title: "开通成功",
              icon: "success",
              duration: 2000,
            });
            that.getVipInfo();

            that.setData({
              showVipPopup: false,
              showVip: false,
              flag: false,
            });
          },
          fail(res) {
            wx.showToast({
              title: "支付失败",
              icon: "none",
              duration: 2000,
            });
          },
        });
      },
    });
  },
  checkboxChangeSociety(e) {
    const value = e.currentTarget.dataset.item;
    let SocietyName = "";
    let SocietyItems = this.data.SocietyItems;
    SocietyItems.forEach((item) => {
      item.checked = false;
    });
    for (let i = 0, len = SocietyItems.length; i < len; ++i) {
      if (SocietyItems[i].value == value) {
        SocietyItems[i].checked = true;
        SocietyName = SocietyItems[i].firmInfo.name;
        break;
      }
    }
    this.setData({
      SocietyItems,
      SocietyName,
      showSociety: false,
    });
  },
  checkboxChangeCity(e) {
    console.log("e", e);
    const value = e.currentTarget.dataset.item;
    let CityName = "";
    let CityItems = this.data.CityItems;
    CityItems.forEach((item) => {
      item.checked = false;
    });
    for (let i = 0, len = CityItems.length; i < len; ++i) {
      if (CityItems[i].value == value) {
        CityItems[i].checked = true;
        CityName = CityItems[i].cityName;
        break;
      }
    }
    this.setData({
      CityItems,
      CityName,
      showCity: false,
    });
  },
  CreatedCard() {
    if (this.data.isVip === 1) {
      wx.navigateTo({
        url: "/pages/card/addCard/addCard",
      });
    } else {
      this.setData({
        showOpenVip: true,
      });
    }
  },
  toVipCrm() {
    this.vipShow();
  },
  toVipClose() {
    this.setData({
      showOpenVip: false,
    });
  },
  toClose() {
    this.setData({
      showCard: false,
    });
  },
  onCloseCard() {
    this.setData({
      show: false,
    });
  },
  OpenCheck() {
    this.getCardList();
    this.setData({
      show: true,
    });
  },
  sumbitCheckCard() {
    let id;
    this.data.cardInfos.forEach((item) => {
      if (item.checked === true) {
        id = item.id;
      }
    });
    if (id) {
      app.request.post({
        url: "us/cardInfo/switchCard",
        params: {
          id,
        },
        success: (res) => {
          if (res) {
            wx.showToast({
              title: "切换成功",
              icon: "success",
            });

            this.setData({
              show: false,
            });
            this.getdefalut();
            this.getVipInfo();
          }
        },
      });
    }
  },
  editTemplate() {
    const { id, backgroundId } = this.data.cardInfo;
    // 获取当前页面栈
    const pages = getCurrentPages();
    // 获取当前页面的路径
    const currentPagePath = pages[pages.length - 1].route;
    // 在触发页面跳转的地方
    wx.navigateTo({
      url:
        "/pages/card/SelectCardTemplate/SelectCardTemplate?id=" +
        id +
        "&backgroundId=" +
        backgroundId +
        "&currentPagePath=" +
        encodeURIComponent(currentPagePath),
    });
    wx.setStorageSync("pageAData", this.data);
  },
  // 改变图片不显示
  watchBackgroundUrl: function (newUrl) {
    if (newUrl) {
      // 如果 backgroundQuery.url 有值，转为 Base64
      let base64 = wx.getFileSystemManager().readFileSync(newUrl, "base64");
      return "data:image/jpg;base64," + base64;
    }
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
          console.log("cardInfo", that.data.cardInfo);
          const canvas = res[0].node;
          const ctx = canvas.getContext("2d");

          const dpr = wx.getSystemInfoSync().pixelRatio;
          canvas.width = res[0].width * dpr;
          canvas.height = res[0].height * dpr;
          ctx.scale(dpr, dpr);

          console.log("canvas:", {
            width: canvas.width,
            height: canvas.height,
          });

          const bj = canvas.createImage();

          bj.src = that.data.cardInfo.backgroundImg;
          await new Promise((resolve) => {
            bj.onload = resolve;
          });
          const fm = canvas.createImage();
          fm.src = "/img/card/card-bgc.png";
          await new Promise((resolve) => {
            fm.onload = resolve;
          });

          // const isVip =  canvas.createImage();
          // isVip.src = "/img/card/isVip-icon.png";
          // await new Promise((resolve) => {
          //   isVip.onload = resolve;
          // });
          const avatar = canvas.createImage();
          avatar.src = that.data.cardInfo.avatar;
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
          ctx.fillText(
            that.data.cardInfo.name ? that.data.cardInfo.name : "暂未填写姓名",
            23,
            30
          );

          ctx.font = "7px Arial";
          if (
            that.data.cardInfo.position.length === 0 ||
            !that.data.cardInfo.position
          ) {
            ctx.fillText("暂无职务", 23, 40);
          } else {
            that.data.cardInfo.position.forEach((position, index) => {
              ctx.fillText(position, 23, 40 + index * 8); // 调整垂直位置，以确保不重叠
            });
          }
          // ctx.drawImage(isVip, 110 - 36 - 23, 20, 28, 28);
          // ctx.fillText(
          //   that.data.cardInfo.position,
          //   23,
          //   40
          // );
          ctx.drawImage(phoneImg, 23, 60, 7, 7);
          ctx.fillText(
            that.data.cardInfo.phone
              ? that.data.cardInfo.phone
              : "暂未填写手机号",
            32,
            65
          );
          ctx.drawImage(companyImg, 23, 70, 7, 7);
          ctx.fillText(
            that.data.cardInfo.company
              ? that.data.cardInfo.company
              : "暂未填写公司名",
            32,
            75
          );
          ctx.drawImage(locationImg, 23, 80, 7, 7);
          ctx.fillText(
            that.data.cardInfo.address
              ? that.data.cardInfo.address
              : "暂未填写地址",
            32,
            85
          );
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
      // 来自页面内转发按钮
      const tempFilePath = await that.CreateShaleCard();
      const id = e.target.dataset.id;
      if (tempFilePath) {
        wx.hideLoading();
        return {
          title: "这是我的数字名片，请收下",
          path: `/pages/card/cardView/cardView?id=${id}&isShare=1&pId=${
            that.data.cardInfo.userId ? that.data.cardInfo.userId : ""
          }`,
          imageUrl: tempFilePath,
        };
      }
    }
  },
});
