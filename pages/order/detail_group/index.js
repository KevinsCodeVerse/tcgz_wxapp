const app = getApp();
import Dialog from "../../../miniprogram/miniprogram_npm/@vant/weapp/dialog/dialog";

Page({
	data: {
		status: 1,
    id: "",
    userCards:null,
		statusList: [
			{ name: "待支付", id: 0 },
			{ name: "待使用", id: 1 },
			{ name: "待发货", id: 10 },
			{ name: "待收货", id: 11 },
			{ name: "团购待成团", id: 5 },
			{ name: "待评价", id: 2 },
			{ name: "已完成", id: 3 },
			{ name: "已退款", id: -1 },
			{ name: "已取消", id: -2 },
		],
	},
	//监听页面初次加载
	onLoad: function (options) {
		console.log(options);
    this.getDetail(options.id);
		this.setData({
			id: options.id,
		});
	},
	//监听页面显示
	onShow: function () {},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	goEvaluate() {
		wx.navigateTo({
			url: "/pages/order/evaluate/evaluate",
		});
	},
	goJoinGroup() {
		wx.navigateTo({
			url: "/pages/order/join_group/index",
		});
	},
	// 跳转 售后页面
	goRefundDetail() {
		wx.redirectTo({
			url: "/pages/order/refundRecord/afterSale/afterSale?&id=" + this.data.id,
		});
	},
	// 跳转 退款申请
	goRefund() {
		wx.navigateTo({
			url: "/pages/order/refundApply/refundApply?&id=" + this.data.id,
		});
  },
  // 跳转 我的名片
  // goMyCard() {
  //   if(this.data.userCards === 1){
  //     wx.navigateTo({
  //       url: "/pages/card/myCard/myCard",
  //     });
  //   } else {
  //     wx.navigateTo({
  //       url: "/pages/card/addCardPage/addCardPage?&id=" + this.data.id,
  //     });
  //   }

  // },
	// 跳转 拼团详情
	goGoodsDetail() {
		wx.navigateTo({
			url: "/pages/goods/group_detail/group_detail?id=" + this.data.order.groupProId,
		});
	},
	// 跳转 商家详情
	goShopDetail() {
		wx.navigateTo({
			url: "/pages/shop/detail/detail?id=" + this.data.shop.id,
		});
	},
	// 倒计时 结束
	onFinish() {
		this.getDetail(this.data.id);
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
	// 取消拼团
	cancelPays(){
		Dialog.confirm({
			message: "是否取消订单",
		})
			.then(() => {
				app.request.post({
					url: "us/groupPro/cancel",
					params: {
						id: this.data.id,
					},
					success: (res) => {
						wx.showToast({
							title: "取消成功!",
						});
						setTimeout(() => {
							wx.redirectTo({
							  url: '/pages/order/group/group?type=3',
							})
						}, 1000);
					},
				});
			})
			.catch(() => {});
	},
	// 取消订单
	cancelPay(){
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
							  url: '/pages/order/group/group?type=3',
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
				type: 3,
			},
			success: (res) => {
				var that = this;
				wx.requestPayment({
					timeStamp: res.timeStamp,
					nonceStr: res.nonceStr,
					package: res.packageValue,
					signType: "MD5",
					paySign: res.paySign,
					success:result=>{
						wx.showToast({
							title: "支付成功",
							icon: "success",
							duration: 2000,
						});
						setTimeout(() => {
							this.getDetail(this.data.id);
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
	// 订单详情
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
					users: res.users,
					teamTime: res.time,
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
	onShareAppMessage: function (res) {
		let teamId = this.data.order.teamId;
		return {
			title: `${this.data.goods.title} 限时拼团! 现只需 ￥${this.data.goods.price} 元`,
			path: `/pages/order/join_group/index?type=3&teamid=${teamId}`,
			imageUrl: app.common.fullPath(this.data.goods.cover),
		};
	},
});
