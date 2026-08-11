(function() {
    var fileList = document.getElementById('fileList');
    var fileCount = document.getElementById('fileCount');

    // 请求构建时生成的 filelist.json
    fetch('/filelist.json?t=' + Date.now())
        .then(function(res) {
            if (!res.ok) throw new Error('文件列表不存在');
            return res.json();
        })
        .then(function(data) {
            if (data.length === 0) {
                fileList.innerHTML = '<div class="empty">暂无文件</div>';
                fileCount.textContent = '0 个项目';
                return;
            }
            renderFiles(data);
        })
        .catch(function() {
            fileList.innerHTML = '<div class="empty">加载失败，请刷新</div>';
        });

    function renderFiles(files) {
        var html = '';
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var iconClass = getIconClass(file.name);
            var sizeText = formatSize(file.size);
            html += `
                <div class="file-item">
                    <div class="left">
                        <div class="icon ${iconClass}"></div>
                        <span class="name">${escapeHtml(file.name)}</span>
                        <span class="size">${sizeText}</span>
                    </div>
                    <button class="download-btn" data-path="${escapeHtml(file.path)}">下载</button>
                </div>
            `;
        }
        fileList.innerHTML = html;
        fileCount.textContent = files.length + ' 个项目';

        var btns = document.querySelectorAll('.download-btn');
        for (var j = 0; j < btns.length; j++) {
            btns[j].addEventListener('click', function() {
                var path = this.getAttribute('data-path');
                var link = document.createElement('a');
                link.href = path;
                link.download = path.split('/').pop();
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        }
    }

    function getIconClass(name) {
        if (name.endsWith('.apk')) return 'icon-apk';
        if (name.endsWith('.txt') || name.endsWith('.md')) return 'icon-txt';
        if (name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.7z')) return 'icon-zip';
        return 'icon-default';
    }

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
        return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
})();