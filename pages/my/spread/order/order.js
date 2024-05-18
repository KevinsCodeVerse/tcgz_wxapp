const app = getApp();
Page({
	data: {
		type: "",
		status: "",
		code: "",
		list: [],
		pageNo: 0,
		pageSize: 10,
		finish: false,
		loading: false,
		statusTitle: "全部状态",
		option1: [
			{ text: "直推/间推", value: "" },
			{ text: "直推", value: 1 },
			{ text: "间推", value: 2 },
		],
		option2: [
			{ text: "升序", value: "asc" },
			{ text: "降序", value: "" },
		],
		isDirect: "",
		isTimer: "",
	},
	//监听页面初次加载
	onLoad: function (options) {
		this.setData({
			id:options.userId
		})
		this.getList();
	},
	//监听页面显示
	onShow: function () {},
	getList() {
		if (this.data.loading || this.data.finish) {
			return;
		}
		this.setData({
			loading: true,
			pageNo: this.data.pageNo + 1,
		});
		app.request.post({
			url: "user/info/commissionList",
			params: {
				businessType: this.data.type,
				pageNo: this.data.pageNo,
				type: this.data.status,
				pageSize: this.data.pageSize,
				pushType: this.data.isDirect,
				sort: this.data.isTimer,
				userId:this.data.id?this.data.id:''
			},
			success: (result) => {
				console.log(result.list);

				result.list.forEach((item) => {
					if (item.queryType == 4) {
						item.name = JSON.parse(item.name);
					}
				});
				var list = this.data.list;
				list = list.concat(result.list);
				this.setData({
					list: list,
					loading: false,
				});
				if (result.list.length < this.data.pageSize) {
					this.setData({
						finish: true,
					});
				}
			},
		});
	},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	typeChange(e) {
		this.setData({
			type: e.currentTarget.dataset.type,
			pageNo: 0,
			loading: false,
			finish: false,
			list: [],
		});
		this.getList();
		this.selectComponent("#item").toggle(false);
	},
	statusChange(e) {
		let statusTitle;
		let status = e.currentTarget.dataset.status;
		console.log(status);
		if (status == 1) {
			statusTitle = "已通过";
		} else if (status === 0 || status === "0") {
			statusTitle = "审核中";
		} else if (status == -1) {
			statusTitle = "已拒绝";
		} else if (status == 2) {
			statusTitle = "已付款";
		} else {
			statusTitle = "全部状态";
		}

		this.setData({
			status: e.currentTarget.dataset.status,
			pageNo: 0,
			statusTitle,
			loading: false,
			finish: false,
			list: [],
		});
		this.getList();
		this.selectComponent("#item").toggle(false);
	},
	// 直推
	directChange(e) {
		this.setData({
			pageNo: 0,
			isDirect: e.detail,
			loading: false,
			finish: false,
			list: [],
		});
		this.getList();
	},
	// 时间
	timerChange(e) {
		this.setData({
			pageNo: 0,
			isTimer: e.detail,
			loading: false,
			finish: false,
			list: [],
		});
		this.getList();
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
