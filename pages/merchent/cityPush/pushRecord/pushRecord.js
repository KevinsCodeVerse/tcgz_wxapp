// pages/merchent/cityPush/pushRecord/pushRecord.js
const app = getApp();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		pageNo: 0,
		pageSize: 7,
		finish: false,
		loading: false,
		list: [],
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.getList();
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},
	getList() {
		if (this.data.finish || this.data.loading) return;
		this.setData({
			loading: true,
			pageNo: this.data.pageNo + 1,
		});
		app.request.post({
			url: "mt/app/scoreList",
			myType: 1,
			params: {
				pageNo: this.data.pageNo,
				pageSize: this.data.pageSize,
			},
			success: (res) => {
				console.log(res);
				this.setData({
					list: [...this.data.list, ...res.list],
				});
				if (res.list.length < this.data.pageSize) {
					this.setData({
						finish: true,
					});
				}
			},
			fail: (err) => {},
			finally: () => {
				this.setData({
					loading: false,
				});
			},
		});
	},
	handSubmit(e) {
		let id = e.currentTarget.dataset.obj.id;
		wx.showLoading({
			title: "加载中..",
		});
		app.request.post({
			url: "mt/app/maOpen",
			myType: 1,
			params: {
				appId: 6,
				userId: wx.getStorageSync("userId"),
				proId: id,
			},
			success: (res) => {
				console.log(res);
				this.pay(res);
			},
			fail: (err) => {},
			finally: () => {},
		});
	},
	pay(res) {
		wx.requestPayment({
			timeStamp: res.timeStamp,
			nonceStr: res.nonceStr,
			package: res.packageValue,
			signType: "MD5",
			paySign: res.paySign,
			success: (res) => {
				wx.hideLoading();
				wx.showToast({
					title: "支付成功",
					duration: 2000,
					success: () => {
						setTimeout(() => {
							this.setData({
								list: [],
								pageNo: 0,
								finish: false,
								loading: false,
							});
							this.getList();
						}, 1500);
					},
				});
			},
			fail(res) {
				wx.hideLoading();
				wx.showToast({
					title: "支付失败",
					duration: 2000,
					icon: "error",
				});
			},
		});
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {
        this.getList()
    },

	/**
	 * 用户点击右上角分享
	 */
	onshareAppMessage: function () {},
});
