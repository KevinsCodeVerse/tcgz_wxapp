const app = getApp();
const areaList = require("../../utils/area");

Page({
	data: {
		areaList: {},
    socketStatus: "closed",
    socket:null,
	},
	//监听页面初次加载
	onLoad: function (options) {
		this.setData({
			areaList: areaList.default,
		});
		
	},
	//监听页面显示
	onShow: function () {},
	//自定义函数编写处，下方其他系统函数使用请提前到此注释前
	btn() {
    wx.ws.socketLink()
		// this.data.socket.send({
    //   data:'呦西'
    // })
  },
  mess(){
    console.log(wx.ws.isSocket);
    wx.ws.socket.send({
      data:"asd"
    })
  },
  close(){
   
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
