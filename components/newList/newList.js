// components/newsList/newList.js
let app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isIndex: {
      type: Boolean,
      default: false
    },
    isRecomm: {
      type: Boolean,
      default: false
    },
    recommType: {
      type: Number
    },
    active: {
      type: String
    },
    type: {
      type: Number
    },
    title: {
      type: String
    },
    indexType: {
      type: String
    },
    recommendType: {
      type: Number
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    playIndex: '',
    // 分页参数
    pageNo: 0,
    pageSize: 10,
    finish: false,
    loading: false,
    list: [],
    showVideo: false
  },

  attached: function () {
    this.getAdList();
    this.getList();
    //发射事件给消息页面监听

  },
  pageLifetimes: {
    show: function () {
      wx.event.on('comment', (e) => {
        let index = this.data.list.findIndex(item => item.id == e.id && item.type == e.type)
        if (index != -1) {
          this.data.list[index].comment++
          this.setData({
            list: this.data.list
          })
        }
      })
    },
  },
  detached() {
    wx.event.off('comment')
  },

  observers: {
    'active,title': function (active, title) {
      this.setData({
        list: [],
        pageNo: 0,
        finish: false,
        loading: false
      })
      this.getList();
    },
    'indexType': function (indexType) {
      this.setData({
        list: [],
        pageNo: 0,
        finish: false,
        loading: false
      })
      this.getList();
    },
    'recommType': function (recommType) {
      this.setData({
        list: [],
        pageNo: 0,
        finish: false,
        loading: false
      })
      this.getList();
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 是否显示视频
    getAdList() {
      app.request.post({
        url: 'user/pro/public/adList',
        success: res => {
          this.setData({
            showVideo: res == 0 ? false : true
          })
        },
      })
    },
    // 资讯列表
    getList() {
      if (this.data.loading || this.data.finish) return;
      this.setData({
        loading: true
      })
      let adCode = wx.getStorageSync('adcode');
      if (!adCode) {
        this.setData({
          loading: false
        })
        return;
      }
      this.setData({
        pageNo: this.data.pageNo + 1
      })
      let url, params;
      if (this.data.isIndex) {
        if (!this.data.indexType) {
          this.setData({
            loading: false
          })
          return;
        }
        url = 'user/article/public/indexList';
        params = {
          pageNo: this.data.pageNo,
          pageSize: this.data.pageSize,
          type: this.data.indexType,
          adCode: adCode
        };
      } else if (this.data.isRecomm) {
        if (!this.data.recommType) return;
        url = 'user/article/public/recommList';
        params = {
          type: this.data.recommType,
          adCode: adCode
        };
      } else {
        if (!this.data.active) {
          this.setData({
            loading: false
          })
          return;
        }
        url = 'user/article/public/secList';
        params = {
          title: this.data.title,
          pageNo: this.data.pageNo,
          pageSize: this.data.pageSize,
          type: this.data.type,
          adCode: adCode
        };
        if (this.data.active == '-1') {
          params.orderBy = 1;
        } else if (this.data.active == '-2') {
          params.orderBy = 2;
        } else {
          params.categoryId = this.data.active;
        }
      }
      app.request.post({
        url: url,
        params: params,
        success: result => {
          let resultList = [];
          if (this.data.isRecomm) {
            resultList = result;
          } else {
            resultList = result.list;
          }
          for (let item of resultList) {
            if (item.image) {
              item.image = item.image.split(',');
            } else {
              item.image = [];
            }
          }
          let list = this.data.list.concat(resultList);
          this.setData({
            list: list
          })
          if (resultList.length < this.data.pageSize) {
            this.setData({
              finish: true
            })
          }
          this.setData({
            loading: false
          })
        },
        allError: () => {
          this.setData({
            loading: false
          })
        }
      })
    },
    toNews(e) {

      let id = e.currentTarget.dataset.id;
      let type = e.currentTarget.dataset.type;

      let index = this.data.list.findIndex(item => item.id == id && item.type == type)
      if (index != -1) {
        console.log(this.data.list[index]);
        this.data.list[index].reading++
        this.setData({
          list: this.data.list
        })
      }
      if (type == 5 || type == undefined) {
        
        if (getCurrentPages().length > 9) {
          wx.redirectTo({
            url: '/pages/focus/highlights/detail/detail?id=' + id
          })
        }
        else{
          wx.navigateTo({
            url: '/pages/focus/highlights/detail/detail?id=' + id
          })
        }
      } else{
        if (getCurrentPages().length > 9) {
          wx.redirectTo({
            url: '/pages/focus/newsDetail/newsDetail?id=' + id + '&type=' + type
          })
        }
        else{
          wx.navigateTo({
            url: '/pages/focus/newsDetail/newsDetail?id=' + id + '&type=' + type
          })
        }
      }
      
      
    },
    toVideo(e) {
      let id = e.currentTarget.dataset.id;
      let type = e.currentTarget.dataset.type;
      let index = this.data.list.findIndex(item => item.id == id && item.type == type)
      if (index != -1) {
        console.log(this.data.list[index]);
        this.data.list[index].reading++
        this.setData({
          list: this.data.list
        })
      }
      if (type == 5 || type == undefined) {
        if (getCurrentPages().length > 9) {
          wx.redirectTo({
            url: '/pages/focus/highlights/detail/detail?id=' + id
          })
        }
        else{
          wx.navigateTo({
            url: '/pages/focus/highlights/detail/detail?id=' + id
          })
        }
        
      } else {
        if (getCurrentPages().length > 9) {
          wx.redirectTo({
            url: '/pages/focus/videoDetail/videoDetail?id=' + id + '&type=' + type
          })
        } else {
          wx.navigateTo({
            url: '/pages/focus/videoDetail/videoDetail?id=' + id + '&type=' + type
          })
        }

      }
    },
    play() {

    },
    playChange(e) {
      if (this.data.playIndex || this.data.playIndex === 0) {
        var videoContext = wx.createVideoContext('video' + this.data.playIndex, this);
        videoContext.pause();
      }
      this.setData({
        playIndex: e.currentTarget.dataset.index
      })
    }
  }
})