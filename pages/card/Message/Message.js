const app = getApp();
Page({
  data: {
    pageNo: 0,
    pageSize: 1000,
    total: 0,
    keywords: "",
    list: [],
    finish: false,
    loading: false,
  },

  onLoad(options) {
    this.getList();
  },
  getList() {
    if(this.data.loading || this.data.finish) {
      return;
    }
    this.setData({
      loading: true,
      pageNo: this.data.pageNo + 1
    })
    const { keywords, pageNo, pageSize } = this.data;
    app.request.post({
      url: "us/cardInfo/pairListNew",
      params: {
        keywords,
        pageNo,
        pageSize,
      },
      success: (res) => {
        this.setData({
          list: res.list.length > 0 ? res.list : [],
          loading: false,
          finish: true
        });
      },
    });
  },
  changeValue(e) {
    const keywords = e.detail;
    this.setData({
      pageNo: 0,
      loading: false,
      finish: false,
      list: [],
      keywords,
    });
    // 清除之前的定时器
    if (this.timer) {
      clearTimeout(this.timer);
    }
    // 设置新的定时器，延迟一定时间后执行搜索
    this.timer = setTimeout(() => {
      this.getList();
    }, 800); 
  },
  clearKeyword() {
    this.setData({
      keywords: "",
    });
  },
    //用户上拉触底事件的处理函数
    onReachBottom: function () {
      this.getList()
    },
});
