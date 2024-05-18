const app = getApp();
Page({
	data: {
		// 分页参数
		pageNo: 0,
		pageSize: 10,
		isNull: false,
		list:[],

		finish: false,
		loading: false,
		list: [
			// {
			//   id: '1',
			//   title: '特惠总统套房主题酒店限时秒杀',
			//   cover: 'https://www.tcgz.store/files/index/index-01.png',
			//   limit: 1,
			//   inventory: 99,
			//   currentPrice: 888,
			//   originalPrice: 2888,
			//   activityEndTime: ''
			// },
			// {
			//   id: '2',
			//   title: '特惠总统套房主题酒店限时秒杀',
			//   cover: 'https://www.tcgz.store/files/index/index-01.png',
			//   limit: 1,
			//   inventory: 99,
			//   currentPrice: 888,
			//   originalPrice: 2888,
			//   activityEndTime: ''
			// },
		],
	},
	//监听页面初次加载
	onLoad: function (options) {
		this.setData({
			type:options.type
		})
	},
	//监听页面显示
	onShow: function () {
		this.getList();
	},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	goDetail(e) {
		wx.navigateTo({
			url: "/pages/goods/seckill_detail/seckill_detail?id=" + e.currentTarget.dataset.id,
		});
	},
	onChange(e) {
		let index = e.currentTarget.dataset.index;
		this.setData({
			["list[" + index + "].timeData"]: e.detail,
		});
	},
	// 倒计时结束
	onFinish() {
    this.setData({
      pageNo: this.data.pageNo-1,
      finish: false,
      loading: false,
  
    })
		this.getList();
	},
	// -------------------------------------------------------接口----------------------------------------------------
	getList() {
		if (this.data.loading || this.data.finish) {
			return;
		}
		wx.showLoading({
			title: "加载中...",
		});
		this.setData({
			loading: true,
			pageNo: this.data.pageNo + 1,
		});
		app.request.post({
			url: "user/spike/list",
			params: {
				pageNo: this.data.pageNo,
				pageSize: this.data.pageSize,
				adCode:wx.getStorageSync('adcode'),
				type:this.data.type
			},
			success: (res) => {
				res.list.forEach((item) => {
					item.timeData = {};
				});
				console.log(res.list);
				if(res.list.length == 0&&this.data.list.length==0) this.data.isNull = true
        		let list = this.data.list.concat(res.list);
				this.setData({
					list,
				});
				if (res.list.length < this.data.pageSize) {
					this.setData({
						finish: true,
					});
				}
				this.setData({
					list,
					loading: false,
					isNull: this.data.isNull,
				});
			},
			finally: () => {
				wx.hideLoading();
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
