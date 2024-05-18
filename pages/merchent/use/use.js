const app = getApp();
Page({
	data: {
		categoryList: [
			{
				id: 1,
				name: "应用市场",
			},
			{
				id: 2,
				name: "我的应用",
			},
		],
		searchValue: "",
		active: 1,
		list: [],
		list2: [],
		categoryId: "",
	},
	//监听页面初次加载
	onLoad: function (options) {},
	//监听页面显示
	onShow: function () {
		this.getlist();
		this.getlist2();
	},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	// 应用详情
	toDetail(e) {
		console.log(e);
		wx.navigateTo({
			url: `/pages/merchent/use/useDetail/useDetail?id=${e.currentTarget.dataset.id}&type=${this.data.active}`,
		});
		setTimeout(() => {
			wx.event.emit("useDetail", e.currentTarget.dataset.info);
		}, 500);
	},
	// tab切换后
	tabChange(e) {
		this.setData({
			active: e.detail.name,
		});
	},
	// 获取商品数据
	getlist() {
		app.request.post({
			url: "mt/app/list",
			myType: 1,
			params: {
				type: 1,
			},
			success: (res) => {
				console.log(res);
				this.setData({
					list: res,
				});
			},
			fail: (err) => {},
			finally: () => {},
		});
	},
	// 获取商品数据
	getlist2() {
		app.request.post({
			url: "mt/app/myAppList",
			myType: 1,

			success: (res) => {
				this.setData({
					list2: res,
				});
			},
		});
	},
	wechatPay(e) {
		let userId = wx.getStorageSync("userId");
		let info = e.currentTarget.dataset.info;
		if (info.status == 1 && this.data.active == 1) {
			return;
		}
		app.request.post({
			url: "mt/app/maOpen",
			params: {
				appId: info.id,
				userId,
			},
			myType: 1,
			success: (res) => {
				var that = this;
				if (!info.amount) {
					wx.showToast({
						title: "续费成功!",
						icon: "success",
						duration: 2000,
					});
				}
				wx.requestPayment({
					timeStamp: res.timeStamp,
					nonceStr: res.nonceStr,
					package: res.packageValue,
					signType: "MD5",
					paySign: res.paySign,
					success: (result) => {
						wx.showToast({
							title: "支付成功",
							icon: "success",
							duration: 2000,
						});

						setTimeout(() => {
							this.getlist();
							this.getlist2();
						}, 1000);
					},
					fail: (res) => {
						this.getlist();
						this.getlist2();
					},
				});
			},
			// finally:(res) =>{
			//     this.getlist();
			//     this.getlist2();
			// }
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
	onshareAppMessage() {},
});
