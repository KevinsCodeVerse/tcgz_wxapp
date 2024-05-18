// pages/attention/attent/index.js
const app = getApp();
import common from "../../../utils/common";

Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		firmList: {
			type: Array,
		},
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		active: 2,
		longitude: "",
		latitude: "",
		markers: [],
		mapShow: false,
		mylong: "113.3926",
		mylat: "23.51595",
		showFoot: false,
		attentList: [],
		attent: {},
		inputFocus: false, // input 框的focus状态
		inputModel: "", // input 框的输入内容
		inputInfo: "搜索公司/店铺名称", // cover-view 显示的 input 的输入内容,初始值充当placeholder作用
		id: "",
		notice: "暂无公告",
		noticeId: "",

		merchants: [], //商户列表
	},

	ready() {
		this.toReset();
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		// 重新渲染
		toReset() {
			console.log(this.properties.firmList);
      this.getAttent(this.properties.firmList);
      let id = wx.getStorageSync('attentionAcitve')||this.properties.firmList[0].firmId
			this.setData({
        id: id,
        attent: this.properties.firmList.find(item=>item.firmId==id).firmInfo||this.properties.firmList[0].firmInfo,
      });
			this.getFirmDetail();
			this.getNotice();
		},

		// 选择器改变时
		attentChange(e) {
			// console.log(e);
			this.setData({
				index: e.detail.value,
				attent: this.data.attentList[e.detail.value],
				id: this.data.attentList[e.detail.value].id,
      });
      wx.setStorageSync('attentionAcitve',this.data.attentList[e.detail.value].id)
			this.getFirmDetail();
			this.getNotice();
		},

		// 将焦点给到 input（在真机上不能获取input焦点）
		tapInput() {
			this.setData({
				//在真机上将焦点给input
				inputFocus: true,
				//初始占位清空
				inputInfo: "",
			});
		},
		// input 失去焦点后将 input 的输入内容给到cover-view
		blurInput(e) {
     
			this.setData({
				inputModel: e.detail.value || "",
			});
			if (!this.data.inputModel) {
				this.setData({
					inputInfo: "搜索公司/店铺名称",
				});
			}
		},

		// 点击标记点触发
		toMarkertap(e) {
			this.setData({ showFoot: true });
			let markerId = e.detail.markerId;
			this.data.merchants.forEach((item, index) => {
				if (item.id == markerId) {
					this.setData({ detail: item });
					return;
				}
			});
		},

		// 计算距离函数
		Rad(d) {
			//根据经纬度判断距离
			return (d * Math.PI) / 180.0;
		},
		// 计算距离
		getDistance(lat1, lng1, lat2, lng2) {
			var radLat1 = this.Rad(lat1);
			var radLat2 = this.Rad(lat2);
			var a = radLat1 - radLat2;
			var b = this.Rad(lng1) - this.Rad(lng2);
			var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
			s = s * 6378.137;
			s = Math.round(s * 10000) / 10000;
			s = s.toFixed(1) + "km"; //保留两位小数
			console.log("经纬度计算的距离:" + s);
			return s;
		},
		toOpenNav() {
			wx.openLocation({
				latitude: this.data.latitude,
				longitude: this.data.longitude,
				name: this.data.detail.name,
				address: this.data.detail.address,
				scale: 16,
			});
		},
		// ----------------------------接口-----------------------------------
		// 获取公告
		getNotice(firmId) {
			app.request.post({
				url: "user/firm/public/news/notice",
				params: {
					firmId: this.data.id,
				},
				success: (res) => {
          if(typeof res==="string"){
            this.setData({
              notice: "暂无公告",
              noticeId: "",
            });
            return 

          }
					this.setData({
						notice: res.title ? res.title : "暂无公告",
						noticeId: res.id ? res.id : "",
					});
				},
			});
		},
		// 关注集体列表
		getAttent(list) {
			let attentList = [];
			list.forEach((item) => {
				attentList.push(item.firmInfo);
			});
			if (attentList.length > 0) {
      let id = wx.getStorageSync('attentionAcitve')
				this.setData({
					attent: attentList.find(item=>item.id==id),
				});
				// this.getDetail(attentList[0].id)
				// this.getNotice(attentList[0].id)
			}
			this.setData({ attentList });
		},
		// 商家分布
		getFirmDetail() {
			app.request.post({
				url: "user/firm/merchantList",
				params: {
					firmId: this.data.id,
				},
				success: (result) => {
					let data = result.firmInfo;
					let merchants = result.merchants;
					//地图标记
					let markers = [];
					let markersObj = {};
					merchants.unshift(result.firmInfo);
					merchants.forEach((item, index) => {
						item.longitude = Number(item.longitude);
						item.latitude = Number(item.latitude);
						if (index == 0) item.tesuType = 1;
						markersObj = {
							id: item.id,
							longitude: item.longitude,
							latitude: item.latitude,
							title: item.name,
							iconPath: app.common.imgUrl + item.icon,
							width: "48px",
							height: "48px",
							anchor: { x: 0.5, y: 1.1 },
							callout: {
								content: item.name,
								color: "#fff",
								fontSize: 12,
								bgColor: "#3994FF",
								borderRadius: 10,
								borderColor: "#3994FF",
								borderWidth: 3,
								padding: 3,
								display: "ALWAYS",
							},
						};
						// console.log("222");
						markers.push(markersObj);
					});
					// console.log("333");

					this.setData({ markers });
					// console.log(markers);
					var that = this;
					//获取当前的地理位置、速度
					that.setData({
						latitude: merchants[0].latitude,
						longitude: merchants[0].longitude,
						mapShow: true,
					});
					this.setData({ merchants });
				},
			});
		},

		// ------------------跳转链接-------------------------------
		goSearch() {
			wx.navigateTo({
				url: "/pages/collective/find/find",
			});
		},
		goDetail(e) {
			if (e.currentTarget.dataset.type) {
				wx.navigateTo({
					url: "/pages/collective/detail_my/index?id=" + this.data.id + "&active=" + e.currentTarget.dataset.type,
				});
			} else {
				wx.navigateTo({
					url: "/pages/collective/detail_my/index?id=" + this.data.id,
				});
			}
		},
		goNewDetail() {
      if(!this.data.noticeId)return
			wx.navigateTo({
				url: "/pages/collective/news_detail/news_detail?id=" + this.data.noticeId,
			});
		},
		goShopDetail(e) {
			let obj = e.currentTarget.dataset.obj;
			if (obj.tesuType == 1) {
				wx.navigateTo({
					url: "/pages/collective/detail_my/index?id=" + obj.id,
				});
			} else {
				wx.navigateTo({
					url: "/pages/shop/detail/detail?id=" + obj.id,
				});
			}
		},
		// --------------------------关闭------------------------------
		toClose() {
			this.setData({ showFoot: false });
		},
	},
});
