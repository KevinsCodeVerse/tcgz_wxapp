const app = getApp();
// pages/merchent/uploadingImg/uploadingImg.js
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		type: 1,
		categoryId: "",
		id: "",
		isDesc: false,
		pageNo: 0,
		pageSize: 10,
		finish: false,
		loading: false,
		list: [],
		value: "",
		goods: {},
		img: "",
		active: 1,
		pageUrl: [
			{ id: "", name: "无", url: -1, data: -1 },
			{ id: 1, name: "普通商品详情", url: "/pages/goods/detail/detail", data: { key: "type=1&id=", label: "商品id" } },
			{ id: 2, name: "秒杀商品详情", url: "/pages/goods/seckill_detail/seckill_detail", data: { key: "id=", label: "商品id" } },
			{ id: 3, name: "拼团商品详情", url: "/pages/goods/group_detail/group_detail", data: { key: "type=3&id=", label: "商品id" } },
		],
	},
	onClickDisabled(event) {
		wx.showToast({
			title: `该竞价 不能切换 ${event.detail.title}`,
			icon: "none",
		});
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		// let active = options.type == 5 ? 2 : options.type == 4 ? 3 : 1;
		this.setData({
			type: options.type || 1,
			id: options.id || "",
			categoryId: options.categoryId || "",
			// active: active,
		});
		// this.selectComponent("#tabs").setData({
		// 	active: active,
		// });
		this.getList();
    },
    // 跳转记录
    toPushRecord(){
        wx.navigateTo({
          url: '/pages/merchent/cityPush/pushRecord/pushRecord',
        })
    },
	onChange(e) {
		this.setData({
			finish: false,
			loading: false,
			pageNo: 0,
			active: e.detail.name * 1,
			list: [],
		});
		console.log("onChange");
		this.getList();
	},

	handSubmit() {
		wx.showLoading({
          title: '加载中..',
        })
		app.request.post({
			url: "mt/app/maOpen",
			myType: 1,
			params: {
                appId:6,
                userId:wx.getStorageSync('userId'),
                proId:this.data.goods.id
			},
			success: (res) => {
                console.log(res);
                this.pay(res)
			},
			fail: (err) => {},
			finally: () => {},
		});
    },
    pay(res){
        wx.requestPayment({
            timeStamp: res.timeStamp,
            nonceStr: res.nonceStr,
            package: res.packageValue,
            signType: 'MD5',
            paySign: res.paySign,
            success: (res)=> {
                wx.hideLoading()
                wx.showToast({
                  title: '支付成功',
                  duration:2000,
                  success:()=>{
                      setTimeout(() => {
                        wx.redirectTo({
						  url: '/pages/merchent/cityPush/pushRecord/pushRecord',
						})
                      }, 1500);
                  }
                })

            },
            fail (res) {
                wx.hideLoading()
                wx.showToast({
                    title: '支付失败',
                    duration:2000,
                    icon:"error"
                  })
            }
          })
    },

	imgSelect(e) {
		const { file } = e.detail;
		let base64 = wx.getFileSystemManager().readFileSync(file.path, "base64");
		base64 = "data:image/jpeg;base64," + base64;
		this.setData({
			img: base64,
		});
	},
	// 选择
	handselect(e) {
		this.setData({
			goods: e.currentTarget.dataset.obj,
			isDesc: false,
		});
	},
	// 商品滚到底部
	bindscrolltolower() {
		console.log(1);
		this.getList();
	},
	onSearchChange(e) {
		this.setData({
			value: e.detail,
			list: [],
			pageNo: 0,
			finish: false,
			loading: false,
		});
		this.getList();
	},
	onSearch() {
		this.setData({
			list: [],
			pageNo: 0,
			finish: false,
			loading: false,
		});
		this.getList();
	},
	// 请求商品
	getList() {
		if (this.data.finish || this.data.loading) return;
		this.setData({
			loading: true,
			pageNo: this.data.pageNo + 1,
		});
		app.request.post({
			url: "mt/bid/proListAll",
			myType: 1,
			params: {
				name: this.data.value || "",
				pageNo: this.data.pageNo,
				pageSize: this.data.pageSize,
				categoryId: this.data.categoryId || "",
				type: this.data.type == 5 ? 2 : this.data.type == 4 ? 3 : this.data.active,
			},
			success: (res) => {
				console.log(res);
				this.setData({
					list: [...this.data.list, ...res.list],
				});
				if (res.list.length < this.data.pageSize) {
					this.setData({
						finish: true,
					});
				}
			},
			fail: (err) => {},
			finally: () => {
				this.setData({
					loading: false,
				});
			},
		});
	},
	//搜索
	onSaerchClick() {},
	desc_open() {
		this.setData({
			isDesc: true,
		});
	},
	desc_onClose() {
		this.setData({
			isDesc: false,
		});
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {},

	/**
	 * 用户点击右上角分享
	 */
	onshareAppMessage: function () {},
});
