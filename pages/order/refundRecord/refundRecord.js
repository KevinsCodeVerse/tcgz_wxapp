const app = getApp();
import Dialog from "../../../miniprogram/miniprogram_npm/@vant/weapp/dialog/dialog";
Page({
	data: {
		type: 1,
		active: "",
		show: false,
		qrCode: "",
		// 分页参数
		list: [],
		pageNo: 0,
		pageSize: 10,
		finish: false,
		loading: false,
	},
	//监听页面初次加载
	onLoad: function (options) {
		this.setData({
			type: options.type || 1,
		});
		this.setData({
			pageNo: 0,
			loading: false,
			finish: false,
			list: [],
		});
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
	// 再次申请
	goRefund(e) {
		wx.navigateTo({
			url: "/pages/order/refundApply/refundApply?&id=" + e.currentTarget.dataset.id,
		});
	},
	goDetail(e) {
		wx.navigateTo({
			url: "/pages/order/refundRecord/afterSale/afterSale?id=" + e.currentTarget.dataset.id,
		});
		// wx.navigateTo({
		// 	url: "/pages/order/detail_order/index?id=" + e.currentTarget.dataset.id + "&type=" + this.data.type,
		// });
	},
	goEvaluate(e) {
		let obj = e.currentTarget.dataset.obj;
		wx.navigateTo({
			url: "/pages/order/evaluate/evaluate?type=" + obj.type + "&id=" + obj.id,
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
						id: e.currentTarget.dataset.id,
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
							this.getList();
						}, 600);
					},
				});
			})
			.catch(() => {});
	},

	toEwm(e) {
		this.setData({
			show: true,
			qrCode: e.currentTarget.dataset.qrcode,
		});
	},
	onClose() {
		this.setData({
			show: false,
			qrCode: "",
		});
	},
	// 获取订单
	getList() {
		if (this.data.loading || this.data.finish) return;
		this.setData({
			pageNo: this.data.pageNo + 1,
			loading: true,
		});
		app.request.post({
			// user/afterSell/list
			url: "user/afterSell/list",
			params: {
				pageNo: this.data.pageNo,
				pageSize: this.data.pageSize,
				// status: this.data.active,
				// type: this.data.type,
			},
			success: (res) => {
				res.list.forEach((item) => {
					item.proInfo = JSON.parse(item.userOrderPay.proInfo);
					// let arr = this.data.statusList.filter((i) => i.id == item.userOrderPay.status);
					// if (arr.length > 0) item.textStatus = arr[0].name;
				});
				let list
				if(this.data.pageNo!=1){
					list = this.data.list.concat(res.list);
				} else{
					list = res.list
				}
				this.setData({
					list: list,
				});
				if (res.list.length < this.data.pageSize) {
					this.setData({
						finish: true,
					});
				}
			},
			finally: () => {
				this.setData({
					loading: false,
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
	onReachBottom: function () {
		this.getList();
	},
	//用户点击右上角转发
	onshareAppMessage: function () {},
});
