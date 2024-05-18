// components/content/footers/footers.js
const app = getApp()
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		like: Boolean,
		isCollect: Boolean,
		info: Object,
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		platform: app.globalData.platform,
		// isCollect: false,	// 是否 收藏
		// like: false,		// 是否 点赞
		num: 155555.55555,
		focusId:0,
		input: '', // 输入的内容
		placeholder: '写评论...' // 输入的提示
	},
	indexLike: 0,
	timerLike: null,
	indexCollect: 0,
	timerCollect: null,
	/**
	 * 组件的方法列表
	 */
	methods: {
		// 失去焦点点
		handingblur(){
			this.setData({
				placeholder:'写评论...'
			})
			this.triggerEvent('blur')
		},
		
		// 点击评论
		comment() {
			if (this.data.input == ""||typeof this.data.input == "undefined" || this.data.input == null || this.data.input == "") {
				
			} else{
				this.data.info.comment++
				this.setData({
					info: this.data.info
				})
			}
			this.triggerEvent('comment', this.data.input)
		},
		// 点赞
		like() {
			this.setData({
				like: !this.data.like
			})
			this.data.info.likes += this.data.like ? 1 : -1
			this.setData({
				info: this.data.info
			})
			clearTimeout(this.timerLike)
			this.indexLike++
			this.timerLike = setTimeout(() => {
				if (this.indexLike % 2 == 0) return
				if(this.data.like == this.data.info.isLike) return
				this.triggerEvent('like', this.data.like)
				this.indexLike = 0
				this.data.info.isLike = !this.data.info.isLike
			}, 100);
		},
		// 收藏
		collect() {
			this.setData({
				isCollect: !this.data.isCollect
			})
			this.data.info.favorites += this.data.isCollect ? 1 : -1
			this.setData({
				info: this.data.info
			})
			clearTimeout(this.timerCollect)
			this.indexCollect++
			this.timerCollect = setTimeout(() => {
				if (this.indexCollect % 2 == 0) return
				if(this.data.isCollect == this.data.info.isFavor) return
				this.triggerEvent('collect', this.data.isCollect)
				this.indexCollect = 0
				this.data.info.isFavor = !this.data.info.isFavor

			}, 100);
		},
		// 分享
		share() {
			this.triggerEvent('share')
		},

		// 输入了
		input(e) {
			this.setData({
				input: e.detail.value
			})
		}
	},
	created() {
		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline']
		})
	}
})