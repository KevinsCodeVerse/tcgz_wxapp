Component({
  // 启用插槽
  options: {
    multipleSlots: true
  },

  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    items: {
      type: Array,
      value: [],
    },
    active: {
      type: String,
      value: '',
      observer: function(val){
        if(val){
          this.setData({
            active_page: val
          })
          let itemWidth = wx.getSystemInfoSync().windowWidth / this.data.items.length; // 每个item 的宽度
          let index = this.data.items.findIndex((item)=>{
            return item.name == val
          })
          let offset = itemWidth * index;
          this.getRpx(result => {
            this.setData({
              style: 'left:' + ((offset * result) + ((itemWidth * result - 70) / 2)) + 'rpx;'
            })
          })
        }
      }
    }
  },

  data: {
    // 这里是一些组件内部数据
    curIndex: 0,  // 当前选中下标
    active_page: '', // 当前激活页
    style: '',
  },

  // 组件加载
  ready() {
    if (!this.data.style){
      this.setData({ active_page: this.data.active })
      let itemWidth = wx.getSystemInfoSync().windowWidth / this.data.items.length; // 每个item 的宽度
      this.getRpx(result => {
        this.setData({
          style: 'left:' + ((itemWidth * result - 70) / 2) + 'rpx;'
        })
      })
    }
  },

  methods: {
    // px 转 rpx 方法
    getRpx(callback){
      wx.getSystemInfo({
        success: (res) => {
          callback((750 / res.windowWidth));
        }
      })
    },

    toActive(e) {
      // wx.getSystemInfoSync().windowWidth // 屏幕宽度
      // wx.getSystemInfoSync().windowWidth / this.data.items.length  // 每个item的宽度
      // e.currentTarget.offsetLeft;  // 对应item的偏移度
      this.getRpx(result=>{
        // 设置下横杠的偏移度并设置相应的data
        this.setData({
          style:'left:' + ((e.currentTarget.offsetLeft * result) + (wx.getSystemInfoSync().windowWidth / this.data.items.length*result-70)/2) + 'rpx;',
          curIndex: e.currentTarget.dataset.current,
          active_page: e.currentTarget.dataset.name
        })
      })
      // 响应给父组件
      this.triggerEvent('change', e.currentTarget.dataset.name)
    }
    
  }
})