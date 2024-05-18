// pages/collective/news/news.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    firmId: {
      type: String,
      value: ''
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    newsList: [],
  },

  ready(){
    this.getNews();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goInformation(e){
      let id= e.currentTarget.dataset.id
      wx.navigateTo({
        url: '/pages/collective/news_detail/news_detail?id='+id,
      })
    },
    
    // 获取组织资讯
    getNews(id){
      app.request.post({
        url: 'user/firm/public/news/list',
        params: {
          firmId: this.data.firmId,
          pageNo: 1,
          pageSize: 1000
        },
        success: res => {
          this.setData({
            newsList: res.list
          })
        },
      })
    },
  }
})
