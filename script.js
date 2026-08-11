(function() {
    'use strict';

    var downloadBtn = document.getElementById('downloadBtn');
    var apkFile = document.getElementById('apkFile');
    var dialogOverlay = document.getElementById('dialogOverlay');
    var dialogClose = document.getElementById('dialogClose');
    var dialogCancel = document.getElementById('dialogCancel');
    var dialogConfirm = document.getElementById('dialogConfirm');
    var currentTimeEl = document.getElementById('currentTime');

    // 更新时间
    function updateTime() {
        if (!currentTimeEl) return;
        var now = new Date();
        var year = now.getFullYear();
        var month = String(now.getMonth() + 1).padStart(2, '0');
        var day = String(now.getDate()).padStart(2, '0');
        var hours = String(now.getHours()).padStart(2, '0');
        var minutes = String(now.getMinutes()).padStart(2, '0');
        currentTimeEl.textContent = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes;
    }
    updateTime();
    setInterval(updateTime, 60000);

    // 下载
    function startDownload() {
        var fileName = 'BAIDONG_v2.6.apk';
        var filePath = 'files/' + fileName;
        var anchor = document.createElement('a');
        anchor.href = filePath;
        anchor.download = fileName;
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (dialogOverlay) {
                dialogOverlay.classList.add('active');
            }
        });
    }

    if (apkFile) {
        apkFile.addEventListener('click', function(e) {
            if (e.target.classList.contains('file-action') || e.target.closest('.file-actions')) {
                return;
            }
            if (dialogOverlay) {
                dialogOverlay.classList.add('active');
            }
        });
    }

    // 对话框
    function closeDialog() {
        if (dialogOverlay) {
            dialogOverlay.classList.remove('active');
        }
    }

    if (dialogClose) {
        dialogClose.addEventListener('click', closeDialog);
    }

    if (dialogCancel) {
        dialogCancel.addEventListener('click', closeDialog);
    }

    if (dialogConfirm) {
        dialogConfirm.addEventListener('click', function() {
            closeDialog();
            startDownload();
        });
    }

    if (dialogOverlay) {
        dialogOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeDialog();
            }
        });
    }

    // 文件项点击高亮
    var fileItems = document.querySelectorAll('.file-item');
    for (var i = 0; i < fileItems.length; i++) {
        (function(index) {
            fileItems[index].addEventListener('click', function(e) {
                if (e.target.classList.contains('file-action') || e.target.closest('.file-actions')) {
                    return;
                }
                var el = this;
                el.style.backgroundColor = '#dce6f4';
                setTimeout(function() {
                    el.style.backgroundColor = '';
                }, 160);
            });
        })(i);
    }

    // 侧边栏菜单点击
    var menuItems = document.querySelectorAll('.menu-item');
    for (var j = 0; j < menuItems.length; j++) {
        (function(idx) {
            menuItems[idx].addEventListener('click', function() {
                for (var k = 0; k < menuItems.length; k++) {
                    menuItems[k].classList.remove('active');
                }
                this.classList.add('active');
            });
        })(j);
    }

    // 工具栏按钮
    var toolBtns = document.querySelectorAll('.tool-btn');
    for (var l = 0; l < toolBtns.length; l++) {
        (function(idx) {
            toolBtns[idx].addEventListener('click', function() {
                var origBg = this.style.backgroundColor;
                this.style.backgroundColor = '#d0def0';
                setTimeout(function() {
                    toolBtns[idx].style.backgroundColor = origBg || '';
                }, 120);
            });
        })(l);
    }

    // 路径操作
    var pathActions = document.querySelectorAll('.path-action');
    for (var m = 0; m < pathActions.length; m++) {
        pathActions[m].addEventListener('click', function() {
            this.style.color = '#3b8cff';
            setTimeout(function() {
                this.style.color = '';
            }.bind(this), 200);
        });
    }

    // 顶部按钮
    var topBtns = document.querySelectorAll('.top-btn');
    for (var n = 0; n < topBtns.length; n++) {
        topBtns[n].addEventListener('click', function() {
            var origBg = this.style.backgroundColor;
            this.style.backgroundColor = '#d0def0';
            setTimeout(function() {
                this.style.backgroundColor = origBg || '';
            }.bind(this), 120);
        });
    }

    // 文件操作按钮
    var fileActions = document.querySelectorAll('.file-action');
    for (var o = 0; o < fileActions.length; o++) {
        fileActions[o].addEventListener('click', function(e) {
            e.stopPropagation();
            var el = this;
            var origBg = el.style.backgroundColor;
            var origColor = el.style.color;
            el.style.backgroundColor = '#b0c8e8';
            el.style.color = '#1a2634';
            setTimeout(function() {
                el.style.backgroundColor = origBg || '';
                el.style.color = origColor || '';
            }, 150);
        });
    }

    console.log('BAIDONG 已启动');
})();