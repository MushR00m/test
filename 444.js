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
  // 通过 Fetch API 发起请求获取IP地址信息
  fetch('https://ipapi.co/json/')
    .then(response => response.json())
    .then(data => onNewIP(data.ip))
    .catch(error => {
      console.error(error);
      // 若ipapi.co接口不可用，则使用备选的freegeoip.app接口
      fetch('https://freegeoip.app/json/')
        .then(response => response.json())
        .then(data => onNewIP(data.ip))
        .catch(error => {
          console.error(error);
          // 若都不可用，则输出错误信息
          console.error("Unable to get IP address information.");
        })
    })
}


// 获取WebRTC方式的IP地址信息
function getWebRTCIP(onNewIP) {
  var RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
  if (RTCPeerConnection) { // 检测浏览器是否支持WebRTC
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
}

// 判断当前浏览器是否为IE
function isIE() {
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf('MSIE ');
  var trident = ua.indexOf('Trident/');
  var edge = ua.indexOf('Edge/');
  if (msie > 0 || trident > 0 || edge > 0) {
    return true;
  }
  return false;
}

// 判断当前浏览器是否为Safari
function isSafari() {
  var ua = window.navigator.userAgent;
  var safari = ua.indexOf('Safari/');
  var chrome = ua.indexOf('Chrome/');
  if (safari > 0 && chrome === -1) {
    return true;
  }
  return false;
}

// 调用获取传统方式IP地址的方法
getTraditionalIP(function(ip) {
  console.log("Your traditional IP address is: " + ip);
});

// 调用获取WebRTC方式IP地址的方法
getWebRTCIP(function(ip) {
  console.log("Your WebRTC IP address is: " + ip);
});

// 兼容IE浏览器，通过 ActiveXObject 获取本机IPv4地址
if (isIE()) {
  var obj = new ActiveXObject("WScript.Shell");
  var ip = obj.Exec("cmd /c ipconfig | findstr IPv4");
  while (!ip.StdOut.AtEndOfStream) {
    var temparr = ip.StdOut.ReadLine().split(": ");
    if (temparr.length > 1) {
      console.log("Your local IP address is: " + temparr[1]);
    }
  }
}

// 兼容 Safari，使用 XHR 请求 IP 地址查询服务
if (isSafari()) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://ipapi.co/json/', true);
  xhr.onload = function() {
    var response = JSON.parse(xhr.responseText);
    console.log("Your local IP address is: " + response.ip);
  }
  xhr.send();
}
