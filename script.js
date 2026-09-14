// ====================== 数据 ======================
let candidates = [];
let votesRecord = [];
let comments = [];

const ADMIN_PWD = "dian120416";
const SECRET_KEY = "dian120416_v2";

function genId() {
    if (window.crypto && window.crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Date.now() + '-' + Math.random().toString(36).substr(2, 8);
}

function recalcVotesFromRecords() {
    candidates.forEach(c => c.votes = 0);
    votesRecord.forEach(record => {
        const target = candidates.find(c => c.id === record.candidateId);
        if (target) target.votes++;
    });
}

function saveData() {
    recalcVotesFromRecords();
    localStorage.setItem('vote_class_data_final', JSON.stringify({ candidates, votesRecord, comments }));
}

function loadData() {
    const raw = localStorage.getItem('vote_class_data_final');
    if (raw) {
        try {
            const data = JSON.parse(raw);
            candidates = data.candidates || [];
            votesRecord = data.votesRecord || [];
            comments = data.comments || [];
        } catch(e) { console.error(e); }
    }
    if (!candidates || candidates.length === 0) {
        candidates = [
            { id: genId(), name: "张煊皓", votes: 0 },
            { id: genId(), name: "牢大", votes: 0 },
            { id: genId(), name: "shmily", votes: 0 }
        ];
        votesRecord = [];
        comments = [];
    }
    const validIds = new Set(candidates.map(c => c.id));
    votesRecord = votesRecord.filter(r => validIds.has(r.candidateId));
    recalcVotesFromRecords();
    saveData();
}

function hasVoted(nick) { return votesRecord.some(r => r.nickname === nick); }

let lastVoteTime = 0;
function vote(nickname, candidateId) {
    const now = Date.now();
    if (now - lastVoteTime < 500) return "操作过快，请稍后再试";
    if (!nickname.trim()) return "请填写昵称";
    const nick = nickname.trim();
    if (hasVoted(nick)) return `“${nick}” 已经投过票了`;
    const cand = candidates.find(c => c.id === candidateId);
    if (!cand) return "候选人不存在";
    votesRecord.push({ id: genId(), nickname: nick, candidateId, time: new Date().toISOString() });
    cand.votes++;
    saveData();
    renderAll();
    lastVoteTime = now;
    return `✅ 投票成功！${nick} 投给了 ${cand.name}`;
}

function changeVoterTarget(voterNickname, newCandidateId) {
    const recordIndex = votesRecord.findIndex(r => r.nickname === voterNickname);
    if (recordIndex === -1) return "该选民未投票";
    const oldRecord = votesRecord[recordIndex];
    if (oldRecord.candidateId === newCandidateId) return "未更改";
    const oldC = candidates.find(c => c.id === oldRecord.candidateId);
    const newC = candidates.find(c => c.id === newCandidateId);
    if (!oldC || !newC) return "候选人不存在";
    oldC.votes--;
    newC.votes++;
    votesRecord[recordIndex].candidateId = newCandidateId;
    saveData();
    renderAll();
    return `已将 ${voterNickname} 改投给 ${newC.name}`;
}

function setVotesSync(cid, newVotes) {
    const target = candidates.find(c => c.id === cid);
    if (!target) return false;
    const currentVotes = target.votes;
    if (currentVotes === newVotes) return true;
    if (newVotes < 0) return false;
    
    if (newVotes > currentVotes) {
        const diff = newVotes - currentVotes;
        for (let i = 0; i < diff; i++) {
            votesRecord.push({
                id: genId(),
                nickname: `[系统调票]`,
                candidateId: cid,
                time: new Date().toISOString(),
                isAdminAdjust: true
            });
        }
    } else {
        const diff = currentVotes - newVotes;
        let toRemove = diff;
        const recordsToRemove = [];
        for (let i = 0; i < votesRecord.length && toRemove > 0; i++) {
            const rec = votesRecord[i];
            if (rec.candidateId === cid && rec.isAdminAdjust) {
                recordsToRemove.push(i);
                toRemove--;
            }
        }
        if (toRemove > 0) {
            for (let i = 0; i < votesRecord.length && toRemove > 0; i++) {
                const rec = votesRecord[i];
                if (rec.candidateId === cid && !rec.isAdminAdjust && rec.nickname === '[系统调票]') {
                    recordsToRemove.push(i);
                    toRemove--;
                }
            }
        }
        recordsToRemove.sort((a,b)=>b-a);
        for (let idx of recordsToRemove) votesRecord.splice(idx, 1);
    }
    recalcVotesFromRecords();
    saveData();
    renderAll();
    return true;
}

function repairVotesConsistency() {
    recalcVotesFromRecords();
    saveData();
    renderAll();
    return "票数已重新计算并修复";
}

function addCandidate(name) {
    if (!name.trim()) return false;
    if (candidates.some(c => c.name === name.trim())) return false;
    candidates.push({ id: genId(), name: name.trim(), votes: 0 });
    saveData();
    renderAll();
    return true;
}

function editCandidate(cid, newName) {
    if (!newName.trim()) return false;
    const c = candidates.find(c => c.id === cid);
    if (!c) return false;
    if (candidates.some(c => c.id !== cid && c.name === newName.trim())) return false;
    c.name = newName.trim();
    saveData();
    renderAll();
    return true;
}

function deleteCandidate(cid) {
    const idx = candidates.findIndex(c => c.id === cid);
    if (idx === -1) return false;
    votesRecord = votesRecord.filter(r => r.candidateId !== cid);
    candidates.splice(idx, 1);
    recalcVotesFromRecords();
    saveData();
    renderAll();
    return true;
}

function addComment(nick, content) {
    if (!content.trim()) return "评论不能为空";
    comments.unshift({ id: genId(), nickname: nick.trim() || "匿名同学", content: content.trim(), time: new Date().toLocaleString() });
    if (comments.length > 200) comments.pop();
    saveData();
    renderAll();
    return "评论已发布";
}

// 简单哈希
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

function generateAdminSyncCode() {
    const exportData = { candidates, votesRecord, version: "v2" };
    const jsonStr = JSON.stringify(exportData);
    const timestamp = Date.now();
    const sign = simpleHash(jsonStr + timestamp + SECRET_KEY);
    const finalObj = { data: jsonStr, ts: timestamp, sign: sign };
    return btoa(encodeURIComponent(JSON.stringify(finalObj)));
}

function decryptAndVerifySyncCode(code) {
    try {
        const finalStr = decodeURIComponent(atob(code));
        const finalObj = JSON.parse(finalStr);
        const { data: jsonStr, ts: timestamp, sign: receivedSign } = finalObj;
        const expectedSign = simpleHash(jsonStr + timestamp + SECRET_KEY);
        if (receivedSign !== expectedSign) return { valid: false, msg: "签名验证失败" };
        const data = JSON.parse(jsonStr);
        if (!data.candidates) return { valid: false, msg: "数据格式错误" };
        return { valid: true, data: data };
    } catch(e) {
        return { valid: false, msg: "同步码解析失败" };
    }
}

function userSyncWithAdminCode(code) {
    const result = decryptAndVerifySyncCode(code);
    if (!result.valid) return { success: false, msg: result.msg };
    const remoteData = result.data;
    
    let mergedCount = 0;
    for (const remoteCand of remoteData.candidates) {
        if (!candidates.some(c => c.name === remoteCand.name)) {
            candidates.push({ ...remoteCand, id: genId(), votes: 0 });
            mergedCount++;
        }
    }
    
    const existingVoterNames = new Set(votesRecord.map(r => r.nickname));
    let voteAdded = 0;
    if (remoteData.votesRecord) {
        for (const remoteRec of remoteData.votesRecord) {
            if (!existingVoterNames.has(remoteRec.nickname)) {
                const remoteCand = remoteData.candidates.find(rc => rc.id === remoteRec.candidateId);
                const targetCand = candidates.find(c => c.name === remoteCand?.name);
                if (targetCand) {
                    votesRecord.push({ id: genId(), nickname: remoteRec.nickname, candidateId: targetCand.id, time: new Date().toISOString() });
                    voteAdded++;
                    existingVoterNames.add(remoteRec.nickname);
                }
            }
        }
    }
    
    recalcVotesFromRecords();
    saveData();
    renderAll();
    return { success: true, msg: `同步完成！新增 ${mergedCount} 位候选人，新增 ${voteAdded} 条投票记录` };
}

function generateUserSyncCode() {
    const userData = { 
        type: "user_vote_data",
        votesRecord: votesRecord.map(r => ({ nickname: r.nickname, candidateName: candidates.find(c=>c.id===r.candidateId)?.name })),
        comments: comments,
        genTime: new Date().toLocaleString()
    };
    return btoa(encodeURIComponent(JSON.stringify(userData)));
}

function importUserSyncCode(code) {
    try {
        const jsonStr = decodeURIComponent(atob(code));
        const data = JSON.parse(jsonStr);
        if (!data.votesRecord && !data.comments) return { success: false, msg: "无效的同步码" };
        
        let voteCount = 0;
        let commentCount = 0;
        
        if (data.votesRecord && Array.isArray(data.votesRecord)) {
            const existingNames = new Set(votesRecord.map(r => r.nickname));
            for (const newRec of data.votesRecord) {
                if (!existingNames.has(newRec.nickname)) {
                    const targetCand = candidates.find(c => c.name === newRec.candidateName);
                    if (targetCand) {
                        votesRecord.push({ id: genId(), nickname: newRec.nickname, candidateId: targetCand.id, time: new Date().toISOString() });
                        voteCount++;
                        existingNames.add(newRec.nickname);
                    }
                }
            }
        }
        
        if (data.comments && Array.isArray(data.comments)) {
            const existingIds = new Set(comments.map(c => c.id));
            for (const newComment of data.comments) {
                if (!existingIds.has(newComment.id)) {
                    comments.push({ ...newComment, id: genId() });
                    commentCount++;
                }
            }
            comments.sort((a, b) => new Date(b.time) - new Date(a.time));
            if (comments.length > 200) comments = comments.slice(0, 200);
        }
        
        recalcVotesFromRecords();
        saveData();
        renderAll();
        return { success: true, msg: `导入成功！合并了 ${voteCount} 条投票，${commentCount} 条评论` };
    } catch(e) {
        return { success: false, msg: "同步码解析失败" };
    }
}

function exportJson() {
    const exportData = { candidates, votesRecord, comments, exportTime: new Date().toLocaleString() };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `投票数据备份_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function exportFullHtml() {
    alert("导出HTML快照将包含当前页面及数据");
    const htmlContent = document.documentElement.outerHTML;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `投票系统_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
}

// ========== 渲染 ==========
function renderCandidates() {
    const container = document.getElementById('candidatesGrid');
    if (!container) return;
    const total = candidates.reduce((s,c)=>s+c.votes,0);
    container.innerHTML = candidates.map(c => {
        let percent = total === 0 ? 0 : (c.votes / total) * 100;
        return `<div class="candidate-card"><div class="candidate-name">${escapeHtml(c.name)}<span style="background:#eef2ff; padding:2px 8px; border-radius:20px;">${c.votes}票</span></div><div class="candidate-votes">${c.votes}</div><div class="vote-progress"><div class="progress-fill" style="width:${percent}%;"></div></div></div>`;
    }).join('');
}

function renderSelects() {
    let opts = candidates.map(c => `<option value="${c.id}">${escapeHtml(c.name)} (${c.votes}票)</option>`).join('');
    const targetSel = document.getElementById('targetCandidateSelect');
    if (targetSel) targetSel.innerHTML = opts;
    const adminSel = document.getElementById('adminVoteCandidate');
    if (adminSel) adminSel.innerHTML = candidates.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
    const editSel = document.getElementById('editCandidateSelect');
    if (editSel) editSel.innerHTML = candidates.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
    const delSel = document.getElementById('delCandidateSelect');
    if (delSel) delSel.innerHTML = candidates.map(c => `<option value="${c.id}">${escapeHtml(c.name)} (${c.votes}票)</option>`).join('');
}

function renderVoteDetail() {
    const tbody = document.getElementById('voteDetailBody');
    if (!tbody) return;
    if (votesRecord.length === 0) { tbody.innerHTML = '<tr><td colspan="3">暂无投票记录</td></tr>'; return; }
    const candidateOpts = candidates.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
    tbody.innerHTML = votesRecord.map(rec => {
        const cur = candidates.find(c => c.id === rec.candidateId);
        return `<tr>
                <td>${escapeHtml(rec.nickname)}</td>
                <td>${cur ? escapeHtml(cur.name) : '?'}</td>
                <td><select class="inline-change" data-nick="${escapeHtml(rec.nickname)}">${candidateOpts}</select> <button class="inline-change-btn" data-nick="${escapeHtml(rec.nickname)}">改投</button></td>
            </tr>`;
    }).join('');
    document.querySelectorAll('.inline-change-btn').forEach(btn => {
        btn.onclick = () => {
            const nick = btn.getAttribute('data-nick');
            const sel = btn.parentElement.querySelector('.inline-change');
            const newId = sel.value;
            const msg = changeVoterTarget(nick, newId);
            const msgDiv = document.getElementById('candidateAdminMsg');
            if (msgDiv) { msgDiv.innerText = msg; setTimeout(()=>msgDiv.innerText='',2000); }
        };
    });
}

function renderRanking() {
    const rankDiv = document.getElementById('rankList');
    let sorted = [...candidates].sort((a,b)=>b.votes-a.votes);
    rankDiv.innerHTML = sorted.map((c,idx) => `<li class="rank-item"><span class="rank-number">${idx+1}</span><span class="rank-name">${idx===0?'🏆 ':''}${escapeHtml(c.name)}</span><span class="rank-votes">${c.votes}票</span></li>`).join('');
}

function renderComments() {
    const container = document.getElementById('commentList');
    if (!container) return;
    if (comments.length === 0) { container.innerHTML = '<div style="text-align:center; color:#6b8aab;">暂无评论</div>'; return; }
    container.innerHTML = comments.map(c => `<div class="comment-item"><div class="comment-header"><span class="comment-nick"><i class="fas fa-user-circle"></i> ${escapeHtml(c.nickname)}</span><span>${escapeHtml(c.time)}</span></div><div class="comment-content">${escapeHtml(c.content)}</div></div>`).join('');
}

function renderAll() { renderCandidates(); renderSelects(); renderRanking(); renderComments(); renderVoteDetail(); }
function escapeHtml(str) { return String(str).replace(/[&<>]/g, m=>m==='&'?'&amp;':m==='<'?'&lt;':'&gt;'); }

// 管理员后台控制（完全通过评论区密码触发）
let adminUnlocked = false;
function showAdmin() { 
    document.getElementById('adminPanel').style.display = 'block'; 
    adminUnlocked = true; 
    renderSelects(); 
    renderVoteDetail(); 
}
function hideAdmin() { 
    document.getElementById('adminPanel').style.display = 'none'; 
    adminUnlocked = false; 
}

// 评论区处理（包含隐藏的密码触发）
let lastCommentTime = 0;
let passwordAttemptCount = 0;

function onComment() {
    const now = Date.now();
    if (now - lastCommentTime < 500) { 
        document.getElementById('commentMsg').innerHTML = "操作过快"; 
        return; 
    }
    let nick = document.getElementById('commentNick').value;
    let content = document.getElementById('commentContent').value;
    
    // 【隐藏密码检测】如果评论内容等于管理员密码，打开/关闭后台
    if (content === ADMIN_PWD) {
        if (!adminUnlocked) {
            showAdmin();
            document.getElementById('commentMsg').innerHTML = "后台已开启";
        } else {
            hideAdmin();
            document.getElementById('commentMsg').innerHTML = "后台已关闭";
        }
        document.getElementById('commentContent').value = '';
        lastCommentTime = now;
        setTimeout(() => document.getElementById('commentMsg').innerHTML = '', 1500);
        return;
    }
    
    // 普通评论
    let msg = addComment(nick, content);
    document.getElementById('commentContent').value = '';
    document.getElementById('commentMsg').innerHTML = msg;
    lastCommentTime = now;
    setTimeout(() => document.getElementById('commentMsg').innerHTML = '', 2000);
}

// 同步功能
function userSync() {
    const code = document.getElementById('syncCodeInput').value.trim();
    if (!code) { document.getElementById('userSyncMsg').innerHTML = '请输入同步码'; return; }
    const result = userSyncWithAdminCode(code);
    document.getElementById('userSyncMsg').innerHTML = result.success ? '✅ ' + result.msg : '❌ ' + result.msg;
    if (result.success) document.getElementById('syncCodeInput').value = '';
    setTimeout(() => document.getElementById('userSyncMsg').innerHTML = '', 3000);
}

function userGenCode() {
    const code = generateUserSyncCode();
    document.getElementById('userSyncCodeText').innerText = code;
    document.getElementById('userCodeArea').style.display = 'block';
}

function userCopyCode() { 
    navigator.clipboard.writeText(document.getElementById('userSyncCodeText').innerText);
    document.getElementById('commentMsg').innerHTML = '✅ 已复制';
    setTimeout(() => document.getElementById('commentMsg').innerHTML = '', 1500);
}

function adminGenSyncCode() {
    if (!adminUnlocked) { alert('未授权'); return; }
    const code = generateAdminSyncCode();
    document.getElementById('adminSyncCodeText').innerText = code;
    document.getElementById('adminSyncArea').style.display = 'block';
}

function copyAdminSyncCode() { 
    navigator.clipboard.writeText(document.getElementById('adminSyncCodeText').innerText);
}

function adminImportUserCode() {
    if (!adminUnlocked) { alert('未授权'); return; }
    const code = document.getElementById('adminImportCode').value.trim();
    if (!code) { document.getElementById('adminSyncMsg').innerHTML = '请输入同步码'; return; }
    const result = importUserSyncCode(code);
    document.getElementById('adminSyncMsg').innerHTML = result.success ? '✅ ' + result.msg : '❌ ' + result.msg;
    document.getElementById('adminImportCode').value = '';
    setTimeout(() => document.getElementById('adminSyncMsg').innerHTML = '', 3000);
}

// 绑定事件
function bind() {
    document.getElementById('submitVoteBtn').onclick = () => {
        let nick = document.getElementById('voterNickname').value;
        let cid = document.getElementById('targetCandidateSelect').value;
        let msg = vote(nick, cid);
        document.getElementById('voteMessage').innerText = msg;
        if (msg.startsWith('✅')) document.getElementById('voterNickname').value = '';
        setTimeout(() => document.getElementById('voteMessage').innerText = '', 2500);
    };
    document.getElementById('submitCommentBtn').onclick = onComment;
    document.getElementById('commentContent').addEventListener('keypress', e => { if(e.key === 'Enter') onComment(); });
    document.getElementById('closeAdminBtn').onclick = hideAdmin;
    
    document.getElementById('applyVotesBtn').onclick = () => { if(!adminUnlocked){alert('未授权');return;} let cid=document.getElementById('adminVoteCandidate').value; let val=parseInt(document.getElementById('newVotesValue').value,10); if(isNaN(val)||val<0)return; if(setVotesSync(cid,val)) document.getElementById('voteAdminMsg').innerText='修改成功'; else document.getElementById('voteAdminMsg').innerText='修改失败'; setTimeout(()=>document.getElementById('voteAdminMsg').innerText='',1500); };
    document.getElementById('addCandidateBtn').onclick = () => { if(!adminUnlocked){alert('未授权');return;} let name=document.getElementById('newCandidateName').value; if(addCandidate(name)) document.getElementById('newCandidateName').value=''; document.getElementById('candidateAdminMsg').innerText=addCandidate(name)?'添加成功':'添加失败'; setTimeout(()=>document.getElementById('candidateAdminMsg').innerText='',1500); };
    document.getElementById('updateCandidateBtn').onclick = () => { if(!adminUnlocked){alert('未授权');return;} let cid=document.getElementById('editCandidateSelect').value; let newName=document.getElementById('editCandidateInput').value; if(editCandidate(cid,newName)) document.getElementById('editCandidateInput').value=''; document.getElementById('candidateAdminMsg').innerText=editCandidate(cid,newName)?'修改成功':'修改失败'; setTimeout(()=>document.getElementById('candidateAdminMsg').innerText='',1500); };
    document.getElementById('deleteCandidateBtn').onclick = () => { if(!adminUnlocked){alert('未授权');return;} let cid=document.getElementById('delCandidateSelect').value; if(deleteCandidate(cid)) document.getElementById('candidateAdminMsg').innerText='已删除'; else document.getElementById('candidateAdminMsg').innerText='删除失败'; setTimeout(()=>document.getElementById('candidateAdminMsg').innerText='',1500); };
    document.getElementById('exportJsonBtn').onclick = () => { if(!adminUnlocked){alert('未授权');return;} exportJson(); };
    document.getElementById('exportHtmlBtn').onclick = () => { if(!adminUnlocked){alert('未授权');return;} exportFullHtml(); };
    document.getElementById('genAdminSyncCodeBtn').onclick = adminGenSyncCode;
    document.getElementById('copyAdminSyncCodeBtn').onclick = copyAdminSyncCode;
    document.getElementById('importUserCodeBtn').onclick = adminImportUserCode;
    document.getElementById('userSyncBtn').onclick = userSync;
    document.getElementById('userGenCodeBtn').onclick = userGenCode;
    document.getElementById('userCopyCodeBtn').onclick = userCopyCode;
    document.getElementById('repairVotesBtn').onclick = () => { if(!adminUnlocked){alert('未授权');return;} const msg = repairVotesConsistency(); document.getElementById('voteAdminMsg').innerText = msg; setTimeout(()=>document.getElementById('voteAdminMsg').innerText='',2000); };
}

loadData();
renderAll();
bind();
hideAdmin(); // 确保后台初始隐藏