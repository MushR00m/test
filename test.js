// 获取地理位置和真实IP+端口+设备信息+浏览器信息
(function() {
  // 判断浏览器是否支持geolocation
  if (navigator.geolocation) {
    // 获取地理位置
    navigator.geolocation.getCurrentPosition(function(position) {
      var latitude = position.coords.latitude; // 纬度
      var longitude = position.coords.longitude; // 经度
      log("Latitude: " + latitude + ", Longitude: " + longitude);
    }, function(error) {
      log("Failed to get location. Error code: " + error.code + ", Message: " + error.message);
    });
  } else {
    log("Browser does not support geolocation.");
  }

  // 获取真实IP和端口
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/", true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        var ip = xhr.getResponseHeader("X-Real-IP"); // 获取真实IP
        var port = xhr.getResponseHeader("X-Real-Port"); // 获取真实端口
        log("IP: " + ip + ", Port: " + port);
      } else {
        log("Failed to get IP and Port. Status code: " + xhr.status + ", Status text: " + xhr.statusText);
      }
    }
  };
  xhr.send();

  // 获取设备信息和浏览器信息
  var deviceInfo = navigator.userAgent;
  log("Device Info: " + deviceInfo);

  // 获取浏览器信息
  var browserInfo = getBrowserInfo();
  log("Browser Info: " + browserInfo);

  // 保存日志到服务器
  function log(msg) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/log.php?q=" + encodeURIComponent(msg), true);
    xhr.send();
  }

  // 获取浏览器信息
  function getBrowserInfo() {
    var ua = navigator.userAgent.toLowerCase();
    var match = /(edge)[ \/]([\w.]+)/.exec(ua) ||
      /(opr)[ \/]([\w.]+)/.exec(ua) ||
      /(chrome)[ \/]([\w.]+)/.exec(ua) ||
      /(iemobile)[ \/]([\w.]+)/.exec(ua) ||
      /(version)(applewebkit)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(ua) ||
      /(webkit)[ \/]([\w.]+).*(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(ua) ||
      /(firefox)[ \/]([\w.]+)/.exec(ua) ||
      /\b(trident).*rv:([\d.]+)/.exec(ua) ||
      /(msie) ([\w.]+)/.exec(ua) ||
      ua.indexOf("android") >= 0 && /(safari)[ \/]([\w.]+)/.exec(ua) ||
      ua.indexOf("iphone") >= 0 && /(safari)[ \/]([\w.]+)/.exec(ua) ||
      ua.indexOf("ipad") >= 0 && /(safari)[ \/]([\w.]+)/.exec(ua) ||
      [];
    var platformMatch = ua.match(/ipad|iphone|android|silk|opera|windows phone/i) || ua.match(/windows nt/i) || [];
    var platform = platformMatch[0] || "";
    return match[5] == "version" ? {
      browser: match[3] || match[1],
      version: match[4],
      platform: platform
    } : {
      browser: match[1],
      version: match[2],
      platform: platform
    };
  }
})();
