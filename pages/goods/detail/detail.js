const app = getApp();
import common from "../../../utils/common";

Page({
	data: {
		app:app,
		isLoging:0,
		isShare: false,
		isDesc: false,
		value: 3,
		mybar: true,
		type: 1, //1:普通  2：秒杀
		time: 30 * 60 * 60 * 1000,
		timeData: {},
		startTime: "", //预览时间

		// 生成图片的链接
		shareImagePath: "",

		id: "",
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

		// 标签
		coupon:[],
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
		console.log("商品详情");
		console.log(options);
		this.setData({
			app,
			type: options.type,
			id: options.id,
			agentId: options.agentId || "",
		});
		this.getDetail(options.id);
		options.agentId && wx.setStorageSync("agentIdoptions", options);
		let token = wx.getStorageSync("token") || "";
		if (token) {
			this.data.agentId && this.binding(this.data.agentId);
		}
	},
	//监听页面显示
	onShow: function () {
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
	},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	// 刷新
	handRefresh(){
		this.getDetail(this.data.id)
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
	goEvaluate() {
		wx.navigateTo({
			url: "/pages/goods/evaluate/evaluate?id=" + this.data.id,
		});
	},
	goShop() {
		wx.navigateTo({
			url: "/pages/shop/detail/detail?id=" + this.data.shop.id,
		});
	},
	goSettle() {
		// let agentId=`&agentId=${this.data.agentId}`
		wx.navigateTo({
			url: "/pages/order/confirm/order/order?type=" + this.data.type + "&id=" + this.data.id,
		});
	},
	// 打电话
	freeTell() {
		if (!this.data.shop.phone) {
			wx.showToast({
				title: "没有电话",
				icon: "none",
			});
			return;
		}
		wx.makePhoneCall({
			phoneNumber: this.data.shop.phone,
		});
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
		id = id ? id : 51;
		wx.showLoading({
			title: "加载中...",
		});
		app.request.post({
			url: "user/pro/public/proDetails",
			params: {
				id,
			},
			success: (res) => {
				
				let bannerList = res.merchantPro.banner.split(",");
				res.merchantPro.description = res.merchantPro.description.replace(/\<img/g, '<img style="max-width:100%;height:auto;display:block;" class="graphic"');
				res.merchantPro.description = res.merchantPro.description.replace(/\<font color="/g, '<font style="color:'); // 字体颜色转换
				
				if (res.eva) {
					res.eva.imgArr = res.eva.img ? res.eva.img.split(",") : [];
				}
				if(res.merchantPro.carriage){
					res.merchantPro.carriage = JSON.parse(res.merchantPro.carriage)
				}
				let coupon = {};//优惠卷
				let afterSellIdent = [];// 标签
				if(res.coupon)coupon = res.coupon
				if(res.merchantPro.afterSellIdent)afterSellIdent = res.merchantPro.afterSellIdent.split(',')||[]
				this.setData({
					goods: res.merchantPro,
					shop: res.merchantShop,
					bannerList,
					evaluate: res.eva,
					isCollect: res.FavoriteStatus,
					app,
					isLoging:1,
					coupon,
					afterSellIdent
				});
				wx.hideLoading();
			},
			fail:()=>{
				
				this.setData({
					isLoging:-1
				})
			},
			error:()=>{
				this.setData({
					isLoging:-1
				})
			}
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
	articleRead() {
		if(this.data.isLoging==-1)return
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
	// 显示优惠券弹窗
	reductionShow() {
		this.setData({
			isDesc: !this.data.isDesc,
		});
	},

	// 分享数据
	getShareInfo() {
		let child = this.selectComponent("#goodscanvas");
		child.go();
	},
	getInfo() {
		app.request.post({
			url: "user/info/totalAssets",
			success: (res) => {
				wx.setStorageSync("userId", res.id);
			},
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
	onHide: function () {
		this.articleRead();
	},
	//监听页面卸载
	onUnload: function () {
		this.articleRead();
	},
	onShareAppMessage(e) {
		this.getInfo();
		let userId = wx.getStorageSync("userId");
		console.log(userId);
		return {
			title: this.data.goods.name,
			path: `pages/goods/detail/detail?agentId=${userId}&id=${this.data.goods.id}&type=1`,
			imageUrl: app.common.fullPath(this.data.goods.cover),
		};
	},
	//监听用户下拉动作
	onPullDownRefresh: function () {},
	//监听用户下拉动作
	onPullDownRefresh: function () {},
	//用户上拉触底事件的处理函数
	onReachBottom: function () {},
	//用户点击右上角转发
	onshareAppMessage: function () {},
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
