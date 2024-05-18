import common from "./common.js";

// post 请求
const post = (options) => {
  if (!options.header) options.header = {};
  // 设置请求头
  options.header["Content-Type"] = "application/x-www-form-urlencoded";
  // 获取登录权限
  let token = options.myType == 1 ? "merchentToken" : "token";
  wx.getStorage({
    key: token,
    success: (res) => {
      options.header.Authorization = res.data;
      startPost(options);
    },
    fail: (res) => {
      startPost(options);
    },
  });
};

// 开始post请求
const startPost = (options) => {
  let id;
  if (options.params && options.params.id) {
    id = options.params.id;
  }
  // console.log(common.baseUrl + options.url)
  wx.request({
    url: common.baseUrl + options.url,
    header: options.header,
    method: "POST",
    responseType: options.responseType,
    data: options.params,
    success: (res) => {
      try {
        if (res.statusCode == 200) {
          // 请求成功后根据返回的状态信息进行不同的回调
          if (res.data.message == "success") {
            // 成功 success
            if (options.success) options.success(res.data.result, res);
          } else if (res.data.message == "error") {
            // 失败 error
            setTimeout(() => {
              wx.showToast({
                title: res.data.result,
                icon: "none",
                duration: 2000,
              });
            }, 200);

            if (options.error) options.error(res);
            if (options.allError) options.allError(res);
          } else if (res.data.message == "warning") {
            // 警告 warning
            if (options.warning) options.warning(res);
          } else if (res.data.message == "info") {
            // 信息 info
            if (options.info) options.info(res);
          }
          if (options.requestSuccess) options.requestSuccess(res.data, res);
        } else {
          switch (res.statusCode) {
            case 404:
              wx.showToast({
                title: "请求错误",
                icon: "none",
                duration: 2000,
              });
              break;
            case 401:
              // 清除token
              let token = options.myType == 1 ? "merchentToken" : "token";
              let myurl =
                options.myType == 1
                  ? "/pages/merchent/login/login"
                  : "/pages/login/login";
              if (id) {
                const cardViewUrl = `/pages/card/cardView/cardView?id=${id}&isShare=1`;
                wx.setStorageSync("redirectUrl", cardViewUrl);
              }
              wx.removeStorage({
                key: token,
                success: function (res) {
                  navtolog(myurl);
                },
              });
              break;
            case 403:
              wx.showToast({
                title: "无权访问",
                icon: "none",
                duration: 2000,
              });
              break;
            case 500:
              wx.showToast({
                title: "很抱歉, 发生了点错误",
                icon: "none",
                duration: 2000,
              });
              break;
            case 504:
              wx.showToast({
                title: "无法连接到服务器",
                icon: "none",
                duration: 2000,
              });
              break;
            default:
              console.log("错误: " + res.statusCode);
              break;
          }
          if (options.requestError) options.requestError(res);
          if (options.allError) options.allError(res);
        }
      } catch (e) {
        console.log(e);
        if (options.allError) options.allError(res);
      } finally {
        if (options.finally) options.finally();
      }
    },
    fail: (res) => {
      //错误
      try {
        switch (res.errMsg) {
          case "request:fail timeout":
            wx.showToast({
              title: "请求超时",
              icon: "none",
              duration: 2000,
            });
            break;
          case "request:fail ":
            wx.showToast({
              title: "连接超时",
              icon: "none",
              duration: 2000,
            });
            break;
        }
        console.log("errMsg", res.errMsg);
        if (options.allError) options.allError();
      } catch (e) {
        if (options.allError) options.allError();
      } finally {
        if (options.finally) options.finally();
      }
    },
  });
};

const getLoginCode = () => {
  // 发起微信授权登录
  getUserInfo((userInfo) => {
    wx.login({
      success: (res) => {
        if (res.code) {
          // 拿到code, 请求给后台
          wx.showLoading({
            title: "微信授权登录中...",
            mask: true,
          });
          login(res.code, userInfo);
        }
      },
      fail: function (res) {
        wx.hideLoading();
      },
    });
  });
  // wx.showModal({
  //   title: '登录',
  //   content: '您还未登录, 是否使用当前微信进行授权登录',
  //   success: function (sm) {
  //     if (sm.confirm) {

  //     } else if (sm.cancel) {
  //       // 取消
  //     }
  //   },
  //   fail: (res)=>{

  //     wx.hideLoading()
  //   }
  // })
};

// 用户登录
const login = (code, userInfo) => {
  post({
    url: "wechat/autho/get",
    params: {
      code,
      nickName: userInfo.nickName,
      avatarUrl: userInfo.avatarUrl,
    },
    success: (result) => {
      wx.setStorage({
        key: "token",
        data: result.token,
        success: (res) => {
          console.log(res);
          wx.showToast({
            title: "登录成功",
            icon: "success",
            duration: 1500,
          });
          // 重新加载当前页面的onLoad方法
          console.log("getCurrentPages", getCurrentPages());
          const pages = getCurrentPages()[getCurrentPages().length - 1];
          console.log("pages", pages);
          pages.onLoad();
          pages.onShow();
        },
      });
    },
    allError: () => {
      wx.hideLoading();
    },
  });
};

// 获取用户信息
const getUserInfo = (callback) => {
  wx.showLoading({
    title: "微信授权登录中...",
    mask: true,
  });
  wx.getUserInfo({
    success: (res) => {
      callback(res.userInfo);
    },
    fail: (res) => {
      wx.hideLoading();
      wx.navigateTo({
        //目的页面地址
        url: "/pages/login/login",
        success: function (res) {},
      });
    },
  });
};

// get 请求
const get = (options) => {
  wx.request({
    url: common.baseUrl + options.url,
    data: options.data,
    method: "GET",
    header: options.header, // 设置请求的 header
    responseType: options.responseType,
    success: function (res) {
      // success
      if (res.statusCode == 200) {
        if (options.success) options.success(res.data, res);
      } else {
        console.log(options.data);
      }
    },
    fail: function (res) {
      console.log(res);
    },
  });
};
let isnavtolog = true;
function navtolog(myurl) {
  if (isnavtolog) {
    console.log("myurl", myurl);
    wx.navigateTo({
      url: myurl,
    });
    isnavtolog = false;
  }
  setTimeout(() => {
    isnavtolog = true;
  }, 500);
}

export default {
  post,
  get,
};
