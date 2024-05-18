const app = getApp();
Page({
	data: {
		active: "",
		status: -1,
		pageNo: 0,
		pageSize: 10,
		loading: false,
		finish: false,
		list: [],
		nowTime: Date.now(),
		QR: "",
		showQR: false,
	},
	//监听页面初次加载
	onLoad: function (options) {
		this.getList();
	},
	//监听页面显示
	onShow: function () {},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	toTabs(e) {
		this.setData({
			active: e.currentTarget.dataset.status,
			pageNo: 0,
			loading: false,
			finish: false,
			list: [],
		});
		this.getList();
	},
	getList() {
		if (this.data.finish || this.data.loading) return;
		this.setData({
			loading: true,
			pageNo: this.data.pageNo + 1,
		});
		app.request.post({
			url: "user/coupon/userList",
			params: {
				isShop: this.data.active,
				pageNo: this.data.pageNo,
				pageSize: this.data.pageSize,
			},
			success: (res) => {
				console.log(res);
				if (this.data.pageNo > 1) {
					this.setData({
						list: [...this.data.list, ...res.list],
					});
				} else {
					this.setData({
						list: res.list,
					});
				}

				if (res.list.length < this.data.pageSize) {
					this.setData({
						finish: true,
					});
				}
			},
			fail: (err) => {},
			finally: () => {
				this.setData({
					loading: false,
				});
			},
		});
	},
	// 去使用
	goGoods(e) {
		wx.navigateTo({
			url: "/pages/shop/detail/detail?id=" + e.currentTarget.dataset.id,
		});
	},
	// 显示二维码
	QR_open(obj) {
		this.setData({
			QR: obj.currentTarget.dataset.obj.qrCode,
			showQR: true,
		});
	},
	onClose() {
		this.setData({
			showQR: false,
		});
		this.setData({
			active: this.data.active,
			pageNo: 0,
			loading: false,
			finish: false,
			list: [],
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
	onPullDownRefresh: function () {},
	//监听用户下拉动作
	onPullDownRefresh: function () {},
	//用户上拉触底事件的处理函数
	onReachBottom: function () {
		this.getList();
	},
	//用户点击右上角转发
	onshareAppMessage: function () {},
});
