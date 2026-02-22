// js/adminViews.js

import { DataManager } from './dataManager.js';
import { setActiveNav, showToast } from './ui.js';

// ==========================================
// 1. ADMİN KOKPİTİ
// ==========================================
export function renderAdminDashboard() {
    setActiveNav('nav-admin-dashboard');
    document.getElementById('page-title').textContent = 'Sistem Kokpiti';
    const contentArea = document.getElementById('content-area');
    document.getElementById('header-actions').innerHTML = '';

    const users = DataManager.getUsers();
    const classes = DataManager.getClasses();
    const assignments = DataManager.getAssignments();
    
    const studentCount = users.filter(u => u.role === 'student').length;
    const teacherCount = users.filter(u => u.role === 'teacher').length;

    contentArea.innerHTML = `
        <div class="grid-container">
            <div class="card" style="grid-column: 1 / -1; display:flex; justify-content:space-between; align-items:center; background: var(--card-bg); border-left: 5px solid var(--primary-color); box-shadow: var(--shadow);">
                <div>
                    <h3 style="color: var(--primary-color); margin-bottom: 5px;"><i class="fa-solid fa-satellite-dish"></i> Sistem Canlı</h3>
                    <p style="color: var(--text-muted); font-size:0.9rem;">Tüm metrikler normal. Detaylı liste için aşağıdaki kartlara tıklayın.</p>
                </div>
            </div>
            
            <div class="stat-card" style="border-top: 4px solid #3b82f6; cursor: pointer; transition: 0.2s;" onclick="window.renderUserManagement('student')" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='none'">
                <i class="fa-solid fa-user-graduate" style="color: #3b82f6;"></i>
                <div class="stat-value">${studentCount}</div>
                <div class="stat-label" style="color: var(--text-muted);">Öğrencileri İncele <i class="fa-solid fa-arrow-right"></i></div>
            </div>
            
            <div class="stat-card" style="border-top: 4px solid #8b5cf6; cursor: pointer; transition: 0.2s;" onclick="window.renderUserManagement('teacher')" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='none'">
                <i class="fa-solid fa-chalkboard-user" style="color: #8b5cf6;"></i>
                <div class="stat-value">${teacherCount}</div>
                <div class="stat-label" style="color: var(--text-muted);">Öğretmenleri İncele <i class="fa-solid fa-arrow-right"></i></div>
            </div>
            
            <div class="stat-card" style="border-top: 4px solid #10b981; cursor: pointer; transition: 0.2s;" onclick="window.renderClassOversight()" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='none'">
                <i class="fa-solid fa-chalkboard" style="color: #10b981;"></i>
                <div class="stat-value">${classes.length}</div>
                <div class="stat-label" style="color: var(--text-muted);">Sınıfları Denetle <i class="fa-solid fa-arrow-right"></i></div>
            </div>
            
            <div class="stat-card" style="border-top: 4px solid #f59e0b; cursor: pointer; transition: 0.2s;" onclick="window.renderAssignmentOversight()" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='none'">
                <i class="fa-solid fa-file-signature" style="color: #f59e0b;"></i>
                <div class="stat-value">${assignments.length}</div>
                <div class="stat-label" style="color: var(--text-muted);">Ödevleri Görüntüle <i class="fa-solid fa-arrow-right"></i></div>
            </div>
        </div>
    `;
}

