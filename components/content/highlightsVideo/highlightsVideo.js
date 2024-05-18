// components/content/highlightsVideo/highlightsVideo.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        videoInfo:Object
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
        toDetail() { 
            wx.navigateTo({
                url: '/pages/focus/highlights/detail/detail?id=' + this.data.videoInfo.id,
            })
        },
    }
})