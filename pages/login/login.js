const app = getApp();
const rsa = require("../../utils/encryption");

Page({
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前

  data: {
    background: "/img/common/login_bg.png",
    userInfo: {},
    parentId: "",
    phone: "",
    agentId: "",
    type: "",
    id: "",
    showVideo: 0,
    isShare: "",
    redirectUrl: "",
  },
  //监听页面初次加载
  onLoad: function (options) {
    console.log("登录options", options);
    const redirectUrl = wx.getStorageSync("redirectUrl");
    if (redirectUrl.includes("isShare")) {
      this.setData({
        redirectUrl,
      });
    }
    this.getAdList(); // 判断是否隐藏取消按钮
    let base64 = wx
      .getFileSystemManager()
      .readFileSync(this.data.background, "base64");
    this.setData({
      background: "data:image/jpg;base64," + base64,
    });

    if (options.scene) {
      let scene = decodeURIComponent(options.scene);
      scene = scene.split(",");
      console.log(scene);
      options.agentId = scene[0];
      options.id = scene[1];
      options.type = scene[2];
      options.scene = "";
    }
    this.setData({
      phone: options.phone ? options.phone : "",
      parentId: options.scene ? options.scene : "",
      agentId: options.agentId || "",
      id: options.id || "",
      type: options.type || "",
    });
    this.data.parentId && wx.setStorageSync("parentId", this.data.parentId);
    options.agentId && wx.setStorageSync("agentIdoptions", options);
    console.log(options);

    this.getUserInfo();

    // wx.redirectTo({
    //   url: `/pages/goods/detail/detail?&id=${this.data.id}&type=1`,
    // })
  },
  //监听页面显示
  onShow: function () {},
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前

  getAdList() {
    app.request.post({
      url: "user/pro/public/adList",
      success: (res) => {
        this.setData({
          showVideo: res,
        });
      },
    });
  },

  // 判断是否新用户
  isNew() {
    let agentIdoptions = wx.getStorageSync("agentIdoptions") || {};
    let parentIds = wx.getStorageSync("parentId") || "";
    parentIds && this.binding(parentIds);
    agentIdoptions.agentId && this.binding(agentIdoptions.agentId);
  },

  // 获取信息系
  getUserInfo(e) {
    console.log("e", e);
    wx.login({
      success: (res) => {
        if (res.code) {
          // 拿到code, 请求给后台
          // wx.showLoading({
          // 	title: "微信授权登录中...",
          // 	mask: true,
          // });
          app.request.post({
            url: "wx/ma/user/public/login",
            params: {
              code: res.code,
              phone: this.data.phone,
            },
            success: (result) => {
              wx.setStorageSync("login", result);
              wx.setStorageSync("token", result.token);
              this.setData({
                encryption: result.encryption,
              });
              this.isNew();
            },
            allError: (err) => {
              console.log(err);
            },
            fail: (err) => {
              wx.hideLoading();
              wx.showToast({
                title: "授权失败",
                icon: "none",
              });
            },
          });
        } else {
          wx.hideLoading();
          wx.showToast({
            title: "授权失败",
            icon: "none",
          });
        }
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showToast({
          title: "授权失败",
          icon: "none",
        });
      },
    });
  },

  getUserProfile() {
    let agentIdoptions = wx.getStorageSync("agentIdoptions") || {};
    let parentIds = wx.getStorageSync("parentId") || "";
    this.setData({
      parentId: parentIds || "",
      agentId: agentIdoptions.agentId || "",
      type: agentIdoptions.type || "",
      id: agentIdoptions.id || "",
    });

    wx.getUserProfile({
      desc: "用于完善会员资料", // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.setData({
          encryptedData: res.encryptedData,
        });

        let login = wx.getStorageSync("login") || "";
        console.log('getUserProfileres',res);
        app.request.post({
          url: "wx/ma/user/info",
          params: {
            encryptedData: res.encryptedData,
            encryption: this.data.encryption || login.encryption,
            iv: res.iv,
            rawData: res.rawData,
            signature: res.signature,
            parentId: this.data.parentId || agentIdoptions.agentId || "",
            // userid:"",
          },
          success: (resul) => {
            wx.showToast({
              title: "授权成功",
              icon: "success",
              duration: 1500,
            });
            this.setData({
              loading: false,
            });
            wx.setStorageSync("phone", resul.mobile);
            parentIds && this.binding(parentIds);
            agentIdoptions.agentId && this.binding(agentIdoptions.agentId);
            // 获取用户信息
            this.getInfo(); //用户信息
            this.getAddressList(); // 定位信息
            console.log("agentIdoptions", agentIdoptions);
            if (agentIdoptions.agentId && agentIdoptions.id) {
              wx.navigateBack({
                delta: 2,
              });
            } else if (agentIdoptions.agentId) {
              wx.switchTab({
                url: "/pages/focus/focus",
              });
              wx.removeStorageSync("parentId");
            } else if (this.data.redirectUrl) {
              setTimeout(() => {
                wx.reLaunch({
                  url: this.data.redirectUrl,
                });
              }, 500);
            }

            wx.navigateBack({
              delta: 2,
              fail: () => {
                wx.switchTab({
                  url: "/pages/focus/focus",
                });
              },
            });
          },
          allError: (err) => {
            console.log(err);
          },
        });
      },
      allError: (err) => {
        console.log(err);
      },
    });
  },

  // 模拟登录
  toLogin() {
    app.request.post({
      url: "user/info/public/authority",
      params: {
        account: rsa.cryptStr("15797735521"),
        password: rsa.cryptStr("123456"),
      },
      success: (res) => {
        console.log(res.token);
        wx.setStorageSync("token", res.token);
      },
    });
  },
  goCancel() {
    wx.navigateBack({
      delta: 1,
    });
  },
  // 绑定上级
  binding(agentId) {
    app.request.post({
      url: "user/invite/binding",
      params: {
        agentId,
      },
      success: () => {
        console.log("绑定成功!" + agentId);
      },
    });
  },
  // 个人信息
  getInfo() {
    app.request.post({
      url: "user/info/totalAssets",
      success: (res) => {
        this.setData({
          info: res,
        });
        wx.setStorageSync("userId", res.id);
      },
    });
  },
  // 获取列表
  getAddressList() {
    app.request.post({
      url: "user/info/addressList",
      success: (res) => {
        wx.setStorageSync(
          "shippingAddress",
          res.filter((item) => item.isDefault)[0]
        );
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
});
