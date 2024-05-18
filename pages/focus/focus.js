const app = getApp();
// 引入SDK核心类
var QQMapWX = require("../../libs/qqmap-wx-jssdk.min.js");
// 实例化API核心类
var qqmapsdk = new QQMapWX({
	key: "L63BZ-6CDLU-WCVVN-2OL5O-2K4I2-ZEBNB", // 必填
});

Page({
	data: {
		timerOnLoad: true,
		navBarHeight: app.globalData.navBarHeight, //导航栏高度
		paddingTop: app.globalData.navBarHeight,
		active: "",
		banner: "",
		cityName: "",
		SildeList: [],
		weather: "",
		// 分页参数
		pageNo: 0,
		pageSize: 10,
		finish: false,
		loading: false,
		adcode: "",
		list: [],
		showVideo: 0,
	},
	//监听页面初次加载
	onLoad: function (options) {
		if (this.data.timerOnLoad) {
			let cityName = wx.getStorageSync("cityName") || "请选择城市";
			let adcode = wx.getStorageSync("adcode") || "";
			this.setData({
				active: "1",
				cityName,
				adcode,
			});
			this.getSite();
			this.data.timerOnLoad = false;
		}
		setTimeout(() => {
			this.data.timerOnLoad = true;
		}, 300);
	},
	//监听页面显示
	onShow: function () {
		this.getAdList();

		if (!this.data.adcode) {
			console.log("ad");
			this.onLoad();
		}
		let cityName = wx.getStorageSync("cityName") || "";
		if (cityName != this.data.cityName) {
			this.onLoad();
		}

		setTimeout(() => {
			if (!wx.getStorageSync("latitude") && !wx.getStorageSync("latitude_new")) {
				wx.showToast({
					title: "请打开定位后刷新或选择城市即可开始使用",
					icon: "none",
					duration: 3000,
				});
			}
		}, 1000);
	},
	// 点击轮播图
	handSwiper(e) {
		let data = e.currentTarget.dataset.obj;
		if (data.url!='undefined') {
			wx.navigateTo({
				url: data.url,
			});
		}
	},
	// 轮播图列表
	getSilde() {
		app.request.post({
			url: "user/sysIndustry/public/bannerList",
			params: {
				type: 0,
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
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	getList() {
		if (this.data.loading || this.data.finish) return;
		this.setData({
			loading: true,
			pageNo: this.data.pageNo + 1,
		});
		app.request.post({
			url: "user/article/public/indexList",
			params: {
				type: this.data.active,
				pageNo: this.data.pageNo,
				pageSize: this.data.pageSize,
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
			},
		});
	},
	getBanner() {
		app.request.post({
			url: "user/cityInfo/public/detail",
			params: {
				adCode: wx.getStorageSync("adcode"),
			},
			success: (result) => {
				this.setData({
					banner: result.image,
				});
			},
		});
	},
	getVisitCount() {
		app.request.post({
			url: "user/cityInfo/public/visitCount",
			params: {
				adCode: this.data.adcode,
			},
			success: (result) => {
				this.setData({
					visitCount: result,
				});
			},
		});
	},
	tabChange(e) {
		this.setData({
			active: e.detail.name,
		});
		let activity = this.selectComponent("#activity");
		if (activity) activity.getList();
	},
	toCity() {
		wx.navigateTo({
			url: "/pages/focus/city/city",
		});
	},
	toPages(e) {
		let url = e.currentTarget.dataset.url;
		if (url == -1) {
			wx.showToast({
				title: "敬请期待",
				icon: "none",
			});
		} else {
			wx.navigateTo({
				url: url,
			});
		}
	},

	getAdList() {
		app.request.post({
			url: "user/pro/public/adList",
			success: (res) => {
				this.setData({
					showVideo: res,
				});
			},
		});
	},

	// 获取位置
	getSite() {
		this.getBanner();
		if (!wx.getStorageSync("latitude") || !wx.getStorageSync("cityName")) {
			wx.getSetting({
				success: (res) => {
					wx.getLocation({
						type: "gcj02", // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
						success: (res) => {
							console.log(res);
							wx.setStorageSync("latitude", res.latitude);
							wx.setStorageSync("longitude", res.longitude);
							this.setData({
								latitude: res.latitude,
								longitude: res.longitude,
							});
							res.longitude && this.getSiteStr();
						},
					});
					if (res.authSetting["scope.userLocation"] === false) {
						wx.authorize({
							scope: "scope.userLocationBackground",
							success: (res) => {
								console.log(res);
								this.onLoad();
							},
							complete: () => {},
						});
					}
				},
			});
		} else {
			let latitude = wx.getStorageSync("latitude_new") || wx.getStorageSync("latitude");
			let longitude = wx.getStorageSync("longitude_new") || wx.getStorageSync("latitude");
			this.setData({
				latitude: latitude,
				longitude: longitude,
			});
			longitude && this.getSiteStr();
		}
	},

	getSiteStr() {
		qqmapsdk.reverseGeocoder({
			//位置坐标，默认获取当前位置，非必须参数
			location: {
				latitude: this.data.latitude,
				longitude: this.data.longitude,
			},
			success: (res) => {
				//成功后的回调
				var res = res.result;
				console.log(res);
				// res.ad_info.adcode = 441300;
				this.setData({
					cityName: res.ad_info.city || wx.getStorageSync("cityName"),
					adcode: res.ad_info.adcode || wx.getStorageSync("adcode"),
				});
				// wx.setStorageSync('address', res.ad_info.province + '-' + res.ad_info.city)
				!wx.getStorageSync("cityName") && wx.setStorageSync("cityName", res.ad_info.city);
				!wx.getStorageSync("adcode") && wx.setStorageSync("adcode", res.ad_info.adcode);
				this.getBanner();
				this.getSilde();
				this.getVisitCount();
				this.selectComponent("#newList").getList();

				this.getWeather();
			},
			fail: function (error) {
				console.error(error);
			},
		});
	},

	// 获取天气
	getWeather() {
		wx.request({
			url: "https://restapi.amap.com/v3/weather/weatherInfo?key=8c9e041953cab52361e76e433ec60ad6&extensions=base&output=JSON&city=" + wx.getStorageSync("adcode"),
			success: (res) => {
				console.log(res);
				let data = res.data.lives[0];
				let weather = data.weather + " " + data.temperature + "°";
				this.setData({
					weather: weather != "undefined undefined°" ? weather : "无法获取该地区天气",
				});
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
		let cityName = wx.getStorageSync("cityName");
		this.setData({
			weather: e.detail != "undefined undefined°" ? e.detail : "无法获取该地区天气",
			cityName,
		});
		setTimeout(() => {
			this.onLoad();
			this.onShow();
		}, 500);
	},

	//监听页面初次加载完成
	onReady: function () {},
	//监听页面隐藏
	onHide: function () {
		wx.hideToast();
	},
	//监听页面卸载
	onUnload: function () {},
	//监听用户下拉动作
	onPullDownRefresh: function () {},
	//监听用户下拉动作
	onPullDownRefresh: function () {},
	//用户上拉触底事件的处理函数
	onReachBottom: function () {
		if (this.data.active != 3) this.selectComponent("#newList").getList();
		if (this.data.active == 3) this.selectComponent("#activity").getList();
	},
	//右上角分享功能
	onShareAppMessage: function (res) {
		var that = this;
		let imageUrl = app.common.imgUrl + this.data.banner;
		console.log(imageUrl);
		return {
			title: "同城有关注 奋斗不迷路",
			path: "pages/focus/focus",
			imageUrl,
		};
	},
});
