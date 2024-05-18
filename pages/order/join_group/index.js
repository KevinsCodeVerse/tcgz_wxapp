const app = getApp();
var wxst = "";
Page({
	data: {
		status: 1, // 拼团状态
		isCollect: -1, // 收藏状态
		id: "",
		type: 3,
	},
	//监听页面初次加载
	onLoad: function (options) {
		console.log(options);
		this.setData({
			id: options.teamid,
		});

		this.getDetail(options.teamid);
		// this.startConnect()
	},
	//监听页面显示
	onShow: function () {
		this.getDetail(this.data.id);
	},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	// 跳转 支付页
	goConfirm() {
		wx.navigateTo({
			url: "/pages/order/confirm/group/group?type=3&id=" + this.data.order.id + "&teamId=" + this.data.id,
		});
	},
	// 跳转普通商品 订单
	goDetail() {
		wx.navigateTo({
			url: "/pages/order/confirm/order/order?type=1&id=" + this.data.order.proId,
		});
	},
	// 跳转 商家详情
	goShopDetail() {
		wx.navigateTo({
			url: "/pages/shop/detail/detail?id=" + this.data.order.shopId,
		});
	},
	// 收藏
	toCollet() {
		let status = this.data.isCollect == 1 ? -1 : 1;
		app.request.post({
			url: "user/pro/favorites",
			params: {
				id: this.data.order.id,
				status,
				machine: app.globalData.model,
				type: this.data.type,
			},
			success: (res) => {
				wx.showToast({
					title: status == 1 ? "已收藏" : "取消收藏成功",
					icon: "none",
				});
				this.getDetail(this.data.id);
			},
		});
	},
	// 倒计时结束
	onFinish() {
		this.getDetail(this.data.id);
	},
	// 订单详情
	getDetail(teamId) {
		teamId = teamId ? teamId : 88900141981098;
		wx.showLoading({
			title: "加载中...",
		});
		app.request.post({
			url: "us/groupPro/groupDetails",
			params: {
				teamId,
			},
			success: (res) => {
				wx.hideLoading();
				wx.stopPullDownRefresh();

				// let goods = JSON.parse(res.userOrderPay.proInfo);
				// let arr = this.data.statusList.filter((i) => i.id == res.userOrderPay.status);
				// if (arr.length > 0) res.userOrderPay.textStatus = arr[0].name;
				// if (res.evaluation) res.evaluation.imgArr = res.evaluation.img ? res.evaluation.img.split(",") : [];
				this.setData({
					order: res.merchantGroupPro,
					shop: res.merchantShop,
					orderUser: res.orderUser,
					// evaluate: res.evaluation ? res.evaluation : {},
					status: res.status,
					peopleCount: res.peopleCount,
					users: res.users,
					userCount: res.userCount,
					isOrder: res.isOrder,
					isCollect: res.FavoriteStatus,
					time: res.time < 0 ? 0 : res.time,
				});
			},
		});
	},

	//创建连接
	startConnect: function () {
		//本地测试使用 ws协议 ,正式上线使用 wss 协议
		var url = "ws://192.168.0.249:8080/out_citywide_service/send/1";
		wxst = wx.connectSocket({
			url: url,
			method: "GET",
		});
		wxst.onOpen((res) => {
			console.info("连接打开成功");
		});
		wxst.onError((res) => {
			console.info("连接识别");
			console.error(res);
		});
		wxst.onMessage((res) => {
			var data = res.data;
			console.info(data);
		});
		wxst.onClose(() => {
			console.info("连接关闭");
		});
	},
	//发送内容
	sendOne: function () {
		if (wxst.readyState == wxst.OPEN) {
			wxst.send({
				data: "小程序端测试",
				success: () => {
					console.info("客户端发送成功");
				},
			});
		} else {
			console.error("连接已经关闭");
		}
	}, 
	//关闭连接
	closeOne: function () {
		wxst.close();
	},

	//监听页面初次加载完成
	onReady: function () {},
	//监听页面隐藏
	onHide: function () {}, 
	//监听页面卸载
	onUnload: function () {},
	//监听用户下拉动作
	onPullDownRefresh: function () {
		this.getDetail(this.data.id);
	},
	//用户上拉触底事件的处理函数
	onReachBottom: function () {},
	//用户点击右上角转发
	onShareAppMessage: function () {

		let teamId = this.data.id;
		return {
			title: `${this.data.order.title} 限时拼团! 现只需 ￥${this.data.order.price} 元`,
			path: `/pages/order/join_group/index?teamid=${teamId}&type=3`,
			imageUrl: app.common.imgUrl + this.data.order.avatar,
		};
	},
});
