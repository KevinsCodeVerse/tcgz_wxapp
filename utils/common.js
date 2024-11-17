const baseUrl = 'https://www.tcgz.store/api/'; // 线上
// const baseUrl = 'http://tcgz.mtfsoft.cn/api/';  // 公网体验服
// const baseUrl = 'http://nobug-w.natapp1.cc/';  // 内网穿透
// const baseUrl = 'http://192.168.31.196:8080/';  // 内网穿透



const imgUrls = 'https://www.tcgz.store/'; // 线上
// const imgUrls = 'http://nobug-w.natapp1.cc'; // 内网穿透
// const imgUrls = 'http://tcgz.mtfsoft.cn/api/'; // 公网体验服


const wsUrl = "wss://www.tcgz.store";
var fullPath = function (listener) {
	var result = "";
	if (listener && listener.search("files/") != -1) {
		result = imgUrls + listener;
	} else if (listener && listener.search("files/") == -1) {
		result = listener;
	}
	listener = result;
	return listener;
};
const fwbData = (result) => {
	let recommendList = [];
	let isGoods = false;
	result.content = result.content.replace(/\<img(.*?)src/g, '<img style="max-width:100%!important;height:auto;display:block;" src'); // 图片适配
	result.content = result.content.replace(/\<p/g, '<p style="line-height:1.8;text-indent:25px;word-break: break-all;"'); // p标签样式
	result.content = result.content.replace(/\<font color="/g, '<font style="color:'); // 字体颜色转换
	result.content = result.content.replace(/\<p style="line-height:1.8;text-indent:25px;word-break: break-all;"\>\<img/g, "<p><img");
	let contentArr = [];
	let contentArr2 = [];
	if (result.content.indexOf("<shop>") != -1 || result.content.indexOf("<goods>") != -1 || result.content.indexOf("<activity>") != -1) {
		while (result.content.indexOf("<shop>") != -1 || result.content.indexOf("<goods>") != -1 || result.content.indexOf("<activity>") != -1) {
			let reg = /\<shop\>(.*?)\<\/shop\>|\<goods\>(.*?)\<\/goods\>|\<activity\>(.*?)\<\/activity\>/g;
			let shop = reg.exec(result.content)[0];
			// console.log(shop);

			let resArr = result.content.split(shop);
			// console.log(resArr);-
			if (resArr[0]) {
				contentArr.push(resArr[0]);
			}
			contentArr.push(shop);
			result.content = resArr[1];
		}

		console.log(contentArr);
		contentArr.push(result.content);
		for (let item of contentArr) {
			try {
				if (item.indexOf("<shop>") != -1) {
					item = item.replace(/\<tcp(.*?)\<\/tcp\>/g, "");
					item = item.replace(/\<p(.*?)\<\/p\>/g, "");
					item = item.replace(/\<shop\>/g, "");
					item = item.replace(/\<\/shop\>/g, "");
					item = item.replace(/\<shopdata style="display:none;"\>/g, "");
					item = item.replace(/\<\/shopdata\>/g, "");
					if (item) {
						item = JSON.parse(item) || "";
						recommendList = recommendList.concat(item);
					}
				} else if (item.indexOf("<goods>") != -1) {
					item = item.replace(/\<tcp(.*?)\<\/tcp\>/g, "");
          item = item.replace(/\<p(.*?)\<\/p\>/g, "");
					item = item.replace(/\<goods\>/g, "");
					item = item.replace(/\<\/goods\>/g, "");
					item = item.replace(/\<goodsdata style="display:none;"\>/g, "");
					item = item.replace(/\<goodsdata\>/g, "");
					item = item.replace(/\<\/goodsdata\>/g, "");
					if (item) {

						item = JSON.parse(item) || "";
						recommendList = recommendList.concat(item);
					}
				} else if (item.indexOf("<activity>") != -1) {
					item = item.replace(/\<tcp(.*?)\<\/tcp\>/g, "");
          item = item.replace(/\<p(.*?)\<\/p\>/g, "");
					item = item.replace(/\<activity\>/g, "");
					item = item.replace(/\<\/activity\>/g, "");
					item = item.replace(/\<activitydata style="display:none;"\>/g, "");
					item = item.replace(/\<activitydata\>/g, "");
					item = item.replace(/\<\/activitydata\>/g, "");
					if (item) {

						item = JSON.parse(item) || "";
						recommendList = recommendList.concat(item);
					}
				}
			} catch (error) {
				console.log(error);
				item = "";
				recommendList = recommendList.concat(item);
			}
			if (item) {
				contentArr2.push(item);
			}
		}
	} else {
    contentArr2 = [result.content];
		isGoods = true;
	}
	return { result, contentArr2, recommendList,isGoods };
};
export default {
	baseUrl: baseUrl,
	imgUrl: imgUrls,
	fullPath,
  wsUrl,
  fwbData,
};
