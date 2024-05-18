// pages/card/vip/vip.js
const app = getApp();
Page({
  data: {
    flag: false,
    isVip: 0,
    day: null,
    vipPrice: null,
    show: false,
    showSociety: false,
    showCity: false,
    SocietyName: "",
    CityName: "",
    SocietyItems: [],
    CityItems: [],
    cityInfo: {},
    firmInfo: {},
    vipInfo: {},
  },

  onLoad(options) {
    this.getSocietyList();
    this.getCityList();
    this.getVipPrice();
    this.getVipInfo();
  },
  getVipInfo() {
    app.request.post({
      url: "user/vip/getInfo",
      success: (res) => {
        console.log("resvip", res);
        const nowTime = new Date().getTime();
        const maturityTime = res.vipInfo.maturityTime;
        const timeDifference = maturityTime - nowTime;
        const day = Math.floor(timeDifference / (24 * 60 * 60 * 1000));
        res.cityInfo.cityName = res.cityInfo.cityName.replace(/省/, "");
        this.setData({
          cityInfo: res.cityInfo,
          firmInfo: res.firmInfo,
          vipInfo: res.vipInfo,
          isVip: res.vipInfo.isVip,
          flag: res.vipInfo.isVip === 1 ? true : false,
          day,
        });
      },
    });
  },
  getSocietyList() {
    app.request.post({
      url: "user/firm/merchantFocusIn/list",
      success: (res) => {
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
        console.log("SocietyItems", this.data.SocietyItems);
      },
    });
  },
  getCityList() {
    app.request.post({
      url: "user/vip/agentInfoList",
      success: (res) => {
        let CityItems = res.map((item) => {
          item.cityName = item.cityName + "城市运营商";
          item.cityName = item.cityName.replace(/省/, "");
          return {
            checked: false,
            value: item.id,
            ...item,
          };
        });
        console.log("CityItems", CityItems);
        this.setData({
          CityItems,
        });
      },
    });
  },
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
  goSociety() {
    wx.navigateTo({
      url: "/pages/collective/find/find",
    });
  },
  openVip() {
    let SocietyItems = this.data.SocietyItems;
    let CityItems = this.data.CityItems;
    const cityInfo = this.data.cityInfo;
    const firmInfo = this.data.firmInfo?this.data.firmInfo:"";
    if (this.data.isVip === 1) {
      SocietyItems = SocietyItems.map((item) => {
        console.log("item", item);
        if (item.firmInfo.id === firmInfo.id) {
          item.checked = true;
          this.setData({
            SocietyName: item.firmInfo.name,
          });
        }
        return {
          ...item,
        };
      });
      CityItems = CityItems.map((item) => {
        if (item.id === cityInfo.id) {
          item.checked = true;
          this.setData({
            CityName: item.cityName,
          });
        }
        return {
          ...item,
        };
      });
    }
    console.log("datadata", this.data);
    this.setData({
      show: !this.data.show,
      CityItems,
      SocietyItems,
    });
  },
  onClose() {
    this.setData({
      show: !this.data.show,
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
  // 同意拒绝协议
  toAgree() {
    this.setData({ flag: !this.data.flag });
  },
  // 购买
  buyVip() {
    let isCity = false;
    let isSociety = false;
    const CityItems = this.data.CityItems;
    const SocietyItems = this.data.SocietyItems;
    let agentId="";
    let merId="";
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
              show: false,
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
});
