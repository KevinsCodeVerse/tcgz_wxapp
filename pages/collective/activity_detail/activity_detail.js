const app = getApp();
import Notify from "./../../../miniprogram/miniprogram_npm/@vant/weapp/notify/notify";
Page({
  data: {
    id: "",
    active: 0,
    status: 1,
    activity: {},
    applyList: [],
    showShare: true,
    showApplp: false,
    maxPage: false,
    singlist: [],
    pageNo: 1,
    storeShow: false,
    recommendList: [],
    contentArr: [],
  },
  //监听页面初次加d
  onLoad: function (options) {
    let id;
    let activityType;
    console.log("options", options);
    if (options.id) {
      id = options.id;
      activityType = options.activityType;
    } else {
      const q = decodeURIComponent(options.q);
      console.log("q", q);
      const params = this.parseQueryString(q);
      console.log("params", params);
      id = params.id;
      activityType = params.activityType;
    }
    this.setData({
      id,
      activityType,
    });
    this.getDetail(id);
  },
  //监听页面显示
  onShow: function () {
    this.getDetail(this.data.id);
  },

  parseQueryString: function (url) {
    const params = {};
    const queryString = url.split("?")[1];

    if (queryString) {
      const pairs = queryString.split("&");

      pairs.forEach((pair) => {
        const [key, value] = pair.split("=");
        params[key] = value;
      });
    }

    return params;
  },
  onChange(e) {
    if (e.detail.index == 1 && this.data.activityType == 2) {
      this.setData({
        singlist: [],
        pageNo: 1,
        maxPage: false,
      });
      this.getSignList();
    }
  },
  openStore() {
    this.setData({
      storeShow: true,
    });
  },
  closeStore() {
    this.setData({
      storeShow: false,
    });
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  shareColse() {
    this.setData({ showShare: false });
  },
  // 导航
  toOpenNav() {
    let latitude = parseFloat(this.data.activity.latitude);
    let longitude = parseFloat(this.data.activity.longitude);
    let name = this.data.activity.name;
    let address = this.data.activity.address;
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      name: name,
      address: address,
      scale: 16,
    });
  },
  getDetail(activityId) {
    let url;
    let isGoods = false;

    this.data.activityType == 2
      ? (url = "user/article/public/activity/details")
      : (url = "user/firm/activity/details");
    app.request.post({
      url,
      params: {
        activityId,
      },
      success: (r) => {
        let res = r.firmActivity;
        let fwb = app.common.fwbData(res);
        console.log(fwb);
        this.setData({
          content: fwb.result,
          contentArr: fwb.isGoods ? fwb.contentArr2 : this.data.contentArr,
          recommendList: fwb.isGoods
            ? fwb.recommendList
            : this.data.recommendList,
        });
        console.log(this.data.recommendList);
        this.forPv(fwb.recommendList, fwb.contentArr2);

        // 处理 自定义表单
        let activity = res;
        if (this.data.activityType == 2) {
          if (activity.message) activity.message = JSON.parse(activity.message);
        }
        // if (activity.content) activity.content = activity.content.replace(/\<img/g, '<img style="max-width:100%;height:auto;display:block;" class="graphic"');

        this.setData({
          activity,
          applyList: r.firmActivityRegisterUser,
          status: r.status,
        });
      },
    });
  },
  forPv(arr, contentArr) {
    let url;
    let params = {};
    arr.forEach(async (item, index) => {
      if (item.type == "goods") {
        url = "user/pro/public/proDetails";
        params = {
          id: item.id,
          type: 1,
          noPv: 1,
        };
      } else if (item.type == "shop") {
        url = "user/pro/public/shopDetails";
        params = {
          shopId: item.id,
          noPv: 1,
        };
      } else {
        this.setData({
          recommendList: arr && arr,
          contentArr,
        });
        return;
      }
      await this.syncGet(url, params).then((res) => {
        if (item.type == "goods") {
          arr[index].pv = res.merchantPro.pv;
          arr[index].comment = res.merchantPro.evaluation;
          contentArr.forEach((cE) => {
            if (typeof cE != "string") {
              if (cE[0].id == res.merchantPro.id && cE[0].type != "shop") {
                cE[0].pv = res.merchantPro.pv;
                cE[0].comment = res.merchantPro.evaluation;
              }
            }
          });
        } else if (item.type == "shop") {
          arr[index].pv = res.merchantShop.pv;
        }
        this.setData({
          recommendList: arr && arr,
          contentArr,
        });
      });
    });
  },
  syncGet(url, params) {
    return new Promise((from, b) => {
      app.request.post({
        url,
        params,
        success: (res) => {
          from(res);
        },
        fail: () => {
          b();
        },
        error: (err) => {
          from({ merchantPro: {} });
        },
      });
    });
  },
  // 请求报名列表
  getSignList() {
    if (this.data.maxPage) return;
    app.request.post({
      url: "user/article/public/activity/signList",
      params: {
        activityId: this.data.id,
        pageSize: 10,
        pageNo: this.data.pageNo,
      },
      success: (res) => {
        console.log(res);

        if (res.list.length < 10) {
          this.setData({
            maxPage: true,
          });
        }
        res.list.forEach((item) => {
          if (item.info) item.info = JSON.parse(item.info);
        });
        this.setData({
          singlist: [...this.data.singlist, ...res.list],
        });
      },
      fail: (err) => {},
      finally: () => {},
    });
  },

  // 报名
  toApply() {
    app.request.post({
      url: "user/firm/signUp",
      params: {
        activityId: this.data.id,
      },
      success: (res) => {
        console.log(res);
        if (this.data.activity.isAmount == 1) {
          wx.requestPayment({
            nonceStr: res.nonceStr,
            package: res.packageValue,
            paySign: res.paySign,
            timeStamp: res.timeStamp,
            signType: res.signType,
            success: (result) => {
              wx.showToast({
                title: "支付成功",
                icon: "success",
                duration: 2000,
              });
              setTimeout(() => {
                this.getDetail(this.data.id);
              }, 1000);
            },
            fail: (res) => {
              // this.getDetail(this.data.id);
            },
          });
        } else {
          wx.showToast({
            title: "报名成功",
            success: (res) => {
              this.getDetail(this.data.id);
            },
          });
        }
      },
    });
  },
  //关闭 报名弹窗
  onClosePopup() {
    this.setData({
      showApplp: false,
    });
  },
  // 打开报名弹窗
  openApply() {
    this.setData({
      showApplp: true,
    });
  },
  // 提交报名
  submitApply(e) {
    if (this.data.activity.isAmount == 0 && !this.data.activity.message) {
      return this.payApply();
    }

    let valueArr = e.detail.value;
    let data = this.data.activity.message;
    let bool = false;
    data.forEach((item, index) => {
      if (item.isNull && !valueArr[item.label]) {
        bool = true;
        Notify({ type: "warning", message: item.placeholder, duration: 1200 });
        return;
      }
    });
    if (bool) return;
    data.forEach((item, index) => {
      for (const iterator in valueArr) {
        if (item.label == iterator) {
          item.value = valueArr[iterator];
        }
      }
    });
    this.setData({
      message: JSON.stringify(data),
    });

    this.payApply();
  },
  // 城市活动 报名接口
  payApply() {
    app.request.post({
      url: "user/article/citySignUp",
      params: {
        activityId: this.data.id,
        info: this.data.message || "",
      },
      success: (res) => {
        if (!this.data.activity.isAmount) {
          return wx.showToast({
            title: "报名成功",
            success: (res) => {
              this.getDetail(this.data.id);
              this.setData({
                showApplp: false,
              });
            },
          });
        }
        wx.requestPayment({
          nonceStr: res.nonceStr,
          package: res.packageValue,
          paySign: res.paySign,
          timeStamp: res.timeStamp,
          signType: res.signType,
          success: (result) => {
            wx.showToast({
              title: "支付成功",
              icon: "success",
              duration: 2000,
            });
            this.setData({
              showApplp: false,
            });
            setTimeout(() => {
              this.getDetail(this.data.id);
            }, 1000);
          },
          fail: (res) => {
            // this.getDetail(this.data.id);
          },
        });
        // wx.showToast({
        // 	title: "报名成功",
        // 	success: (res) => {
        // 		this.getDetail(this.data.id);
        // 	},
        // });
      },
    });
  },
  onScroll(event) {
    wx.createSelectorQuery()
      .select("#scroller")
      .boundingClientRect((res) => {
        this.setData({
          scrollTop: event.detail.scrollTop,
          offsetTop: res.top,
        });
      })
      .exec();
  },
  toStore(e) {
    let id = e.currentTarget.dataset.id;
    let item = e.currentTarget.dataset.item;
    let url = "";
    if (e.currentTarget.dataset.type == "shop") {
      url = "/pages/shop/detail/detail?type=1&id=" + id;
    } else if (e.currentTarget.dataset.type == "goods") {
      if (e.currentTarget.dataset.item.video) {
        url = "/pages/goods/g_video/index?type=1&id=" + id;
      } else {
        url = "/pages/goods/detail/detail?type=1&id=" + id;
      }
    } else if (e.currentTarget.dataset.type == "activity") {
      if (e.currentTarget.dataset.item.atype == 1)
        url = `/pages/collective/activity_detail2/activity_detail2?id=${id}&type=${1}&activityType=${
          item.activityType
        }`;
      if (e.currentTarget.dataset.item.atype == 0)
        url = `/pages/collective/activity_detail/activity_detail?id=${id}&type=${0}&activityType=${
          item.activityType
        }`;
    }
    wx.navigateTo({
      url: url,
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
  onReachBottom: function () {
    if (!this.data.maxPage) {
      this.setData({
        pageNo: this.data.pageNo + 1,
      });
      this.getSignList();
    }
  },
  //用户点击右上角转发
  onShareAppMessage: function () {
    let id = this.data.id; // 分享产品的Id
    return {
      imageUrl: app.common.fullPath(this.data.activity.cover),
      title: this.data.activity.name,
      path: `pages/collective/activity_detail/activity_detail?id=${id}&type=0&activityType=${this.data.activityType}`, // 分享后打开的页面
    };
  },
});
