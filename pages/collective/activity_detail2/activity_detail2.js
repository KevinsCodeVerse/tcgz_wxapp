const app = getApp()
Page({
  data: {
    active: 0,
    status: 1,
    activity: {},
    applyList: [],
		showShare: true,
		showApplp: false,
		maxPage: false,
		singlist: [],
    pageNo: 1,
    storeShow:false,
    contentArr:[],
    recommendList:[],
    
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.setData({activityId: options.id})
  },
  //监听页面显示
  onShow: function () {
    this.getDetail()

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
  getDetail(){

    let isGoods = false
    app.request.post({
      url: 'user/article/vote/list',
      params: {
        activityId: this.data.activityId
      },
      success: r => {
        let res = r.firmActivity;
        let fwb = app.common.fwbData(res);
        this.setData({
          content: fwb.result,
          contentArr: fwb.isGoods ? fwb.contentArr2 : this.data.contentArr,
          recommendList: fwb.isGoods ? fwb.recommendList : this.data.recommendList,
        });
        console.log(this.data.recommendList);

        this.forPv(fwb.recommendList,fwb.contentArr2);
			
				// 处理 自定义表单
				let activity = res;
				if (this.data.activityType == 2) {
					if (activity.message) activity.message = JSON.parse(activity.message);
				}
				// if (activity.content) activity.content = activity.content.replace(/\<img/g, '<img style="max-width:100%;height:auto;display:block;" class="graphic"');

				this.setData({
					activity,
					applyList: r.firmActivityRegisterUser,
					status: r.status,
				});

        
      },
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
  goVote(){
    wx.navigateTo({
      url: '/pages/collective/vote/vote?id='+this.data.activityId,
    })
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
  onReachBottom: function () {},
  //用户点击右上角转发
  onshareAppMessage: function () {},
})