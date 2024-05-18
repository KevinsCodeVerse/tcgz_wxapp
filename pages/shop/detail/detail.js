const app = getApp();
// import Dialog from '/miniprogram/miniprogram_npm/@vant/weapp/dist/dialog/dialog';
import Dialog from "../../../miniprogram/miniprogram_npm/@vant/weapp/dialog/dialog";

Page({
	data: {
		app: app,
		active: 0,
		id: "",
		distance: 0,
		shop: {},
		startTime: "", //预览时间
		isAttent: -1,
    isLike: -1,
    showVideo:0,
		goodsList: [
			// {
			//   id: '1',
			//   type: 1,
			//   title: '栋企鸡团购特惠限时拼团59元享原价119',
			//   cover: 'https://www.tcgz.store/files/index/index-04.png',
			//   limit: 3,
			//   inventory: 462,
			//   countrymen:59,
			//   currentPrice: 69,
			//   originalPrice: 119,
			//   sales: 99
			// },
		],
	},
	//监听页面初次加载
	onLoad: function (options) {
		this.setData({
			id: options.id,
			app,
    });
    this.getAdList()
    
	},
	//监听页面显示
	onShow: function () {
		this.setData({
			startTime: new Date().getTime(),
		});
		var pages = getCurrentPages(); //页面指针数组
		var prepage = pages[pages.length - 2]; //上一页
		if (pages.length >= 2) {
			if (prepage.route == "pages/shop/index") {
				wx.setStorageSync("backShop", 1);
			}
		}
  },
  // 隐藏
	getAdList() {
		app.request.post({
			url: "user/pro/public/adList",
			success: (res) => {
        this.setData({
          showVideo:res
        })
		    this.getDetail(this.data.id);
			},
		});
	},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	// 跳转商品详情
	goDetail(e) {
		let obj = e.currentTarget.dataset.obj;
		if (obj.type == 3) {
			wx.navigateTo({
				url: "/pages/goods/group_detail/group_detail?id=" + obj.id,
			});
		} else if (obj.type == 2) {
			wx.navigateTo({
				url: "/pages/goods/seckill_detail/seckill_detail?id=" + obj.id,
			});
		} else {
			wx.navigateTo({
				url: "/pages/goods/detail/detail?id=" + obj.id + "&type=1",
			});
		}
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
	// --------------------------------------------------接口--------------------------------------------------
	// 关注和点赞
	toCollet(e) {
		let type = e.currentTarget.dataset.type;
		let status = type == 1 ? this.data.isAttent : this.data.isLike;
		wx.showLoading({
			title: "请求中...",
			mask: true,
		});
		app.request.post({
			url: "user/info/attentionOrLike",
			params: {
				shopId: this.data.id,
				status,
				type,
				machine: app.globalData.model,
			},
			success: (res) => {
				// this.getDetail(this.data.id)
				if (type == 1) {
					this.setData({
						isAttent: this.data.isAttent == 1 ? -1 : 1,
						["shop.attention"]: this.data.isAttent == 1 ? this.data.shop.attention - 1 : this.data.shop.attention + 1,
					});
					wx.showToast({
						title: status == -1 ? "已关注" : "取消关注成功",
						icon: "none",
					});
				} else {
					this.setData({
						isLike: this.data.isLike == 1 ? -1 : 1,
						["shop.like"]: this.data.isLike == 1 ? this.data.shop.like - 1 : this.data.shop.like + 1,
					});
					wx.showToast({
						title: status == -1 ? "已点赞" : "取消点赞成功",
						icon: "none",
					});
				}
			},
			finally: (res) => {
				wx.hideLoading({});
			},
		});
	},
	onFinish() {
		this.getDetail(this.data.id);
	},
	getDetail(id) {
		id = id ? id : this.data.id;
		let latitude = wx.getStorageSync("latitude");
		let longitude = wx.getStorageSync("longitude");
		wx.showLoading({
			title: "加载中...",
		});
		app.request.post({
			url: "user/pro/public/shopDetails",
			params: {
				shopId: id,
				latitude: latitude,
				longitude: longitude,
			},
			success: (res) => {
				wx.hideLoading();
				if (res.merchantShop.content) {
					res.merchantShop.content = res.merchantShop.content.replace(/\<img(.*?)src/g, '<img style="max-width:100%!important;height:auto;display:block;" src');
					res.merchantShop.content = res.merchantShop.content.replace(/\<p/g, '<p style="line-height:1.8;word-break: break-all;"');
					res.merchantShop.content = res.merchantShop.content.replace(/\<p style="line-height:1.8;word-break: break-all;"\>\<img/g, "<p><img");
				}
				this.setData({
					goodsList: res.proList,
					shop: res.merchantShop,
					distance: res.distance,
					isAttent: res.isAttention,
					isLike: res.isLike,
					showInvite: res.showInvite,
					isInvite: res.isInvite,
				});
			},
			finally: (res) => {
				wx.hideLoading({});
			},
		});
	},
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
			url: "user/shop/shopData",
			params: {
				id: this.data.id,
				machine: app.globalData.model,
				readTime: timeLen,
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
	// 申请成为分销
	// applyStaff(){
	//   Dialog.confirm({
	//     message: '是否申请成为 该店铺的推广员？',
	//   })
	//     .then(() => {
	//       app.request.post({
	//         url: "user/invite/applyInviter",
	//         params: {
	//           shopId : this.data.id,
	//         },
	//         success:(res)=>{
	//           wx.showToast({
	//             title:res,
	//             icon:'none'
	//           })
	//         }
	//       })
	//     })
	//     .catch(() => {
	//       // on cancel
	//     });

	// },

	//监听页面初次加载完成
	onReady: function () {},
	//监听页面隐藏
	onHide: function () {},
	//监听页面卸载
	onUnload: function () {
		this.articleRead();
	},
	//监听用户下拉动作
	onPullDownRefresh: function () {
		this.articleRead();
	},
	//监听用户下拉动作
	onPullDownRefresh: function () {},
	//用户上拉触底事件的处理函数
	onReachBottom: function () {},
	//用户点击右上角转发
	onShareAppMessage: function (res) {
		let id = this.data.id; // 分享产品的Id
		if (res.from === "button") {
			// 来自页面内转发按钮
			console.log(res.target);
		}
		return {
			title: this.data.shop.name,
			path: `pages/shop/detail/detail?id=${id}`, // 分享后打开的页面
		};
	},
});
