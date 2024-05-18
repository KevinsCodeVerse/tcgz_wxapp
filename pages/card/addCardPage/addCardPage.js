// pages/card/addCardPage/addCardPage.js
const app = getApp();
Page({
  data: {
    background: "",
    textbgc: "",
  },

  onLoad(options) {
    this.watchBackgroundUrl(this.data.background);
    this.watchBackgroundUrl(this.data.textbgc);
  },

  watchBackgroundUrl: function (newUrl) {
    if (newUrl) {
      let base64 = wx.getFileSystemManager().readFileSync(newUrl, "base64");
      this.setData({
        background: "data:image/jpg;base64," + base64,
        textbgc: "data:image/jpg;base64," + base64,
      });
    }
  },

  addCard() {
    wx.navigateTo({
      url: "/pages/card/addCard/addCard",
    });
  },
});
