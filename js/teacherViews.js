// js/teacherViews.js

import { DataManager, syncDataToLocal } from './dataManager.js';
import { fetchBulutVeri } from './firebaseApi.js';
import { generateId, generateClassCode } from './utils.js';
import { showToast, closeModal, setActiveNav } from './ui.js';

export function renderDashboardHome() {
    setActiveNav('nav-home');
    const user = DataManager.getCurrentUser();
    const contentArea = document.getElementById('content-area');
    document.getElementById('header-actions').innerHTML = '';
    document.getElementById('page-title').textContent = 'Özet Tablosu';

    const classes = DataManager.getClasses().filter(c => c.teacherId === user.id);
    const assignments = DataManager.getAssignments().filter(a => classes.some(c => c.id === a.classId));
    const allUsers = DataManager.getUsers();
    
    const studentSet = new Set();
    allUsers.forEach(u => {
        if (u.role === 'student' && u.enrolledClasses) {
            u.enrolledClasses.forEach(classId => {
                if (classes.some(c => c.id === classId)) studentSet.add(u.id);
            });
        }
    });

    contentArea.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card" onclick="window.viewAllClassesStats()">
                <i class="fa-solid fa-chalkboard"></i>
                <div class="stat-value">${classes.length}</div>
                <div class="stat-label">Aktif Sınıf</div>
            </div>
            <div class="stat-card" onclick="window.viewAllStudentsStats()">
                <i class="fa-solid fa-users"></i>
                <div class="stat-value">${studentSet.size}</div>
                <div class="stat-label">Toplam Öğrenci</div>
            </div>
            <div class="stat-card" onclick="window.viewAllAssignmentsStats()">
                <i class="fa-solid fa-file-signature"></i>
                <div class="stat-value">${assignments.length}</div>
                <div class="stat-label">Verilen Ödev</div>
            </div>
        </div>
        <div id="dashboard-detail-area">
            <div style="text-align:center; color:var(--text-muted); padding:30px;">
                <i class="fa-solid fa-hand-pointer fa-2x" style="margin-bottom:15px; opacity:0.5;"></i>
                <p>Detaylı listeleri görmek için yukarıdaki kutulara tıklayın.</p>
            </div>
        </div>
    `;
}

export function renderTeacherClassesList() {
    setActiveNav('nav-classes');
    const user = DataManager.getCurrentUser();
    const contentArea = document.getElementById('content-area');
    document.getElementById('header-actions').innerHTML = '';
    document.getElementById('page-title').textContent = 'Sınıflarım';

    const classes = DataManager.getClasses().filter(c => c.teacherId === user.id);

    if (classes.length === 0) {
        contentArea.innerHTML = `<div style="text-align:center; padding: 50px; color: var(--text-muted);">
            <i class="fa-solid fa-chalkboard fa-3x"></i>
            <p style="margin-top:20px;">Henüz bir sınıf oluşturmadınız. Sağ alttaki <strong>+</strong> butonuna basın.</p>
        </div>`;
        return;
    }

    let html = '<div class="grid-container">';
    classes.forEach(c => {
        const allUsers = DataManager.getUsers();
        const studentCount = allUsers.filter(u => u.role === 'student' && u.enrolledClasses && u.enrolledClasses.includes(c.id)).length;

        html += `
        <div class="card teacher-class-card">
            <div class="tcc-header">
                <div class="tcc-title-area">
                    <div class="tcc-title">${c.name}</div>
                    <div class="tcc-students"><i class="fa-solid fa-user-group"></i> ${studentCount} Öğrenci</div>
                </div>
                <button class="btn-icon-danger" onclick="window.deleteClass('${c.id}')" title="Sınıfı Sil">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
            <div class="tcc-code-area" onclick="navigator.clipboard.writeText('${c.code}'); window.showToast('Kod kopyalandı!', 'success');">
                <span class="tcc-code-label">Sınıf Kodu (Kopyalamak için tıkla)</span>
                <strong class="tcc-code">${c.code} <i class="fa-regular fa-copy"></i></strong>
            </div>
            <div class="tcc-actions">
                <button class="btn-tcc-primary" onclick="window.viewClassAssignments('${c.id}')">
                    <i class="fa-solid fa-folder-open"></i> Ödevleri Yönet
                </button>
                <div class="tcc-action-row">
                    <button class="btn-tcc-secondary" onclick="window.openStudentListModal('${c.id}')">
                        <i class="fa-solid fa-list-ul"></i> Liste
                    </button>
                    <button class="btn-tcc-add" onclick="window.openAddAssignmentModal('${c.id}', event)">
                        <i class="fa-solid fa-plus"></i> Yeni Ödev
                    </button>
                </div>
            </div>
        </div>`;
    });
    html += '</div>';
    contentArea.innerHTML = html;
}

export function viewAllClassesStats() {
    const user = DataManager.getCurrentUser();
    const classes = DataManager.getClasses().filter(c => c.teacherId === user.id);
    const detailArea = document.getElementById('dashboard-detail-area');
    
    if (classes.length === 0) {
        detailArea.innerHTML = '<p class="text-center" style="color:var(--text-muted)">Hiç sınıfınız yok.</p>';
        return;
    }
    
    let html = '<h3 style="margin-bottom: 15px; color: var(--primary-color);"><i class="fa-solid fa-chalkboard"></i> Sınıflarım ve Kodları</h3><div class="grid-container">';
    classes.forEach(c => {
        html += `<div class="card" style="padding: 15px;">
            <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 10px;">${c.name}</div>
            <div style="background: rgba(0,0,0,0.05); padding: 8px; border-radius: 8px; text-align: center; font-family: monospace; letter-spacing: 2px;">${c.code}</div>
        </div>`;
    });
    html += '</div>';
    detailArea.innerHTML = html;
}

export function viewAllStudentsStats() {
    const user = DataManager.getCurrentUser();
    const classes = DataManager.getClasses().filter(c => c.teacherId === user.id);
    const allUsers = DataManager.getUsers();
    const detailArea = document.getElementById('dashboard-detail-area');
    
    let studentsHtml = '<h3 style="margin-bottom: 15px; color: var(--primary-color);"><i class="fa-solid fa-users"></i> Tüm Öğrenciler ve Sınıfları</h3><ul style="list-style:none; padding:0; background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border-color);">';
    let studentCount = 0;

    allUsers.forEach(u => {
        if (u.role === 'student' && u.enrolledClasses) {
            const studentClasses = classes.filter(c => u.enrolledClasses.includes(c.id));
            if (studentClasses.length > 0) {
                studentCount++;
                const classNames = studentClasses.map(c => `<span class="badge-status badge-pending" style="margin-right: 5px;">${c.name}</span>`).join('');
                studentsHtml += `<li style="padding: 12px 15px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                    <div><strong>${u.name} ${u.surname}</strong> <br><small style="color:var(--text-muted)">No: ${u.studentNo || '-'}</small></div>
                    <div>${classNames}</div>
                </li>`;
            }
        }
    });
    studentsHtml += '</ul>';
    
    if(studentCount === 0) detailArea.innerHTML = '<p class="text-center" style="color:var(--text-muted)">Sınıflarınıza kayıtlı öğrenci yok.</p>';
    else detailArea.innerHTML = studentsHtml;
}

export function viewAllAssignmentsStats() {
    const user = DataManager.getCurrentUser();
    const classes = DataManager.getClasses().filter(c => c.teacherId === user.id);
    const assignments = DataManager.getAssignments().filter(a => classes.some(c => c.id === a.classId));
    const submissions = DataManager.getSubmissions();
    const detailArea = document.getElementById('dashboard-detail-area');
    
    if (assignments.length === 0) {
        detailArea.innerHTML = '<p class="text-center" style="color:var(--text-muted)">Hiç ödev verilmemiş.</p>';
        return;
    }
    
    let html = '<h3 style="margin-bottom: 15px; color: var(--primary-color);"><i class="fa-solid fa-file-signature"></i> Ödevler (Tıklayıp Teslimleri Gör)</h3><div class="grid-container">';
    
    // YENİ: Diziyi tersine çevirerek en yeni ödevleri en üste alıyoruz!
    const sortedAssignments = [...assignments].reverse(); 
    
    sortedAssignments.forEach(a => {
        const parentClass = classes.find(c => c.id === a.classId);
        // Muafiyetleri teslim sayısından sayma
        const subCount = submissions.filter(s => s.assignmentId === a.id && s.status !== 'exempt').length; 
        
        html += `
        <div class="card" style="padding: 15px; cursor: pointer;" onclick="window.openAssignmentDetailsModal('${a.id}')" title="Detayları ve teslim edenleri gör">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                <div class="card-badge" style="margin:0;">${parentClass.name}</div>
                <div class="badge-status badge-success"><i class="fa-solid fa-check"></i> ${subCount} Teslim</div>
            </div>
            <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 5px;">${a.title}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);"><i class="fa-regular fa-calendar"></i> Son: ${a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'Belirsiz'}</div>
            <div style="margin-top:10px; font-size:0.8rem; color:var(--primary-color); text-align:right;"><i class="fa-solid fa-arrow-right"></i> Öğrencileri İncele</div>
        </div>`;
    });
    html += '</div>';
    detailArea.innerHTML = html;
}

export function openCreateClassModal(event) { 
    if(event) event.stopPropagation(); 
    window.closeFab(); 
    document.getElementById('modal-create-class').style.display = 'flex'; 
}

export function deleteClass(classId) {
    if(!confirm('Bu sınıfı silmek istediğine emin misin?')) return;
    let classes = DataManager.getClasses(); classes = classes.filter(c => c.id !== classId); DataManager.setClasses(classes);
    let assignments = DataManager.getAssignments(); assignments = assignments.filter(a => a.classId !== classId); DataManager.setAssignments(assignments);
    let users = DataManager.getUsers();
    users.forEach(u => { if(u.role === 'student' && u.enrolledClasses) { u.enrolledClasses = u.enrolledClasses.filter(id => id !== classId); } });
    DataManager.setUsers(users);
    showToast('Sınıf başarıyla silindi.', 'success');
    renderTeacherClassesList(); 
}

export async function openStudentListModal(classId) {
    try {
        const veri = await fetchBulutVeri();
        if (veri && veri.users) localStorage.setItem('users', JSON.stringify(veri.users));
    } catch (e) { console.log("Veri çekilemedi."); }

    const users = DataManager.getUsers();
    const students = users.filter(u => u.role === 'student' && u.enrolledClasses && u.enrolledClasses.includes(classId));
    const listContainer = document.getElementById('student-list-content');
    
    if (students.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:20px;">Henüz bu sınıfa kayıtlı öğrenci yok.</p>';
    } else {
        let html = '<ul style="list-style:none;">';
        students.forEach(s => {
            html += `
            <li class="student-list-item">
                <div>
                    <i class="fa-solid fa-user-graduate" style="color:var(--primary-color); margin-right:8px;"></i>
                    <strong>${s.name} ${s.surname}</strong>
                    <br><small style="color:var(--text-muted); margin-left:24px;">No: ${s.studentNo || '-'}</small>
                </div>
                <button class="btn-danger" onclick="window.removeStudentFromClass('${s.id}', '${classId}')" title="Sınıftan Çıkar"><i class="fa-solid fa-user-xmark"></i></button>
            </li>`;
        });
        html += '</ul>';
        listContainer.innerHTML = html;
    }
    document.getElementById('modal-student-list').style.display = 'flex';
}

export function removeStudentFromClass(studentId, classId) {
    if(!confirm('Bu öğrenciyi sınıftan çıkarmak istediğine emin misin?')) return;
    let users = DataManager.getUsers();
    const studentIndex = users.findIndex(u => u.id === studentId);
    if (studentIndex > -1) {
        users[studentIndex].enrolledClasses = users[studentIndex].enrolledClasses.filter(id => id !== classId);
        DataManager.setUsers(users);
        showToast('Öğrenci sınıftan çıkarıldı.', 'success');
        openStudentListModal(classId); 
        renderTeacherClassesList(); 
    }
}

export function openAddAssignmentModalDirect(event) { openAddAssignmentModal(null, event); }

export function openAddAssignmentModal(classId = null, event = null) {
    if(event) event.stopPropagation();
    window.closeFab();
    
    const select = document.getElementById('assignment-class-select');
    select.innerHTML = '<option value="" disabled selected>Hangi Sınıfa Verilecek?</option>';
    
    const user = DataManager.getCurrentUser();
    const classes = DataManager.getClasses().filter(c => c.teacherId === user.id);
    
    if(classes.length === 0) { showToast('Önce bir sınıf oluşturmalısınız!', 'error'); return; }

    classes.forEach(c => { select.innerHTML += `<option value="${c.id}">${c.name}</option>`; });

    if (classId) {
        select.value = classId;
        select.parentElement.style.display = 'none'; 
        select.dataset.selected = classId;
    } else {
        select.parentElement.style.display = 'block';
        select.dataset.selected = "";
    }

    document.getElementById('assignment-title').value = '';
    document.getElementById('questionCount').value = '';
    document.getElementById('assignment-date').value = ''; 
    document.getElementById('modal-add-assignment').style.display = 'flex';
}

export async function viewClassAssignments(classId) {
    try {
        const veri = await fetchBulutVeri();
        if (veri) syncDataToLocal(veri); 
    } catch (e) { console.log("Veri çekilemedi."); }

    const assignments = DataManager.getAssignments().filter(a => a.classId === classId);
    const submissions = DataManager.getSubmissions();
    const contentArea = document.getElementById('content-area');
    document.getElementById('page-title').textContent = 'Ödev Takibi';
    document.getElementById('header-actions').innerHTML = `<button class="btn-secondary" onclick="window.renderTeacherClassesList()">Geri Dön</button>`;

    if (assignments.length === 0) {
        contentArea.innerHTML = '<p class="text-center" style="color:var(--text-muted)">Bu sınıfta henüz ödev yok.</p>';
        return;
    }

    let html = '<div class="grid-container">';
    
    // YENİ: Ödevleri tersine çevirerek en yeni ödevleri en üste alıyoruz!
    const sortedAssignments = [...assignments].reverse();

    sortedAssignments.forEach(a => {
        const completedCount = submissions.filter(s => s.assignmentId === a.id && s.status !== 'exempt').length;
        html += `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div class="card-title">${a.title}</div>
                <button class="btn-icon-danger" onclick="window.deleteAssignment('${a.id}', '${classId}')" title="Ödevi Sil" style="padding: 0; font-size: 1.2rem;">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin: 10px 0;">${a.description}</p>
            <div class="assignment-meta">
                <span><i class="fa-solid fa-check-circle"></i> ${completedCount} Teslim</span>
                <span>Son: ${a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'Belirsiz'}</span>
            </div>
            <button class="btn-primary" style="margin-top:15px;" onclick="window.openAssignmentDetailsModal('${a.id}')">Teslimleri Gör</button>
        </div>`;
    });
    html += '</div>';
    contentArea.innerHTML = html;
}

export async function openAssignmentDetailsModal(assignmentId) {
    try {
        const veri = await fetchBulutVeri();
        if (veri) {
            if (veri.users) localStorage.setItem('users', JSON.stringify(veri.users));
            if (veri.submissions) localStorage.setItem('submissions', JSON.stringify(veri.submissions));
        }
    } catch (e) { console.log("Veri çekilemedi."); }

    const assignments = DataManager.getAssignments();
    const assignment = assignments.find(a => a.id === assignmentId);
    const users = DataManager.getUsers();
    const studentsInClass = users.filter(u => u.role === 'student' && u.enrolledClasses && u.enrolledClasses.includes(assignment.classId));
    const submissions = DataManager.getSubmissions().filter(s => s.assignmentId === assignmentId);
    
    const container = document.getElementById('assignment-detail-content');
    document.getElementById('detail-title').textContent = `${assignment.title} - Durum`;

    if (studentsInClass.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);">Bu sınıfta hiç öğrenci yok.</p>';
    } else {
        let html = '<ul style="list-style:none; padding:0;">';
        studentsInClass.forEach(student => {
            const submission = submissions.find(s => s.studentId === student.id);
            let badge = '';
            let statsHtml = ''; // YENİ: İstatistikleri tutacağımız değişken

            if (submission) {
                if (submission.status === 'exempt') {
                    badge = '<span class="badge-status" style="background: rgba(100,116,139,0.1); color: #64748b;"><i class="fa-solid fa-minus"></i> Muaf</span>';
                } else {
                    badge = '<span class="badge-status badge-success"><i class="fa-solid fa-check"></i> Tamamlandı</span>';
                    
                    // YENİ: Eğer öğrencinin istatistiği varsa alt kısma şık bir bar ekliyoruz
                    if (submission.stats) {
                        statsHtml = `
                        <div style="font-size: 0.85rem; margin-top: 12px; display: flex; gap: 15px; background: rgba(0,0,0,0.03); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-color);">
                            <span style="color: var(--success);" title="Doğru"><i class="fa-solid fa-circle-check"></i> ${submission.stats.correct}</span>
                            <span style="color: var(--danger);" title="Yanlış"><i class="fa-solid fa-circle-xmark"></i> ${submission.stats.wrong}</span>
                            <span style="color: var(--text-muted);" title="Boş"><i class="fa-solid fa-minus"></i> ${submission.stats.blank}</span>
                            <strong style="color: var(--primary-color); margin-left: auto;">Başarı: %${submission.stats.successRate}</strong>
                        </div>`;
                    }
                }
            }
            else {
                const today = new Date(); today.setHours(0,0,0,0);
                const due = assignment.dueDate ? new Date(assignment.dueDate) : null;
                if (due && due < today) badge = '<span class="badge-status badge-danger"><i class="fa-solid fa-clock"></i> Süresi Doldu</span>';
                else badge = '<span class="badge-status badge-pending"><i class="fa-solid fa-hourglass-start"></i> Bekliyor</span>';
            }
            
            // YENİ: li etiketine display:block verip içerikleri alt alta estetikçe dizdik
            html += `
            <li class="student-list-item" style="display: block; padding: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${student.name} ${student.surname}</strong>
                        <br><small style="color:var(--text-muted);">No: ${student.studentNo || '-'}</small>
                    </div>
                    <div>${badge}</div>
                </div>
                ${statsHtml}
            </li>`;
        });
        html += '</ul>';
        container.innerHTML = html;
    }
    document.getElementById('modal-assignment-details').style.display = 'flex';
}
// YENİ: Ödev Silme Fonksiyonu
export function deleteAssignment(assignmentId, classId) {
    if(!confirm('Bu ödevi ve öğrencilerin bu ödeve ait tüm teslim kayıtlarını silmek istediğinize emin misiniz?')) return;
    
    // 1. Ödevi sil
    let assignments = DataManager.getAssignments();
    assignments = assignments.filter(a => a.id !== assignmentId);
    DataManager.setAssignments(assignments);
    
    // 2. Bu ödeve ait tüm teslimleri ve muafiyetleri (çöp kalmasın diye) sil
    let submissions = DataManager.getSubmissions();
    submissions = submissions.filter(s => s.assignmentId !== assignmentId);
    DataManager.setSubmissions(submissions);
    
    window.showToast('Ödev başarıyla silindi.', 'success');
    window.viewClassAssignments(classId); // Sayfayı anında yenile
}