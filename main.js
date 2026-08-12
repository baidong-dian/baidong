/* ============================================================
   Baidong 下载页脚本
   文件路径：Baidong-site/js/main.js

   功能说明：
     1. 4 台手机组成的「风车」随页面滚动进度同步旋转（参考 LineageOS）
     2. 点击下载按钮，读取 files 文件夹内的 Baidong.apk 并触发下载
     3. 当 images/Baidong-icon.png 不存在时，自动显示占位图标，页面不报错
   ============================================================ */

(function () {
  "use strict";

  /* ============================================================
     1. 风车滚动旋转
     滚动进度 0 -> 1 对应风车旋转 0 -> 360 度（整圈，首尾状态一致）
     ============================================================ */
  var windmill = document.getElementById("windmill");
  var heroInner = document.getElementById("heroInner");

  var targetDeg = 0;   // 目标旋转角度（根据滚动进度计算）
  var currentDeg = 0;  // 当前实际角度（平滑过渡用）

  // 获取整页滚动进度（0 ~ 1）
  function getScrollProgress() {
    var docEl = document.documentElement;
    var maxScroll = docEl.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return 0;
    var p = window.scrollY / maxScroll;
    return Math.min(1, Math.max(0, p)); // 限制在 0~1 之间
  }

  // 每一帧执行的动画逻辑
  function tick() {
    var progress = getScrollProgress();
    targetDeg = progress * 360;

    // 平滑跟随：每帧向目标值逼近，数值越小越柔滑
    currentDeg += (targetDeg - currentDeg) * 0.14;

    // 写入风车容器的 transform，实现同步旋转
    if (windmill) {
      windmill.style.transform = "rotate(" + currentDeg + "deg)";
    }

    // 首屏文字随滚动淡出并上移（提升层次感）
    if (heroInner) {
      var p2 = Math.min(1, window.scrollY / (window.innerHeight * 0.8));
      heroInner.style.opacity = String(1 - p2);
      heroInner.style.transform = "translateY(" + p2 * 60 + "px)";
    }

    window.requestAnimationFrame(tick);
  }
  tick();

  /* ============================================================
     2. 下载安装包：files/Baidong.apk
     原理：动态创建一个 <a> 标签，href 指向相对路径，download 指定文件名，
           再模拟点击触发浏览器下载。纯静态实现，无需任何后端。
     ============================================================ */
  var APK_PATH = "files/Baidong.apk";  // 安装包相对路径（相对于 index.html）
  var APK_NAME = "Baidong.apk";        // 下载后保存的文件名

  function downloadApk() {
    var a = document.createElement("a");
    a.href = APK_PATH;
    a.download = APK_NAME;
    document.body.appendChild(a);      // 部分浏览器要求元素在文档中
    a.click();
    document.body.removeChild(a);

    // 在卡片下方给出提示
    var tip = document.getElementById("downloadTip");
    if (tip) {
      tip.textContent = "已触发下载：files/Baidong.apk（若未开始下载，请确认安装包已放入 files 目录）";
    }
  }

  // 页面上所有「下载」按钮绑定同一个逻辑
  ["downloadBtn", "navDownloadBtn", "heroDownloadBtn"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", downloadApk);
    }
  });

  /* ============================================================
     3. App 图标占位
     正常情况下页面读取 images/Baidong-icon.png 显示 App 图标；
     若该文件缺失（尚未放入），自动替换为内置的橙色 "B" 占位图标。
     ============================================================ */
  var FALLBACK_ICON =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'>" +
        "<rect width='256' height='256' rx='56' fill='#1b2029'/>" +
        "<circle cx='128' cy='128' r='86' fill='none' stroke='#ff8c1a' stroke-width='10'/>" +
        "<text x='128' y='176' font-size='120' font-family='Arial,sans-serif' font-weight='bold' " +
        "text-anchor='middle' fill='#ff8c1a'>B</text>" +
      "</svg>"
    );

  document.querySelectorAll("img.app-icon").forEach(function (img) {
    // 加载失败（文件不存在）时切换到占位图标
    img.addEventListener("error", function () {
      if (img.src !== FALLBACK_ICON) {
        img.src = FALLBACK_ICON;
        img.classList.add("icon-fallback");
      }
    });
    // 缓存场景下可能不会触发 error 事件，这里主动兜底检查一次
    if (img.complete && img.naturalWidth === 0) {
      img.src = FALLBACK_ICON;
    }
  });
})();
