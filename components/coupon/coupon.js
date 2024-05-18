// components/coupon/coupon.js
const app = getApp();
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		type: Number,
		shopId: Number,
        price: Number,
        numPrice: Number,
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		show: false,
		list: [],
		conponPrice: 0,
		conponUseAmount: 0,
	},
	lifetimes: {
		ready: function () {
			this.getList();
		},
	},
	/**
	 * 组件的方法列表
	 */
	methods: {
		onClose() {
			this.setData({
				show: false,
			});
		},
		openCoupon() {
            if(!this.data.list.length)return;
			this.setData({
				show: true,
			});
		},
		getList() {
			app.request.post({
				url: "user/coupon/select",
				params: {
					merchantId: this.data.shopId,
					type: this.data.type,
				},
				success: (res) => {
					console.log(res);
					res.sort((item1, item2) => item1.useAmount - item2.useAmount);
					this.setData({
						list: res,
					});
				},
				fail: (err) => {},
				finally: () => {},
			});
		},
		select(e) {
            console.log(this.data.price - e.currentTarget.dataset.obj.useAmount);
            
			if (this.data.price+this.data.conponPrice - e.currentTarget.dataset.obj.useAmount >= 0) {
				this.setData({
					show: false,
					conponPrice: e.currentTarget.dataset.obj.amount,
					conponUseAmount: e.currentTarget.dataset.obj.useAmount,
				});
				this.triggerEvent("coupon", e.currentTarget.dataset.obj);
			}
		},
		// 不适用优惠券
		noConpon() {
			this.setData({
				show: false,
				conponPrice: 0,
			});
			this.triggerEvent("coupon", { id: 0 });
		},
	},
	observers: {
		show: function (res) {
			if (this.data.show == true) {
				this.getList();
			}
		},
		price: function (res) {
			if (this.data.conponUseAmount > this.data.price+this.data.conponPrice) {
				this.setData({
					conponPrice: 0,
					conponUseAmount: 0,
				});
				this.triggerEvent("coupon", { id: 0 });
			}
        },
        shopId:function(res){
            this.setData({
                conponPrice: 0,
                conponUseAmount: 0,
            });
				this.getList();

            this.triggerEvent("coupon", { id: 0 });
        }
        
	},
});
