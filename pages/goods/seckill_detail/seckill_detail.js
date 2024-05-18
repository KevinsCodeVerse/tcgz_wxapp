const app = getApp();
Page({
	data: {
		app: app,
		isNull: 0, // 是否有该商品
		value: 3,
		mybar: true,
		type: 2, //1:普通  2：秒杀
		countDown: 0,
		timeData: {},
		OpentimeData:{},//开始倒计时
		agentId: "", // 推荐人 id
		staryTime: "", //预览时间
		loading:false,
		id: "",
		seckillId: "",
		goods: {},
		shop: {},
		bannerList: [],
		evaList: [],
		evaluate: {},
		isCollect: -1,
		productList: [
			{
				id: 1,
				title: "水果生鲜",
				cover: "https://www.tcgz.store/files/index/index-01.png",
				discount: 7.6,
				countrymen: 1,
				currentPrice: 129,
				originalPrice: 288,
				countrymenPrice: 99,
				sales: 86,
			},
			{
				id: 2,
				title: "紫丁香主题酒店总统套房-不含早（预付+到付）",
				cover: "https://www.tcgz.store/files/index/index-06.png",
				discount: 0,
				countrymen: 0,
				currentPrice: 1299,
				originalPrice: 2888,
				countrymenPrice: 888,
				sales: 888,
			},
		],
		agentId: "",
		proId: "",
		// 优惠券
		isDesc: false,
	},
	//监听页面初次加载
	onLoad: function (options) {
		// this.shareOpen()
		if (options.scene) {
			let scene = decodeURIComponent(options.scene);
			scene = scene.split(",");
			console.log(scene);
			options.agentId = scene[0];
			options.id = scene[1];
			options.type = scene[2];
			options.scene = "";
		}
		console.log("秒杀商品详情");
		console.log(options);
		this.setData({
			type: options.type || 2,
			seckillId: options.id,
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
	//监听页面显示
	onShow: function () {
		this.getDetail(this.data.seckillId);
		this.setData({
			startTime: new Date().getTime(),
		});
		var pages = getCurrentPages(); //页面指针数组
		var prepage = pages[pages.length - 2]; //上一页
		if (pages.length >= 2) {
			if (prepage.route == "pages/index/index") {
				wx.setStorageSync("backGoods", 1);
			}
		}

		wx.setNavigationBarColor({
			frontColor: "#ffffff",
			backgroundColor: "#ff6040",
		});
	},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	goEvaluate() {
		wx.navigateTo({
			url: "/pages/goods/evaluate/evaluate?id=" + this.data.proId,
		});
	},
	goShop() {
		wx.navigateTo({
			url: "/pages/shop/detail/detail?id=" + this.data.shop.id,
		});
	},
	goSettle() {
		wx.navigateTo({
			url: "/pages/order/confirm/seckill/seckill?type=2&id=" + this.data.seckillId,
		});
	},
	// 倒计时改变时
	onChange(e) {
		this.setData({
			timeData: e.detail,
		});
	},
	// 倒计时 准备开始改变时
	onChangeOpen(e) {
		this.setData({
			OpentimeData: e.detail,
		});
	},

	// 打电话
	freeTell() {
		if (!this.data.shop.phone) {
			wx.showToast({ title: "没有电话", icon: "none" });
			return;
		}
		wx.makePhoneCall({
			phoneNumber: this.data.shop.phone,
		});
	},
	// 倒计时结束
	onFinish() {
		this.getDetail(this.data.seckillId);
		wx.stopPullDownRefresh()

	},
	// 导航
	toOpenNav() {
		let latitude = parseFloat(this.data.shop.latitude);
		let longitude = parseFloat(this.data.shop.longitude);
		let name = this.data.shop.name;
		let address = this.data.shop.address;
		wx.openLocation({
			latitude: latitude,
			longitude: longitude,
			name: name,
			address: address,
			scale: 16,
		});
	},
	// -----------------------------------------接口-----------------------------------------------
	getDetail(id) {
		if(this.data.loading)return
		id = id ? id : this.data.seckillId;
		wx.showLoading({
			title: "加载中...",
		});
		this.setData({
			loading:true
		})
		app.request.post({
			url: "user/spike/proDetails",
			params: {
				id,
			},
			success: (res) => {
				let bannerList = res.merchantSpikePro.banner.split(","),staryTime;
				res.merchantSpikePro.content = res.merchantSpikePro.content.replace(/\<img/g, '<img style="max-width:100%;height:auto;display:block;" class="graphic"');
				if (res.eva) res.eva.imgArr = res.eva.img ? res.eva.img.split(",") : []// 评论信息
				if(res.merchantSpikePro.status==0) staryTime = res.merchantSpikePro.startTime - Date.now()	// 开始倒计时
				if(res.merchantSpikePro.carriage){
					res.merchantSpikePro.carriage = JSON.parse(res.merchantSpikePro.carriage)
				}
				let coupon = {};//优惠卷
				let afterSellIdent = [];// 标签
				if(res.coupon)coupon = res.coupon
				if(res.merchantSpikePro.afterSellIdent)afterSellIdent = res.merchantSpikePro.afterSellIdent.split(',')||[]
				this.setData({
					staryTime,
					goods: res.merchantSpikePro,
					shop: res.merchantShop,
					bannerList,
					evaluate: res.eva,
					isCollect: res.FavoriteStatus,
					countDown: res.overTime < 0 ? 0 : res.overTime,
					id: res.merchantSpikePro.shopId,
					isNull: 1,
					proId: res.merchantSpikePro.proId,
					coupon,
					afterSellIdent
				});
				wx.hideLoading();
			},
			fail: () => {
				this.setData({
					isNull: -1,
				});
			},
			finally:()=>{
				this.setData({
					loading:false
				});
			},
			error:()=>{
				this.setData({
					isNull:-1,
				})
			}
		});
	},
	// 刷新
	handRefresh() {
		this.getDetail(this.data.id);
	},
	// 分享数据
	getShareInfo() {},
	// 收藏
	toCollet() {
		let status = this.data.isCollect == 1 ? -1 : 1;
		app.request.post({
			url: "user/pro/favorites",
			params: {
				id: this.data.seckillId,
				status,
				type: 2,
				machine: app.globalData.model,
			},
			success: (res) => {
				wx.showToast({ title: status == 1 ? "已收藏" : "取消收藏成功", icon: "none" });
				this.getDetail(this.data.seckillId);
			},
		});
	},
	// 埋点
	articleRead() {
		let token = wx.getStorageSync("token");
		if (!token) {
			return;
		}
		let endTime = new Date().getTime();
		let timeLen = endTime - this.data.startTime;
		let minutes = parseInt(timeLen / 1000 / 60);
		let seconds = parseInt((timeLen / 1000) % 60);
		timeLen = minutes + "分" + seconds + "秒";
		app.request.post({
			url: "user/pro/proData",
			params: {
				id: this.data.id,
				machine: app.globalData.model,
				readTime: timeLen,
				type: this.data.type,
			},
		});
	},
	// 绑定上级
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
	getInfo() {
		app.request.post({
			url: "user/info/totalAssets",
			success: (res) => {
				wx.setStorageSync("userId", res.id);
			},
		});
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
					this.getDetail(this.data.seckillId)
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
	onHide: function () {
		// this.articleRead();
	},
	//监听页面卸载
	onUnload: function () {
		// this.articleRead();
	},
	//监听用户下拉动作 
	onPullDownRefresh: function () {
		this.onFinish()
	},
	//用户上拉触底事件的处理函数
	onReachBottom: function () {},
	//用户点击右上角转发
	onShareAppMessage: function (res) {
		this.getInfo();
		let userId = wx.getStorageSync("userId");
		console.log(userId);
		return {
			title: this.data.goods.title,
			path: `pages/goods/seckill_detail/seckill_detail?agentId=${userId}&id=${this.data.goods.id}&type=2`,
			imageUrl: app.common.fullPath(this.data.goods.avatar),
		};
	},
	// 监听页面滚动
	onPageScroll(e) {
		if (e.scrollTop > 250) {
			this.setData({ mybar: false });
		} else {
			this.setData({ mybar: true });
		}
	},
});
