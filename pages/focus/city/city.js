const app = getApp()
Page({
  data: {
    content:'',
    list: [
      // {
      //   id: 'city1',
      //   type: 1,
      //   title: '市直公共文体场馆开展疫情防控应急演练',
      //   author: '惠州市文化广电旅游体育局',
      //   imgs: ['https://www.tcgz.store//files/merchantShop/editor/15986860522290540.png'],
      //   comments: 160
      // },
      // {
      //   id: 'city2',
      //   type: 1,
      //   title: '探访水巷街，走进岁月里的别样温柔！',
      //   author: '惠州市文化广电旅游体育局',
      //   imgs: ['https://www.tcgz.store//files/merchantShop/editor/15987966416316208.png'],
      //   comments: 108
      // },
      // {
      //   id: 'city3',
      //   type: 1,
      //   title: '扬帆出海 | 央视讲述白马窑遗址的幕后故事！',
      //   author: '惠州市文化广电旅游体育局',
      //   imgs: ['https://www.tcgz.store//files/merchantShop/editor/16001162282801936.png'],
      //   comments: 100
      // }
    ],
    // content: '<p><img src="https://www.tcgz.store//files/merchantShop/editor/15981143494998416.png" style="max-width:100%;"></p><p><br></p><p style="text-align:center;"><b style=""><font style="font-size:20px;">惠州—惠民之州</font></b><br></p><p style="text-align:center;"><font style="font-size:24px;"><b><br></b></font></p><p style="text-align:left;"><img src="https://www.tcgz.store//files/merchantShop/editor/15981209291236694.png" style="max-width:100%;"><font size="5"><b><br></b></font></p><p style="text-align:left;"><br></p><p style="text-align:left;">&nbsp; &nbsp; &nbsp; &nbsp;惠州，广东省地级市，地处粤港澳大湾区东岸，背靠罗浮山，南临大亚湾，境内东江蜿蜒100多公里，是珠江三角洲中心城市之一&nbsp;&nbsp;。总面积11347平方公里&nbsp;，下辖惠城区、惠阳区、惠东县、博罗县和龙门县，设有仲恺高新技术产业开发区和大亚湾经济技术开发区两个国家级开发区。根据第七次人口普查数据，截至2020年11月1日零时，惠州市常住人口为6042852人。<br></p><p style="text-align:left;"><br></p><p style="text-align:left;"><img src="https://www.tcgz.store//files/merchantShop/editor/15981231053523350.png" style="max-width:100%;"><br></p><p style="text-align:left;"><br></p><p style="text-align:left;">&nbsp; &nbsp; &nbsp; &nbsp;惠州是国家历史文化名城&nbsp;&nbsp;，在隋唐已是“粤东重镇”，至今1400多年，一直是东江流域政治、经济、军事、文化中心和商品集散地。在古代即有“岭南名郡”、“粤东门户”之称，简称鹅城&nbsp;&nbsp;。惠州是中国近代抗争史的前沿阵地，曾建立华南抗日战争的主力部队—东江纵队。&nbsp;东江中下游的中心城市，处在客家文化、广府文化和潮汕文化的交汇地带，各种文化相互交融、兼收并蓄，广东汉剧、渔歌、山歌、舞龙、舞狮、舞春牛、瑶族的舞火狗等各种文化活动盛行&nbsp;。</p><p style="text-align:left;"><img src="https://www.tcgz.store//files/merchantShop/editor/15981250928074772.png" style="max-width: 100%;"><br></p><p style="text-align:left;"><br></p><p style="text-align:left;">&nbsp; &nbsp; &nbsp; &nbsp;惠州还是客家人的重要聚居地和集散地之一，旅居海外华人华侨、港澳台同胞居客家四州之首，被称为客家侨都。惠州是广东三大族群客家人、潮汕人、广府人融合得最为成功的地方，也是客家人从陆地文明走向海洋文明的重要通道之一。客家人是惠州人中人数最多的群体，客家文化是惠州文化中不可或缺的重要组成部分，海外许多客家华侨的祖籍地就是惠州&nbsp;&nbsp;。从唐到清末1000多年间，共有430多位中国名人客寓或临履惠州，留下了许多让世人为之骄傲的历史文化遗产。2020年惠州市地区生产总值为4221.79亿元。<br></p><p style="text-align:left;"><br></p><p style="text-align:left;"><img src="https://www.tcgz.store//files/merchantShop/editor/15981292131303590.png" style="max-width:100%;"><br></p>'
  },
  //监听页面初次加载
  onLoad: function (options) {
    this.getDetail();
  },
  //监听页面显示
  onShow: function () {
  },
  //自定义函数编写处，下方其他系统函数使用请提前到此注释前
  getDetail() {
    if(this.data.loading) return;
    this.setData({
      loading: true
    })
    let adCode = wx.getStorageSync('adcode');
    wx.showLoading({
      title: '加载中'
    })
    app.request.post({
      url: 'user/cityInfo/public/detail',
      params: {
        adCode: adCode
      },
      success: result => {
        result.description = result.description.replace(/\<img(.*?)src/g,'<img style="max-width:100%!important;height:auto;display:block;" src')
        result.description = result.description.replace(/\<p/g,'<p style="line-height:1.8;text-indent:25px;"')
        result.description = result.description.replace(/\<p style="line-height:1.8;text-indent:25px;"\>\<img/g,'<p><img')

        this.setData({
          content: result.description,
          loading: false
        })
        wx.hideLoading();
      },
      allError: () => {
        this.setData({
          loading: false
        })
        wx.hideLoading();
      }
    })
  },
  
  //监听页面初次加载完成
  onReady: function () {
  },
  //监听页面隐藏
  onHide: function () {
  },
  //监听页面卸载
  onUnload: function () {
  },
  //监听用户下拉动作
  onPullDownRefresh: function () {
  },
  //监听用户下拉动作
  onPullDownRefresh: function () {
  },
  //用户上拉触底事件的处理函数
  onReachBottom: function () {
  },
  //用户点击右上角转发
  onshareAppMessage: function () {
  },
})