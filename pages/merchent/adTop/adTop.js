// pages/merchent/adTop/adTop.js
const app = getApp();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		active: "0",
		finish: "",
		pageNo: 0,
		pageNoMy: 0,
		pageSize: 30,
		loading: false,
		list: [],
		Mylist: [],
		ruleShow: false,
		descShow: false,
		category: [],
		categoryObj: {},
		ruleData: "",
		MyTimer: false,
		count: 1,
		selectData: {}, // 选中的 竞价

		// 调整价格弹窗
		adjustShow: false,
		adjustId: "",
		adjustPrice: "",
		adjustAmount: "",
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.getListBid();
		this.onResize();
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},
	onFinish() {
		console.log("倒计时结束");
		setTimeout(() => {
			this.setData({
				finish: false,
				loading: false,
				pageNo: 0,
				pageNoMy: 0,
				list: [],
				Mylist: [],
			});
			if (this.data.active == 0) {
				this.getListBid();
			} else if (this.data.active == 1) {
				this.getMyListBid("", 2);
			} else {
				this.getMyListBid(1);
			}
		}, 1000);
	},
	// 输入价格
	omChangeSteAdjust(e) {
		this.setData({
			adjustAmount: e.detail,
		});
	},
	// 确认 调整价格
	submitAdAdjust() {
		wx.showLoading({
			title: "正在出价",
		});
		app.request.post({
			url: "mt/bid/updateBit",
			myType: 1,
			params: {
				amount: this.data.adjustAmount,
				bidUserId: this.data.adjustId,
			},
			success: (res) => {
				wx.showToast({
					title: "出价成功",
				});
				this.setData({
					adjustShow: false,
				});
				setTimeout(() => {
					this.setData({
						finish: false,
						pageNo: 0,
						pageNoMy: 0,
						list: [],
					});
					this.getMyListBid("", 2);
				}, 500);
			},
			fail: (err) => {},
			finally: () => {
				wx.hideLoading();
			},
		});
	},
	// 打开 调整价格弹窗
	adjust_onOpen(e) {
		this.setData({
			adjustId: e.currentTarget.dataset.obj.id,
			adjustPrice: e.currentTarget.dataset.obj.offerAmount,
			adjustShow: true,
			adjustAmount: e.currentTarget.dataset.obj.offerAmount,
		});
	},
	// 关闭 调整价格弹窗
	adjust_onClose() {
		this.setData({
			adjustShow: false,
		});
	},
	// 跳转 上传
	toUploading(e) {
		let obj = e.currentTarget.dataset.obj;
		let categoryId = obj.cityBidUser.type ==3? obj.cityBidUser.categoryId:''
		wx.navigateTo({
			url: `/pages/merchent/uploadingImg/uploadingImg?id=${obj.cityBidUser.id}&type=${obj.cityBid.type}&categoryId=${ categoryId|| ""}`,
		});
	},
	// 跳转 排行记录
	toRanking(e) {
		let id = e.currentTarget.dataset.obj.cityBidUser.id;
		console.log(e);
		wx.navigateTo({
			url: `/pages/merchent/rankingRecord/rankingRecord?id=${id}`,
		});
	},
	// 跳转 查看
	toDetail(e) {
		let id = e.currentTarget.dataset.obj.cityBidUser.id;
		wx.navigateTo({
			url: `/pages/merchent/adDetail/adDetail?id=${id}`,
		});
	},
	// 提交 参与竞价
	submitAd() {
		if (this.data.selectData.type == 3 && !this.data.categoryObj.id) {
			return wx.showToast({
				title: "请选择分类",
				icon: "none",
			});
		}
		wx.showLoading({
			title: "正在出价",
		});
		wx.requestSubscribeMessage({
			tmplIds: ["zUr1XGbBJVAmh2pED1zMfcjHKowjFYMM3UVIpPp9O7E", "kizXEIVeq6E1Ry2vIX1Z1M-U57ADhQLKaM1B9Qkp7bo", "FkBnl12DycgI7yBTR6-TfngWwz0UwXTkOLzlgOUszgU"],
			success(res) {},
		});
		app.request.post({
			url: "mt/bid/submitBit",
			myType: 1,
			params: {
				amount: this.data.count,
				id: this.data.selectData.id,
				categoryId: this.data.categoryObj.id || "",
			},
			success: (res) => {
				wx.showToast({
					title: "参与成功",
				});
				this.setData({
					descShow: false,
				});
				this.selectComponent("#tabs").setData({
					active: "1",
				});

				// this.getMyListBid('',2);
			},
			fail: (err) => {},
			finally: () => {
				wx.hideLoading({});
			},
		});
	},
	// 参与出价
	omChangeSte(e) {
		console.log(e);
		if (e.detail < this.data.selectData.amount) {
			this.setData({
				count: this.data.selectData.amount,
			});
		} else {
			this.setData({
				count: e.detail,
			});
		}
	},
	// 选择类目
	deliveryChange(e) {
		console.log(e);
		this.setData({
			categoryObj: this.data.category[e.detail.value],
		});
	},
	// 打开 规则弹窗
	openRule() {
		this.setData({
			ruleShow: true,
		});
	},
	// 关闭 规则弹窗
	onRuleClose() {
		this.setData({
			ruleShow: false,
		});
	},
	// 打开 可参与弹窗
	openDesc(e) {
		this.setData({
			selectData: e.currentTarget.dataset.obj,
			count: e.currentTarget.dataset.obj.amount,
			descShow: true,
		});
	},
	// 关闭 可参与弹窗
	desc_onClose() {
		this.setData({
			descShow: false,
			selectData: {},
		});
	},
	onChange(e) {
		this.setData({
			finish: false,
			loading: false,
			pageNoMy: 0,
			pageNo: 0,
			active: e.detail.name,
			list: [],
			Mylist: [],
		});
		console.log("onChange");
		if (e.detail.name == 0) {
			this.getListBid();
		} else if (e.detail.name == 1) {
			this.getMyListBid("", 2);
		} else {
			this.getMyListBid(1, 2);
		}
	},
	toMyBid() {
		// this.selectComponent("#tabs").setData({
		// 	active: '2',
		// });
		console.log("toMyBid");
		this.setData({
			finish: false,
			loading: false,
			pageNo: 0,
			pageNoMy: 0,
			active: "2",
			list: [],
			Mylist: [],
		});
		this.getMyListBid(1, 2);
	},
	isType(i) {
		switch (i) {
			case 0:
				return "首页轮播";
			case 1:
				return "好物轮播";
			case 2:
				return "好店轮播";
			case 3:
				return "商品分类";
			case 4:
				return "拼团列表";
			case 5:
				return "秒杀列表";
		}
	},
	getListBid() {
		if (this.data.finish || this.data.loading) return;
		this.setData({
			loading: true,
			pageNo: this.data.pageNo + 1,
		});
		app.request.post({
			url: "mt/bid/list",
			myType: 1,
			params: {
				pageNo: this.data.pageNo,
				pageSize: 1000,
			},
			success: (res) => {
				console.log(res);
				res.list.forEach((element) => {
					element.dey = element.bidStartTime - Date.now();
					element.deyEnd = element.bidEndTime - Date.now();
					element.typeTitle = this.isType(element.type);
				});
				if (res.bidRule.blodValue) {
					res.bidRule.blodValue = res.bidRule.blodValue.replace(/\<img(.*?)src/g, '<img style="max-width:100%!important;height:auto!important;display:block;" src'); // 图片适配
					res.bidRule.blodValue = res.bidRule.blodValue.replace(/\<p/g, '<p style="line-height:1.8;word-break: break-all;"'); // p标签样式
					res.bidRule.blodValue = res.bidRule.blodValue.replace(/\<font color="/g, '<font style="color:'); // 字体颜色转换
				}
				this.setData({
					list: [...this.data.list, ...res.list],
					ruleData: res.bidRule,
					category: res.category,
				});
				if (res.list.length < this.data.pageSize) {
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
	getMyListBid(myStatus, type) {
		if (this.data.finish || (this.data.loading && type != 2) || this.data.MyTimer) return;
		this.setData({
			loading: true,
			// MyTimer: true,
			pageNoMy: this.data.pageNoMy + 1,
		});
		app.request.post({
			url: "mt/bid/myList",
			myType: 1,
			params: {
				myStatus: myStatus == 1 ? myStatus : "",
				pageNo: this.data.pageNoMy,
				pageSize: this.data.pageSize,
			},
			success: (res) => {
				res.list.forEach((element) => {
					if(element.cityBid){
						element.cityBid.dey = element.cityBid.bidStartTime - Date.now()||0
						element.cityBid.deyEnd = element.cityBid.bidEndTime - Date.now()||0
						element.cityBid.typeTitle = this.isType(element.cityBid.type)||'';
					}
				});
				console.log(res);

				if (type == 2) {
					this.setData({
						Mylist: res.list,
					});
				} else {
					this.setData({
						Mylist: [...this.data.Mylist, ...res.list],
					});
				}
				if (res.list.length < this.data.pageSize) {
					this.setData({
						finish: true,
					});
				}
			},
			finally: () => {
				this.setData({
					loading: false,
				});
				// setTimeout(() => {
				// 	this.setData({
				// 		MyTimer: false,
				// 	});
				// }, 200);
			},
		});
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		this.socket();
	},
	socket() {
		wx.onSocketMessage((res) => {
			console.log(res);
			if (res.data.includes("queue/merchantBid/sendMessage")&&this.data.Mylist.length) {
				if (!this.data.loading) {
					console.log("socket 刷新");
					// console.log(res.splice("/n"));
					this.setData({
						finish: false,
						// loading: false,
						pageNo: 0,
						pageNoMy: 0,
						list: [],
						// Mylist: [],
					});
					this.getListBid();
					this.getMyListBid("", 2);
				}
			}
			// pageNo 重叠的原因导致 我参与列表不出现
		});
	},
	onResize() {
		wx.event.on("adTop", () => {
			this.setData({
				finish: false,
				loading: false,
				pageNo: 0,
				pageNoMy: 0,
			});
			this.getMyListBid(1, 2);
		});
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {
		// wx.ws.closeSocket();
	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {
		wx.event.off("adTop");
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {
		if (this.data.active == 1) {
			this.getMyListBid();
		} else {
			this.getMyListBid(1);
		}
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {},
});
