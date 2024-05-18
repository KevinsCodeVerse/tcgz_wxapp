const app = getApp();
Page({
	data: {
    list: [],
    active:1,
		pageNo: 0,
		pageSize: 20,
		finish: false,
		loading: false,
		url: "user/bankCard/withdrawList",
	},
	//监听页面初次加载
	onLoad: function (options) {
		this.getList();
	},
	//监听页面显示
	onShow: function () {},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	getList() {
		if (this.data.loading || this.data.finish) {
			return;
		}
		this.setData({
			loading: true,
			pageNo: this.data.pageNo + 1,
		});
		app.request.post({
			url: this.data.url,
			params: {
				pageNo: this.data.pageNo,
				pageSize: this.data.pageSize,
			},
			success: (result) => {
				var list = this.data.list;
				list = list.concat(result.list);
				this.setData({
					list: list,
					loading: false,
				});
				if (result.list.length < this.data.pageSize) {
					this.setData({
						finish: true,
					});
				}
			},
		});
	},
	// tab change
	tabChange(e) {
		let url;
		if (e.detail == 1) {
			url = "user/bankCard/withdrawList";
		} else {
			url = "user/bankCard/frozenList";
		}
		this.setData({
			url,
      list: [],
      active:e.detail,
			pageNo: 0,
			finish: false,
			loading: false,
		});
		this.getList();
	},

	//监听页面初次加载完成
	onReady: function () {},
	//监听页面隐藏
	onHide: function () {},
	//监听页面卸载
	onUnload: function () {},
	//监听用户下拉动作
	onPullDownRefresh: function () {

    
  },
	//用户上拉触底事件的处理函数
	onReachBottom: function () {
    this.getList();

	},
	//用户点击右上角转发
	onshareAppMessage: function () {},
});
