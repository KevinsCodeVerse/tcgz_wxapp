// components/commentList/commentList.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    iid: Number,
    type: Number,
    info: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    commentreply: "",
    isnum: [], // 是否显示全部信息
    ADDnum: [], // 是否显示全部信息
    commentList: null, // 评论
    commentParams: {
      pageNo: 1,
      pageSize: 10,
    },
    total: 0,
    pages: 0,
    istit: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 失去聚焦
    blur() {
      let child = this.selectComponent('#footers_id')
      if (child.data.focusId == 1) {
        console.log("失去焦点");
        this.setData({
          commentreply: "",
          focusId: 0
        })
      }
    },

    // 回复
    reply(e) {
      setTimeout(() => {
        let child = this.selectComponent('#footers_id')
        child.setData({
          placeholder: '回复' + e.detail.userName + ": ",
          focusId: 1
        })
        this.data.commentreply = e.detail
        console.log("回复");
      }, 300);

    },

    // 请求 评论数据
    getcomment(params) {
      return new Promise((resolve, reject) => {
        app.request.post({
          url: "user/comment/public/comment",
          params: {
            id: this.data.iid,
            type: this.data.type,
            pageNo: params.pageNo,
            pageSize: params.pageSize
          },
          success: (res) => {
            resolve(res)
            wx.hideLoading();
          },
          error: (err) => {
            reject(err)
          }
        })
      })
    },
    // 请求 评论数据
    async NEWgetcomment() {
      // if(this.data.commentList.total)return
      this.data.commentParams.pageNo++
      let a = this.data.commentParams.pageNo * this.data.commentParams.pageSize
      if (this.data.commentList.total <= a) {
        this.setData({
          istit: true
        })
        return
      }
      let commentList = await this.getcomment(this.data.commentParams) // 请求评论数据
      this.data.commentList.list = [...this.data.commentList.list, ...commentList.list]
      this.setData({
        commentList: this.data.commentList
      })
    },
    // 点击 发送 
    comment(e) {
      let child = this.selectComponent('#footers_id')
      console.log(e.detail);
      if (e.detail[0] == null) {
        return wx.showToast({
          icon: 'none',
          title: '请输入评论再试!',
          mask: false,
        });
      }

      if (this.data.commentreply.id) {
        console.log("回复");
        app.request.post({
          url: "user/comment/addReply",
          params: {
            comment: e.detail,
            commentId: this.data.commentreply.commentId || this.data.commentreply.id,
            parentId: this.data.commentreply.userId||"",
            parentName: this.data.commentreply.userName
          },
          success: async (res) => {
            console.log(res);
            this.data.commentParams.pageSize = this.data.commentParams.pageNo * this.data.commentParams.pageSize
            this.data.commentParams.pageNo = 1
            this.data.istit = true

            this.setData({
              commentList: await this.getcomment(this.data.commentParams),
              commentreply: ""
            })
            child.setData({
              input: '',
              placeholder: "写评论...",
              focusId: 0,
            })
            console.log(this.data);
            this.triggerEvent("operation")
            wx.event.emit('comment', {
              id: this.data.info.id,
              type:this.data.info.type
            }) 
          }
        })
      } else {
        console.log("写评论");
        app.request.post({

          url: "user/comment/add",
          params: {
            comment: e.detail,
            id: this.data.iid,
            type: this.data.type
          },
          success: async (res) => {
            console.log(res);
            this.data.commentParams.pageSize = this.data.commentParams.pageNo * this.data.commentParams.pageSize
            this.data.commentParams.pageNo = 1
            this.data.istit = true
            this.setData({
              commentList: await this.getcomment(this.data.commentParams)
            })
            console.log(this.data.commentParams);
            console.log(this.data);
            this.triggerEvent("operation")
            child.setData({
              input: ''
            })
            wx.event.emit('comment', {
              id: this.data.info.id,
              type:this.data.info.type
            }) 

          },
          error: (err) => {

          }
        })

      }
    },
    // 点赞 事件
    like(e) {
      let child = this.selectComponent('#footers_id')
      console.log(e.detail);
      if (this.data.type == 1 || this.data.type == 4 || this.data.type == 2|| this.data.type == 3) {
        app.request.post({
          url: "user/article/like",
          params: {
            id: this.data.iid,
            status: e.detail ? 1 : -1
          },
          success: (res) => {
            console.log(res);
            this.triggerEvent("operation")
          },
          error: (err) => {
            child.setData({
              like: !child.data.like,
            })
          }
        })
      } else if (this.data.type == 5) {
        app.request.post({
          url: "user/videoCollect/like",
          params: {
            id: this.data.iid,
            status: e.detail ? 1 : -1
          },
          success: (res) => {
            console.log(res);
          },
          error: (err) => {
            child.setData({
              like: !child.data.like,
            })
          }
        })
      }

    },
    // 收藏 事件
    collect(e) {
      let child = this.selectComponent('#footers_id')
      console.log(child);
      if (this.data.type == 1 || this.data.type == 4 || this.data.type == 2|| this.data.type == 3) {
        app.request.post({
          url: "user/article/favor",
          params: {
            id: this.data.iid,
            status: e.detail ? 1 : -1
          },
          success: (res) => {
            console.log(res);
            this.triggerEvent("operation")
          },
          error: (err) => {
            child.setData({
              isCollect: !child.data.isCollect
            })
          }
        })
      } else if (this.data.type == 5) {
        app.request.post({
          url: "user/videoCollect/favor",
          params: {
            id: this.data.iid,
            status: e.detail ? 1 : -1
          },
          success: (res) => {
            console.log(res);
            this.triggerEvent("operation")
          },
          error: (err) => {
            child.setData({
              isCollect: !child.data.isCollect
            })
          }
        })
      }


    },
    // 分享记录
    share() {
      if (this.data.type == 5) {
        app.request.post({
          url: "user/videoCollect/share",
          params: {
            id: this.data.iid,
          },
          success: () => {
            this.triggerEvent("operation")
          }
        })
      } else if (this.data.type == 1 || 2 || 3 || 4) {
        app.request.post({
          url: "user/article/share",
          params: {
            id: this.data.iid,
          },
          success: () => {
            this.triggerEvent("operation")
          }
        })
      }

    },

    // 切换隐藏页
    handtapnum(e) {
      let index = e.currentTarget.dataset.index
      if (this.data.isnum[index] == 0) {
        this.data.isnum[index] = true

        this.setData({
          isnum: this.data.isnum
        })
      } else {
        this.data.isnum[index] = false

        this.setData({
          isnum: this.data.isnum
        })
      }
      console.log(this.data.commentList);
    },

    // 加载更多
    handtapnumADD(e) {
      let index = e.currentTarget.dataset.index
      this.data.ADDnum[index] += 10
      this.setData({
        ADDnum: this.data.ADDnum
      })
    }


  },



  // 生命周期
  async ready() {
    let commentList = await this.getcomment(this.data.commentParams) // 请求评论数据

    for (let i = 0; i < commentList.total + 10; i++) {
      this.data.isnum[i] = false
      this.data.ADDnum[i] = 10
    }
    this.setData({
      commentList,
      isnum: this.data.isnum,
      ADDnum: this.data.ADDnum
    })

    setTimeout(() => {
      console.log(this.data.commentList);
    }, 2000);
  }
})