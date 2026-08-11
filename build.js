const fs = require('fs');
const path = require('path');

// 扫描 files 目录
const filesDir = path.join(__dirname, 'files');

if (!fs.existsSync(filesDir)) {
    // 如果 files 目录不存在，创建一个空列表
    fs.writeFileSync('filelist.json', JSON.stringify([], null, 2));
    console.log('files 目录不存在，已生成空列表');
    process.exit(0);
}

const fileNames = fs.readdirSync(filesDir);
const fileList = [];

for (const name of fileNames) {
    const fullPath = path.join(filesDir, name);
    const stat = fs.statSync(fullPath);
    if (stat.isFile()) {
        fileList.push({
            name: name,
            path: 'files/' + name,
            size: stat.size
        });
    }
}

// 按文件名排序
fileList.sort((a, b) => a.name.localeCompare(b.name));

// 写入 filelist.json 到根目录
fs.writeFileSync('filelist.json', JSON.stringify(fileList, null, 2));
console.log(`已生成 filelist.json，共 ${fileList.length} 个文件`);