const app = getApp();
import Dialog from "../../../miniprogram/miniprogram_npm/@vant/weapp/dialog/dialog";

Page({
	data: {
		id: "",
		type: 1,
		status: 1,
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

	//监听页面显示
	onShow: function () {},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	onFinish(){
		this.getDetail(options.id);
	},
	goRefundDetail() {
		wx.redirectTo({
			url: "/pages/order/refundRecord/afterSale/afterSale?&id=" + this.data.id,
		});
	},
	goRefund() {
		if(this.data.order.afterSellStatus ==-2){
			return wx.showToast({
			  title: '该商品无法售后',
			  icon:'none'
			})
		}
		wx.navigateTo({
			url: "/pages/order/refundApply/refundApply?&id=" + this.data.id,
		});
	},
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
		if(this.data.order.type==1){
			wx.navigateTo({
				url: "/pages/goods/detail/detail?type=" + this.data.order.type + "&id=" + this.data.order.proId,
			});
		} else{
			wx.navigateTo({
				url: "/pages/goods/seckill_detail/seckill_detail?type=2&id=" + this.data.order.spikeId,
			});
		}
		
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
	// 打电话
	freeTell() {
		// if (!this.data.shop.phone) {
		// 	wx.showToast({ title: "没有电话", icon: "none" });
		// 	return;
		// }
		wx.makePhoneCall({
			phoneNumber: app.globalData.TerPhnoe,
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
	// -----------------------------------------接口-----------------------------------------------
	//确认收货
	toDelivery() {
		Dialog.confirm({
			title: "是否确认收货",
			message:'是否确认收货，确认收货后将无法申请售后'
		})
			.then(() => {
				app.request.post({
					url: "user/order/receipt",
					params: {
						id: this.data.id,
					},
					success: (res) => {
						this.getDetail(this.data.id);
						wx.showToast({
							title: "确认收货成功",
						});
					},
				});
			})
			.catch(() => {});
	},
	// 取消订单
	cancelPay() {
		Dialog.confirm({
			message: "是否取消订单",
		})
			.then(() => {
				app.request.post({
					url: "user/order/cancel",
					params: {
						id: this.data.id,
					},
					success: (res) => {
						wx.showToast({
							title: "取消成功!",
						});
						setTimeout(() => {
							wx.redirectTo({
							  url: '/pages/order/order/order?type='+this.data.type,
							})
						}, 1000);
					},
					
				});
			})
			.catch(() => {});
		
	},
	// 微信支付
	wechatPay() {
		wx.showLoading({ title: "支付中", mask: true });
		app.request.post({
			url: "wx/pay/orderPay",
			params: {
				id: this.data.id,
				type: this.data.type,
			},
			success: (res) => {
				var that = this;
				wx.requestPayment({
					timeStamp: res.timeStamp,
					nonceStr: res.nonceStr,
					package: res.packageValue,
					signType: "MD5",
					paySign: res.paySign,
					success(result) {
						wx.showToast({
							title: "支付成功",
							icon: "success",
							duration: 2000,
						});
						setTimeout(() => {
							this.getDetail();
						}, 1500);
					},
					fail(res) {
						wx.showToast({
							title: "支付失败",
							icon: "none",
							duration: 2000,
						});
					},
				});
			},
		});
	},

	getDetail(id) {
		id = id ? id : 88900141981098;
		wx.showLoading({
			title: "加载中...",
		});
		app.request.post({
			url: "user/order/orderDetails",
			params: {
				id,
			},
			success: (res) => {
				wx.hideLoading();
				let goods = JSON.parse(res.userOrderPay.proInfo);
				let arr = this.data.statusList.filter((i) => i.id == res.userOrderPay.status);
				if (arr.length > 0) res.userOrderPay.textStatus = arr[0].name;
				if (res.evaluation) res.evaluation.imgArr = res.evaluation.img ? res.evaluation.img.split(",") : [];
				this.setData({
					order: res.userOrderPay,
					shop: res.merchantShop,
					goods: goods,
					evaluate: res.evaluation ? res.evaluation : {},
					status: res.userOrderPay.status,
					timedown: res.cancelTime,
					limitTime:res.limitTime
				});
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
