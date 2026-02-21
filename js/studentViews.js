// js/studentViews.js

import { DataManager } from './dataManager.js';
import { generateId } from './utils.js';
import { setActiveNav, showToast } from './ui.js'; // Hatanın sebebi burasıydı, bu satır eksikti!

export function renderStudentDashboard(tab = 'active') {
    setActiveNav('nav-assignments'); // Artık hatasız çalışacak
    document.getElementById('page-title').textContent = 'Ödevlerim';
    const contentArea = document.getElementById('content-area');
    document.getElementById('header-actions').innerHTML = '';

    // --- YENİ: OTURUMU GÜNCEL TUTMA SİHİRMİZ ---
    let user = DataManager.getCurrentUser();
    const allUsers = DataManager.getUsers();
    const freshUser = allUsers.find(u => u.id === user.id);
    if (freshUser) {
        user = freshUser; // Öğrencinin güncel sınıflarını al
        DataManager.setCurrentUser(user); // Oturumu yenile (atıldığı sınıf silinsin)
    }
    // -------------------------------------------

    const enrolledIds = user.enrolledClasses || [];
    const classes = DataManager.getClasses().filter(c => enrolledIds.includes(c.id));
    const allAssignments = DataManager.getAssignments().filter(a => enrolledIds.includes(a.classId));
    const submissions = DataManager.getSubmissions();

    let html = `
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
        filteredList = allAssignments.filter(a => {
            const isSub = submissions.find(s => s.assignmentId === a.id && s.studentId === user.id);
            const isOverdue = a.dueDate && new Date(a.dueDate) < today;
            return !isSub && !isOverdue; 
        });
    } else if (tab === 'missed') {
        filteredList = allAssignments.filter(a => {
            const isSub = submissions.find(s => s.assignmentId === a.id && s.studentId === user.id);
            const isOverdue = a.dueDate && new Date(a.dueDate) < today;
            return !isSub && isOverdue; 
        });
    } else {
        filteredList = allAssignments.filter(a => submissions.find(s => s.assignmentId === a.id && s.studentId === user.id));
    }

    if (filteredList.length === 0) {
        let msg = tab === 'active' ? 'Bekleyen harika! Hiç ödevin yok.' : (tab === 'missed' ? 'Süpersin! Kaçırdığın hiç ödev yok.' : 'Henüz tamamlanmış bir ödev yok.');
        let icon = tab === 'active' ? 'fa-mug-hot' : (tab === 'missed' ? 'fa-face-smile-wink' : 'fa-box-open');
        html += `<div style="text-align:center; padding:50px; color:var(--text-muted);">
            <i class="fa-solid ${icon} fa-3x"></i>
            <p style="margin-top:20px;">${msg}</p>
        </div>`;
    } else {
        html += '<div class="grid-container">';
        
        // YENİ: Ödevleri tersine çevirerek en yenileri en başa al
        const sortedFilteredList = [...filteredList].reverse();
        
        sortedFilteredList.forEach(a => {
            const parentClass = classes.find(c => c.id === a.classId);
            if (!parentClass) return;

            if (tab === 'completed') {
                const sub = submissions.find(s => s.assignmentId === a.id && s.studentId === user.id);
                const isExempt = sub && sub.status === 'exempt'; // Öğrenci bu ödevden muaf mı?

                html += `
                <div class="card completed" ${isExempt ? 'style="border-color: #cbd5e1; opacity: 0.6;"' : ''}>
                    <div class="card-header">
                        <div class="card-title">${a.title}</div>
                        <div class="card-badge" ${isExempt ? 'style="background: #f1f5f9; color: #64748b;"' : ''}>${parentClass.name}</div>
                    </div>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">${a.description}</p>
                    <div class="assignment-meta"><span><i class="fa-solid ${isExempt ? 'fa-minus' : 'fa-check'}"></i> ${isExempt ? 'Muaf Tutuldun' : 'Tamamlandı'}</span></div>
                    <button class="btn-complete" style="background:${isExempt ? '#f1f5f9' : 'rgba(16, 185, 129, 0.1)'}; color:${isExempt ? '#64748b' : 'var(--success)'}; border:none; cursor:default;">
                        <i class="fa-solid ${isExempt ? 'fa-minus' : 'fa-check'}"></i> ${isExempt ? 'Ödevden Muafsın' : 'Teslim Edildi'}
                    </button>
                </div>`;
            } else {
                // ... (Burası mevcut "Süresi Doldu" ve "Bekleyenler" kısmı aynı kalacak)
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
                    <p style="color: var(--text-muted); font-size: 0.9rem;">${a.description}</p>
                    <div class="assignment-meta">
                        <span style="color:${timeColor}; font-weight: ${isUrgent ? '700' : 'normal'}">
                            <i class="fa-solid ${isUrgent ? 'fa-hourglass-half fa-spin-pulse' : 'fa-calendar'}"></i> ${isUrgent ? timeText : (isOverdue ? 'Son Tarih: ' + timeText : 'Son: ' + timeText)}
                        </span>
                    </div>
                    ${isOverdue ? `<button class="btn-complete" style="background:rgba(239, 68, 68, 0.1); color:var(--danger); border:none; cursor:not-allowed; margin-top:15px;"><i class="fa-solid fa-circle-xmark"></i> Süresi Doldu</button>` : `<button class="btn-complete ${isUrgent ? 'btn-urgent' : ''}" onclick="window.submitAssignment('${a.id}')">Tamamla</button>`}
                </div>`;
            }
        });
        html += '</div>';
    }
    html += `</div>`;
    contentArea.innerHTML = html;
}

export function submitAssignment(assignmentId) {
    const user = DataManager.getCurrentUser();
    const submissions = DataManager.getSubmissions();
    const newSub = { id: generateId(), assignmentId, studentId: user.id, status: 'completed', timestamp: new Date().toISOString() };
    submissions.push(newSub);
    DataManager.setSubmissions(submissions);
    
    if (!window.confetti) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
        script.onload = () => confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, zIndex: 9999 });
        document.head.appendChild(script);
    } else confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, zIndex: 9999 });

    showToast('Tebrikler! Ödev tamamlandı.', 'success');
    renderStudentDashboard('active'); 
}

export function openJoinClassModal(event) { 
    if(event) event.stopPropagation(); 
    if(typeof window.closeFab === 'function') window.closeFab(); 
    document.getElementById('modal-join-class').style.display = 'flex'; 
}