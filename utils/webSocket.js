
import common from "./common";
import request from "./request.js";

class WS {
	constructor({ wx, url }) {
		this.wx = wx;
		this.isSocket = false; // websocket 是否开启
	}
	async socketLink() {
		let userId = this.wx.getStorageSync('userId')||''
		let token = this.wx.getStorageSync('token')||''

		if(!userId&&token){
			userId = await this.getAddressList()
			console.log(userId);
		} else if(!token){ 
			userId = '1'
		}

		wx.connectSocket({
			url: common.wsUrl+"/ws/webSocketServer/"+userId+"/n1gtusqw/websocket",
		});
		setTimeout(() => {
			wx.sendSocketMessage({
				data: JSON.stringify(["CONNECT\naccept-version:1.1,1.0\nheart-beat:10000,10000\n\n\u0000"]),
				success: () => {},
			});
			setTimeout(() => {
				wx.sendSocketMessage({
					data: JSON.stringify(["SUBSCRIBE\nid:sub-1\ndestination:/queue/merchantBid/sendMessage\n\n\u0000"]),
					success: () => {
						console.log("接收信息");
					},
				});
			}, 200);
			// this.socket.send({
			// 	data: JSON.stringify(["CONNECT\naccept-version:1.1,1.0\nheart-beat:10000,10000\n\n\u0000"]),
			// 	success: () => {
			// 		console.log("接收信息");
			// 	},
			// });
			// this.socket.send({
			// 	data: JSON.stringify(["SUBSCRIBE\nid:sub-1\ndestination:/queue/merchantBid/sendMessage\n\n\u0000"]),
			// 	success: () => {
			// 		console.log("接收信息");
			// 	},
			// });
		}, 500);
		this.onOpen();
		this.onClose();
		this.onError();
	}
	closeSocket() {
		if (this.isSocket == true) {
			wx.closeSocket({
				code: 0,
			});
			console.log("closeSocket 主动断开连接");
		}
	}
	onOpen() {
		wx.onSocketOpen((res) => {
			console.log("socket连接成功");
			this.isSocket = true;
		});
	}
	onClose() {
		wx.onSocketClose((res) => {
			console.log("socket连接中断");
			this.isSocket = false;
			console.log(res);
		});
	}
	onError() {
		wx.onSocketError((res) => {
			console.log("socket连接中断");
			this.isSocket = false;
			console.log(res);
		});
	}
	// 获取列表
	getAddressList() {
		return new Promise((resolve, rejects) => {
			request.post({
				url: "user/info/addressList",
				success: (res) => {
				if(res.length){
          resolve(res[0].usId)
        }
				
				},
				error:()=>{
					rejects(err)
				},
				finally:(al)=>{
					
				}
			});
		});
	}
}

module.exports = {
	WS,
};
