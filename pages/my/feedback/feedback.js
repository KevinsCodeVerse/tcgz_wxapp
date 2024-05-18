const app = getApp();
Page({
	data: {
		type: "", //1:普通  4:物流
		value: 0,
		orderId: "",
		content: "",
		fileList: [],
	},
	//监听页面初次加载
	onLoad: function (options) {
		this.setData({
			orderId: options.id,
			type: options.type,
		});
	},
	//监听页面显示
	onShow: function () {
    let colors = '#3994FF'
		
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: colors,
    });
	},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	onChange(event) {
		this.setData({
			value: event.detail,
		});
	},
	bindContent(e) {
		this.setData({
			content: e.detail.value,
		});
	},
  toList(){
    wx.navigateTo({
      url: '/pages/my/feedbackList/feedbackList',
    })
  },
	// 提交
	toSubmit() {
		let img = [];
		this.data.fileList.forEach((item) => {
			img.push(item.url);
		});
		wx.showToast({ title: "提交中...", icon: "loading", mask: true });
		app.request.post({
			url: "user/sysAdvice/add",
			params: {
				id: this.data.orderId,
				score: this.data.value,
				content: this.data.content,
				imgs: JSON.stringify(img),
        type: this.data.type,
        adCode:wx.getStorageSync('adcode')
			},
			success: (res) => {
				wx.showToast({
					title: "提交成功",
					success: () => {
						setTimeout(() => {
							wx.navigateBack({ delta: 2 });
						}, 1000);
					},
				});
			},
			finally: (res) => {},
		});
	},

	// 图片上传
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
		console.log(fileList);
	},
	// 图片删除
	removeImg(event) {
		console.log(111);
		let index = event.currentTarget.dataset.index;
		var fileList = this.data.fileList;
		fileList.splice(event.detail.index, 1);
		this.setData({
			fileList,
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
