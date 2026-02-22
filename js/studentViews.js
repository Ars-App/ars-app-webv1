// js/studentViews.js

import { DataManager } from './dataManager.js';
import { generateId } from './utils.js';
import { setActiveNav, showToast } from './ui.js';

export function renderStudentDashboard(tab = 'active') {
    setActiveNav('nav-assignments');
    document.getElementById('page-title').textContent = 'Ödevlerim';
    const contentArea = document.getElementById('content-area');
    document.getElementById('header-actions').innerHTML = '';

    // --- OTURUMU GÜNCEL TUTMA ---
    let user = DataManager.getCurrentUser();
    const allUsers = DataManager.getUsers();
    const freshUser = allUsers.find(u => u.id === user.id);
    if (freshUser) {
        user = freshUser; 
        DataManager.setCurrentUser(user); 
    }

    const enrolledIds = user.enrolledClasses || [];
    const classes = DataManager.getClasses().filter(c => enrolledIds.includes(c.id));
    const allAssignments = DataManager.getAssignments().filter(a => enrolledIds.includes(a.classId));
    const submissions = DataManager.getSubmissions();

    // 1. YENİ EKLENTİ: Sınıflarım Bilgi Kartı (Sınıftan Çıkma İkonlu Haline Güncellendi)
    let classesHtml = '';
    if(classes.length > 0) {
        classesHtml = `
        <div class="card" style="margin-bottom: 20px; padding: 15px; border-left: 4px solid var(--primary-color);">
            <h4 style="margin-bottom: 12px; color: var(--text-main); font-size: 1rem;"><i class="fa-solid fa-chalkboard-user" style="color: var(--primary-color);"></i> Kayıtlı Olduğum Sınıflar</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                ${classes.map(c => `
                <span style="display: flex; align-items: center; background: var(--input-bg); color: var(--text-main); padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; border: 1px solid var(--border-color); box-shadow: var(--shadow);">
                    <strong>${c.name}</strong>
                    <div style="width: 1px; height: 14px; background: var(--border-color); margin: 0 10px;"></div>
                    <i class="fa-solid fa-right-from-bracket" style="color: var(--danger); cursor: pointer; transition: 0.2s;" onclick="window.leaveClass('${c.id}')" title="Sınıftan Ayrıl" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='none'"></i>
                </span>
                `).join('')}
            </div>
        </div>`;
    }

    let html = classesHtml + `
    <div class="segmented-control">
        <button class="segment-btn ${tab === 'active' ? 'active' : ''}" onclick="window.renderStudentDashboard('active')">Bekleyenler</button>
        <button class="segment-btn ${tab === 'missed' ? 'active' : ''}" onclick="window.renderStudentDashboard('missed')">Süresi Dolanlar</button>
        <button class="segment-btn ${tab === 'completed' ? 'active' : ''}" onclick="window.renderStudentDashboard('completed')">Tamamlananlar</button>
    </div>
    <div id="tab-content">`;

    if (enrolledIds.length === 0) {
        html += `<div style="text-align:center; padding: 50px; color: var(--text-muted);">
            <i class="fa-solid fa-book-open fa-3x"></i>
            <p style="margin-top:20px;">Henüz bir sınıfta değilsiniz. Sağ alttaki <strong>+</strong> butonuna basarak katılın.</p>
        </div></div>`;
        contentArea.innerHTML = html;
        return;
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    let filteredList = [];
    if (tab === 'active') {
        filteredList = allAssignments.filter(a => !submissions.find(s => s.assignmentId === a.id && s.studentId === user.id) && (!a.dueDate || new Date(a.dueDate) >= today));
    } else if (tab === 'missed') {
        filteredList = allAssignments.filter(a => !submissions.find(s => s.assignmentId === a.id && s.studentId === user.id) && (a.dueDate && new Date(a.dueDate) < today));
    } else {
        filteredList = allAssignments.filter(a => submissions.find(s => s.assignmentId === a.id && s.studentId === user.id));
    }

    if (filteredList.length === 0) {
        let msg = tab === 'active' ? 'Bekleyen harika! Hiç ödevin yok.' : (tab === 'missed' ? 'Süpersin! Kaçırdığın hiç ödev yok.' : 'Henüz tamamlanmış bir ödev yok.');
        let icon = tab === 'active' ? 'fa-mug-hot' : (tab === 'missed' ? 'fa-face-smile-wink' : 'fa-box-open');
        html += `<div style="text-align:center; padding:50px; color:var(--text-muted);"><i class="fa-solid ${icon} fa-3x"></i><p style="margin-top:20px;">${msg}</p></div>`;
    } else {
        html += '<div class="grid-container">';
        const sortedFilteredList = [...filteredList].reverse();
        
        sortedFilteredList.forEach(a => {
            const parentClass = classes.find(c => c.id === a.classId);
            if (!parentClass) return;

            if (tab === 'completed') {
                const sub = submissions.find(s => s.assignmentId === a.id && s.studentId === user.id);
                const isExempt = sub && sub.status === 'exempt'; 

                // Öğrencinin Doğru/Yanlış/Boş istatistiklerini karta basma (KORUNDU)
                let statsHtml = '';
                if(!isExempt && sub.stats) {
                    statsHtml = `
                    <div style="display:flex; justify-content:space-between; margin-top:10px; padding-top:10px; border-top:1px solid var(--border-color); font-size:0.9rem; font-weight:600;">
                        <span style="color:var(--success)" title="Doğru"><i class="fa-solid fa-check"></i> ${sub.stats.correct}</span>
                        <span style="color:var(--danger)" title="Yanlış"><i class="fa-solid fa-xmark"></i> ${sub.stats.wrong}</span>
                        <span style="color:var(--text-muted)" title="Boş"><i class="fa-solid fa-minus"></i> ${sub.stats.blank}</span>
                        <strong style="color:var(--primary-color)">%${sub.stats.successRate}</strong>
                    </div>`;
                }

                html += `
                <div class="card completed" ${isExempt ? 'style="border-color: #cbd5e1; opacity: 0.6;"' : ''}>
                    <div class="card-header">
                        <div class="card-title">${a.title}</div>
                        <div class="card-badge" ${isExempt ? 'style="background: #f1f5f9; color: #64748b;"' : ''}>${parentClass.name}</div>
                    </div>
                    <div style="font-weight: 600; color: var(--text-main); margin: 10px 0;">🎯 Hedef: ${a.questionCount || '-'} Soru</div>
                    ${statsHtml}
                    <button class="btn-complete" style="background:${isExempt ? '#f1f5f9' : 'rgba(16, 185, 129, 0.1)'}; color:${isExempt ? '#64748b' : 'var(--success)'}; border:none; cursor:default; margin-top:10px;">
                        <i class="fa-solid ${isExempt ? 'fa-minus' : 'fa-check'}"></i> ${isExempt ? 'Ödevden Muafsın' : 'Teslim Edildi'}
                    </button>
                </div>`;
            } else {
                const dueDate = a.dueDate ? new Date(a.dueDate) : null;
                const isOverdue = tab === 'missed';
                let isUrgent = false; let timeText = 'Belirsiz'; let timeColor = 'var(--text-muted)'; let cardClass = '';

                if (dueDate) {
                    timeText = new Date(a.dueDate).toLocaleDateString();
                    if (isOverdue) { cardClass = 'overdue'; timeColor = 'var(--danger)'; } 
                    else {
                        const diffTime = dueDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays <= 2) { isUrgent = true; cardClass = 'urgent'; timeText = `Son ${diffDays} Gün!`; timeColor = 'var(--warning)'; }
                    }
                }

                html += `
                <div class="card ${cardClass}" id="card-${a.id}">
                    <div class="card-header">
                        <div class="card-title">${a.title}</div>
                        <div class="card-badge ${isUrgent ? 'pulse-badge' : ''}">${parentClass.name}</div>
                    </div>
                    <div style="font-weight: 600; color: var(--text-main); margin: 10px 0;">🎯 Hedef: ${a.questionCount || '-'} Soru</div>
                    <div class="assignment-meta">
                        <span style="color:${timeColor}; font-weight: ${isUrgent ? '700' : 'normal'}">
                            <i class="fa-solid ${isUrgent ? 'fa-hourglass-half fa-spin-pulse' : 'fa-calendar'}"></i> ${isUrgent ? timeText : (isOverdue ? 'Son Tarih: ' + timeText : 'Son: ' + timeText)}
                        </span>
                    </div>
                    ${isOverdue ? `<button class="btn-complete" style="background:rgba(239, 68, 68, 0.1); color:var(--danger); border:none; cursor:not-allowed; margin-top:15px;"><i class="fa-solid fa-circle-xmark"></i> Süresi Doldu</button>` : `<button class="btn-complete ${isUrgent ? 'btn-urgent' : ''}" onclick="window.openCompleteModal('${a.id}', ${a.questionCount || 0})">Tamamla</button>`}
                </div>`;
            }
        });
        html += '</div>';
    }
    html += `</div>`;
    contentArea.innerHTML = html;
}

