const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: Object,
    type: Number
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  timer: null,
  indexLike:0,
  /**
   * 组件的方法列表
   */
  methods: {
    // 回复
    handtapreply(e) {
      this.triggerEvent("reply", this.data.list)
    },
    // 点赞
    handtapislike() {
      let status
      if (this.data.list.isLike == 1) {
        status = -1
        this.data.list.likeNum--
      } else {
        status = 1
        this.data.list.likeNum++
      }
      this.setData({
        list: {
          ...this.data.list,
          isLike: status
        }
      })
      this.indexLike++
      clearTimeout(this.timer)
      if(this.indexLike%2==0)return
      this.timer = setTimeout(() => {
        app.request.post({
          url: "user/comment/commentLike",
          params: {
            id: this.data.list.id,
            status: status,
            type: this.data.type
          },
          success: () => {

          }
        })
        this.indexLike = 0
      }, 200);
    }
  }
})