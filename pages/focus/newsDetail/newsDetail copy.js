const app = getApp();
Page({
	data: {
		list: [],
		id: "",
		type: "",
		storeShow: false,
		content: "",
		contentArr: [],
		recommendList: [],
		startTime: "",
	},
	//监听页面初次加载
	onLoad: function (options) {
		this.setData({
			id: options.id,
			type: options.type,
		});
	},
	//监听页面显示
	onShow: function () {
		this.getDetail();
		this.setData({
			startTime: new Date().getTime(),
		});
	},
	//监听页面隐藏
	onHide: function () {
		this.articleRead();
	},
	//监听页面卸载
	onUnload: function () {
		this.articleRead();
	},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	getDetail() {
		app.request.post({
			url: "user/article/public/detail",
			params: {
				id: this.data.id,
			},
			success: (result) => {
        let recommendList = [];
        let isGoods = false
				result.content = result.content.replace(/\<img(.*?)src/g, '<img style="max-width:100%!important;height:auto;display:block;" src'); // 图片适配
				result.content = result.content.replace(/\<p/g, '<p style="line-height:1.8;text-indent:25px;word-break: break-all;"'); // p标签样式
				result.content = result.content.replace(/\<font color="/g, '<font style="color:'); // 字体颜色转换
				result.content = result.content.replace(/\<p style="line-height:1.8;text-indent:25px;word-break: break-all;"\>\<img/g, "<p><img");
				let contentArr = [];
				let contentArr2 = [];
				if (result.content.indexOf("<shop>") != -1 || result.content.indexOf("<goods>") != -1) {
          
					while (result.content.indexOf("<shop>") != -1 || result.content.indexOf("<goods>") != -1) {
						let reg = /\<shop\>(.*?)\<\/shop\>|\<goods\>(.*?)\<\/goods\>/g;
            let shop = reg.exec(result.content)[0];
            // console.log(shop);

            let resArr = result.content.split(shop);
            console.log(resArr);
						if (resArr[0]) {
							contentArr.push(resArr[0]);
						}
						contentArr.push(shop);
						result.content = resArr[1];
          }
          console.log(contentArr);
          contentArr.push(result.content);
					for (let item of contentArr) {
						if (item.indexOf("<shop>") != -1) {
							item = item.replace(/\<p(.*?)\<\/p\>/g, "");
							item = item.replace(/\<shop\>/g, "");
							item = item.replace(/\<\/shop\>/g, "");
							item = item.replace(/\<shopdata style="display:none;"\>/g, "");
							item = item.replace(/\<\/shopdata\>/g, "");
							if (item) {
								item = JSON.parse(item);
								recommendList = recommendList.concat(item);
							}
						} else if (item.indexOf("<goods>") != -1) {
							item = item.replace(/\<p(.*?)\<\/p\>/g, "");
							item = item.replace(/\<goods\>/g, "");
							item = item.replace(/\<\/goods\>/g, "");
							item = item.replace(/\<goodsdata style="display:none;"\>/g, "");
							item = item.replace(/\<goodsdata\>/g, "");
							item = item.replace(/\<\/goodsdata\>/g, "");
							if (item) {
								item = JSON.parse(item);
								recommendList = recommendList.concat(item);
							}
						}
						if (item) {
							contentArr2.push(item);
						}
					}
				} else {
          contentArr2 = [result.content];
          isGoods = true
				}

				this.setData({
					content: result,
					contentArr: isGoods?contentArr2:this.data.contentArr,
					recommendList: isGoods?recommendList:this.data.recommendList,
				});
				this.forPv(recommendList,contentArr2);
			},
		});
	},
	forPv(arr,contentArr) {
		let url;
		let params = {};
		arr.forEach(async (item, index) => {
			if (item.type != "shop") {
				url = "user/pro/public/proDetails";
				params = {
					id: item.id,
          type: 1,
          noPv:1,
				};
			} else {
				url = "user/pro/public/shopDetails";
				params = {
          shopId: item.id,
          noPv:1,
				};
			}
			await this.syncGet(url, params).then((res) => {
				if (item.type != "shop") {
					arr[index].pv = res.merchantPro.pv;
					arr[index].comment = res.merchantPro.evaluation;
					contentArr.forEach((cE) => {
						if (typeof cE != "string") {
							if (cE[0].id == res.merchantPro.id&&cE[0].type!="shop") {
								cE[0].pv = res.merchantPro.pv;
								cE[0].comment = res.merchantPro.evaluation;
							}
						}
					});
				} else {
					arr[index].pv = res.merchantShop.pv;
				}
				this.setData({
          recommendList: arr,
          contentArr,
				});
			});
		});
	},
	syncGet(url, params) {
		return new Promise((from, b) => {
			app.request.post({
				url,
				params,
				success: (res) => {
					from(res);
				},
				fail: () => {
					b();
        },
        error:err=>{
          wx.hideToast({
            success: (res) => {},
          })
        }
			});
		});
	},
	toStore(e) {
		let id = e.currentTarget.dataset.id;
		let url = "";
		if (e.currentTarget.dataset.type == "shop") {
			url = "/pages/shop/detail/detail?id=";
		} else {
			if (e.currentTarget.dataset.item.video) {
				url = "/pages/goods/g_video/index?id=";
			} else {
				url = "/pages/goods/detail/detail?id=";
			}
		}

		wx.navigateTo({
			url: url + id + "&type=1",
		});
	},
	openStore() {
		this.setData({
			storeShow: true,
		});
	},
	closeStore() {
		this.setData({
			storeShow: false,
		});
	},
	// 浏览记录数据埋点
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
			url: "user/article/articleData",
			params: {
				id: this.data.id,
				readTime: timeLen,
				machine: app.globalData.model,
				type: this.data.type,
			},
			success: (result) => {},
		});
	},

	//监听页面初次加载完成
	onReady: function () {},

	//监听用户下拉动作
	onPullDownRefresh: function () {},
	//监听用户下拉动作
	onPullDownRefresh: function () {},
	//用户上拉触底事件的处理函数
	onReachBottom: function () {
		let child = this.selectComponent("#news_commentListID");
		child.NEWgetcomment();
	},
	//用户点击右上角转发
  onshareAppMessage: function () {},
  onShareTimeline:function(){
    return {
      title:this.data.content.title
    }
  }
});
