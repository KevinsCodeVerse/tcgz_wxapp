const app = getApp();
// 引入SDK核心类
var QQMapWX = require("../../libs/qqmap-wx-jssdk.min.js");
// 实例化API核心类
var qqmapsdk = new QQMapWX({
	key: "L63BZ-6CDLU-WCVVN-2OL5O-2K4I2-ZEBNB", // 必填
});

Page({
	data: {
		showMore: "",
		SildeList: [],
		tab: 1,
		searchValue: "",
		navBarHeight: app.globalData.navBarHeight, //导航栏高度
		paddingTop: app.globalData.navBarHeight + 40,
		value: "",
		showIndustry: false,
		classifyList: [],
		active: -1,
		cityName: "",

		// 分页参数
		pageNo: 0,
		pageSize: 10,
		finish: false,
		loading: false,
		productList: [
			// {
			//   id: 2,
			//   title: '紫丁香主题酒店总统套房-不含早（预付+到付）',
			//   cover: 'https://www.tcgz.store/files/index/index-06.png',
			//   discount: 0,
			//   countrymen: 0,
			//   currentPrice: 1299,
			//   originalPrice: 2888,
			//   countrymenPrice: 888,
			//   sales: 888
			// },
		],

		groupSeckill: {}, //拼团秒杀数据
	},
	//监听页面初次加载
	onLoad: function (options) {
		let latitude = wx.getStorageSync("latitude");
		let longitude = wx.getStorageSync("longitude");
		let city = wx.getStorageSync("cityName");
		this.setData({
			cityName: city,
			latitude: latitude,
			longitude: longitude,
			app,
		});
		this.getClassify();
		this.getList();
		this.getSilde();
	},
	//监听页面显示
	onShow: function () {
		let cityName = wx.getStorageSync("cityName");
		if (cityName != this.data.cityName) {
			this.setData({
				active: -1,
				pageNo: 0,
				finish: false,
				loading: false,
				productList: [],
				cityName,
			});
			this.getList();
			this.getSilde();
		}
		// if(!wx.getStorageSync('backGoods')){
		//   this.getSite();
		//   this.setData({
		//     tab: 1,
		//     pageNo: 0,
		//     finish: false,
		//     loading: false,
		//     productList: [],
		//   })
		//   this.getList();
		// }
		// wx.removeStorageSync('backGoods')
	},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	toSearch(e) {
		wx.navigateTo({
			url: "/pages/index/search/search?value=" + e.detail,
		});
	},

	toSeckill() {
		wx.navigateTo({
			url: `/pages/index/seckill/seckill?type=${this.data.tab}`,
		});
	},
	toGroup() {
		wx.navigateTo({
			url: `/pages/index/group/group?type=${this.data.tab}`,
		});
	},
	// 点击轮播图
	handSwiper(e) {
		let data = e.currentTarget.dataset.obj;
		if (data.url != "undefined") {
			wx.navigateTo({
				url: data.url,
			});
		}
	},
	tabChange(e) {
		this.setData({
			tab: e.currentTarget.dataset.id,
			pageNo: 0,
			finish: false,
			loading: false,
			productList: [],
		});
		this.getList();
	},
	getSilde() {
		app.request.post({
			url: "user/sysIndustry/public/bannerList",
			params: {
				type: 1,
				cityCode: wx.getStorageSync("adcode"),
			},
			success: (res) => {
				this.setData({
					SildeList: res,
				});
			},
			fail: (err) => {},
			finally: () => {},
		});
	},
	classifyChange(e) {
		this.setData({
			active: e.currentTarget.dataset.id,
			pageNo: 0,
			finish: false,
			loading: false,
			showMore: false,
			productList: [],
		});
		this.getList();
	},
	// 跳转拼团
	goGroupDetail(e) {
		wx.navigateTo({
			url: "/pages/goods/group_detail/group_detail?id=" + e.currentTarget.dataset.id + "&type=3",
		});
	},
	// 跳转秒杀
	goSeckillDetail(e) {
		wx.navigateTo({
			url: "/pages/goods/seckill_detail/seckill_detail?id=" + e.currentTarget.dataset.id,
		});
	},
	// 跳转商品详情
	goDetail(e) {
		let obj = e.currentTarget.dataset.obj;
		if (obj.video) {
			wx.navigateTo({
				url: "/pages/goods/g_video/index?id=" + obj.id + "&type=1",
			});
		} else if (obj.type == 3) {
			wx.navigateTo({
				url: "/pages/goods/group_detail/group_detail?id=" + obj.id,
			});
		} else {
			wx.navigateTo({
				url: "/pages/goods/detail/detail?id=" + obj.id + "&type=1",
			});
		}
	},
	toNo() {
		wx.showToast({
			title: "敬请期待",
			icon: "none",
		});
	},
	// 获取位置
	getSite() {
		if (!wx.getStorageSync("latitude")) {
			wx.getLocation({
				type: "gcj02", // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
				success: function (res) {
					wx.setStorageSync("latitude", res.latitude);
					wx.setStorageSync("longitude", res.longitude);
				},
			});
		}
		let latitude = wx.getStorageSync("latitude");
		let longitude = wx.getStorageSync("longitude");
		this.setData({
			latitude: latitude,
			longitude: longitude,
		});
		let that = this;
		qqmapsdk.reverseGeocoder({
			//位置坐标，默认获取当前位置，非必须参数
			location: {
				latitude: latitude,
				longitude: longitude,
			},
			success: (res) => {
				//成功后的回调
				var res = res.result;
				that.setData({ cityName: res.ad_info.city });
				wx.setStorageSync("address", res.ad_info.province + "-" + res.ad_info.city);
				wx.setStorageSync("cityName", res.ad_info.city);
			},
			fail: function (error) {
				console.error(error);
			},
		});
	},
	// -------------------------------------------------------接口----------------------------------------------------
	getClassify() {
		app.request.post({
			url: "user/info/public/proCategory",
			success: (res) => {
				res.unshift({ id: "-1", name: "推荐" });
				this.setData({ classifyList: res });
			},
		});
	},
	// 拼团秒杀 推荐
	groupSeckill() {
		app.request.post({
			url: "user/pro/indexRecommend",
			params: {
				adCode: wx.getStorageSync("adcode"),
				type:this.data.tab
			},
			success: (res) => {
				this.setData({
					groupSeckill: res,
				});
			},
		});
	},
	//more
	more() {
		this.setData({
			showMore: !this.data.showMore,
		});
	},
	// 请求列表
	getList() {
		if (this.data.loading || this.data.finish) return;
		this.groupSeckill();
		this.setData({
			loading: true,
			pageNo: this.data.pageNo + 1,
		});
		let adCode = wx.getStorageSync("adcode");
		app.request.post({
			url: "user/pro/public/indexList",
			params: {
				categoryId: this.data.active,
				type: this.data.tab,
				pageNo: this.data.pageNo,
				pageSize: this.data.pageSize,
				longitude: wx.getStorageSync('longitude_new')||wx.getStorageSync('longitude'),
				latitude: wx.getStorageSync('latitude_new')||wx.getStorageSync('longitude'),
				adCode,
			},
			success: (res) => {
				res.list.forEach((item) => {
					if (item.friendPrice && item.price) {
						item.discount = ((item.friendPrice / item.price) * 10).toFixed(1);
					} else {
						item.discount = 10;
					}
				});
				let list = this.data.productList.concat(res.list);
				this.setData({
					productList: list,
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
				wx.stopPullDownRefresh();
			},
		});
	},

	// 切换城市
	toAreaCal(e) {
		let clickaddress = this.selectComponent("#clickaddress");
		clickaddress.setData({
			showArea: !clickaddress.data.showArea,
		});
	},

	// 切换完城市后
	handresize(e) {
		this.setData({
			cityName: wx.getStorageSync("cityName"),
		});
		setTimeout(() => {
			this.setData({
				active: -1,
				pageNo: 0,
				finish: false,
				loading: false,
				productList: [],
			});
			this.getList();
			this.getSilde();
		}, 500);
	},

	//监听页面初次加载完成
	onReady: function () {},
	//监听页面隐藏
	onHide: function () {},
	//监听页面卸载
	onUnload: function () {},
	//监听用户下拉动作
	onPullDownRefresh: function () {
		let latitude = wx.getStorageSync("latitude");
		let longitude = wx.getStorageSync("longitude");
		let city = wx.getStorageSync("cityName");
		this.setData({
			cityName: city,
			latitude: latitude,
			longitude: longitude,
			active: -1,
			pageNo: 0,
			finish: false,
			loading: false,
			productList: [],
		});
		this.getClassify();
		this.getList();
		this.getSilde();
	},
	//监听用户下拉动作
	//用户上拉触底事件的处理函数
	onReachBottom: function () {
		this.getList();
	},
	//用户点击右上角转发
	onshareAppMessage: function () {},
});
