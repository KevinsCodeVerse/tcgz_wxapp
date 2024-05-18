// pages/card/addCard/addCard.js
const app = getApp();
const area = require("../.../../../../utils/cityArea");
const rsa = require("../../../utils/encryption");
const utils = require("../.../../../../utils/common");
Page({
  data: {
    // vip价格
    vipPrice: null,

    // 获取定位参数
    latitude: "",
    longitude: "",
    userLocation: null, // 用户位置信息，包含经纬度
    preViewCard: false,
    backgroundId: "",
    backgroundName: "",
    backgroundList: [],
    id: "",
    avatar: "",
    name: "",
    phone: "",
    wxQrcode: "",
    position: [""],
    userId: "",
    company: "",
    address: "",
    introduction: "",
    identity: "1",
    isEdit: 1, //1创建 2编辑
    isVip: 0,

    cardNeedResource: [],
    RequirementData: [],
    AssetsData: [],
    cardPicture: [],
    merchantList: [],
    merchant: [],
    merchantInfos: [],
    route: {
      id: "",
      name: "",
      url: "",
    },
    result: [],
    area: area.default,
    // 需求表单
    RequirementForm: {
      type: "1",
      title: "",
      classId: "",
      className: "",
      industryName: "",
      industryId: "",
      city: "",
      cityList: [],
    },
    RequirementBtnShow: false,
    RequirementShow: false,
    showRelevance: false,
    // 资源表单
    AssetsForm: {
      type: "2",
      title: "",
      classId: "",
      className: "",
      industryName: "",
      industryId: "",
      city: "",
      cityList: [],
    },
    AssetsBtnShow: false,
    industryAssetsArr: [],
    showAssetsIndustry: false,
    ClassArr: [],
    ClassColumns: [],
    AssetsShow: false,
    showAssetsAddress: false,
    showIndustry: false,
    showAddress: false,
    showRequirement: false,
    industryArr: [],
    columns: [],
    vipInfo: {},
    vipClassArr: [],
    vipColumns: [],
    vipClassData: {},
    show: false,
    // 开通vip
    flag: false,
    disabled: true,
    vipText: "",
    showVip: false,
    showCity: false,
    showSociety: false,
    showVipPopup: false,
    SocietyName: "",
    CityName: "",
    SocietyItems: [],
    CityItems: [],
    firmInfo: {},
    smsShow: true,
    getVerification: "60s后重新获取",
    shopPhone: "",
    phoneCode: "",
    phoneSign: "",
    isEditRequirement: false,
    ReqIndex: null,
    isEditAssets: false,
    AssetsIndex: null,
    isShareId: "",
  },

  async onLoad(options) {
    const pageAData = wx.getStorageSync("pageAData");
    if (pageAData) {
      console.log("pageAData", pageAData);
      this.setData(pageAData);
      const RichEditor = this.selectComponent("#RichEditor");
      if (RichEditor) {
        RichEditor.modifyArray(pageAData.cardPicture);
      }
    }
    wx.removeStorageSync("pageAData");
    await this.getIndustryList();
    await this.getClassList();
    await this.getSocietyList();
    await this.getCityList();
    await this.getInfo();
    await this.getVipInfo();
    if (options.id) {
      // 有id走编辑
      await this.editCard(options.id);
    }
    if (options.isShareId) {
      this.setData({
        isShareId: options.isShareId,
      });
    }
    if (options.backgroundId) {
      this.setData({
        backgroundId: Number(options.backgroundId),
        backgroundName: options.backgroundName,
        backgroundImg: options.background,
      });
    }
    await this.getBgcList();
  },
  onShow() {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const currentUrl = `/${currentPage.__displayReporter.showReferpagepath}`;
    if (currentUrl.includes("SelectCardTemplate")) {
      const pageAData = wx.getStorageSync("pageAData");
      if (pageAData) {
        this.setData(pageAData);
        const RichEditor = this.selectComponent("#RichEditor");
        if (RichEditor) {
          RichEditor.modifyArray(pageAData.cardPicture);
        }
      }
      wx.removeStorageSync("pageAData");
    }
  },
  getInfo() {
    app.request.post({
      url: "user/info/totalAssets",
      success: (res) => {
        console.log("getInfo", res);
      },
    });
  },
  async getVipInfo() {
    app.request.post({
      url: "user/vip/getInfo",
      success: (res) => {
        console.log("vip", res);
        this.setData({
          isVip: res.vipInfo.isVip,
          firmInfo: res.firmInfo,
          vipInfo: res.vipInfo,
          disabled: res.vipInfo.isVip === 1 ? false : true,
        });
      },
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
  getBgcList() {
    app.request.post({
      url: "us/cardInfo/backgrounds",
      success: (res) => {
        if (res) {
          this.setData({
            backgroundList: res,
          });
          if (!this.data.backgroundId) {
            this.setData({
              backgroundId: this.data.backgroundList[0].id,
              backgroundName: this.data.backgroundList[0].name,
              backgroundImg: utils.default.fullPath(
                this.data.backgroundList[0].img
              ),
            });
          } else {
            console.log("backgroundId", this.data.backgroundId);
            this.data.backgroundList.forEach((item) => {
              if (item.id === this.data.backgroundId) {
                console.log("item", item);
                this.setData({
                  backgroundName: item.name,
                  backgroundId: item.id,
                  backgroundImg: utils.default.fullPath(item.img),
                });
              }
            });
          }
        }
      },
    });
  },
  async editCard(id) {
    const RichEditor = this.selectComponent("#RichEditor");

    if (id) {
      app.request.post({
        url: "us/cardInfo/getInfo",
        params: {
          id,
        },
        success: (res) => {
          if (res) {
            console.log("编辑数据", res);
            res.cardInfo.backgroundImg = utils.default.fullPath(
              res.cardInfo.backgroundImg
            );
            res.cardInfo.position = res.cardInfo.position.split(",");
            const cardNeedResources = res.cardNeedResources;
            const merchant = res.merchantInfos;
            const RequirementData = [];
            const AssetsData = [];
            if (cardNeedResources.length > 0) {
              cardNeedResources.forEach((item) => {
                if (item.type === "1") {
                  RequirementData.push(item);
                } else {
                  AssetsData.push(item);
                }
              });
            }
            const {
              backgroundId,
              backgroundImg,
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
            } = res.cardInfo;
            this.setData({
              backgroundId,
              backgroundImg,
              isEdit: 2,
              RequirementData,
              AssetsData,
              merchant,
              isVip: res.isVip,
              disabled: res.isVip === 1 ? false : true,
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
            });
            RichEditor.modifyArray(res.cardPictures);
          }
        },
      });
    }
  },
  editRequirement(e) {
    const isVip = this.data.isVip;
    console.log("editRequirement-e", e);
    const item = e.currentTarget.dataset.item;
    console.log("item", item);
    const industryArr = this.data.industryArr;
    const ClassArr = this.data.ClassArr;
    console.log("editAssets-ClassArr", ClassArr);
    let industryName;
    let className;
    industryArr.forEach((i) => {
      if (i.id === item.industryId) {
        industryName = i.name;
      }
    });
    if (isVip === 1) {
      ClassArr.forEach((i) => {
        if (i.id === item.classId) {
          className = i.name;
        }
      });
    } else {
      ClassArr.forEach((i) => {
        if (i.pId === item.classId) {
          className = i.parentName;
        }
      });
    }

    this.setData({
      RequirementForm: {
        ...item,
        industryName,
        className,
      },
      RequirementShow: true,
      isEditRequirement: true,
      ReqIndex: e.currentTarget.dataset.index,
    });
  },
  editAssets(e) {
    const isVip = this.data.isVip;
    console.log("editAssets-e", e);
    const item = e.currentTarget.dataset.item;
    const industryArr = this.data.industryArr;
    const ClassArr = this.data.ClassArr;
    console.log("editAssets-ClassArr", ClassArr);
    let industryName;
    let className;

    industryArr.forEach((i) => {
      if (i.id === item.industryId) {
        industryName = i.name;
      }
    });
    if (isVip === 1) {
      ClassArr.forEach((i) => {
        if (i.id === item.classId) {
          className = i.name;
        }
      });
    } else {
      ClassArr.forEach((i) => {
        if (i.pId === item.classId) {
          className = i.parentName;
        }
      });
    }
    this.setData({
      AssetsForm: {
        ...item,
        industryName,
        className,
      },
      AssetsShow: true,
      isEditAssets: true,
      AssetsIndex: e.currentTarget.dataset.index,
    });
  },
  imgSelect(e) {
    const { file } = e.detail;
    let base64 = wx.getFileSystemManager().readFileSync(file.url, "base64");
    base64 = "data:image/jpeg;base64," + base64;
    this.setData({
      avatar: base64,
    });
  },
  CodeimgSelect(e) {
    const { file } = e.detail;
    let base64 = wx.getFileSystemManager().readFileSync(file.url, "base64");
    base64 = "data:image/jpeg;base64," + base64;
    this.setData({
      wxQrcode: base64,
    });
  },

  handlePhoneInput(event) {
    const userInput = event.detail;
    // if(!/^1[3-9]\d{9}$/.test(userInput)) {
    //   wx.showToast({
    //     title: '手机号格式错误',
    //     icon: 'none'
    //   })
    //   return;
    // }
    // this.setData({
    //   phone: isValidPhone ? "" : userInput,
    // });
  },
  addPos() {
    this.data.position.push("");

    this.setData({
      position: this.data.position,
    });
  },
  bindShop() {
    this.setData({
      show: true,
    });
  },
  popupShowRequirement() {
    this.setData({
      RequirementShow: true,
      isEditRequirement: false,
      RequirementBtnShow: false,
      RequirementForm: {
        type: "1",
        text: "",
        classId: "",
        className: "",
        industryId: "",
        industryName: "",
        city: "",
        cityList: [],
      },
    });
  },
  popupShowAssets() {
    this.setData({
      AssetsShow: true,
      isEditAssets: false,
      AssetsBtnShow: false,
      AssetsForm: {
        type: "2",
        title: "",
        classId: "",
        className: "",
        industryName: "",
        industryId: "",
        city: "",
        cityList: [],
      },
    });
  },
  toVipCrm() {
    this.vipShow();
  },
  toVipClose() {
    this.setData({
      showOpenVip: false,
    });
  },
  vipShow() {
    this.getVipPrice();
    this.setData({
      showVip: true,
    });
  },
  openVip() {
    this.setData({
      showVipPopup: !this.data.showVipPopup,
    });
  },
  removeShop(e) {
    const index = e.currentTarget.dataset.index;
    const merchant = this.data.merchant;
    merchant.splice(index, 1);
    this.setData({
      merchant,
    });
  },
  RelevanceShow() {
    this.setData({
      showRelevance: true,
    });
  },

  onCloseVip() {
    this.setData({
      showVip: false,
    });
  },

  onCloseRequirementPopup() {
    this.setData({
      RequirementShow: false,
      RequirementForm: {
        type: "1",
        title: "",
        className: "",
        classId: "",
        industryName: "",
        industryId: "",
        city: "",
        cityList: [],
      },
    });
  },
  onCloseAssetsPopup() {
    this.setData({
      AssetsShow: false,
      AssetsForm: {
        type: "1",
        title: "",
        className: "",
        classId: "",
        industryName: "",
        industryId: "",
        city: "",
        cityList: [],
      },
    });
  },
  onClose() {
    this.setData({
      show: false,
    });
  },
  fieldchange(e) {
    const index = e.currentTarget.dataset.index;
    this.data.position[index] = e.detail;
    this.setData({
      position: this.data.position,
    });
  },
  // 开通vip部分
  checkVip(e) {
    let vipText;
    if (e.type === "tap") {
      vipText = e.currentTarget.dataset.item;
    }
    if (e.type === "checkVip") {
      vipText = e.detail;
    }
    if (this.data.isVip !== 1) {
      this.getVipPrice();
      this.setData({
        showOpenVip: true,
        vipText,
      });
    }
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
  goSociety() {
    wx.navigateTo({
      url: "/pages/collective/find/find",
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
    console.log("agentId", agentId);
    console.log("merId", merId);
    wx.showLoading({ title: "支付中", mask: true });
    app.request.post({
      url: "wx/pay/openVip",
      params: {
        agentId,
        merId,
        // identity:this.data.identity
      },
      success: (res) => {
        var that = this;
        wx.requestPayment({
          timeStamp: res.timeStamp,
          nonceStr: res.nonceStr,
          package: res.packageValue,
          signType: "MD5",
          paySign: res.paySign,
          success(result) {
            console.log("支付成功", result);
            const RichEditor = that.selectComponent("#RichEditor");
            if (RichEditor) {
              // 刷新组件vip
              RichEditor.loadData();
            }
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
  // 同意拒绝协议
  toAgree() {
    this.setData({ flag: !this.data.flag });
  },
  onShopChange(e) {
    this.setData({
      result: e.detail,
    });
  },
  toShopCrm() {
    if (!this.data.shopPhone && !this.data.phoneCode) {
      wx.showToast({ title: "请填写信息", icon: "error" });
      this.setData({
        showRelevance: true,
      });
      return;
    } else {
      app.request.post({
        url: "us/cardInfo/getMerchantInfo",
        params: {
          phone: rsa.cryptStr(this.data.shopPhone),
          phoneCode: this.data.phoneCode,
          phoneSign: rsa.cryptStr(this.data.phoneSign),
        },
        success: (res) => {
          console.log("res", res);
          if (res) {
            if (res.length === 0) {
              wx.showToast({
                title: "暂无关联商户",
              });
              return;
            }
            wx.showToast({
              title: "验证成功",
              icon: "success",
            });
            res.forEach((item) => {
              item.selected = false;
            });
            this.setData({
              showRelevance: false,
              show: true,
              merchantList: res,
              shopPhone: "",
              phoneCode: "",
              phoneSign: "",
            });
            let merchantList = this.data.merchantList;
            if (this.data.merchant.length > 0) {
              const merchant = this.data.merchant;
              merchantList.forEach((i) => {
                merchant.forEach((j) => {
                  if (i.id === j.id) {
                    i.selected = true;
                  }
                });
              });
              this.setData({
                show: true,
                isShopBtn: true,
                merchantList,
              });
            } else {
              merchantList[0].selected = true;
              this.setData({
                show: true,
                isShopBtn: true,
                merchantList,
              });
            }
            // this.getMerchantsLocation();
            // this.getUserLocation();
          } else {
            this.setData({
              showRelevance: false,
              shopPhone: "",
              phoneCode: "",
              phoneSign: "",
            });
            wx.showToast({
              title: "该用户没有关联商户",
              icon: "error",
            });
          }
        },
      });
    }
  },
  toShopClose() {
    this.setData({
      shopPhone: "",
      phoneCode: "",
      phoneSign: "",
      showRelevance: false,
    });
  },
  toggleSelection(e) {
    const index = e.currentTarget.dataset.index;
    const selected = !this.data.merchantList[index].selected;
    this.setData({
      [`merchantList[${index}].selected`]: selected,
    });
    let isShopBtn = false;
    this.data.merchantList.forEach((item) => {
      if (item.selected === true) {
        isShopBtn = true;
      }
    });
    this.setData({
      isShopBtn,
    });
  },

  // 18676267684
  ConfirmAssociation() {
    if (this.data.isShopBtn === true) {
      const selectedIds = new Set(this.data.merchant.map((item) => item.id));
      const newMerchants = this.data.merchantList
        .filter((item) => item.selected && !selectedIds.has(item.id))
        .map((item) => ({ ...item }));

      this.setData({
        show: false,
        merchant: [...this.data.merchant, ...newMerchants],
      });

      console.log("merchant", this.data.merchant);
    } else {
      wx.showToast({
        title: "请选择关联商户",
      });
    }
  },
  onChange(e) {
    this.setData({
      identity: e.detail,
    });
  },
  onChangeRequirement(e) {
    this.setData({
      "RequirementForm.title": e.detail,
    });
    if (e.detail) {
      this.btnShowRequirement();
    } else {
      this.btnHiddenRequirement();
    }
  },
  onChangeAssets(e) {
    this.setData({
      "AssetsForm.title": e.detail,
    });
    if (e.detail) {
      this.btnShowAssets();
    } else {
      this.btnHiddenAssets();
    }
  },

  catchImg(url) {
    if (url) {
      const relativePath = url.replace(/^.*\/files\//, "/files/");
      return relativePath;
    }
  },
  catchBackgroundUrl(newUrl) {
    if (newUrl) {
      let base64 = wx.getFileSystemManager().readFileSync(newUrl, "base64");
      return "data:image/jpg;base64," + base64;
    }
  },
  addTemplate() {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const { route } = currentPage;
    wx.navigateTo({
      url:
        "/pages/card/SelectCardTemplate/SelectCardTemplate?backgroundId=" +
        this.data.backgroundId +
        "&currentPagePath=" +
        route,
    });
    const RichEditor = this.selectComponent("#RichEditor");
    const cardPicture = RichEditor.getData();
    this.setData({
      cardPicture,
    });
    wx.setStorageSync("pageAData", this.data);
  },
  //移动选点
  moveToLocation() {
    var that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting["scope.userLocation"]) {
          wx.authorize({
            scope: "scope.userLocation",
            success() {
              // 用户已经同意
              //其他操作...
              console.log("用户已经同意位置授权");
            },
            fail() {
              console.log("用户已经拒绝位置授权");
              that.openConfirm(); //如果拒绝，在这里进行再次获取授权的操作
            },
          });
        } else {
          wx.chooseLocation({
            success: function (res) {
              let address = res.address.split("市")[0] + "市";
              let detail = res.address + res.name;
              that.setData({
                address: detail,
                longitude: res.longitude,
                latitude: res.latitude,
              });
            },
          });
        }
      },
    });
  },
  openConfirm() {
    wx.showModal({
      content: "检测到您没打开此小程序的定位权限，是否去设置打开？",
      confirmText: "确认",
      cancelText: "取消",
      success: function (res) {
        //点击“确认”时打开设置页面
        if (res.confirm) {
          console.log("用户点击确认");
          wx.openSetting({
            success: (res) => {},
          });
        } else {
          console.log("用户点击取消");
        }
      },
    });
  },
  // 需求行业选择
  toIndustryCal() {
    this.setData({ showIndustry: !this.data.showIndustry });
  },
  // 资源行业选择
  toAssetsIndustryCal() {
    this.setData({ showAssetsIndustry: !this.data.showAssetsIndustry });
  },
  toAssetsCal() {
    this.setData({ showAssets: !this.data.showAssets });
  },
  toRequirementCal() {
    this.setData({ showRequirement: !this.data.showRequirement });
  },
  // 商家入驻
  toPublicJoin() {
    wx.navigateTo({
      url: "/pages/shop/settled/settled",
    });
  },
  // 需求分类
  toRequirementCrm(e) {
    console.log("e", e);
    const ClassArr = this.data.ClassArr;
    let classId;
    ClassArr.forEach((item) => {
      if (item.parentName == e.detail.value) {
        classId = item.pId;
      }
    });
    console.log("classId", classId);
    if (e.detail.value) {
      this.setData({
        "RequirementForm.className": e.detail.value,
        "RequirementForm.classId": classId,
      });
    }
    this.setData({ showRequirement: !this.data.showRequirement });
    this.btnShowRequirement();
  },
  tovipRequirementCrm(e) {
    console.log("eeeee", e);
    const index = e.detail.index;
    const classId = this.data.vipClassArr[index[0]].children[index[1]].id;
    if (e.detail.value) {
      this.setData({
        "RequirementForm.className": e.detail.value[1],
        "RequirementForm.classId": classId,
      });
    }
    this.setData({ showRequirement: !this.data.showRequirement });
    this.btnShowRequirement();
  },
  // vipClassArr
  tovipAssetsCrm(e) {
    console.log("e", e);
    const index = e.detail.index;
    const classId = this.data.vipClassArr[index[0]].children[index[1]].id;
    if (e.detail.value) {
      this.setData({
        "AssetsForm.className": e.detail.value[1],
        "AssetsForm.classId": classId,
      });
    }
    this.setData({ showAssets: !this.data.showAssets });
    this.btnShowAssets();
  },
  // 资源分类
  toAssetsCrm(e) {
    console.log("e", e);
    const ClassArr = this.data.ClassArr;
    let classId;
    ClassArr.forEach((item) => {
      if (item.parentName == e.detail.value) {
        classId = item.pId;
      }
    });
    if (e.detail.value) {
      this.setData({
        "AssetsForm.className": e.detail.value,
        "AssetsForm.classId": classId,
      });
    }
    this.setData({ showAssets: !this.data.showAssets });
    this.btnShowAssets();
  },
  // 需求行业
  toIndustryCrm(e) {
    const index = e.detail.index;
    const industryId = this.data.industryArr[index].id;
    if (e.detail.value) {
      this.setData({
        "RequirementForm.industryName": e.detail.value,
        "RequirementForm.industryId": industryId,
      });
    }
    this.setData({ showIndustry: !this.data.showIndustry });
    this.btnShowRequirement();
  },
  // 资源行业
  toAssetsIndustryCrm(e) {
    const index = e.detail.index;
    const industryId = this.data.industryArr[index].id;
    if (e.detail.value) {
      this.setData({
        "AssetsForm.industryName": e.detail.value,
        "AssetsForm.industryId": industryId,
      });
    }
    this.setData({ showAssetsIndustry: !this.data.showAssetsIndustry });
    this.btnShowAssets();
  },
  // 需求
  btnShowRequirement() {
    const { title, industryName, className, city } = this.data.RequirementForm;
    if (title && className && industryName && city) {
      this.setData({
        RequirementBtnShow: true,
      });
    }
  },
  btnHiddenRequirement() {
    this.setData({
      RequirementBtnShow: false,
    });
  },
  // 资源
  btnShowAssets() {
    const { title, className, industryName, city } = this.data.AssetsForm;

    if (title && className && industryName && city) {
      this.setData({
        AssetsBtnShow: true,
      });
    }
  },
  btnHiddenAssets() {
    this.setData({
      AssetsBtnShow: false,
    });
  },
  // 需求地区
  toRegionCrm(e) {
    var regionArr = e.detail.values;
    this.setData({
      showAddress: !this.data.showAddress,
      "RequirementForm.city": regionArr[0].name + "-" + regionArr[1].name,
    });
    this.btnShowRequirement();
  },
  // 资源地区
  toAssetsRegionCrm(e) {
    var regionArr = e.detail.values;
    this.setData({
      showAssetsAddress: !this.data.showAssetsAddress,
      "AssetsForm.city": regionArr[0].name + "-" + regionArr[1].name,
    });
    this.btnShowAssets();
  },
  // 确认添加需求
  addRequirement() {
    const { title, className, industryName, city } = this.data.RequirementForm;
    if (title && className && industryName && city) {
      this.setData({
        RequirementBtnShow: true,
      });
    } else {
      wx.showToast({ title: "请选择所有信息", icon: "error" });
      return;
    }
    if (this.data.isEditRequirement === true) {
      const ReqIndex = this.data.ReqIndex;
      this.data.RequirementData[ReqIndex] = this.data.RequirementForm;
      this.setData({
        RequirementShow: !this.data.RequirementShow,
        RequirementData: this.data.RequirementData,
        ReqIndex: null,
        isEditRequirement: false,
        RequirementForm: {
          type: "1",
          title: "",
          classId: "",
          className: "",
          industryId: "",
          industryName: "",
          city: "",
          cityList: [],
        },
      });
    } else {
      this.data.RequirementData.push(this.data.RequirementForm);
      this.setData({
        RequirementData: this.data.RequirementData,
        RequirementShow: !this.data.RequirementShow,
        RequirementForm: {
          type: "1",
          title: "",
          classId: "",
          className: "",
          industryId: "",
          industryName: "",
          city: "",
          cityList: [],
        },
      });
    }
  },

  // 确认添加资源
  addAssets() {
    const { title, className, industryName, city } = this.data.AssetsForm;
    if (title && className && industryName && city) {
      this.setData({
        AssetsBtnShow: true,
      });
    } else {
      wx.showToast({ title: "请选择所有信息", icon: "error" });
      return;
    }
    if (this.data.isEditAssets === true) {
      const AssetsIndex = this.data.AssetsIndex;
      this.data.AssetsData[AssetsIndex] = this.data.AssetsForm;
      this.setData({
        AssetsData: this.data.AssetsData,
        AssetsShow: !this.data.AssetsShow,
        AssetsIndex: null,
        isEditAssets: false,
        AssetsForm: {
          type: "2",
          title: "",
          classId: "",
          className: "",
          industryName: "",
          industryId: "",
          city: "",
          cityList: [],
        },
      });
    } else {
      this.data.AssetsData.push(this.data.AssetsForm);
      this.setData({
        AssetsData: this.data.AssetsData,
        AssetsShow: !this.data.AssetsShow,
        AssetsForm: {
          type: "2",
          title: "",
          classId: "",
          className: "",
          industryName: "",
          industryId: "",
          city: "",
          cityList: [],
        },
      });
    }
  },
  //移除需求
  removeRequirement(e) {
    const index = e.currentTarget.dataset.index;
    this.data.RequirementData.splice(index, 1);
    this.setData({
      RequirementData: this.data.RequirementData,
    });
  },
  removePos(e) {
    const index = e.currentTarget.dataset.index;
    this.data.position.splice(index, 1);
    this.setData({
      position: this.data.position,
    });
  },
  // 移除资源
  removeAssets(e) {
    const index = e.currentTarget.dataset.index;

    this.data.AssetsData.splice(index, 1);
    this.setData({
      AssetsData: this.data.AssetsData,
    });
  },
  // 地址选择
  addressChange(e) {
    let arr = e.detail.value;
    this.setData({ address: arr.join("-") });
  },
  tosel() {
    this.setData({ showAddress: !this.data.showAddress });
  },
  toAssetssel() {
    this.setData({ showAssetsAddress: !this.data.showAssetsAddress });
  },
  // 校验
  verify() {
    const { avatar, name, phone, company } = this.data;
    if (!avatar) {
      wx.showToast({ title: "请上传头像", icon: "error" });
      return;
    }
    if (!name) {
      wx.showToast({ title: "请填写姓名", icon: "error" });
      return;
    }
    if (!phone) {
      wx.showToast({ title: "请填写手机号", icon: "error" });
      return;
    }
    if (!company) {
      wx.showToast({ title: "请填写公司名称", icon: "error" });
      return;
    }
    // 验证手机号格式
    const phoneRegex = /^[1][3-9][0-9]{9}$/;
    if (!phoneRegex.test(this.data.phone)) {
      wx.showToast({ title: "手机号格式不正确", icon: "error" });
      return;
    }
    return true;
  },
  // 清空数据
  clear() {
    wx.removeStorageSync("pId");
    this.setData({
      id: "",
      userId: "",
      avatar: "",
      name: "",
      backgroundId: "",
      backgroundName: "",
      phone: "",
      wxQrcode: "",
      position: [""],
      company: "",
      address: "",
      introduction: "",
      identity: "1",
      isEdit: 1, //1创建 2编辑
      RequirementData: [],
      AssetsData: [],
      cardPicture: [],
      merchant: [],
      isEditRequirement: false,
    });
  },
  // 收集数据
  dataReduction() {
    const RichEditor = this.selectComponent("#RichEditor");
    const RichData = RichEditor.getData();
    const {
      id,
      userId,
      isVip,
      avatar,
      name,
      wxQrcode,
      phone,
      company,
      address,
      position,
      introduction,
      identity,
      merchant,
      RequirementData,
      AssetsData,
      backgroundId,
      backgroundImg,
    } = this.data;
    const merchantData = [];
    merchant.forEach((item) => {
      merchantData.push({ merchantId: item.id });
    });
    const ReqData = RequirementData.map((item) => {
      return {
        title: item.title,
        type: item.type,
        industryId: item.industryId,
        city: item.city,
        classId: item.classId,
      };
    });
    const AData = AssetsData.map((item) => {
      return {
        title: item.title,
        type: item.type,
        industryId: item.industryId,
        city: item.city,
        classId: item.classId,
      };
    });
    const cardNeedResource = [...ReqData, ...AData];
    const pId = wx.getStorageSync("pId");
    console.log("pId", pId);
    const params = {
      pId: pId ? pId : "",
      id,
      userId,
      isVip,
      avatar,
      name,
      wxQrcode,
      phone,
      company,
      address,
      position,
      introduction,
      identity,
      backgroundId,
      backgroundImg,
      merchant: merchantData?.length > 0 ? JSON.stringify(merchantData) : [],
      cardNeedResource:
        cardNeedResource.length > 0 ? JSON.stringify(cardNeedResource) : [],
      cardPicture: RichData.length > 0 ? JSON.stringify(RichData) : [],
    };
    return params;
  },

  // 普通
  addCard() {
    var isValue = this.verify();
    if (isValue === true) {
      const params = this.dataReduction();
      console.log("params", params);
      params.backgroundImg = this.catchImg(params.backgroundImg);
      wx.showLoading({
        title: "",
      });
      if (this.data.isEdit === 2) {
        // 走编辑
        console.log("编辑params", params);
        app.request.post({
          url: "us/cardInfo/up",
          params,
          success: (res) => {
            wx.hideLoading();
            wx.showToast({ title: "编辑成功", icon: "success" });
            this.clear();
            const RichEditor = this.selectComponent("#RichEditor");
            RichEditor.clear();
            wx.navigateTo({
              url: "/pages/card/myCard/myCard",
            });
          },
        });
      } else {
        app.request.post({
          url: "us/cardInfo/add",
          params,
          success: (res) => {
            wx.hideLoading();
            wx.showToast({
              title: "创建成功",
              icon: "success",
              complete: () => {
                console.log("this.data.isShareId", this.data.isShareId);
                if (this.data.isShareId) {
                  setTimeout(() => {
                    wx.reLaunch({
                      url:
                        "/pages/card/cardView/cardView?isShare=1&id=" +
                        this.data.isShareId,
                    });
                  }, 600);
                } else {
                  setTimeout(() => {
                    wx.navigateTo({
                      url: "/pages/card/myCard/myCard",
                    });
                    wx.removeStorageSync("pId");
                  }, 500);
                }

                this.clear();
                const RichEditor = this.selectComponent("#RichEditor");
                RichEditor.clear();
              },
            });
          },
        });
      }
    } else {
      wx.showToast({ title: isValue, icon: "error" });
    }
  },

  // 预览
  preview() {
    const RichEditor = this.selectComponent("#RichEditor");
    const RichData = RichEditor.getData();
    this.setData({
      preViewCard: !this.data.preViewCard,
      cardPicture: RichData,
    });
  },
  onpVipChange(e) {
    const { picker, value, index } = e.detail;
    picker.setColumnValues(1, this.data.vipClassData[value[0]]);
  },
  transformToColumns(rawData) {
    let data = rawData.reduce((result, item) => {
      result[item.name] = item.children.map((child) => child.name);
      return result;
    }, {});
    this.setData({
      vipClassData: data,
    });
    console.log("data", data);
    const columns = [
      {
        values: Object.keys(data),
        className: "column1",
      },
      {
        values: data[Object.keys(data)[0]],
        className: "column2",
        defaultIndex: 1,
      },
    ];
    console.log("columns", columns);
    return columns;
  },

  getIndustryList() {
    app.request.post({
      url: "user/sysIndustry/public/list",
      success: (res) => {
        let columns = [];
        res.forEach((item) => {
          columns.push(item.name);
        });
        this.setData({
          columns: columns,
          industryArr: res,
        });
      },
    });
  },
  // 获取资源和需求分类列表
  async getClassList() {
    await this.getVipInfo();
    await app.request.post({
      url: "us/cardInfo/resourceClass",
      success: (res) => {
        console.log("res资源", res);
        if (res) {
          const vipColumns = this.transformToColumns(res);
          console.log("vipColumns", vipColumns);
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
          res.forEach((item) => {
            this.data.ClassColumns.push(item.name);
          });
          this.setData({
            ClassArr: modifiedRes,
            vipClassArr: res,
            vipColumns,
            ClassColumns: this.data.ClassColumns,
          });
          console.log("ClassArr", this.data.ClassArr);
          console.log("vipClassArr", this.data.vipClassArr);
        }
      },
    });
  },

  // ------------------------短信验证相关方法---------------------------
  getSms() {
    if (!/^1[3-9]\d{9}$/.test(this.data.shopPhone)) {
      wx.showToast({ title: "手机号格式错误", icon: "none" });
      return;
    }
    app.request.post({
      url: "sms/public/sendCodeMer",
      params: {
        phone: this.data.shopPhone,
      },
      success: (result, res) => {
        this.setData({ phoneSign: result });
        wx.showToast({ title: "短信发送成功" });
        var time = 60;
        this.setData({
          smsShow: false,
          getVerification: "60s后重新获取",
        });
        var Time = setInterval(() => {
          if (time == 1) {
            this.setData({
              smsShow: true,
            });
            time = 60;
            clearTimeout(Time);
          } else {
            time--;
            this.setData({
              getVerification: time + "s后重新获取",
            });
          }
        }, 1000);
      },
    });
  },
  getSign(e) {
    console.log(e);
    this.setData({
      phoneSign: e.detail,
    });
  },
  setPhone(e) {
    this.setData({
      shopPhone: e.detail,
    });
  },
  setVerifyCode(e) {
    this.setData({
      phoneSign: e.detail.value,
    });
  },
  setCode(e) {
    this.setData({
      phoneCode: e.detail.value,
    });
  },

  // 获取位置
  getSite() {
    this.getBanner();
    if (!wx.getStorageSync("latitude") || !wx.getStorageSync("cityName")) {
      wx.getSetting({
        success: (res) => {
          wx.getLocation({
            type: "gcj02", // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
            success: (res) => {
              console.log(res);
              wx.setStorageSync("latitude", res.latitude);
              wx.setStorageSync("longitude", res.longitude);
              this.setData({
                latitude: res.latitude,
                longitude: res.longitude,
              });
              res.longitude && this.getSiteStr();
            },
          });
          if (res.authSetting["scope.userLocation"] === false) {
            wx.authorize({
              scope: "scope.userLocationBackground",
              success: (res) => {
                console.log(res);
                this.onLoad();
              },
              complete: () => {},
            });
          }
        },
      });
    } else {
      let latitude =
        wx.getStorageSync("latitude_new") || wx.getStorageSync("latitude");
      let longitude =
        wx.getStorageSync("longitude_new") || wx.getStorageSync("latitude");
      this.setData({
        latitude: latitude,
        longitude: longitude,
      });
      longitude && this.getSiteStr();
    }
  },
});
