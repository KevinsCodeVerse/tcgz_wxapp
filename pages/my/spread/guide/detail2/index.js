const app = getApp();

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
			id:options.id
		})
		this.getDetail()
	},
	getDetail(){
		app.request.post({
			url: "user/sysParams/public/handbook/detail",
			params: {
				type:2,
				id:this.data.id
			},
			success: (res) => {
				this.setData({
					detail:res
				})
			},
			fail: (err) => {
				
			},
			finally: () => {
				
			},
		});
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},

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
	onReachBottom: function () {},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {
    let url = `/pages/my/spread/guide/detail2/index?id=${this.data.id}`
    console.log(url);
		return {
			path: url,
			title: this.data.detail.title,
			imageUrl: app.common.imgUrl + this.data.detail.cover,
		};
	},
});
