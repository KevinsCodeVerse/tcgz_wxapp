// pages/collective/activity/index.js
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
    type:{
      type: Number,
      value: 1
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    list: [],
    pageNo:1,
    isMax:false,
    loading:false,
    pageSize:10
  },

  ready(){
    this.setData({
      pageNo:1
    })
    this.getList();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goActivity(e){
      var obj= e.currentTarget.dataset.obj
      console.log(obj);
      if(obj.type==0){   //报名
        wx.navigateTo({
          url: '/pages/collective/activity_detail/activity_detail?id='+obj.id+'&type='+obj.type+'&activityType='+obj.activityType,
        })
      }else if(obj.type==1){
        wx.navigateTo({
          url: '/pages/collective/activity_detail2/activity_detail2?id='+obj.id+'&type='+obj.type+'&activityType='+obj.activityType,
        })
      }
    },
    getList(){
      if(this.data.isMax||this.data.loading)return
      this.setData({
        loading:true
      })
      let url ='user/firm/activity/list'
      this.data.type==2&&(url="user/article/public/activity/list")
      app.request.post({
        url,
        params: {
          firmId: this.data.type!=2?this.data.firmId:'',
          adCode:wx.getStorageSync('adcode'),
          pageNo: this.data.pageNo,
          pageSize: this.data.pageSize
        },
        success: res => {
          
          if(this.data.pageNo!=1){
            this.setData({
              list: [...this.data.list,...res.list]
            })
          }else{
            this.setData({
              list: res.list,
            })
          }
          this.data.pageNo++
          if(res.list.length<this.data.pageSize){
            this.setData({
                isMax:true,
            })
          }
        },
        finally:fi=>{
          this.setData({
            loading:false
        })
        }
      })
    },
  },
})