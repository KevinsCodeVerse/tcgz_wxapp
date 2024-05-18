// pages/merchent/adDetail/adDetail.js
Page({
	/**
	 * 页面的初始数据
	 */
	data: {},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.setData({
			id: options.id,
		});
		this.getDetail();
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {},
	toUploading(e){
		let obj = this.data.cityBidUser
		let categoryId = obj.type == 3? obj.categoryId:''
		wx.redirectTo({
			url: `/pages/merchent/uploadingImg/uploadingImg?id=${obj.id}&type=${obj.type}&categoryId=${categoryId||''}`,
		});
	},
	getDetail() {
		getApp().request.post({
            url: "mt/bid/detail",
            myType:1,
			params: {
				id: this.data.id,
			},
			success: (res) => {
				this.setData({
					cityBidUser:res.cityBidUser,
					goods: res.merchantPro,
				});
			},
			fail: (err) => {},
			finally: () => {},
		});
	},
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
	onReachBottom: function () {},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {},
});
