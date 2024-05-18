// pages/index/index.js
// import * as echarts from '../../components/ec-canvas/echarts';
// npm install --save echarts-for-weixin
const app = getApp();

Page({
  data: {
    list: [],
    pageNo: 0,
    pageSize: 1000,
    pages: 1,
    total: 0,
    keywords: "",
    finish: false,
    loading: false,
    activeTab: 0,
    ec: {
      lazyLoad: true,
    },
    chartData: {},
  },

  onLoad: function () {
    this.getList();
  },

  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      activeTab: Number(index),
    });
    if (this.data.activeTab == 0) {
      this.getList();
    } else {
      this.getStar();
    }
  },
  getList() {
    if (this.data.loading || this.data.finish) {
      return;
    }
    this.setData({
      loading: true,
      pageNo: this.data.pageNo + 1,
    });
    const { keywords, pageNo, pageSize } = this.data;
    // /us/cardInfo/focusOnList
    app.request.post({
      url: "us/cardInfo/connectionsList",
      params: {
        keywords,
        pageNo,
        pageSize,
      },
      success: (res) => {
        this.setData({
          list: res.list.length > 0 ? res.list : [],
          loading: false,
          finish: true,
        });
      },
    });
  },
  getStar() {
    if (this.data.loading || this.data.finish) {
      return;
    }
    this.setData({
      loading: true,
      pageNo: this.data.pageNo + 1,
    });
    const { keywords, pageNo, pageSize } = this.data;
    app.request.post({
      url: "us/cardInfo/focusOnList",
      params: {
        keywords,
        pageNo,
        pageSize,
      },
      success: (res) => {
        this.setData({
          list: res.list.length > 0 ? res.list : [],
          loading: false,
          finish: true,
        });
      },
    });
  },
  goCardView(e) {
    const item = e.currentTarget.dataset.item;

    if (item.id) {
      wx.navigateTo({
        url: "/pages/card/cardView/cardView?id=" + item.id,
      });
    }
  },
  changeValue(e) {
    const keyWord = e.detail;
    this.setData({
      pageNo: 0,
      loading: false,
      finish: false,
      list: [],
      keyWord,
    });
    // 清除之前的定时器
    if (this.timer) {
      clearTimeout(this.timer);
    }
    // 设置新的定时器，延迟一定时间后执行搜索
    this.timer = setTimeout(() => {
      this.getList();
    }, 500); // 设置延迟时间，单位为毫秒（这里设置为500毫秒）
  },
  clearKeyword() {
    this.setData({
      keywords: "",
    });
    if (this.data.activeTab === 0) {
      this.getList();
    } else {
      this.getStar();
    }
  },
  //用户上拉触底事件的处理函数
  onReachBottom: function () {
    console.log(123213);
    this.getList();
  },
});
