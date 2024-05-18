const app = getApp();
// const rsa= require('../../../../utils/encryption')
// const Toast= require('../../../../miniprogram/miniprogram_npm/@vant/weapp/toast/toast')
import Toast from "../../../../miniprogram/miniprogram_npm/@vant/weapp/toast/toast";

Page({
	data: {
		ids: "",
		cardName: "",
		cardNum: "",
		name: "",
		banList: [],
		active: -1,
		activeBank: {},
		phone: "",
		idcard: "",
		idcardName: "",
		defaultIdcard: 0,
	},
	//监听页面初次加载
	onLoad: function (options) {
		if (options.id) {
			wx.setNavigationBarTitle({
				title: "查看/修改卡号信息",
			});
			this.setData({ id: options.id });
		} else {
			wx.setNavigationBarTitle({
				title: "提交卡号信息",
			});
		}
	},
	//监听页面显示
	onShow: function () {
		this.getPublicBanklist();
	},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	bindCardName(e) {
		this.setData({
			cardName: e.detail.value,
		});
	},
	checkboxChange(e) {
		console.log(e);
		let index = e.detail.value;
		this.setData({
			defaultIdcard: index[0] || 0,
		});
	},
	deliveryChange(e) {
		let index = e.detail.value;
		if (index != this.data.active && index == 0) {
			this.setData({
				activeBank: {},
				name: "",
				phone: "",
				idcard: "",
				idcardName: "",
				active: index,
				defaultIdcard: "0",
			});
			return;
		}

		this.setData({
			active: index,
		});
		if (index != -1) {
			let arrBank = this.data.arrBank[index];
			this.data.banList.forEach((item) => {
				if (item.bankId == arrBank.bankId) {
					this.setData({
						activeBank: item,
						name: arrBank.name,
						phone: arrBank.phone,
						idcard: arrBank.idcard,
						idcardName: arrBank.idcardName,
						ids: arrBank.id,
						defaultIdcard: arrBank.defaultIdcard,
					});
				}
			});
		}
	},
	bankChange(e) {
		this.setData({
			activeBank: this.data.banList[e.detail.value],
		});
	},
	bindCardNum(e) {
		this.setData({
			idcard: e.detail.value,
		});
	},
	bindName(e) {
		this.setData({
			name: e.detail.value,
		});
	},
	bindphone(e) {
		this.setData({
			phone: e.detail.value,
		});
	},

	getPublicBanklist() {
		app.request.post({
			url: "general/query/public/bankList",
			myType: 1,
			success: (res) => {
		        this.getBankList();
				this.setData({
					banList: res,
				});
			},
		});
	},
	getBankList() {
		app.request.post({
			url: "mt/info/getBank",
			myType: 1,
			success: (res) => {
				if (res.length) {
					this.setData({
						activeBank: {},
						name: res[0].name,
						phone: res[0].phone,
						idcard: res[0].idcard,
						idcardName: res[0].idcardName,
                        defaultIdcard: res[0].defaultIdcard,
                        ids: res[0].id,
						active: 1,
					});
					this.data.banList.forEach((item) => {
						if (item.bankId == res[0].bankId) {
							this.setData({
								activeBank: item,
							});
						}
					});
				}
				this.setData({
					arrBank: [{ id: -1, idcardName: "新增银行卡" }, ...res],
				});
			},
		});
	},

	// 提交
	toSubmit() {
		if (!this.data.idcard) {
			wx.showToast({ title: "请填写完整内容", icon: "none" });
			return;
		}
		Toast.loading({ message: "提交中...", forbidClick: true, duration: 0 });
		let params = {
			bankId: this.data.activeBank.bankId,
			defaultIdcard: this.data.defaultIdcard,
			idCard: this.data.idcard,
			idCardName: this.data.activeBank.bank,
			name: this.data.name,
			phone: this.data.phone,
			id: this.data.ids || "",
		};
		console.log(params);
		app.request.post({
			url: "mt/info/saveOrUpdateBank",
			myType: 1,
			params,
			success: (res) => {
				wx.showToast({
					title: "提交成功",
					success: () => {
						setTimeout(() => {
							wx.navigateBack({ delta: 1 });
						}, 1500);
					},
				});
			},
			finally: (res) => {
				Toast.clear();
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
