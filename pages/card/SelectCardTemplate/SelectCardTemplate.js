// pages/card/SelectCardTemplate/SelectCardTemplate.js
const utils = require("../.../../../../utils/common");
const app = getApp();
Page({
  data: {
    selected: null,
    name: "",
    job: "",
    phone: "",
    CompanyName: "",
    avatar: "",
    address: "",
    corporationList: [],
    Path: null,
    id: "",
    backgroundId: "",
    backgroundName: "",
    background: "",
    list: [],
  },
  onLoad(options) {
    this.getList(options);
  },
  getRoute(options) {
    const { backgroundId, currentPagePath, id } = options;
    this.setData({
      Path: decodeURIComponent(currentPagePath),
      id: id ? id : null,
      backgroundId: backgroundId ? backgroundId : null,
    });
    if (backgroundId) {
      this.data.list.forEach((item, index) => {
        if (backgroundId == item.id) {
          this.setData({
            selected: index,
            backgroundId,
            backgroundName: item.name,
            background: item.img,
            list: this.data.list,
          });
        }
      });
    } else {
      this.setData({
        selected: 0,
        background: this.data.list[0].img,
        backgroundId: this.data.list[0].id,
        backgroundName: this.data.list[0].name,
        list: this.data.list,
      });
    }
    // this.watchBackgroundUrl(this.data.background);
  },
  getList(options) {
    app.request.post({
      url: "us/cardInfo/backgrounds",
      success: (res) => {
        if (res) {
          res.forEach((item) => {
            item.img = utils.default.fullPath(item.img);
          });
          const data = res;
          this.setData({
            list: res,
          });
       
          this.getRoute(options);
        } else {
          wx.showToast({
            title: "暂无模版选择",
            icon: "none",
          });
        }
      },
    });
  },

  selectImage(e) {
    const index = e.currentTarget.dataset.index;
    const item = e.currentTarget.dataset.item;
    this.setData({
      selected: index,
      background: item.img,
      backgroundId: item.id,
      backgroundName: item.name,
    });
  },
  saveCardTemplate() {
    const { id, backgroundId, backgroundName, background } = this.data;
    console.log('id',id);
    console.log('backgroundId',backgroundId);
    if (id && backgroundId) {
      app.request.post({
        url: "us/cardInfo/setBackgrounds",
        params: {
          id,
          backgroundId,
        },
        success: (res) => {
          console.log('更改了');
          wx.navigateBack({
            delta: 1,
          });
          return
        },
      });
      return;
    } 
    let pageAData = wx.getStorageSync("pageAData");
    pageAData.backgroundId = backgroundId;
    pageAData.backgroundName = backgroundName;
    pageAData.backgroundImg = background;
    wx.setStorageSync("pageAData", pageAData);
    wx.navigateBack({
      delta: 1,
    });
    const url =
      "/" +
      this.data.Path +
      "?backgroundId=" +
      this.data.backgroundId +
      "&backgroundName=" +
      this.data.backgroundName +
      "&background=" +
      this.data.background;
    // wx.redirectTo({
    //   url,
    // });
  },
});
