const app = getApp();
Page({
	data: {
		type: 5,
		id: "",
		startTime: "", // 预览时长
		isDesc: false, // 简介的隐藏
		isSelect: false, //选集的隐藏
		activeVideoindex: 0, // 点前点击视频的索引
		activeVideo: -1, // 当前点击的视频
		detailInfo: {}, // 集锦详情信息
    child: "", // 组件示例
    contentArr:[],
    recommendList:[],
    storeShow:false,
		list: [
			{
				type: "1",
				title: "双月湾由东湾和西湾两个半月组成.也是名字的由来~",
				imgs: ["http://b1-q.mafengwo.net/s16/M00/E7/B9/CoUBUl_XJ6-AeN4xAAqn0KhBmJw853.jpg?imageView2%2F2%2Fw%2F680%2Fq%2F90%7CimageMogr2%2Fstrip%2Fquality%2F90"],
				author: "惠州日报",
				time: "24小时前",
				comments: "160",
			},
			{
				type: "2",
				title: "双月湾由东湾和西湾两个半月组成.也是名字的由来~",
				video: "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4",
				author: "惠州日报",
				time: "24小时前",
				comments: "160",
			},
			{
				type: "1",
				title: "四天三夜路线推荐",
				imgs: [
					"http://n1-q.mafengwo.net/s16/M00/47/53/CoUBUl_6TLKAfrfnAA9T0EhVtK0545.jpg?imageView2%2F2%2Fw%2F700%2Fh%2F600%2Fq%2F90%7CimageMogr2%2Fstrip%2Fquality%2F90",
					"http://n1-q.mafengwo.net/s16/M00/47/54/CoUBUl_6TLOAbRx0ABCKlFC8T54982.jpg?imageView2%2F2%2Fw%2F700%2Fh%2F600%2Fq%2F90%7CimageMogr2%2Fstrip%2Fquality%2F90",
					"http://b1-q.mafengwo.net/s16/M00/67/B3/CoUBUl_6xBSAGO4fABCd-62oVV8807.jpg?imageView2%2F2%2Fw%2F700%2Fh%2F600%2Fq%2F90%7CimageMogr2%2Fstrip%2Fquality%2F90",
				],
				author: "惠州日报",
				time: "24小时前",
				comments: "160",
			},
		],
	},
	//监听页面初次加载
	onLoad: async function (options) {
		this.setData({
			id: options.id,
		});
		// let detailInfo = await this.getInfo(options.id); // 请求详情数据
		// this.setData({
		// 	detailInfo,
		// 	activeVideo: detailInfo.videoCollectUrlList[0].video,
		// });
	},
	//监听页面显示
	onShow: async function () {
		this.setData({
			startTime: new Date().getTime(),
    });
    let detailInfo = await this.getInfo(); // 请求详情数据
		this.setData({
			detailInfo,
			activeVideo: detailInfo.videoCollectUrlList[0].video,
		});
		wx.event.on("comment", (e) => {
			this.data.detailInfo.comment++;
			this.setData({
				detailInfo: this.data.detailInfo,
			});
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
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	toDetail(e) {
		console.log(e);
		app.request.post({
			url: "user/videoCollect/public/urlDetail",
			params: {
				id: e.currentTarget.dataset.id,
			},
			success: (res) => {
				console.log(res);

				this.setData({
					activeVideo: res.video,
					activeVideoindex: e.currentTarget.dataset.index,
					isSelect: false,
				});
			},
			error: (err) => {},
		});
	},
	// 点击 简介
	handTapDesc() {
		this.setData({
			isDesc: !this.data.isDesc,
		});
		console.log(getCurrentPages());
	},

	// 点击 选集
	handTapSelect() {
		this.setData({
			isSelect: true,
		});
	},
	// 请求 详情事件
	getInfo(id) {
		wx.showLoading({
			mask: true,
		});
		return new Promise((resolve, reject) => {
			app.request.post({
        url: "user/videoCollect/public/detail",
        params:{
          id:this.data.id
        },
				success: (res) => {
					res.content = res.introduce;
          let fwb = app.common.fwbData(res);
          console.log(fwb);
					this.setData({
						activeVideo: fwb.result,
						contentArr: fwb.isGoods ? fwb.contentArr2 : this.data.contentArr,
						recommendList: fwb.isGoods ? fwb.recommendList : this.data.recommendList,
          });
				  this.forPv(fwb.recommendList,fwb.contentArr2);
					resolve(fwb.result);
					wx.hideLoading();
				},
				error: (err) => {
					reject(err);
				},
			});
		});
  },
  forPv(arr,contentArr) {
		let url;
		let params = {};
		arr.forEach(async (item, index) => {
			if (item.type == "goods") {
				url = "user/pro/public/proDetails";
				params = {
					id: item.id,
          type: 1,
          noPv:1,
				};
			} else if(item.type == "shop") {
				url = "user/pro/public/shopDetails";
				params = {
          shopId: item.id,
          noPv:1,
				};
			} else{
        this.setData({
          recommendList: arr&&arr,
          contentArr,
        });
        return
      }
			await this.syncGet(url, params).then((res) => {
				if (item.type == "goods") {
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
				} else if(item.type == "shop") {
					arr[index].pv = res.merchantShop.pv;
				}
				this.setData({
          recommendList: arr&&arr,
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
          from({merchantPro:{}});
        }
			});
		});
	},
  toStore(e) {
		let id = e.currentTarget.dataset.id;
		let item = e.currentTarget.dataset.item;
		let url = "";
		if (e.currentTarget.dataset.type == "shop") {
			url = "/pages/shop/detail/detail?type=1&id="+id;
		} else if(e.currentTarget.dataset.type == "goods") {
			if (e.currentTarget.dataset.item.video) {
				url = "/pages/goods/g_video/index?type=1&id="+id;
			} else {
				url = "/pages/goods/detail/detail?type=1&id="+id;
			}
		} else if(e.currentTarget.dataset.type == "activity") {
      console.log(e.currentTarget.dataset.item.atype);
      if(e.currentTarget.dataset.item.atype==1)url =`/pages/collective/activity_detail2/activity_detail2?id=${id}&type=${1}&activityType=${item.activityType}`
      if(e.currentTarget.dataset.item.atype==0)url = `/pages/collective/activity_detail/activity_detail?id=${id}&type=${0}&activityType=${item.activityType}`;

      console.log(url);
      
    }
		wx.navigateTo({
			url: url
		});
	},
	// 关闭简介弹窗
	desc_onClose() {
		this.setData({
			isDesc: false,
		});
	},
	// 关闭选集弹窗
	select_onClose() {
		this.setData({
			isSelect: false,
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
			url: "user/article/articleData",
			params: {
				id: this.data.id,
				machine: app.globalData.model,
				readTime: timeLen,
				type: this.data.type,
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
		wx.event.off("comment");

		this.articleRead();
	},
	//监听用户下拉动作
	onPullDownRefresh: function () {},
	//监听用户下拉动作
	onPullDownRefresh: function () {},
	//用户上拉触底事件的处理函数
	onReachBottom: function () {
		let child = this.selectComponent("#commentListID");
		child.NEWgetcomment();
	},
	//用户点击右上角转发
	onshareAppMessage: function () {},
	onShareTimeline: function () {
		let img;
		if (this.data.detailInfo.image) {
			img = app.common.imgUrl + this.data.detailInfo.image;
		}
		return {
			title: this.data.detailInfo.title,
			imageUrl: img || "",
		};
	},
});
