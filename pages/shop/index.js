const app = getApp();
// 引入SDK核心类
var QQMapWX = require("../../libs/qqmap-wx-jssdk.min.js");
// 实例化API核心类
var qqmapsdk = new QQMapWX({
	key: "L63BZ-6CDLU-WCVVN-2OL5O-2K4I2-ZEBNB", // 必填
});

Page({
	data: {
		tab: 1,
		searchValue: "",
		navBarHeight: app.globalData.navBarHeight, //导航栏高度
		paddingTop: app.globalData.navBarHeight + 78,
		value: "",
		SildeList:[],
		classifyList: [],
		active: "",
		longitude: "",
		latitude: "",
		cityName: "",
		isIcon: -1,

		// 分页参数
		pageNo: 0,
		pageSize: 10,
		finish: false,
		loading: false,
		shopList: [],
	},
	//监听页面初次加载
	onLoad: function (options) {
		this.getClassify();
		this.getSite();
	},
	//监听页面显示
	onShow: function () {
    this.setData({ cityName: wx.getStorageSync("cityName") });
    console.log("npi");
   

		if (!wx.getStorageSync("backShop")) {
			this.getSite();
			this.getAdList();
			this.getSilde()
			this.setData({
				tab: 1,
				pageNo: 0,
				finish: false,
				loading: false,
        shopList: [],
        latitude: wx.getStorageSync("latitude"),
        longitude: wx.getStorageSync("longitude"),
      });
     
			setTimeout(() => {
        if(wx.getStorageSync("latitude")){
          this.getList();
        }
			}, 500);
		}
    wx.removeStorageSync("backShop");
    
    setTimeout(() => {
      if(!wx.getStorageSync('latitude')){
        wx.showToast({
          title: '打开定位后即可查看店铺距离',
          icon:'none',
          duration:2000
        })
        this.getList();

      }
    }, 1000);
	},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	// 选择tab
	tabChange(e) {
		this.setData({
			tab: e.currentTarget.dataset.id,
			shopList: [],
			pageNo: 0,
			finish: false,
		});
		if (e.currentTarget.dataset.id == 1) {
			this.getList();
		} else if (e.currentTarget.dataset.id == 3) {
			this.getFocusList();
		}
	},
	// 点击轮播图
	handSwiper(e){
		let data =  e.currentTarget.dataset.obj
		if (data.url!='undefined') {
			wx.navigateTo({
				url: data.url,
			});
		}
	},	
	getSilde() {
		app.request.post({
			url: "user/sysIndustry/public/bannerList",
			params: {
				type: 2,
				cityCode: wx.getStorageSync('adcode'),
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
	// 选择分类
	classifyChange(e) {
		this.setData({
			active: e.currentTarget.dataset.id,
			pageNo: 0,
			finish: false,
			loading: false,
			shopList: [],
		});
		this.getList();
	},
	more(){
		this.setData({
			showMore:!this.data.showMore
		})
	},
	// 店铺详情
	toDetail(e) {
		wx.navigateTo({
			url: "/pages/shop/detail/detail?id=" + e.currentTarget.dataset.id,
		});
	},
	// 商家入驻
	toPublicJoin() {
		wx.navigateTo({
			url: "/pages/shop/settled/settled",
		});
	},
	// 搜索
	toSearch(e) {
		this.setData({
			searchValue: e.detail,
			pageNo: 0,
			finish: false,
			loading: false,
			shopList: [],
		});
		this.getList();
	},
	// 获取位置
	getSite() {
    console.log("getSite 执行");
		wx.getLocation({
			type: "gcj02", // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
			success: (res)=>{
				wx.setStorageSync("latitude", res.latitude);
        wx.setStorageSync("longitude", res.longitude);
        this.setData({
          latitude: wx.getStorageSync("latitude"),
          longitude: wx.getStorageSync("longitude"),
        });
        qqmapsdk.reverseGeocoder({
          //位置坐标，默认获取当前位置，非必须参数
          location: {
            latitude: wx.getStorageSync("latitude"),
            longitude: wx.getStorageSync("longitude"),
          },
          success: (res) => {
            //成功后的回调
            var res = res.result;
            // this.toSearch("");
            // wx.setStorageSync('address', res.ad_info.province+'-'+res.ad_info.city)
            // wx.setStorageSync('cityName', res.ad_info.city)
          },
          fail: function (error) {
            console.error(error);
          },
        });
			},
		});
		
	},

	// -------------------------------------------------------接口----------------------------------------------------
	getClassify() {
		app.request.post({
			url: "user/info/public/shopCategory",
			success: (res) => {
				res.unshift({ id: "", name: "推荐" });
				this.setData({ classifyList: res });
			},
		});
	},
	// 获取店铺列表
	getList() {
		if (this.data.loading || this.data.finish) return;
		this.setData({
			loading: true,
			pageNo: this.data.pageNo + 1,
    });
    
		app.request.post({
			url: "user/info/public/shopList",
			params: {
				categoryId: this.data.active,
				name: this.data.searchValue,
				latitude: this.data.latitude,
				longitude: this.data.longitude,
				pageNo: this.data.pageNo,
				pageSize: this.data.pageSize,
				adCode: wx.getStorageSync("adcode"),
			},
			success: (res) => {
        console.log('店铺res',res);
				let list = this.data.shopList.concat(res.list);
				this.setData({
					shopList: list,
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

	// 关注店铺
	getFocusList() {
		if (this.data.loading || this.data.finish) return;
		this.setData({
			loading: true,
			pageNo: this.data.pageNo + 1,
		});
		app.request.post({
			url: "user/info/attentionShopList",
			params: {
				categoryId: this.data.active,
				name: this.data.searchValue,
				latitude: this.data.latitude,
				longitude: this.data.longitude,
				pageNo: this.data.pageNo,
				pageSize: this.data.pageSize,
			},
			success: (res) => {
				if (res.list.length < this.data.pageSize) {
					this.setData({
						finish: true,
					});
				}
				let list = this.data.shopList.concat(res.list);
				this.setData({
					shopList: list,
				});
			},
			finally: () => {
				this.setData({
					loading: false,
				});
			},
		});
	},

	getAdList() {
		app.request.post({
			url: "user/pro/public/adList",
			success: (res) => {
				this.setData({ isIcon: res });
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
			this.onLoad();
			this.onShow();
		}, 500);
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
		if (this.data.tab == 1) {
			this.getList();
		} else if (this.data.tab == 3) {
			this.getFocusList();
		}
	},
	//用户点击右上角转发
	onshareAppMessage: function () {},
});
