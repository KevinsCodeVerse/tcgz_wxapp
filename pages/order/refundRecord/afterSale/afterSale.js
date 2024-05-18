const app = getApp();
import Dialog from "../../../../miniprogram/miniprogram_npm/@vant/weapp/dialog/dialog";

Page({
	data: {
		id: "",
		type: 1,
		status: -11,
		active: 0,
		time: 1000,
		isLogShow: false, // is物流弹窗
		logisticsTitle: "", // ;物流公司
		logisticsNum: "", // ;物流订单号
		steps2: [
			{
				desc: "提交申请",
			},
			{
				desc: "商家处理",
			},
			{
				desc: "寄回商品",
			},
			{
				desc: "退款成功",
			},
		],
		steps1: [
			{
				desc: "提交申请",
			},
			{
				desc: "商家处理",
			},
			{
				desc: "退款成功",
			},
		],
		order: {},
		shop: {},
		goods: {},
		evaluate: {},
		timedown: 0,
		statusList: [
			{ name: "待支付", id: 0 },
			{ name: "待使用", id: 1 },
			{ name: "待评价", id: 2 },
			{ name: "已完成", id: 3 },
			{ name: "已退款", id: -1 },
			{ name: "已取消", id: -2 },
		],
	},
	//监听页面初次加载
	onLoad: function (options) {
		this.setData({
			type: options.type,
			id: options.id,
		});
		this.getDetail(options.id);
	},
	onFinish() {
		this.getDetail(this.data.id);
	},
	//监听页面显示
	onShow: function () {},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	goEvaluate() {
		wx.navigateTo({
			url: "/pages/order/evaluate/evaluate?type=" + this.data.order.type + "&id=" + this.data.id,
		});
	},
	goShopDetail() {
		wx.navigateTo({
			url: "/pages/shop/detail/detail?id=" + this.data.shop.id,
		});
	},
	goGoodsDetail() {
		wx.navigateTo({
			url: "/pages/goods/detail/detail?type=" + this.data.order.type + "&id=" + this.data.order.proId,
		});
	},
	// 复制
	toCopy() {
		wx.setClipboardData({
			data: this.data.id,
			success: () => {
				wx.showToast({
					title: "复制成功",
				});
			},
		});
	},
	// 复制 快递
	toCopyShipNo() {
		wx.setClipboardData({
			data: this.data.userAfterSell.refundShipNo,
			success: () => {
				wx.showToast({
					title: "复制成功",
				});
			},
		});
	},
	// 复制
	toCopyShopInfo() {
		let str = `收货地址：${this.data.merchantInfo.addr}
收件人：${this.data.merchantInfo.name}
联系电话：${this.data.merchantInfo.phone}`;
		wx.setClipboardData({
			data: str,
			success: () => {
				wx.showToast({
					title: "复制成功",
				});
			},
		});
	},
	// 打电话
	freeTell() {
		if (!this.data.merchantInfo.phone) {
			wx.showToast({ title: "没有电话", icon: "none" });
			return;
		}
		wx.makePhoneCall({
			phoneNumber: this.data.merchantInfo.phone,
		});
	},
	// 导航
	toOpenNav() {
		let latitude = parseFloat(this.data.shop.latitude);
		let longitude = parseFloat(this.data.shop.longitude);
		let name = this.data.shop.name;
		let address = this.data.shop.address;
		wx.openLocation({
			latitude: latitude,
			longitude: longitude,
			name: name,
			address: address,
			scale: 16,
		});
	},
	// 再次申请
	goRefund() {
		wx.navigateTo({
			url: "/pages/order/refundApply/refundApply?&id=" + this.data.id,
		});
	},
	// 取消申请
	NoApply(e) {
		Dialog.confirm({
			message: "是否取消申请",
		})
			.then(() => {
				app.request.post({
					url: "user/afterSell/cancel",
					params: {
						id: this.data.id,
					},
					success: () => {
						wx.showToast({
							title: "取消成功!",
						});
						setTimeout(() => {
							this.setData({
								pageNo: 0,
								loading: false,
								finish: false,
							});
							wx.redirectTo({
								url: "/pages/order/refundRecord/refundRecord",
							});
						}, 600);
					},
				});
			})
			.catch(() => {});
	},
	//显示物流弹窗
	isShowLog() {
		this.setData({
			isLogShow: true,
		});
	},
	//填写物流
	onLogisticsClose() {
		this.setData({
			isLogShow: false,
		});
	},
	getLogisticsInfo() {
		if (!this.data.logisticsTitle || !this.data.logisticsNum) {
			wx.showToast({
				title: "请填写完整信息",
				icon: "none",
			});
		}
		app.request.post({
			url: "user/afterSell/refundShip",
			params: {
				id: this.data.id,
				refundShip: this.data.logisticsTitle,
				refundShipNo: this.data.logisticsNum,
			},
			success: (res) => {
				this.setData({
					isLogShow: false,
				});
				wx.showToast({
					title: "填写完毕",
				});
				setTimeout(() => {
					this.getDetail();
				}, 500);
			},
			fail: (err) => {},
			finally: () => {},
		});
	},
	// -----------------------------------------接口-----------------------------------------------

	// 查看图片
	ontapImg(e) {
		let img = [];
		this.data.userAfterSell.img.forEach((item) => {
			img.push(app.common.imgUrl + item);
		});
		console.log(img);
		wx.previewImage({
			current: app.common.imgUrl + e.currentTarget.dataset.image,
			urls: img,
		});
	},
	getDetail(id) {
		id = id ? id : this.data.id;
		wx.showLoading({
			title: "加载中...",
		});
		app.request.post({
			url: "user/afterSell/details",
			params: {
				id,
			},
			success: (res) => {
				wx.hideLoading();
				let goods = JSON.parse(res.userOrderPay.proInfo);
				let arr = this.data.statusList.filter((i) => i.id == res.userOrderPay.status);
				if (arr.length > 0) res.userOrderPay.textStatus = arr[0].name;
				if (res.evaluation) res.evaluation.imgArr = res.evaluation.img ? res.evaluation.img.split(",") : [];
				if (res.userAfterSell.productSnapshot) res.userAfterSell.productSnapshot = JSON.parse(res.userAfterSell.productSnapshot);
				if (res.userAfterSell.img) res.userAfterSell.img = JSON.parse(res.userAfterSell.img);
				// 判断当前进度
				let status = res.userOrderPay.afterSellStatus;
				if (res.userOrderPay.afterSellType == 2 && res.userOrderPay.carriage != 1) {
					if (status == 1) {
						this.data.active = 0;
					} else if (status == 2) {
						this.data.active = 1;
					} else if (status == 3) {
						this.data.active = 2;
					} else if (status == 10) {
						this.data.active = 3;
					}
				} else if (res.userOrderPay.afterSellType == 1) {
					this.data.active = 1;
					if (status == 10) {
						this.data.active = 2;
					}
				}
				console.log("123");

				this.setData({
					order: res.userOrderPay,
					merchantInfo: res.merchantInfo,
					goods: goods,
					evaluate: res.evaluation ? res.evaluation : {},
					status,
					time: res.time,
					userAfterSell: res.userAfterSell,
					active: this.data.active,
				});
				console.log("321");

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