// ==========================================
// 2. KULLANICI YÖNETİMİ 
// ==========================================
export function renderUserManagement(initialFilter = 'all') {
    setActiveNav('nav-admin-users');
    document.getElementById('page-title').textContent = 'Kullanıcı Yönetimi';
    const contentArea = document.getElementById('content-area');

    // KARANLIK MOD DÜZELTMESİ: Option etiketlerine style="background: var(--input-bg); color: var(--text-main);" eklendi.
    // YENİ: Mobilde esneyebilen dinamik arama çubuğu
        document.getElementById('header-actions').innerHTML = `
            <div style="display: flex; gap: 15px; align-items: center; background: var(--card-bg); padding: 8px 15px; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: var(--shadow); width: 100%;">
                <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                    <i class="fa-solid fa-filter" style="color: var(--primary-color);"></i>
                    <select id="filter-role" onchange="window.filterAdminUsers()" style="background: transparent; border: none; color: var(--text-main); font-weight: 600; outline: none; cursor: pointer; font-size: 0.9rem; width: 100%;">
                        <option style="background: var(--input-bg); color: var(--text-main);" value="all" ${initialFilter === 'all' ? 'selected' : ''}>Tüm Roller</option>
                        <option style="background: var(--input-bg); color: var(--text-main);" value="student" ${initialFilter === 'student' ? 'selected' : ''}>Öğrenciler</option>
                        <option style="background: var(--input-bg); color: var(--text-main);" value="teacher" ${initialFilter === 'teacher' ? 'selected' : ''}>Öğretmenler</option>
                    </select>
                </div>
                <div class="desktop-only-divider" style="width: 1px; height: 20px; background: var(--border-color);"></div>
                <div style="display: flex; align-items: center; gap: 10px; flex: 2;">
                    <i class="fa-solid fa-magnifying-glass" style="color: var(--text-muted);"></i>
                    <input type="text" id="search-user" onkeyup="window.filterAdminUsers()" placeholder="İsim veya kullanıcı ara..." style="background: transparent; border: none; color: var(--text-main); outline: none; width: 100%; font-size: 0.9rem;">
                </div>
            </div>
        `;

    const users = DataManager.getUsers().filter(u => u.role !== 'admin');
    
    let html = `
    <div class="card" style="padding: 0; overflow: hidden; margin-top: 10px;">
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead style="background: rgba(0,0,0,0.03); border-bottom: 2px solid var(--border-color);">
                    <tr>
                        <th style="padding: 15px; font-weight: 600; color: var(--text-muted);">Kullanıcı Bilgisi</th>
                        <th style="padding: 15px; font-weight: 600; color: var(--text-muted);">Rol</th>
                        <th style="padding: 15px; text-align: right; font-weight: 600; color: var(--text-muted);">İşlemler</th>
                    </tr>
                </thead>
                <tbody id="admin-users-tbody">
    `;

    users.forEach(u => {
        const roleText = u.role === 'teacher' ? 'Öğretmen' : 'Öğrenci';
        const roleColor = u.role === 'teacher' ? '#8b5cf6' : '#3b82f6';

        html += `
        <tr class="user-row" data-role="${u.role}" data-name="${u.name} ${u.surname} ${u.username}" style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 15px;">
                <strong style="color: var(--text-main); font-size: 1.05rem;">${u.name} ${u.surname}</strong><br>
                <small style="color: var(--text-muted);">@${u.username}</small>
            </td>
            <td style="padding: 15px;">
                <span style="background: ${roleColor}20; color: ${roleColor}; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">${roleText}</span>
            </td>
            <td style="padding: 15px; text-align: right; gap: 8px; display: flex; justify-content: flex-end;">
                <button onclick="window.openUserDetailsModal('${u.id}')" class="btn-primary" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 6px;" title="Kullanıcı Özeti"><i class="fa-solid fa-eye"></i> Özet</button>
                <button onclick="window.resetUserPassword('${u.id}')" class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 6px;" title="Şifreyi 123456 Yap"><i class="fa-solid fa-key"></i></button>
                <button onclick="window.deleteUserAsAdmin('${u.id}')" class="btn-danger" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 6px;" title="Hesabı Kalıcı Olarak Sil"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        </tr>`;
    });

    html += `</tbody></table></div></div>`;
    contentArea.innerHTML = html;
    
    filterAdminUsers(); 
}

export function filterAdminUsers() {
    const searchText = document.getElementById('search-user').value.toLowerCase();
    const roleFilter = document.getElementById('filter-role').value;
    const rows = document.querySelectorAll('.user-row');

    rows.forEach(row => {
        const name = row.getAttribute('data-name').toLowerCase();
        const role = row.getAttribute('data-role');
        const matchesSearch = name.includes(searchText);
        const matchesRole = roleFilter === 'all' || role === roleFilter;
        row.style.display = (matchesSearch && matchesRole) ? 'table-row' : 'none';
    });
}

