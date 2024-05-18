const app = getApp();
Page({
	data: {
		info: {},
		orderCount: 0,
		shopCount: 0,
		amount: 0,
		account: "",
		show: false,
		order: {},
		useInfo: "",
		frozenMoney: 0,
		showTopUp: false,
	},
	//监听页面初次加载
	onLoad: function (options) {},
	//监听页面显示
	onShow: function () {
		wx.getStorage({
			key: "merchentToken",
			success: (res) => {
				this.getInfo();
			},
			fail: (res) => {
				console.log(res);
				wx.showModal({
					title: "检测到商家登录失效，是否前往登录？",
					confirmText: "商家登录",
					success: (res) => {
						console.log();
						if (res.confirm) {
							wx.navigateTo({
								url: "/pages/merchent/login/login",
							});
						} else {
							wx.navigateBack({
								delta: 1,
							});
						}
					},
				});
			},
		});
	},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	logout() {
		wx.removeStorageSync("merchentToken");
		wx.navigateTo({
			url: "/pages/merchent/login/login",
		});
	},
	//pay
	pay() {
		this.getInfo();
		this.setData({ showTopUp: false });
	},
	toWithdraw() {
		wx.navigateTo({
			url: "/pages/merchent/withdraw/withdraw/withdraw?type=1&money=" + this.data.amount,
		});
	},
	//绑定 user id
	bindUserId() {
		wx.requestSubscribeMessage({
			tmplIds: ["bi5zVrnVQ4rK-QJru_wx-USk7JN8dbprWXpusJHLDK0", "OWjpxMzGxW_l8OEWeVVREY46332xVkYlIT3vDCotHrE"],
			success(res) {
				app.request.post({
					url: "mt/info/bindUser",
					myType: 1,
					params: {
						userId: wx.getStorageSync("userId"),
					},
					success: (res) => {
						wx.showToast({
							title: "您的微信将会接收推送消息",
							icon: "none",
							duration: 2000,
						});
						setTimeout(() => {
							wx.showToast({
								title: "绑定成功",
							});
						}, 2000);
					},
					fail: (err) => {},
					finally: () => {},
				});
			},
		});
	},
	//
	toColse() {
		this.setData({ show: false });
	},
	onTopUpClose() {
		this.setData({ showTopUp: false });
	},
	onTopUpopen() {
		this.setData({ showTopUp: true });
	},
	onFlow() {
		wx.navigateTo({
			url: "/pages/merchent/withdraw/flow/flow",
		});
	},
	// 扫码
	toScan() {
		var that = this;
		wx.scanCode({
			onlyFromCamera: true, // 只允许从相机扫码
			success(res) {
				console.log("扫码成功：" + JSON.stringify(res));
				that.setData({ useInfo: res.result });
				let resu = JSON.parse(res.result);
				// 扫码成功后  在此处理接下来的逻辑
				that.setData({
					resu,
				});
				app.request.post({
					url: "mt/order/detail",
					myType: 1,
					params: {
						id: resu.orderId,
						type: resu.type,
					},
					success: (result) => {
						that.setData({ show: true });
						if (resu.type == 1) {
							result.order.proInfo = JSON.parse(result.order.proInfo);
						} else if (resu.type == 9) {
						}
						that.setData({
							order: result.order,
						});
					},
				});
			},
		});
	},
	// 核销
	toUse(res) {
		app.request.post({
			url: "mt/order/use",
			myType: 1,
			params: {
				params: this.data.useInfo,
			},
			success: (result) => {
				this.setData({ show: false });
				wx.showToast({
					title: "核销成功",
				});
			},
		});
	},

	// 获取商家信息
	getInfo() {
		app.request.post({
			url: "mt/info/info",
			myType: 1,
			success: (res) => {
				this.setData({
					info: res.name,
					orderCount: res.orderCount,
					shopCount: res.shopCount,
					account: res.account,
					amount: res.amount,
					frozenMoney: res.frozenMoney,
				});
			},
			error: (res) => {
				this.setData({
					info: { name: "商家已被冻结，请请联系管理员解冻" },
				});
				console.log(res.data.result);
			},
		});
	},
	// 跳转 应用服务市场
	handUse() {
		wx.navigateTo({
			url: "/pages/merchent/use/use",
		});
	},
	// 跳转 推广服务
	handAdvertising() {
		wx.navigateTo({
			url: "/pages/merchent/advertising/advertising",
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
