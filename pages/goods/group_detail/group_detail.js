const app = getApp();
Page({
	data: {
		value: 3,
		isLoging: 0,
		mybar: true,
		type: 3, //1:普通  2：秒杀   3.组团
		time: 30 * 60 * 60 * 1000,
		timeData: {},
		goods: {},
		bannerList: [],
		detail: {},
		shopDetails: {},
		id: "",
		productList: [],
		atTime: "",
		// 优惠券
		isDesc: false,
	},
	//监听页面初次加载
	onLoad: function (options) {
		if (options.scene) {
			let scene = decodeURIComponent(options.scene);
			scene = scene.split(",");
			console.log(scene);
			options.agentId = scene[0];
			options.id = scene[1];
			options.type = scene[2];
			options.scene = "";
		}
		console.log("拼团商品详情");
		console.log(options);
		this.setData({
			type: options.type || 3,
			id: options.id,
			agentId: options.agentId || "",
		});
		this.getDetail(options.id);
		// this.getUserInfo() // 静默登录
		options.agentId && wx.setStorageSync("agentIdoptions", options);
		let token = wx.getStorageSync("token") || "";
		if (token) {
			this.data.agentId && this.binding(this.data.agentId);
		}
	},
	//监听页面显示
	onShow: function () {
		this.data.id && this.getDetail(this.data.id);
	},
	// 刷新
	handRefresh() {
		this.getDetail(this.data.id);
	},
	// 绑定
	binding(agentId) {
		app.request.post({
			url: "user/invite/binding",
			params: {
				agentId,
			},
			success: () => {
				console.log("绑定成功!" + agentId);
			},
		});
	},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	goEvaluate() {
		if (!this.data.evaluate) {
			wx.showToast({
				title: "暂无评论!",
				icon: "none",
			});
			return;
		}
		wx.navigateTo({
			url: "/pages/goods/evaluate/evaluate?id=" + this.data.proId,
		});
	},
	// 跳转 商铺
	goShop() {
		wx.navigateTo({
			url: "/pages/shop/detail/detail?id=" + this.data.shopDetails.id,
		});
	},
	//跳转 更多拼团
	goGroupMoreList() {
		wx.navigateTo({
			url: `/pages/goods/group_detail/group_more_list/group_more_list?id=${this.data.id}`,
		});
	},
	
	// 倒计时改变时
	onChange(e) {
		this.setData({
			timeData: e.detail,
		});
	},
	toNo() {
		wx.showToast({
			title: "敬请期待",
			icon: "none",
		});
	},
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
	// 跳转普通商品 订单
	goDetail() {
		wx.navigateTo({
			url: "/pages/order/confirm/order/order?type=1&id=" + this.data.detail.proId,
		});
	},
	// 收藏
	toCollet() {
		let status = this.data.isCollect == 1 ? -1 : 1;
		app.request.post({
			url: "user/pro/favorites",
			params: {
				id: this.data.id,
				status,
				machine: app.globalData.model,
				type: this.data.type,
			},
			success: (res) => {
				wx.showToast({
					title: status == 1 ? "已收藏" : "取消收藏成功",
					icon: "none",
				});
				this.getDetail(this.data.id);
			},
		});
	},
	// 请求详情
	getDetail(id) {
		wx.showLoading({
			title: "加载中...",
		});
		app.request.post({
			url: "us/groupPro/details",
			params: {
				id,
			},
			success: (res) => {
				if (res.merchantGroupPro.content) {
					res.merchantGroupPro.content = res.merchantGroupPro.content.replace(/\<img/g, '<img style="max-width:100%;height:auto;display:block;" class="graphic"');
				}
	
				if (res.eva) {
					res.eva.imgArr = res.eva.img ? res.eva.img.split(",") : [];
				}
				let bannerList = res.merchantGroupPro.imgs.split(",");
				if(res.merchantGroupPro.carriage){
					res.merchantGroupPro.carriage = JSON.parse(res.merchantGroupPro.carriage)
				}
				let coupon = {}; //优惠卷
				let afterSellIdent = []; // 标签
				if (res.coupon) coupon = res.coupon;
				if (res.merchantGroupPro.afterSellIdent) afterSellIdent = res.merchantGroupPro.afterSellIdent.split(",") || [];
				this.setData({
					bannerList,
					detail: res.merchantGroupPro,
					evaluate: res.eva,
					shopDetails: res.shopDetails,
					isCollect: res.FavoriteStatus,
					proId: res.merchantGroupPro.proId,
					groupUsersAll: res.groupSpellUsers || [],
					isLoging: 1,
					atTime: res.merchantGroupPro.openGroupTime - Date.now(),
					coupon,
					afterSellIdent,
				});
			},
			fail: () => {
				this.setData({
					isLoging: -1,
				});
			},
			finally: (res) => {
				wx.hideLoading();
				wx.stopPullDownRefresh();
			},
			error:()=>{
				this.setData({
					isLoging:-1
				})
			}
		});
	},
	// 打电话
	freeTell() {
		if (!this.data.shopDetails.phone) {
			wx.showToast({
				title: "没有电话",
				icon: "none",
			});
			return;
		}
		wx.makePhoneCall({
			phoneNumber: this.data.shopDetails.phone,
		});
	},
	// 导航
	toOpenNav() {
		let latitude = parseFloat(this.data.shopDetails.latitude);
		let longitude = parseFloat(this.data.shopDetails.longitude);
		let name = this.data.shopDetails.name;
		let address = this.data.shopDetails.address;
		wx.openLocation({
			latitude: latitude,
			longitude: longitude,
			name: name,
			address: address,
			scale: 16,
		});
	},
	// 获取 userId
	getInfo() {
		app.request.post({
			url: "user/info/totalAssets",
			success: (res) => {
				wx.setStorageSync("userId", res.id);
			},
		});
	},
	// 倒计时结束
	onFinish() {
		this.getDetail(this.data.id);
	},

	// 显示优惠券弹窗 ------------------------------------------------------------------------------------------------------
	reductionShow() {
		this.setData({
			isDesc: !this.data.isDesc,
		});
	},
	// 领取优惠券
	bindCoupon(e){
		console.log(e);
		let id = e.currentTarget.dataset.id
		app.request.post({
			url: "user/coupon/getCoupon",
			params: {
				id,
			},
			success: (res) => {
				wx.showToast({
				  title: '领取成功',
				  mask:true
				})
				setTimeout(() => {
					this.getDetail(this.data.id)
				}, 1000);
			},
			fail: (err) => {
				
			},
			finally: () => {
				
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
	onPullDownRefresh: function () {
		this.onFinish();
	},

	//用户上拉触底事件的处理函数
	onReachBottom: function () {},
	//用户点击右上角转发
	onShareAppMessage: function (res) {
		this.getInfo();
		let userId = wx.getStorageSync("userId");
		console.log(userId);
		return {
			title: `${this.data.detail.title} 限时拼团! 现只需 ￥${this.data.detail.price} 元`,
			path: `pages/goods/group_detail/group_detail?agentId=${userId}&id=${this.data.detail.id}&type=3`,
			imageUrl: app.common.fullPath(this.data.detail.avatar),
		};
	},
	// 监听页面滚动
	onPageScroll(e) {
		if (e.scrollTop > 250) {
			this.setData({
				mybar: false,
			});
		} else {
			this.setData({
				mybar: true,
			});
		}
	},
});
