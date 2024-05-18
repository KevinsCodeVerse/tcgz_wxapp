// pages/card/messageDetail/messageDetail.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    myInfo: "",
    otherInfo: "",
    load: true,
    scrollTop: 0, // 初始化滚动位置
    content: "",
    sessionId: "",
    messageList: [],
    scrollIntoView: "",
    messageType:"",
    messageHight:""
  },

  chuDi() {
    this.messageDetail()
  },
  messageDetail(e) {
    if (e) {
      this.setData({
        sessionId: e.id
      })
    }
    this.setData({
      load: true
    })
    app.request.post({
      url: "us/cardInfo/sessionDetail",
      params: {
        sessionId: this.data.sessionId
      },
      success: (res) => {
        this.setData({
          messageList: res.list,
          load: false
        })
        var usId = wx.getStorageSync('userId');
        if (res.needCard) {
          if (usId === res.needCard.userId) {
            this.setData({
              myInfo: res.needCard,
              otherInfo: {
                ...res.resourceCard,
                type: 1
              }
            })
          }
        }
        if (res.resourceCard) {
          if (usId === res.resourceCard.userId) {
            this.setData({
              myInfo: res.resourceCard,
              otherInfo: {
                ...res.needCard,
                type: 2
              }
            })
          }
        }
        if(!res.needCard&&!res.resourceCard){                  
          this.setData({
            messageType:1,
            messageHight:'67vh'
          })
          this.data.messageList.forEach(item=>{
            if(item.itemType===0||item.itemType===1||item.itemType===2){
              this.setData({
                otherInfo:{
                  ...item,
                  type:item.itemType
                }
              })
              console.log("info:",this.data.otherInfo);
            }
          })
        }else{       
          console.log(456456);    
           this.setData({
            messageType:0,
            messageHight:'50vh'
          })         
        }
        this.scrollToBottom()
      },
    });
  },
  //滚动到底部方法
  scrollToBottom() {
    this.setData({
      scrollIntoView: 'message_' + (this.data.messageList.length - 1), // 目标ID为最后一个消息项
    });
  },
  sendMessage() {
    if (this.data.content === '') {
      wx.showToast({
        title: '请输入内容',
        icon:'none'
      })
      return;
    }
    app.request.post({
      url: "us/cardInfo/sendMessage",
      params: {
        content: this.data.content,
        sessionId: this.data.sessionId
      },
      success: (res) => {
        wx.showToast({
          title: '发送成功',
        })
        this.setData({
          content: ""
        })
        this.messageDetail()
        this.scrollToBottom()
      },
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.messageDetail(options)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.scrollToBottom()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})