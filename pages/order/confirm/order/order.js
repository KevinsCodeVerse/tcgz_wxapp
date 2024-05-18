const app = getApp();

import Dialog from "../../../../miniprogram/miniprogram_npm/@vant/weapp/dialog/dialog";
Page({
	data: {
		goodId: "",
		type: 1,
		specList: [],
		skuList: [],
		skuInfo: {
			curPrice: 0,
			rioPrice: 0,
			cover: "",
		},
		address: {},
		shop: {},
		count: 1,
		phone: "",
		allPrice: 0,
		agentId: "",
		deliveryName: "自提",
		deliveryType: 1,
		deliveryList: [
			// {id: 1,name: '自提'},
			// {id: 2,name: '配送'},
		],

		// 优惠券
		conponPrice: 0,
		conponId: "",
		// 备注信息
		userRemark: "",
	},
	//监听页面初次加载
	onLoad: function (options) {
		options.deliveryType == 2 && (this.data.deliveryName = "快递");
		console.log(options);
		if (options.type) {
			this.setData({
				type: options.type,
				goodId: options.id,
				agentId: options.agentId || "",
				deliveryType: options.deliveryType || 1,
				deliveryName: this.data.deliveryName,
			});
		}
		this.getConfirm(options.id);
		wx.removeStorageSync("delivery");
	},
	//监听页面显示
	onShow: function () {
		this.getConfirm(this.data.goodId);
	},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	bindPhone(e) {
		this.setData({ phone: e.detail.value });
	},
	bindUserRemark(e){
		this.setData({ userRemark: e.detail.value });
	},
	deliveryChange(e) {
		console.log(e);
		let allPrice = (this.data.count * this.data.skuInfo.curPrice + (parseInt(e.detail.value) + 1 == 2 ? this.data.goods.freight : 0)-this.data.conponPrice).toFixed(2);
		this.setData({
			allPrice,
			deliveryName: this.data.deliveryList[e.detail.value].name,
			deliveryType: parseInt(e.detail.value) + 1,
		});
	},
	goAddress() {
		wx.navigateTo({
			url: `/pages/my/address/address?goodsId=${this.data.goodId}&type=1`,
		});
	},
	//  步进器
	// 输入数字后
	omChangeSte(e) {
		this.data.count = parseInt(e.detail);
		let allPrice = (this.data.count * this.data.skuInfo.curPrice + (this.data.deliveryType == 2 ? this.data.goods.freight : 0) - this.data.conponPrice).toFixed(2);
		// allPrice = allPrice < 0.01 ? 0.01 : allPrice;

		this.setData({
			allPrice,
			count: this.data.count,
		});
	},
	// 提交订单
	toSubmit() {
		if (!this.data.phone && this.data.deliveryType == 1) {
			wx.showToast({ title: "请输入正确的手机号", mask: true, icon: "none" });
			return;
		}
		if (this.data.deliveryType == 2 && this.data.address && !this.data.address.id) {
			wx.showToast({ title: "请选择地址", mask: true, icon: "none" });
			return;
		}
		wx.showLoading({ title: "支付中...", mask: true });
		let params = {
			id: this.data.goodId,
			type: this.data.deliveryType,
			count: this.data.count,
			phone: this.data.phone,
			userRemark: this.data.userRemark,
			specId: this.data.skuInfo.id ? this.data.skuInfo.id : "",
			addressId: this.data.address ? this.data.address.id : "",
			couponUserId: this.data.conponId,
		};
		app.request.post({
			url: "user/order/submitOrder",
			params,
			success: (res) => {
				this.wechatPay(res);
			},
			finally: function () {
				console.log("确认订单");
				console.log(params);
			},
		});
	},
	// 微信支付
	wechatPay(id) {
		app.request.post({
			url: "wx/pay/orderPay",
			params: {
				id,
				type: 1,
			},
			success: (res) => {
				var that = this;
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
						if (this.data.deliveryType == 2) {
							wx.navigateBack({
								delta: 1,
							});
						} else {
							wx.redirectTo({
								url: "/pages/order/detail_order/index?id=" + id,
							});
						}
						wx.requestSubscribeMessage({
							tmplIds: ["bi5zVrnVQ4rK-QJru_wx-USk7JN8dbprWXpusJHLDK0", "OWjpxMzGxW_l8OEWeVVREY46332xVkYlIT3vDCotHrE", "GpFNSZUF3KMxyhXt-3wNBVXhVWSWUcXmuEjUTDJmwm4"],
							success(res) {},
						});
					},
					fail: (res) => {
						wx.showToast({
							title: "支付失败",
							icon: "none",
							duration: 2000,
						});
						this.data.goods.merchantId = 0;
						this.setData({
							goods: this.data.goods,
						});
						setTimeout(() => {
							this.getConfirm(this.data.goodId);
						}, 1500);
					},
				});
			},
		});
	},

	// 获取商品信息
	getConfirm(id) {
		wx.showLoading({
			title: "加载中...",
		});
		app.request.post({
			url: "user/order/confirmOrder",
			params: {
				id,
			},
			success: (res) => {
				wx.hideLoading();
				let address = [];
				let delivery = wx.getStorageSync("delivery");
				if (this.data.deliveryType == 2 && delivery) {
					res.address = delivery;
				}
				if (wx.getStorageSync("shippingAddress")) address = wx.getStorageSync("shippingAddress");
				// console.log(res);
				// if (!res.address && !address) {
				// 	if (this.data.deliveryType == 2) {
				// 		this.goAddress();
				// 		return;
				// 	}
				// }
				// 处理spec
				res.arraySpec.forEach((item) => {
					let sonName = [];
					item.sonName.forEach((i, index) => {
						let obj = {
							name: i,
							check: index == 0 ? true : false,
						};
						sonName.push(obj);
					});
					item.sonName = sonName;
				});

				// 处理sku
				let proSkus = "";
				if (res.proSkus) {
					proSkus = JSON.parse(res.proSkus);
					proSkus.forEach((item, index) => {
						let sku = [];
						let obj = JSON.parse(item.spec);
						for (var i in obj) {
							sku.push(obj[i]);
						}
						item.sku = sku;
						if (index == 0) {
							this.setData({
								skuInfo: item,
							});
						}
					});
				} else {
					let skuInfo = {
						curPrice: res.merchantPro.price,
						rioPrice: res.merchantPro.originalPrice,

						cover: res.merchantPro.cover,
					};
					// 计算总价
					let allPrice = res.merchantPro.price;
					this.setData({
						skuInfo: skuInfo,
						allPrice,
					});
				}
				// 处理配送方式
				let deliveryList = [];
				JSON.parse(res.merchantPro.carriage).forEach((item) => {
					deliveryList.push({
						id: item,
						name: item == 1 ? "自提" : "快递",
					});
					deliveryList.sort((item1, item2) => item1.id - item2.id);
				});
				if (deliveryList.length == 1 && deliveryList[0].id == 2) {
					this.data.deliveryType = 2;
					this.data.deliveryName = "快递";
				}

				// 地址
				console.log(address[0]);
				this.setData({
					goods: res.merchantPro,
					shop: res.shop,
					specList: res.arraySpec,
					skuList: proSkus,
					deliveryList,
					allPrice: res.merchantPro.price * this.data.count + (this.data.deliveryType == 2 ? res.merchantPro.freight : 0),
					address: res.address ? res.address : address[0],
					deliveryType: this.data.deliveryType,
					deliveryName: this.data.deliveryName,
				});
				this.getSkuInfo();
			},
		});
	},

	// -----------------------------规格相关-----------------------------------
	chooseSpec(e) {
		let name = e.currentTarget.dataset.name;
		let oneIndex = e.currentTarget.dataset.index;
		let specList = this.data.specList;
		specList[oneIndex].sonName.forEach((i) => {
			i.check = false;
			if (i.name == name) i.check = true;
		});
		this.setData({
			specList,
		});
		this.getSkuInfo();
	},
	getSkuInfo() {
		let arr = [];
		this.data.specList.forEach((item) => {
			item.sonName.forEach((i) => {
				if (i.check) arr.push(i.name);
			});
		});
		if (arr.length < this.data.specList.length) return;
		// console.log(arr)
		this.data.skuList.forEach((item) => {
			if (item.sku.join(";") == arr.join(";")) {
				// console.log(item)
				// 计算总价
				let allPrice = item.curPrice;
				allPrice = (this.data.count * allPrice + (this.data.deliveryType == 2 ? this.data.goods.freight : 0) - this.data.conponPrice).toFixed(2);
				// allPrice = allPrice < 0.01 ? 0.01 : allPrice;
				this.setData({
					skuInfo: item,
					allPrice,
				});
			}
		});
	},
	// 优惠卷 相关 ----------------------------------------
	handCouponPrice(e) {
		this.setData({
			conponPrice: e.detail.amount || "",
			conponId: e.detail.id || "",
		});
		this.data.goods.id && this.omChangeSte({ detail: this.data.count });
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
