const utils = require("../../utils/common");
const app = getApp();
Page({
  data: {
    info: {},
    pass: false,
    nick: "",
    show: false,
    userCards: null,
    showReferrer: false,
    invite: {},
    avatarUrl: "",
    showEdit: false,
    showInfo: false,
  },
  //监听页面初次加载
  onLoad: function (options) {
  
  },
  //监听页面显示
  onShow: function () {
    this.getInfo();
    this.getDefalutList();
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  getDefalutList() {
    app.request.post({
      url: "us/cardInfo/getUserInfo",
      success: (res) => {
        console.log("userCards", res.userCards);
        this.setData({
          userCards: res.userCards,
        });
      },
    });
  },
  goShop() {
    wx.navigateTo({
      url: "/pages/my/shop/shop",
    });
  },
  goIndex() {
    wx.switchTab({
      url: "/pages/attention/attention",
    });
  },
  toReferrer() {
    app.request.post({
      url: "user/info/referees",
      params: {
        code: this.data.code,
      },
      success: (res) => {
        this.setData({
          invite: res,
        });
      },
    });
    this.setData({ showReferrer: !this.data.showReferrer });
  },
  toNo() {
    wx.showToast({
      title: "敬请期待",
      icon: "none",
    });
  },
  toCard(e) {
    console.log("是否有名片", this.data.userCards);
    let url;
    const userCards = this.data.userCards;
    if (userCards == null) {
      wx.showToast({
        title: "加载中...",
        icon:'error'
      });
      return;
    }
  
    if (userCards === 1) {
      url = "/pages/card/myCard/myCard";
      wx.navigateTo({
        url,
      });
    } else if (userCards === 0) {
      url = "/pages/card/addCardPage/addCardPage";
      wx.navigateTo({
        url,
      });
    }
   

  },
  href(e) {
    let url = e.currentTarget.dataset.url;
    if (url == -1) {
      wx.showToast({
        title: "敬请期待",
        icon: "none",
      });
    } else {
      wx.navigateTo({
        url: e.currentTarget.dataset.url,
      });
    }
  },
  copyCode() {
    wx.setClipboardData({
      data: this.data.info.inviterCode,
      success: () => {
        wx.showToast({
          title: "复制成功",
        });
      },
    });
  },
  // 打开邀请码弹窗
  openDialog(e) {
    this.setData({
      show: true,
    });
  },
  // 输入邀请码
  codeChange(e) {
    console.log(e);
    this.setData({
      code: e.detail.value,
    });
  },
  bindCode() {
    app.request.post({
      url: "user/info/bind",
      params: {
        code: this.data.code,
      },
      success: (res) => {
        wx.showToast({
          title: "绑定成功",
        });
        this.getInfo();
      },
    });
  },
  // 个人信息
  getInfo() {
    app.request.post({
      url: "user/info/totalAssets",
      success: (res) => {
        console.log("getInfo", res);
        const isLocalPath = res.avatar?.includes("default_avatar.jfif");
        const isNick =
          res.nick?.startsWith("用户") || res.nick?.startsWith("微信用户");
        console.log("isLocalPath", isLocalPath);
        console.log("isNick", isNick);
        if (isNick || isLocalPath) {
          this.showInfo();
        }

        this.setData({
          info: res,
          nick: res.nick,
          avatarUrl: res.avatar,
        });
        wx.setStorageSync("userId", res.id);
        // console.log(info);
      },
    });
  },
  showInfo() {
    this.setData({
      showInfo: !this.data.showInfo,
    });
  },
  // 修改个人信息
  showEditInfo() {
    this.setData({
      showEdit: !this.data.showEdit,
    });
  },
  onChooseAvatar(e) {
    console.log("e", e);
    const { avatarUrl } = e.detail;
    this.setData({
      avatarUrl,
      "info.avatar": this.data.avatarUrl ? "" : this.data.avatar,
    });
  },
  getUserProfile() {
    const { avatarUrl, nick } = this.data;
    if (!nick || nick.startsWith("微信用户") || nick.startsWith("用户")) {
      wx.showToast({
        title: "请修改默认昵称",
      });
      return;
    }
    if (!avatarUrl) {
      wx.showToast({
        title: "请选择头像",
      });
      return;
    }
    console.log("avatarUrl", avatarUrl);
    const isLocalPath = avatarUrl.includes("files");
    let base64;
    if (!isLocalPath) {
      base64 = wx.getFileSystemManager().readFileSync(avatarUrl, "base64");
      base64 = "data:image/jpeg;base64," + base64;
    }
    const id = wx.getStorageSync("userId");
    app.request.post({
      url: "wx/ma/user/update",
      params: {
        id,
        nick,
        img: isLocalPath ? avatarUrl : base64,
      },
      success: (res) => {
        wx.showToast({
          title: "修改成功",
          icon: "success",
          duration: 1500,
        });
        this.showEditInfo();
        this.getInfo();
      },
    });
  },
  // 开发时
  exploit() {
    let arr = [];
    console.log(wx.getStorageInfoSync());
    wx.getStorageInfoSync().keys.forEach((element) => {
      arr.push(wx.getStorageSync(element));
    });
    wx.setClipboardData({
      data: JSON.stringify(arr),
      success: (res) => {
        wx.showToast({
          title: "复制成功请将复制内容发给开发者",
          icon: "none",
        });
      },
    });
  },

  //监听页面初次加载完成
  onReady: function () {},
  //监听页面隐藏
  onHide: function () {
    this.setData({
      showEdit: false,
      showInfo: false,
    });
  },
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
});