export function openUserDetailsModal(userId) {
    const user = DataManager.getUsers().find(u => u.id === userId);
    if(!user) return;
    
    const classes = DataManager.getClasses();
    let summaryHtml = '';
    
    if(user.role === 'teacher') {
        const myClasses = classes.filter(c => c.teacherId === user.id);
        summaryHtml = `<div style="background: var(--input-bg); padding: 10px; border-radius: 8px; margin-top: 10px; border: 1px solid var(--border-color);">
            <p style="margin: 0; color: var(--text-main);"><strong>Açtığı Sınıf Sayısı:</strong> ${myClasses.length}</p>
        </div>`;
    } else {
        const enrolledCount = user.enrolledClasses ? user.enrolledClasses.length : 0;
        summaryHtml = `<div style="background: var(--input-bg); padding: 10px; border-radius: 8px; margin-top: 10px; border: 1px solid var(--border-color);">
            <p style="margin: 0; color: var(--text-main);"><strong>Kayıtlı Olduğu Sınıf:</strong> ${enrolledCount}</p>
            ${user.studentNo ? `<p style="margin: 5px 0 0 0; color: var(--text-main);"><strong>Okul Numarası:</strong> ${user.studentNo}</p>` : ''}
        </div>`;
    }

    document.getElementById('admin-user-detail-content').innerHTML = `
        <div style="font-size: 1.1rem; color: var(--text-main);"><strong>${user.name} ${user.surname}</strong></div>
        <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 10px;">@${user.username}</div>
        ${summaryHtml}
        <div style="margin-top: 15px; font-size: 0.85rem; color: var(--warning);"><i class="fa-solid fa-circle-info"></i> Şifreyi sıfırlarsanız geçici şifre <b>123456</b> olacaktır.</div>
    `;
    document.getElementById('modal-admin-user-details').style.display = 'flex';
}

export function resetUserPassword(userId) {
    if(!confirm("Şifreyi '123456' olarak sıfırlamak istediğinize emin misiniz?")) return;
    let users = DataManager.getUsers();
    let user = users.find(u => u.id === userId);
    if(user) {
        user.password = "123456"; 
        DataManager.setUsers(users);
        showToast(`${user.name} şifresi '123456' yapıldı.`, 'success');
    }
}

export function deleteUserAsAdmin(userId) {
    if(!confirm("DİKKAT! Bu kullanıcıyı kalıcı olarak silmek istediğinize emin misiniz?")) return;
    let users = DataManager.getUsers().filter(u => u.id !== userId);
    DataManager.setUsers(users);
    showToast("Kullanıcı sistemden tamamen silindi.", "success");
    renderUserManagement(document.getElementById('filter-role').value); 
}

// ==========================================
// 3. SINIF DENETİMİ & IMPERSONATION
// ==========================================
export function renderClassOversight() {
    setActiveNav('nav-admin-classes');
    document.getElementById('page-title').textContent = 'Sınıf Denetimi';
    const contentArea = document.getElementById('content-area');
    document.getElementById('header-actions').innerHTML = '';

    const classes = DataManager.getClasses();
    const users = DataManager.getUsers();

    if(classes.length === 0) {
        contentArea.innerHTML = '<p style="color:var(--text-muted); text-align:center;">Sistemde hiç sınıf yok.</p>';
        return;
    }

    let html = '<div class="grid-container">';
    classes.forEach(c => {
        const teacher = users.find(u => u.id === c.teacherId);
        const studentCount = users.filter(u => u.role === 'student' && u.enrolledClasses && u.enrolledClasses.includes(c.id)).length;
        const isGhost = studentCount === 0;

        html += `
        <div class="card ${isGhost ? 'overdue' : ''}" style="border: 1px solid var(--border-color);">
            <div class="card-header">
                <div class="card-title">${c.name}</div>
                ${isGhost ? '<span class="badge-status badge-danger">Hayalet Sınıf</span>' : `<span class="badge-status badge-success">${studentCount} Öğrenci</span>`}
            </div>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 5px;"><i class="fa-solid fa-user-tie"></i> Öğretmen: ${teacher ? teacher.name + ' ' + teacher.surname : 'Bilinmeyen'}</p>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 15px;"><i class="fa-solid fa-barcode"></i> Kod: <strong style="color:var(--text-main);">${c.code}</strong></p>
            
            <button onclick="window.deleteClassAsAdmin('${c.id}')" class="btn-danger" style="width: 100%;"><i class="fa-solid fa-trash"></i> Sınıfı Kapat</button>
        </div>`;
    });
    html += '</div>';
    contentArea.innerHTML = html;
}

