const app = getApp();
Page({
	data: {
		type: 1,
	},
	//监听页面初次加载
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
				type:1,
				id:this.data.id
			},
			success: (res) => {
				res.content = res.content.replace(/\<img(.*?)src/g, '<img style="max-width:100%!important;height:auto;display:block;" src');
				res.content = res.content.replace(/\<p/g, '<p style="line-height:1.8;"');
				res.content = res.content.replace(/\<font color="/g, '<font style="color:'); // 字体颜色转换
				this.setData({
					detail:res
				})
			},
			fail: (err) => {
				
			},
			finally: () => {
				
			},
		});
	}
	,
	//监听页面显示
	onShow: function () {},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前

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
	onShareAppMessage: function () {
		let url = `/pages/my/spread/guide/detail/detail?id=${this.data.id}`
		console.log(url);
		return {
			path: url,
			title: this.data.detail.title,
			imageUrl: app.common.imgUrl + this.data.detail.cover,
		};
	},
});
