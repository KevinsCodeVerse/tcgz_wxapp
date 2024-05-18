// components/clickaddress/clickaddress.js
const areaList = require("../../utils/area");
// 引入SDK核心类
var QQMapWX = require("../../libs/qqmap-wx-jssdk.min.js");
// 实例化API核心类
var qqmapsdk = new QQMapWX({
	key: "L63BZ-6CDLU-WCVVN-2OL5O-2K4I2-ZEBNB", // 必填
});
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {},

	/**
	 * 组件的初始数据
	 */
	data: {
		value: "",
		showArea: false,
		// 地址筛选
		address: "",
		cityName: "",
		adcode: "",
		areaList: {},
		arrName: [],
		weather: "", // 天气
		ischangesearch: true,
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
        // 点击 搜索出的城市
        clickItem(e){
            let info = e.currentTarget.dataset.info
            this.setData({
                address:info.name,
                cityName: info.name,
                loading: false,
                finish: false,
                pageNo: 0,
                adcode: info.code,
                showArea:false
            });
            // this.getList();
            wx.setStorageSync("cityName", this.data.cityName);
            wx.setStorageSync("adcode", this.data.adcode);
            this.getSiteStr();
            this.getWeather();
        },
		// 输入
		changesearch(e) {
			this.data.arrName = [];
			clearTimeout(this.data.ischangesearch);
			this.data.ischangesearch = setTimeout(() => {
				if (this.data.ischangesearch) {
					console.log(e.detail);
					for (let item in this.data.areaList.city_list) {
						let name = {};
						if (!e.detail){
                            return this.setData({
								arrName: [],
							});
                        }
							
						if (this.data.areaList.city_list[item].includes(e.detail)) {
							console.log(item);
							name = {
								name: this.data.areaList.city_list[item],
								code: item,
							};
							this.data.arrName.push(name);
						}
					}
					this.setData({
						arrName: this.data.arrName,
					});
				}
			}, 200);
		},
		// 点击 地址后
		toAreaCrm(e) {
			console.log(e);
			if (e.detail.values) {
				this.setData({
					address: e.detail.values[0].name + e.detail.values[1].name,
					cityName: e.detail.values[1].name,
					loading: false,
					finish: false,
					pageNo: 0,
					adcode: e.detail.values[1].code,
				});
				// this.getList();
				wx.setStorageSync("cityName", this.data.cityName);
				wx.setStorageSync("adcode", this.data.adcode);
				wx.setStorageSync("address", this.data.address);
				this.getSiteStr();
				this.getWeather();
			}
			this.setData({
				showArea: !this.data.showArea,
			});
			console.log(this.data);
		},

		//-------------地址选择--------------------------
		toAreaCal(e) {
			this.setData({
				showArea: !this.data.showArea,
			});
			console.log(e);
		},

		// 获取天气
		getWeather() {
			wx.request({
				url: "https://restapi.amap.com/v3/weather/weatherInfo?key=8c9e041953cab52361e76e433ec60ad6&extensions=base&output=JSON&city=" + this.data.adcode,
				success: (res) => {
					let data = res.data.lives[0];
					let weather = data.weather + " " + data.temperature + "°";
					this.setData({
						weather: weather,
					});
					this.triggerEvent("resize", weather);
				},
			});
		},
		// 获取位置
		getSiteStr() {
			qqmapsdk.geocoder({
				//位置坐标，默认获取当前位置，非必须参数
				address: this.data.address,
				success: (res) => {
					//成功后的回调
					var res = res.result;
					this.setData({
						latitude: res.location.lat,
						longitude: res.location.lng,
					});
					wx.setStorageSync("latitude_new", res.location.lat);
					wx.setStorageSync("longitude_new", res.location.lng);
				},
				fail: function (error) {
					console.error(error);
				},
			});
		},
	},

	lifetimes: {
		attached: function () {
			// 在组件实例进入页面节点树时执行
		},
		detached: function () {
			// 在组件实例被从页面节点树移除时执行
		},
		// ready: function () {
		//     // 	在组件在视图层布局完成后执行
		//     let address = wx.getStorageSync('address')
		//     if (address) {
		//         address = address.split('-')
		//         this.setData({
		//             address: address.join(''),
		//             cityName: address[1]
		//         })
		//     }
		//     // this.getList();
		//     // this.getIndustryList();
		//     this.setData({
		//         areaList: areaList.default
		//     })
		// },
	},
	pageLifetimes: {
		show: function () {
			// 页面被展示
			// 	在组件在视图层布局完成后执行
			let address = wx.getStorageSync("address");
			let cityName = wx.getStorageSync("cityName");
			if (address) {
				address = address.split("-");
				this.setData({
					address: address.join(""),
					cityName: cityName,
				});
			}
			// this.getList();
			// this.getIndustryList();
			this.setData({
				areaList: areaList.default,
				adcode: wx.getStorageSync("adcode"),
			});
		},
		hide: function () {
			// 页面被隐藏
		},
		resize: function (size) {
			// 页面尺寸变化
		},
	},
});