export function deleteClassAsAdmin(classId) {
    if(!confirm('Bu sınıfı zorla kapatmak istediğinize emin misiniz?')) return;
    let classes = DataManager.getClasses().filter(c => c.id !== classId);
    DataManager.setClasses(classes);
    showToast('Sınıf kapatıldı.', 'success');
    renderClassOversight();
}

// ==========================================
// YENİ: 4. TÜM ÖDEVLER DENETİMİ
// ==========================================
export function renderAssignmentOversight() {
    // Sınıf denetimi menüsünün alt modülü gibi çalışır
    setActiveNav('nav-admin-dashboard'); 
    document.getElementById('page-title').textContent = 'Tüm Ödevler Denetimi';
    const contentArea = document.getElementById('content-area');
    
    // Geri dön butonu
    document.getElementById('header-actions').innerHTML = `
        <button class="btn-secondary" onclick="window.renderAdminDashboard()"><i class="fa-solid fa-arrow-left"></i> Kokpite Dön</button>
    `;

    const assignments = DataManager.getAssignments();
    const classes = DataManager.getClasses();
    const users = DataManager.getUsers();

    if(assignments.length === 0) {
        contentArea.innerHTML = '<p style="color:var(--text-muted); text-align:center; margin-top: 50px;"><i class="fa-solid fa-box-open fa-3x"></i><br><br>Sistemde verilmiş hiçbir ödev bulunmuyor.</p>';
        return;
    }

    let html = '<div class="grid-container">';
    
    // En yeniler en üstte
    const sortedAssignments = [...assignments].reverse();

    sortedAssignments.forEach(a => {
        const parentClass = classes.find(c => c.id === a.classId);
        const teacher = parentClass ? users.find(u => u.id === parentClass.teacherId) : null;
        const className = parentClass ? parentClass.name : 'Silinmiş Sınıf';
        const teacherName = teacher ? `${teacher.name} ${teacher.surname}` : 'Bilinmeyen Öğretmen';

        html += `
        <div class="card" style="border: 1px solid var(--border-color);">
            <div class="card-header">
                <div class="card-title">${a.title}</div>
                <div class="card-badge">${className}</div>
            </div>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 5px;"><i class="fa-solid fa-user-pen"></i> Veren: ${teacherName}</p>
            <div class="assignment-meta" style="margin-bottom: 15px;">
                <span style="color: var(--warning);"><i class="fa-regular fa-calendar-xmark"></i> Son Tarih: ${a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'Belirsiz'}</span>
            </div>
            
            <button onclick="window.deleteAssignmentAsAdmin('${a.id}')" class="btn-danger" style="width: 100%;"><i class="fa-solid fa-trash-can"></i> Bu Ödevi Sistemden Sil</button>
        </div>`;
    });
    html += '</div>';
    contentArea.innerHTML = html;
}

export function deleteAssignmentAsAdmin(assignmentId) {
    if(!confirm("Sistem yöneticisi olarak bu ödevi zorla silmek istediğinize emin misiniz? Öğrencilerin verileri de gidecek.")) return;
    
    let assignments = DataManager.getAssignments().filter(a => a.id !== assignmentId);
    DataManager.setAssignments(assignments);
    
    let submissions = DataManager.getSubmissions().filter(s => s.assignmentId !== assignmentId);
    DataManager.setSubmissions(submissions);
    
    showToast('Ödev sistemden silindi.', 'success');
    renderAssignmentOversight();
}

export function changeViewMode(mode) {
    const user = DataManager.getCurrentUser();
    if (user.role !== 'admin') return;
    localStorage.setItem('adminViewMode', mode);
    showToast(`Test moduna geçiliyor...`, 'info');
    setTimeout(() => { window.location.reload(); }, 800);
}

export function exitImpersonation() {
    changeViewMode('admin');
}