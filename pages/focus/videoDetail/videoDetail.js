const app = getApp()
Page({
  data: {
    id: '',
    type:'',
    list: [
    ],
    detail: {},
    stateDetail:{},
    startTime: '',
    isDuce:false,// 是否展开简介
    contentArr:[],
    recommendList:[],
    
    storeShow:false,
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.setData({
      id: options.id,
      type: options.type
    })
  },
  //监听页面显示
  onShow: function () {
    this.getDetail();

    this.setData({
      startTime: new Date().getTime()
    })
  },
  //监听页面隐藏
  onHide: function () {
    this.articleRead();
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
  //监听页面卸载
  onUnload: function () {
    this.articleRead();
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  getDetail() {
    app.request.post({
      url: 'user/article/public/detail',
      params: {
        id: this.data.id
      },
      success: result => {
        let fwb = app.common.fwbData(result);
        this.setData({
          detail: fwb.result,
          stateDetail:fwb.result,
          contentArr: fwb.isGoods ? fwb.contentArr2 : this.data.contentArr,
          recommendList: fwb.isGoods ? fwb.recommendList : this.data.recommendList,
        });
        this.forPv(fwb.recommendList,fwb.contentArr2);
      }
    })
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
  // 评论之后
  comment_operation(){
    app.request.post({
      url: 'user/article/public/detail',
      params: {
        id: this.data.id
      },
      success: result => {
        this.data.stateDetail.comment = result.comment
        this.data.stateDetail.likes = result.likes
        this.data.stateDetail.favorites = result.favorites
        this.data.stateDetail.share= result.share
        this.setData({
          stateDetail: this.data.stateDetail
        })
      }
    })
  },
  // 浏览记录数据埋点
  articleRead() {
    let token = wx.getStorageSync('token');
    if(!token) {
      return;
    }
    let endTime = new Date().getTime();
    let timeLen = endTime - this.data.startTime;
    let minutes = parseInt(timeLen/1000/60);
    let seconds = parseInt(timeLen/1000%60);
    timeLen = minutes + '分' + seconds + '秒';
    app.request.post({
      url: 'user/article/articleData',
      params: {
        id: this.data.id,
        readTime: timeLen,
        machine: app.globalData.model,
        type: this.data.type
      },
      success: result => {
        
      }
    })
  },
  // 关闭简介
  handduceClose(){
    this.setData({
      isDuce:!this.data.isDuce
    })
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
      if(e.currentTarget.dataset.item.atype==1)url =`/pages/collective/activity_detail2/activity_detail2?id=${id}&type=${1}&activityType=${item.activityType}`
			if(e.currentTarget.dataset.item.atype==0)url = `/pages/collective/activity_detail/activity_detail?id=${id}&type=${0}&activityType=${item.activityType}`;
    }
		wx.navigateTo({
			url: url
		});
	},
  //监听页面初次加载完成
  onReady: function () {
  },
  //监听用户下拉动作
  onPullDownRefresh: function () {
  },
  //监听用户下拉动作
  onPullDownRefresh: function () {
  },
  //用户上拉触底事件的处理函数
  onReachBottom: function () {
    let child = this.selectComponent('#videoDetailcommentListID')
    child.NEWgetcomment()
  },
  //用户点击右上角转发
  onshareAppMessage: function () {
  },
  onShareTimeline:function(){
    let img
    if(this.data.detail.avatar){
      img = app.common.imgUrl + this.data.detail.avatar
    }
    return {
      title:this.data.detail.title,
      imageUrl:img||''
    }
  }
})