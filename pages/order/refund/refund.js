const app = getApp();
Page({
	data: {
		show: false,
		id: "",
		remark: "",
		text: "",
		type: 1,
		status: 1,
		order: {},
		shop: {},
		goods: {},
		evaluate: {},
		timedown: 0,
		price: "",
		statusList: [
			{ name: "待支付", id: 0 },
			{ name: "待使用", id: 1 },
			{ name: "待评价", id: 2 },
			{ name: "已完成", id: 3 },
			{ name: "已退款", id: -1 },
			{ name: "已取消", id: -2 },
		],
		fileList: [],
		itemList: ["订单信息拍错(规格/尺码/颜色)", "我不想要了", "地址/电话信息填写错误"],
		reason: "请选择",
	},
	//监听页面初次加载
	onLoad: function (options) {
		this.setData({
			type: options.type,
			id: options.id,
		});
		this.getDetail(options.id);
		let title = "申请仅退款";
		if (this.data.type == 2) {
			title = "申请退款退货";
		}
		wx.setNavigationBarTitle({
			title,
		});
	},
	//监听页面显示
	onShow: function () {},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前

	goRefund() {
		wx.navigateTo({
			url: "/pages/order/refundApply/refundApply?&id=" + this.data.id,
		});
	},
	// 输入退款金额
	setInput() {
		this.setData({
			show: true,
		});
	},
	// 选择 退款记录
	select() {
		wx.showActionSheet({
			alertText: "请选择退款原因",
			itemList: this.data.itemList,
			success: (res) => {
				this.setData({
					reason: this.data.itemList[res.tapIndex],
				});
			},
			fail(res) {
				console.log(res.errMsg);
			},
		});
	},
	// 钱
	onInput2(e) {
		this.setData({
			price: e.detail.value,
		});
	},
	// 文本输入
	onInput(e) {
		this.setData({
			remark: e.detail.value,
		});
	},
	// 打电话
	freeTell() {
		if (!this.data.shop.phone) {
			wx.showToast({ title: "没有电话", icon: "none" });
			return;
		}
		wx.makePhoneCall({
			phoneNumber: this.data.shop.phone,
		});
	},
	// 提交表单
	async sub() {
		let img = JSON.stringify(this.data.fileList.map((i) => i.url));
		if (this.data.reason == "请选择") {
			wx.showToast({
				title: "请选择退款原因!",
				icon: "none",
				duration: 2000,
			});
			return;
		}
		await this.asApply(img).then((res) => {
			wx.showToast({
				title: "申请成功!",
			});
			setTimeout(() => {
				wx.reLaunch({
					url: "/pages/order/refundRecord/refundRecord",
				});
			}, 500);
		});
	},
	// 提交申请
	asApply(img) {
		return new Promise((from, reject) => {
			app.request.post({
				url: "user/afterSell/apply",
				params: {
					id: this.data.id,
					reason: this.data.reason,
					type: this.data.type,
					img,
					remark: this.data.remark,
					amount: this.data.price,
				},
				success: () => {
					from();
				},
			});
		});
	},
	//删除照片
	imgDelete(e) {
		console.log(e.detail.index);
		this.data.fileList.splice(e.detail.index, 1);
		this.setData({
			fileList: this.data.fileList,
		});
	},
	// -----------------------------------------接口-----------------------------------------------
	//
	afterRead(event) {
		const { file } = event.detail;
		let base64 = wx.getFileSystemManager().readFileSync(file.path, "base64");
		base64 = "data:image/jpeg;base64," + base64;
		// 上传完成需要更新 fileList
		var fileList = this.data.fileList;
		fileList.push({ ...file, url: base64 });
		this.setData({
			fileList: fileList,
		});

		// 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
		// wx.uploadFile({
		//   url: 'https://example.weixin.qq.com/upload', // 仅为示例，非真实的接口地址
		//   filePath: file.url,
		//   name: 'file',
		//   formData: { user: 'test' },
		//   success(res) {
		//     // 上传完成需要更新 fileList
		//     const { fileList = [] } = this.data;
		//     fileList.push({ ...file, url: res.data });
		//     this.setData({ fileList });
		//   },
		// });
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
				if (res.evaluation) res.evaluation.imgArr = res.evaluation.img ? res.evaluation.img.split(",") : [];
				console.log("22222222222");
				this.setData({
					order: res.userOrderPay,
					shop: res.merchantShop,
					goods: goods,
					evaluate: res.evaluation ? res.evaluation : {},
					status: res.userOrderPay.status,
					timedown: res.cancelTime,
					price: res.userOrderPay.payAmount,
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
