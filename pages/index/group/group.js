const app = getApp();
Page({
	data: {
		pageNo: 0,
		pageSize: 10,
		isNull: false,
		list:[],
		finish: false,
		loading: false,
		goodsList: [
			// {
			//   id: '1',
			//   title: '栋企鸡团购特惠限时拼团59元享原价119',
			//   cover: 'https://www.tcgz.store/files/index/index-04.png',
			//   limit: 3,
			//   inventory: 462,
			//   currentPrice: 59,
			//   originalPrice: 119
			// },
			// {
			//   id: '2',
			//   title: '栋企鸡团购特惠限时拼团59元享原价119',
			//   cover: 'https://www.tcgz.store/files/index/index-04.png',
			//   limit: 3,
			//   inventory: 462,
			//   currentPrice: 59,
			//   originalPrice: 119
			// },
			// {
			//   id: '3',
			//   title: '栋企鸡团购特惠限时拼团59元享原价119',
			//   cover: 'https://www.tcgz.store/files/index/index-04.png',
			//   limit: 3,
			//   inventory: 462,
			//   currentPrice: 59,
			//   originalPrice: 119
			// },
			// {
			//   id: '4',
			//   title: '栋企鸡团购特惠限时拼团59元享原价119',
			//   cover: 'https://www.tcgz.store/files/index/index-04.png',
			//   limit: 3,
			//   inventory: 462,
			//   currentPrice: 59,
			//   originalPrice: 119
			// },
		],
	},
	//监听页面初次加载
	onLoad: function (options) {
		this.setData({
				type:options.type
		})
		this.getList();
	},
	//监听页面显示
	onShow: function () {},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	goDetail(e) {
		console.log(e);
		wx.navigateTo({
			url: "/pages/goods/group_detail/group_detail?id=" + e.currentTarget.dataset.id + "&&type=3",
		});
	},

	// 商品列表
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
			url: "us/groupPro/List",
			params: {
				pageNo: this.data.pageNo,
				pageSize: this.data.pageSize,
				adCode:wx.getStorageSync('adcode'),
				type:this.data.type
			},
			success: (res) => {
				console.log(res);
				if(res.list.length == 0&&this.data.list.length==0) this.data.isNull = true
				console.log(res.length);
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
