import utils from "/utils/util.js";
import common from "./utils/common.js";
import {WS} from "./utils/webSocket.js";
import request from "/utils/request.js";
import { Event } from "/utils/event.js";
wx.event = new Event(); // 全局事件监听
wx.ws = new WS({wx:wx}); // websocket
//app.js
App({
	// 引入工具类
	utils: utils,
	request: request,
	common: common,
	onLaunch: function () {
		this.setNavBarInfo();
		this.login()
		this.getAdList();
		this.getInfoAgain();
		this.getTerPhnoe(); // 平台号码
		let token = wx.getStorageSync("token") || "";
		if (token) {
			this.getAddressList();
		}
	},
	onShow: function () {
		this.getAdList();
		wx.ws.socketLink();
	},
	onHide:function(){
		wx.ws.closeSocket();
	},
	onLoad: () => {},
	globalData: {
		//全局数据管理
		platform: "", // ios 或 android
		model: "", //手机型号
		isLogin: false, //是否登录
		encryption: "", //加密标识
		navBarHeight: 0, // 导航栏高度
		menuBotton: 0, // 胶囊距底部间距（保持底部间距一致）
		menuRight: 0, // 胶囊距右方间距（方保持左、右间距一致）
		menuHeight: 0, // 胶囊高度（自定义内容可与胶囊高度保证一致）
		showVideo: 0,
		TerPhnoe: "", //平台号码
	},

	/**
	 * @description 设置导航栏信息
	 */
	setNavBarInfo() {
		// 获取系统信息
		const systemInfo = wx.getSystemInfoSync();
		this.globalData.platform = systemInfo.platform;
		this.globalData.model = systemInfo.model;
		// 胶囊按钮位置信息
		const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
		// 导航栏高度 = 状态栏到胶囊的间距（胶囊距上距离-状态栏高度） * 2 + 胶囊高度 + 状态栏高度
		this.globalData.navBarHeight = (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height + systemInfo.statusBarHeight;
		this.globalData.menuBotton = menuButtonInfo.top - systemInfo.statusBarHeight;
		this.globalData.menuRight = systemInfo.screenWidth - menuButtonInfo.right;
		this.globalData.menuHeight = menuButtonInfo.height;
	},

	// 再次获取授权
	getInfoAgain() {
		let again = wx.getStorageSync("again");
		if (!again) {
			wx.setStorageSync("again", true);
			wx.removeStorageSync("token");
		}
	},

	// 登录
	login() {
		wx.login({
			success: (res) => {

				this.request.post({
					url: "wx/ma/user/public/login",
					params: {
						code: res.code,
					},
					success: (res) => {
						wx.setStorageSync("token", res.token);
						wx.setStorageSync("login", res);
						this.getAddressList();
						this.binding()
						this.globalData.encryption = res.encryption;
					},
				});
			},
			fail: (err) => {
				console.log(1111);
			},
		});
	},
	// 授权过的直接获取用户信息
	getUserInfo() {
		wx.getSetting({
			success: (res) => {
				if (res.authSetting["scope.userInfo"]) {
					// 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
					wx.getUserInfo({
						success: (res) => {
							this.request.post({
								url: "/wx/ma/user/info",
								params: {
									rawData: res.rawData,
									signature: res.signature,
									encryptedData: res.encryptedData,
									iv: res.iv,
									encryption: this.globalData.encryption,
								},
								success: (res) => {
									console.log("授权过的改变登录状态");
									this.globalData.isLogin = true;
									if (this.isLoginReadyCallback) {
										this.isLoginReadyCallback(res);
									}
								},
							});
						},
					});
				}
			},
		});
	},
	// 获取列表
	getAddressList() {
		request.post({
			url: "user/info/addressList",
			success: (res) => {
				wx.setStorageSync("shippingAddress", res.filter((item) => item.isDefault)[0]);
				if (!res.result && !res[0]) {
					
					wx.setStorageSync("shippingAddress", res.result);
				}
			},
		});
	},
	// 隐藏
	getAdList() {
		request.post({
			url: "user/pro/public/adList",
			success: (res) => {
				this.globalData.showVideo = res;
			},
		});
	},
	// 平台电话号码
	getTerPhnoe() {
		request.post({
			url: "user/shop/public/customerPhone",
			success: (res) => {
				this.globalData.TerPhnoe = res;
			},
		});
	},
	// 绑定上级
	binding() {
		setTimeout(() => {
			let {agentId} = wx.getStorageSync('agentIdoptions')
			if(!wx.getStorageSync('token')||!agentId)return
			request.post({
				url: "user/invite/binding",
				params: {
					agentId,
				},
				success: () => {
					console.log("绑定成功!" + agentId);
				},
			});
		}, 4000);
	},
});