// YENİ: Öğrencinin sınıftan ayrılmasını sağlayan fonksiyon
export function leaveClass(classId) {
    if(!confirm("Bu sınıftan ayrılmak istediğinize emin misiniz? (Mevcut ödev teslimleriniz silinmez ancak sınıfı bir daha göremezsiniz.)")) return;
    
    let users = DataManager.getUsers();
    let currentUser = DataManager.getCurrentUser();
    let userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex > -1) {
        users[userIndex].enrolledClasses = users[userIndex].enrolledClasses.filter(id => id !== classId);
        DataManager.setUsers(users);
        DataManager.setCurrentUser(users[userIndex]);
        showToast('Sınıftan başarıyla ayrıldınız.', 'success');
        renderStudentDashboard('active'); 
    }
}

export function openCompleteModal(assignmentId, questionCount) {
    document.getElementById('current-completing-assignment-id').value = assignmentId;
    document.getElementById('targetQuestionCount').innerText = questionCount;
    document.getElementById('correctCount').value = '';
    document.getElementById('wrongCount').value = '';
    document.getElementById('validationError').style.display = 'none';
    
    if(typeof window.closeFab === 'function') window.closeFab();
    document.getElementById('modal-complete-assignment').style.display = 'flex';
}

export function saveTaskStats() {
    const assignmentId = document.getElementById('current-completing-assignment-id').value;
    const target = parseInt(document.getElementById('targetQuestionCount').innerText) || 0;
    const correct = parseInt(document.getElementById('correctCount').value) || 0;
    const wrong = parseInt(document.getElementById('wrongCount').value) || 0;

    if ((correct + wrong) > target && target > 0) {
        document.getElementById('validationError').style.display = 'block';
        return;
    }

    const blank = target > 0 ? target - (correct + wrong) : 0;
    let successRate = 0;
    if(target > 0) {
        successRate = ((correct / target) * 100).toFixed(1);
    }

    const user = DataManager.getCurrentUser();
    const submissions = DataManager.getSubmissions();
    const newSub = { 
        id: generateId(), 
        assignmentId, 
        studentId: user.id, 
        status: 'completed', 
        timestamp: new Date().toISOString(),
        stats: { correct, wrong, blank, successRate }
    };
    
    submissions.push(newSub);
    DataManager.setSubmissions(submissions);
    
    document.getElementById('modal-complete-assignment').style.display = 'none';

    if (!window.confetti) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
        script.onload = () => confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, zIndex: 9999 });
        document.head.appendChild(script);
    } else confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, zIndex: 9999 });

    showToast(`Tebrikler! Başarı Oranın: %${successRate}`, 'success');
    renderStudentDashboard('active'); 
}

export function openJoinClassModal(event) { 
    if(event) event.stopPropagation(); 
    if(typeof window.closeFab === 'function') window.closeFab(); 
    document.getElementById('modal-join-class').style.display = 'flex'; 
}