// pages/goods/group_detail/group_more_list/group_more_list.js
const app = getApp();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		type: 3,
		active: "",
		list: [],
		pageNo: 0,
		pageSize: 10,
		finish: false,
		loading: false,
	},

	getdetail() {
		app.request.post({
			url: "us/groupPro/teamList",
			params: {
				id: "",
			},
		});
	},
	// 倒计时结束
	onFinish() {
		this.getList();
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.setData({
			id: options.id,
		});
		this.getList();
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {},
	// 跳转 支付页
	goConfirm() {
		wx.navigateTo({
			url: "/pages/order/confirm/group/group?type=3&id=" + this.data.id,
		});
	},
	// 跳转 参团页
	goConfirms(e) {
		console.log(e);
		wx.navigateTo({
			url: "/pages/order/join_group/index?type=3&teamid=" + e.currentTarget.dataset.teamid,
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
			url: "us/groupPro/teamList",
			params: {
				pageNo: this.data.pageNo,
				pageSize: this.data.pageSize,
				id: this.data.id,
			},
			success: (res) => {
				console.log("11");
				// res.list.forEach(item => {
				//     item.proInfo = JSON.parse(item.userOrderPay.proInfo)
				//     let arr = this.data.statusList.filter(i => i.id == item.userOrderPay.status)
				//     if (arr.length > 0) item.textStatus = arr[0].name
				// })

				let list = this.data.list.concat(res.groupSpellUsers);
				this.setData({
					list: list,
					detail: res.merchantGroupPro,
				});
				console.log("22");
				if (res.groupSpellUsers.length < this.data.pageSize) {
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

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {
		this.getList();
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {},
});
