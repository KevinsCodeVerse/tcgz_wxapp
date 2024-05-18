// components/topUp/topUp.js
const app = getApp()
Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: { 

    },  

    /**
     * 组件的方法列表
     */
    methods: {
        handTotUp(e){
            let money = e.currentTarget.dataset.amount
            app.request.post({
                url: "mt/bid/balanceRecharge",
                myType:1,
                params: {
                    money,
                    userId:wx.getStorageSync('userId')
                },
                success: (res) => {
                    console.log(res);
                    this.pay(res)
                },
                fail: (err) => {

                    
                },
                finally: () => {
                    
                },
            });
        },
        pay(res){
            wx.requestPayment({
                timeStamp: res.timeStamp,
                nonceStr: res.nonceStr,
                package: res.packageValue,
                signType: 'MD5',
                paySign: res.paySign,
                success: (res)=> {
                    wx.showToast({
                      title: '支付成功',
                      duration:2000,
                      success:()=>{
                          this.triggerEvent("pay")
                      }
                    })

                },
                fail (res) { }
              })
        }
    }
})
