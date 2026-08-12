# Baidong 官网下载页

纯静态网页项目（HTML + CSS + JavaScript），无需后端，双击 `index.html` 即可在浏览器中本地打开运行。

## 一、目录结构与文件命名规则

```
Baidong-site/
├── index.html          # 页面结构（HTML）—— 主入口，浏览器直接打开它
├── css/
│   └── style.css       # 页面样式（CSS）—— 视觉风格参考 MT 管理器（暗色+橙色）
├── js/
│   └── main.js         # 页面交互（JS）—— 风车旋转 / 下载按钮 / 图标占位
├── files/
│   └── Baidong.apk     # 【需要你放入】安装包，文件名必须为 Baidong.apk
└── images/
    └── Baidong-icon.png # 【需要你放入】App 图标，文件名必须为 Baidong-icon.png
```

命名规则：所有文件名、目录名保持小写英文（`index.html` / `style.css` / `main.js` / `Baidong.apk` / `Baidong-icon.png`），路径使用相对路径，整个文件夹整体移动即可，无需改代码。

## 二、部署步骤（两步）

1. **放安装包**：把 `Baidong.apk` 复制到 `files/` 文件夹（删除里面的"使用说明.txt"即可）。
2. **放图标**：把你的 App 图标重命名为 `Baidong-icon.png`，放到 `images/` 文件夹（建议正方形 PNG，如 512x512）。

然后双击 `index.html`，在浏览器中打开即可使用全部功能：
- 滚动鼠标滚轮 → 4 台手机组成的风车随页面滚动进度同步旋转；
- 点击任意「下载」按钮 → 自动下载 `files/Baidong.apk`。

## 三、常见问题

- **点了下载没反应**：确认 `files/Baidong.apk` 文件确实存在且文件名完全一致。
- **图标显示的是橙色 B**：说明 `images/Baidong-icon.png` 还没放进去，放好后刷新即显示真实图标。
- 若要把页面发布到服务器，把整个 `Baidong-site` 文件夹上传到网站根目录即可。
