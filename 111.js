// 获取浏览器信息和设备信息
var userAgent = navigator.userAgent;
var appVersion = navigator.appVersion;

// 获取地理位置信息
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(function(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    var accuracy = position.coords.accuracy;
    console.log('Latitude: ' + latitude);
    console.log('Longitude: ' + longitude);
    console.log('Accuracy: ' + accuracy);
  });
}

// 获取传统方式的IP地址信息
function getTraditionalIP(onNewIP) {
  // 通过请求一个静态资源来获取IP地址信息
  var script = document.createElement("script");
  script.src = "https://4.ipw.cn/";
  script.type = "text/javascript";
  document.getElementsByTagName("head")[0].appendChild(script);

  script.onload = function() {
    onNewIP(window.__ipinfo);
  };
}

// 获取WebRTC方式的IP地址信息
function getWebRTCIP(onNewIP) {
  var RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
  var pc = new RTCPeerConnection({
    iceServers: []
  });
  var noop = function() {};

  pc.createDataChannel(""); // 创建数据通道
  pc.createOffer(function(sdp) { // 创建 offer
    sdp.sdp.split('\n').forEach(function(line) {
      if (line.indexOf('candidate') < 0) return;
      var parts = line.split(' ');
      var candidate = {
        foundation: parts[0],
        component: parts[1],
        protocol: parts[2].toLowerCase(),
        priority: parseInt(parts[3], 10),
        ip: parts[4],
        port: parseInt(parts[5], 10),
        type: parts[7]
      };
      if (candidate.protocol !== 'udp' || candidate.type !== 'host') return;
      onNewIP(candidate.ip);
    });
    pc.setLocalDescription(sdp, noop, noop); // 设置本地描述信息
  }, noop);
}

// 调用获取传统方式IP地址的方法
getTraditionalIP(function(ip){
console.log("Your traditional IP address is: " + ip);
});

// 调用获取WebRTC方式IP地址的方法
getWebRTCIP(function(ip){
console.log("Your WebRTC IP address is: " + ip);
});
