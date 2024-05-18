const app = getApp();
Page({
	data: {
		gpa: "",
		type: 1,
		groupGpa: "",
		info: {},
		upgradeList: [],
		isshowShop: false,
		levelList: [
			{
				id: 0,
				name: "普通用户",
			},
			{
				id: 1,
				name: "普通会员",
			},
			{
				id: 2,
				name: "黄金会员",
			},
			{
				id: 3,
				name: "合伙人",
			},
			{
				id: 4,
				name: "至尊合伙人",
			},
		],
		shopList: [
			{
				id: 0,
				name: "普通会员",
			},
			{
				id: 1,
				name: "黄金会员",
			},
			{
				id: 2,
				name: "合伙人",
			},
			{
				id: 3,
				name: "至尊合伙人",
			},
		],
		// 规则参数
		member: [],
		goldMember: [],
		partner: [],
		superPartner: [],
		list: {},
		// 切换
		gpa2: "",
		groupGpa2: "",
		show: false,
		actions: [],
		active: "1",
		activeShop: {},
		isshow: false,
	},
	//监听页面初次加载
	onLoad: function (options) {},
	//监听页面显示
	onShow: function () {
		this.getRules();
		this.getShopList();
	},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	goGiftC(e) {
		let level = e.currentTarget.dataset.level;
		if (level == 4) {
			wx.navigateTo({
				url: "/pages/my/spread/gift_c/gift_c",
			});
		} else {
			wx.navigateTo({
				url: "/pages/my/spread/gift_b/gift_b?level=" + level,
			});
		}
	},
	// 关闭后
	onClose() {
		this.setData({
			show: false,
		});
	},
	// tab切换后
	tabChange(e) {
		this.setData({
			active: e.detail.name,
			activeShop:this.data.actions[0]
		});
		if ((e.detail.name = 2)) {
			this.getShopinfo();
		} else {
			this.getRules();
		}
	},
	// 点击后
	onSelect(e) {
		console.log(e);
		this.getShopinfo(e.currentTarget.dataset.id);
		this.setData({
			activeShop: e.currentTarget.dataset.info,
			show:false
		});
	},
	// 获取 商家信息
	getShopinfo(id) {
		if (this.data.actions.length == 0) {
			this.setData({
				isshow: true,
			});
			return;
		}
		let ids = id ? id : this.data.actions[0].id;

		app.request.post({
			url: "user/invite/inviteGrade",
			params: {
				id: ids,
			},
			success: (res) => {
				let directly, inDirectly;
				switch (res.invite.grade) {
					case 0:
						directly = res.goldPerson;
						inDirectly = res.goldTeam;
						break;
					case 1:
						directly = res.partnerPerson;
						inDirectly = res.partnerTeam;
						break;
					case 2:
						directly = res.superPartnerPerson;
						inDirectly = res.superPartnerTeam;
						break;
				}
				let gpa2 = (((directly - res.subPersonAmount) / directly) * 100).toFixed(1);
				let groupGpa2 = (((inDirectly - res.subTeamAmount) / inDirectly) * 100).toFixed(1);
				console.log(res);
				this.setData({
					list: res,
					gpa2,
					groupGpa2,
				});
			},
		});
	},
	// 获取规则
	getRules() {
		wx.showLoading({
			title: "加载中...",
		});
		app.request.post({
			url: "user/promote/promoteLevel",
			success: (res) => {
				let member = res.member.split(",");
				let goldMember = res.goldMember.split(",");
				let partner = res.partner.split(",");
				let superPartner = res.superPartner.split(",");
				let gpa = ((res.directly / res.conditionOne) * 100).toFixed(1);
				let groupGpa = ((res.inDirectly / res.conditionTwo) * 100).toFixed(1);
				gpa = gpa > 100 ? 100 : gpa;
				groupGpa = groupGpa > 100 ? 100 : groupGpa;
				var info = {
					directly: res.directly,
					inDirectly: res.inDirectly,
					conditionOne: res.conditionOne,
					conditionTwo: res.conditionTwo,
					name: res.name,
					level: res.level,
				};
				var upgradeList = [];
				res.sysList.forEach((item) => {
					var arr = item.split(",");
					let obj = {
						count1: arr[0],
						count2: arr[1],
						img: arr[2],
						level: arr[3],
					};
					upgradeList.push(obj);
				});
				console.log(upgradeList);

				this.setData({
					member: member,
					goldMember: goldMember,
					partner: partner,
					superPartner: superPartner,
					upgradeList,
					gpa,
					groupGpa,
					info,
				});
			},
			finally: (res) => {
				wx.hideLoading();
			},
		});
	},
	// 显示 切换
	handshow() {
		this.setData({
			show: true,
		});
	},
	// get
	getShopList() {
		app.request.post({
			url: "user/invite/inviteShopList",
			success: (res) => {
				console.log(res);
				if (!res.length) {
					isshowShop = true;
				}
				this.setData({
					actions: res,
					isshowShop: this.data.isshowShop,
					activeShop: res[0],
				});
			},
		});
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
});
