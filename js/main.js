// js/main.js

import { DataManager, syncDataToLocal } from './dataManager.js';
import { fetchBulutVeri } from './firebaseApi.js';
import { generateId, generateClassCode } from './utils.js';
import { initTheme, moveThemeButton, showToast, toggleDarkMode, togglePassword, switchAuth, toggleStudentFields, closeModal } from './ui.js';
import { setupAuthListeners, deleteAccount, updateProfile, updatePassword } from './auth.js';
import {
    renderDashboardHome,
    renderTeacherClassesList,
    viewAllClassesStats,
    viewAllStudentsStats,
    viewAllAssignmentsStats,
    openCreateClassModal,
    deleteClass,
    openStudentListModal,
    removeStudentFromClass,
    openAddAssignmentModalDirect,
    openAddAssignmentModal,
    viewClassAssignments,
    openAssignmentDetailsModal,
    deleteAssignment
} from './teacherViews.js';
import {
    renderStudentDashboard, openCompleteModal, saveTaskStats,
    openJoinClassModal, leaveClass
} from './studentViews.js';
// adminViews.js'den gelen tüm fonksiyonları eksiksiz içe aktarıyoruz
// adminViews.js import satırını aynen böyle güncelle:
import {
    renderAdminDashboard, renderUserManagement, renderClassOversight,
    changeViewMode, exitImpersonation, filterAdminUsers,
    openUserDetailsModal, resetUserPassword, deleteUserAsAdmin, deleteClassAsAdmin,
    renderAssignmentOversight, deleteAssignmentAsAdmin
} from './adminViews.js';
// ---- GLOBAL PENCEREYE (WINDOW) BAĞLAMA ----
window.toggleDarkMode = toggleDarkMode;
window.togglePassword = togglePassword;
window.switchAuth = switchAuth;
window.toggleStudentFields = toggleStudentFields;
window.closeModal = closeModal;
window.showToast = showToast;
window.renderDashboardHome = renderDashboardHome;
window.renderTeacherClassesList = renderTeacherClassesList;
window.renderStudentDashboard = renderStudentDashboard;
window.logout = DataManager.logout;
window.syncDataToLocal = syncDataToLocal;
window.deleteAccount = deleteAccount;
window.updateProfile = updateProfile;
window.updatePassword = updatePassword;
// İstatistik ve Liste Fonksiyonları
window.viewAllClassesStats = viewAllClassesStats;
window.viewAllStudentsStats = viewAllStudentsStats;
window.viewAllAssignmentsStats = viewAllAssignmentsStats;

// Modal ve Öğretmen Fonksiyonları
window.openCreateClassModal = openCreateClassModal;
window.deleteClass = deleteClass;
window.openStudentListModal = openStudentListModal;
window.removeStudentFromClass = removeStudentFromClass;
window.openAddAssignmentModalDirect = openAddAssignmentModalDirect;
window.openAddAssignmentModal = openAddAssignmentModal;
window.viewClassAssignments = viewClassAssignments;
window.openAssignmentDetailsModal = openAssignmentDetailsModal;
window.deleteAssignment = deleteAssignment;

// Öğrenci Fonksiyonları
window.openJoinClassModal = openJoinClassModal;
window.leaveClass = leaveClass;
// window.submitAssignment = submitAssignment; // BUNU SİL, YERİNE ŞUNLARI YAZ:
window.openCompleteModal = openCompleteModal;
window.saveTaskStats = saveTaskStats;
//Admin fonksiyonları

// ---- GLOBAL PENCEREYE (WINDOW) BAĞLAMA ----
// O bölüme in ve admin window atamalarını aynen şu şekilde eksiksiz tamamla:
window.renderAdminDashboard = renderAdminDashboard;
window.renderUserManagement = renderUserManagement;
window.renderClassOversight = renderClassOversight;
window.changeViewMode = changeViewMode;
window.exitImpersonation = exitImpersonation;
window.filterAdminUsers = filterAdminUsers;
window.openUserDetailsModal = openUserDetailsModal;
window.resetUserPassword = resetUserPassword;
window.deleteUserAsAdmin = deleteUserAsAdmin;
window.deleteClassAsAdmin = deleteClassAsAdmin;
window.renderAssignmentOversight = renderAssignmentOversight;
window.deleteAssignmentAsAdmin = deleteAssignmentAsAdmin;

// ---- HTML ELEMENTLERİNİN TIKLAMA OLAYLARINI (EVENTS) BAĞLAMA ----
function setupHTMLListeners() {
    // 1. ÇIKIŞ YAP Butonu (Senin en çok takıldığın yer)
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', window.logout);
    // ------------------------------------------
    // YENİ: PROFİL AYARLARI VE DANGER ZONE
    // ------------------------------------------

    // --- ELİT TEMA GEÇİŞ MANTIĞI ---
    // 1. Önce HTML'deki elemanları JavaScript'e tanıtıyoruz
    const teacherBtn = document.getElementById('teacher-btn'); // Öğretmen butonu
    const studentBtn = document.getElementById('student-btn'); // Öğrenci butonu
    const loginBtn = document.getElementById('login-btn');     // Giriş butonu
    const accentText = document.getElementById('accent-text'); // "Rehberlik" yazısı
    const authSection = document.getElementById('auth-section'); // En arka plan

    // 2. Desen Tanımları (SVG Kodları)
    const studentPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 24 24' fill='none' stroke='%233182CE' stroke-width='1' stroke-opacity='0.12' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 14l9-5-9-5-9 5 9 5z'/%3E%3Cpath d='M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z'/%3E%3C/svg%3E")`;
    const teacherPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 24 24' fill='none' stroke='%23F97316' stroke-width='1' stroke-opacity='0.12' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='7' width='18' height='12' rx='2'/%3E%3Cpath d='M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2'/%3E%3C/svg%3E")`;

    if (teacherBtn && studentBtn) {
        // ÖĞRETMEN MODU TIKLANDIĞINDA
        teacherBtn.addEventListener('click', () => {
            // Arka plan desenini çantalı desene çevir
            if (authSection) authSection.style.backgroundImage = teacherPattern;

            // "Rehberlik" yazısını turuncuya çevir (Mavi class'ını sil, Turuncu ekle)
            if (accentText) accentText.classList.replace('text-[#3182CE]', 'text-orange-500');

            // Giriş butonunu turuncu yap
            if (loginBtn) loginBtn.classList.replace('bg-[#1A202C]', 'bg-orange-600');

            // Butonların aktiflik durumunu güncelle
            teacherBtn.className = "flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-orange-500 shadow-lg transition-all";
            studentBtn.className = "flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-700 transition-all";
        });

        // ÖĞRENCİ MODU TIKLANDIĞINDA
        studentBtn.addEventListener('click', () => {
            // Arka plan desenini kepli desene çevir
            if (authSection) authSection.style.backgroundImage = studentPattern;

            // "Rehberlik" yazısını maviye geri çevir
            if (accentText) accentText.classList.replace('text-orange-500', 'text-[#3182CE]');

            // Giriş butonunu koyu laciverte geri çevir
            if (loginBtn) loginBtn.classList.replace('bg-orange-600', 'bg-[#1A202C]');

            // Butonların aktiflik durumunu güncelle
            studentBtn.className = "flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-[#3182CE] shadow-lg transition-all";
            teacherBtn.className = "flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-700 transition-all";
        });
    }

    // 1. Profil Kartına Tıklayınca Ayarları Aç ve İçini Doldur
    const btnProfileSettings = document.getElementById('btn-profile-settings');
    if (btnProfileSettings) {
        btnProfileSettings.addEventListener('click', () => {
            const user = DataManager.getCurrentUser();
            if (user) {
                document.getElementById('set-name').value = user.name;
                document.getElementById('set-surname').value = user.surname;
                document.getElementById('set-new-password').value = '';
                document.getElementById('set-new-password-confirm').value = '';
                if (typeof window.closeFab === 'function') window.closeFab(); // Varsa Speed Dial'ı kapat
                document.getElementById('modal-profile-settings').style.display = 'flex';
            }
        });
    }

    // 2. İsim Değiştirme Formunu Yakala
    const formUpdateProfile = document.getElementById('form-update-profile');
    if (formUpdateProfile) {
        formUpdateProfile.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('set-name').value.trim();
            const surname = document.getElementById('set-surname').value.trim();
            if (window.updateProfile(name, surname)) {
                window.showToast('Profil bilgileri güncellendi.', 'success');
                // Sayfayı yenilemeden sol menüdeki ismi anında güncelle:
                const user = DataManager.getCurrentUser();
                document.getElementById('user-fullname').textContent = `${user.name} ${user.surname}`;
                document.getElementById('user-avatar').textContent = (user.name.charAt(0) + user.surname.charAt(0)).toUpperCase();
            }
        });
    }

    // 3. Şifre Değiştirme Formunu Yakala
    const formUpdatePassword = document.getElementById('form-update-password');
    if (formUpdatePassword) {
        formUpdatePassword.addEventListener('submit', (e) => {
            e.preventDefault();
            const p1 = document.getElementById('set-new-password').value;
            const p2 = document.getElementById('set-new-password-confirm').value;
            if (p1 !== p2) {
                window.showToast('Şifreler uyuşmuyor!', 'error');
                return;
            }
            if (window.updatePassword(p1)) {
                window.showToast('Şifreniz başarıyla güncellendi.', 'success');
                document.getElementById('set-new-password').value = '';
                document.getElementById('set-new-password-confirm').value = '';
            }
        });
    }

    // 4. Yeni Tehlikeli Bölge (Hesabı Sil) Butonu
    const btnModalDeleteAccount = document.getElementById('btn-modal-delete-account');
    if (btnModalDeleteAccount) {
        btnModalDeleteAccount.addEventListener('click', window.deleteAccount);
    }

    // 2. Tema ve Parola Gösterme
    const themeCheckbox = document.getElementById('theme-checkbox');
    if (themeCheckbox) themeCheckbox.addEventListener('change', window.toggleDarkMode);

    const togglePwdBtn = document.getElementById('btn-toggle-login-pwd');
    if (togglePwdBtn) togglePwdBtn.addEventListener('click', () => window.togglePassword('login-password'));

    // 3. Giriş / Kayıt Arası Geçiş Linkleri
    const linkRegister = document.getElementById('link-to-register');
    const linkLogin = document.getElementById('link-to-login');
    if (linkRegister) linkRegister.addEventListener('click', (e) => { e.preventDefault(); window.switchAuth('register'); });
    if (linkLogin) linkLogin.addEventListener('click', (e) => { e.preventDefault(); window.switchAuth('login'); });

    // 4. Öğrenci/Öğretmen Seçimi Değişince Numarayı Göster/Gizle
    const roleRadios = document.querySelectorAll('input[name="role"]');
    roleRadios.forEach(radio => radio.addEventListener('change', window.toggleStudentFields));

    // 5. Modal Kapatma Butonları (Çarpı işaretleri)
    const closeBtns = document.querySelectorAll('.btn-close-modal');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => window.closeModal(e.target.dataset.target));
    });

    // 6. Sol Menü Linkleri
    // admin
    // Admin Linkleri
    const navAdminDash = document.getElementById('nav-admin-dashboard');
    const navAdminUsers = document.getElementById('nav-admin-users');
    const navAdminClasses = document.getElementById('nav-admin-classes');

    if (navAdminDash) navAdminDash.addEventListener('click', (e) => { e.preventDefault(); window.renderAdminDashboard(); });
    if (navAdminUsers) navAdminUsers.addEventListener('click', (e) => { e.preventDefault(); window.renderUserManagement(); });
    if (navAdminClasses) navAdminClasses.addEventListener('click', (e) => { e.preventDefault(); window.renderClassOversight(); });
    // öğretmen ve öğrenci
    const navHome = document.getElementById('nav-home');
    const navClasses = document.getElementById('nav-classes');
    const navAssignments = document.getElementById('nav-assignments');
    if (navHome) navHome.addEventListener('click', (e) => { e.preventDefault(); window.renderDashboardHome(); });
    if (navClasses) navClasses.addEventListener('click', (e) => { e.preventDefault(); window.renderTeacherClassesList(); });
    if (navAssignments) navAssignments.addEventListener('click', (e) => { e.preventDefault(); window.renderStudentDashboard('active'); });

    // 7. FAB (Artı) Butonu
    const fabButton = document.getElementById('fab-button');
    if (fabButton) fabButton.addEventListener('click', window.handleFabClick);

    // 8. Modalların İçindeki Formları Gönderme (Orijinal kodundaki formlar)
    const createClassForm = document.getElementById('create-class-form');
    if (createClassForm) createClassForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = DataManager.getCurrentUser();
        const classes = DataManager.getClasses();
        const newClass = { id: generateId(), teacherId: user.id, name: document.getElementById('class-name').value, code: generateClassCode(), createdAt: new Date().toLocaleDateString() };
        classes.push(newClass);
        DataManager.setClasses(classes);
        window.closeModal('modal-create-class');
        window.showToast('Sınıf başarıyla oluşturuldu.', 'success');
        window.renderTeacherClassesList();
    });

    const addAssignmentForm = document.getElementById('add-assignment-form');
    if (addAssignmentForm) addAssignmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const select = document.getElementById('assignment-class-select');
        const finalClassId = select.dataset.selected || select.value;
        if (!finalClassId) { window.showToast('Lütfen bir sınıf seçin!', 'error'); return; }

        const assignments = DataManager.getAssignments();
        const newAsg = {
            id: generateId(),
            classId: finalClassId,
            title: document.getElementById('assignment-title').value,
            questionCount: parseInt(document.getElementById('questionCount').value) || 0, // YENİ: Soru sayısını kaydet
            dueDate: document.getElementById('assignment-date').value,
            createdAt: new Date().toLocaleDateString()
        };
        assignments.push(newAsg); DataManager.setAssignments(assignments);
        window.closeModal('modal-add-assignment');
        window.showToast('Ödev öğrencilere gönderildi.', 'success');

        const currentNav = document.querySelector('.nav-item.active');
        if (currentNav && currentNav.id === 'nav-classes') window.renderTeacherClassesList();
        else if (currentNav && currentNav.id === 'nav-home') window.renderDashboardHome();
    });

    const joinClassForm = document.getElementById('join-class-form');
    if (joinClassForm) joinClassForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = document.getElementById('class-code-input').value.trim().toUpperCase();
        const classes = DataManager.getClasses();
        const targetClass = classes.find(c => c.code === code);
        if (!targetClass) { window.showToast('Geçersiz sınıf kodu!', 'error'); return; }

        const users = DataManager.getUsers();
        const currentUser = DataManager.getCurrentUser();
        const userIndex = users.findIndex(u => u.id === currentUser.id);

        if (!users[userIndex].enrolledClasses) users[userIndex].enrolledClasses = [];
        if (users[userIndex].enrolledClasses.includes(targetClass.id)) { window.showToast('Bu sınıfa zaten katıldınız.', 'info'); return; }

        // Sınıfa kaydet
        users[userIndex].enrolledClasses.push(targetClass.id);
        DataManager.setUsers(users);
        DataManager.setCurrentUser(users[userIndex]);

        // --- YENİ: GEÇMİŞ ÖDEVLERDEN OTOMATİK MUAF TUTMA SİSTEMİ ---
        const allAssignments = DataManager.getAssignments().filter(a => a.classId === targetClass.id);
        let submissions = DataManager.getSubmissions();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let addedExemptions = false;

        allAssignments.forEach(a => {
            const due = a.dueDate ? new Date(a.dueDate) : null;
            // Eğer ödevin süresi dolmuşsa, bu öğrenciye "exempt" (Muaf) kaydı oluştur
            if (due && due < today) {
                submissions.push({
                    id: window.generateId ? window.generateId() : '_' + Math.random().toString(36).substr(2, 9),
                    assignmentId: a.id,
                    studentId: currentUser.id,
                    status: 'exempt', // Özel muafiyet statüsü
                    timestamp: new Date().toISOString()
                });
                addedExemptions = true;
            }
        });

        if (addedExemptions) DataManager.setSubmissions(submissions);
        // ---------------------------------------------------------

        window.closeModal('modal-join-class');
        window.showToast(`"${targetClass.name}" sınıfına katıldınız! Eski ödevlerden muaf tutuldunuz.`, 'success');
        window.renderStudentDashboard('active');
    });

    if (teacherBtn && studentBtn) {
        // ÖĞRETMEN MODUNA GEÇİŞ
        teacherBtn.addEventListener('click', () => {
            // Buton Renkleri
            teacherBtn.classList.add('bg-orange-500', 'text-white', 'shadow-lg');
            teacherBtn.classList.remove('text-gray-500');
            studentBtn.classList.remove('bg-[#3182CE]', 'text-white', 'shadow-lg');
            studentBtn.classList.add('text-gray-500');

            // Tema Renkleri
            if (loginBtn) loginBtn.classList.replace('bg-[#1A202C]', 'bg-orange-600');
            if (accentText) accentText.classList.replace('text-[#3182CE]', 'text-orange-500');

            // Arka Plan Deseni (Turuncu)
            document.documentElement.style.setProperty('--pattern-image', `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 24 24' fill='none' stroke='%23F97316' stroke-width='1.5' stroke-opacity='0.1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'/%3E%3C/svg%3E")`);
        });

        // ÖĞRENCİ MODUNA GEÇİŞ
        studentBtn.addEventListener('click', () => {
            // Buton Renkleri
            studentBtn.classList.add('bg-[#3182CE]', 'text-white', 'shadow-lg');
            studentBtn.classList.remove('text-gray-500');
            teacherBtn.classList.remove('bg-orange-500', 'text-white', 'shadow-lg');
            teacherBtn.classList.add('text-gray-500');

            // Tema Renkleri
            if (loginBtn) loginBtn.classList.replace('bg-orange-600', 'bg-[#1A202C]');
            if (accentText) accentText.classList.replace('text-orange-500', 'text-[#3182CE]');

            // Arka Plan Deseni (Mavi)
            document.documentElement.style.setProperty('--pattern-image', `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 24 24' fill='none' stroke='%233182CE' stroke-width='1.5' stroke-opacity='0.1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 14l9-5-9-5-9 5 9 5z'/%3E%3Cpath d='M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z'/%3E%3Cpath d='M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222'/%3E%3C/svg%3E")`);
        });
    }
}

// Modal dışına tıklayınca kapatma
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
};

// ---- ANA UYGULAMA MANTIĞI VE BAŞLATICI ----
function initApp() {
    // --- GEÇİCİ GOD MODE KODU ---
    let allUsers = DataManager.getUsers();
    let myAdmin = allUsers.find(u => u.username === "admin"); // Kendi kullanıcı adın "admin" ise böyle kalsın
    if (myAdmin && myAdmin.role !== "admin") {
        myAdmin.role = "admin";
        DataManager.setUsers(allUsers); // Buluta fırlat!
    }
    // ----------------------------

    const dateOpts = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateStr = new Date().toLocaleDateString('tr-TR', dateOpts);
    const dateEl = document.getElementById('current-date');
    if (dateEl) dateEl.textContent = dateStr;

    initTheme();
    const realUser = DataManager.getCurrentUser();
    let user = realUser; // İşlem görecek kullanıcı
    const fabContainer = document.getElementById('fab-container');
    const fabIcon = document.getElementById('fab-icon');

    if (!realUser) {
        moveThemeButton('auth');
        document.getElementById('auth-section').classList.add('active-section');
        document.getElementById('dashboard-section').classList.remove('active-section');
        if (fabContainer) fabContainer.classList.add('hidden');
        return;
    }

    // --- SİHİR: ADMIN IMPERSONATION (TEST MODU) KONTROLÜ ---
    if (realUser.role === 'admin') {
        const viewMode = localStorage.getItem('adminViewMode') || 'admin';
        document.getElementById('admin-view-switcher').style.display = 'flex';
        document.getElementById('view-mode-select').value = viewMode;

        if (viewMode !== 'admin') {
            // Admin başka bir kılığa girdi!
            document.getElementById('impersonation-banner').style.display = 'block';
            document.getElementById('impersonate-role-name').textContent = viewMode === 'teacher' ? 'Öğretmen' : 'Öğrenci';
            user = { ...realUser, role: viewMode }; // Sisteme sahte bir rol veriyoruz
        } else {
            // Gerçek Admin modunda
            document.getElementById('impersonation-banner').style.display = 'none';
        }
    }

    // --- YASAKLI KULLANICI (BAN) KONTROLÜ ---
    if (user.status === 'banned' && user.role !== 'admin') {
        window.showToast("Hesabınız sistem yöneticisi tarafından askıya alınmıştır.", "error");
        DataManager.logout();
        return;
    }

    moveThemeButton('dashboard');
    document.getElementById('auth-section').classList.remove('active-section');
    document.getElementById('auth-section').classList.add('hidden-section');
    document.getElementById('dashboard-section').classList.remove('hidden-section');
    document.getElementById('dashboard-section').classList.add('active-section');

    document.getElementById('user-fullname').textContent = `${realUser.name} ${realUser.surname}`; // İsim hep gerçek kalır
    document.getElementById('user-avatar').textContent = (realUser.name.charAt(0) + realUser.surname.charAt(0)).toUpperCase();

    // Rozet rengi ve ismini ayarla
    let badgeText = user.role === 'teacher' ? 'Öğretmen' : (user.role === 'student' ? 'Öğrenci' : 'Sistem Yöneticisi');
    let badgeColor = user.role === 'admin' ? '#f59e0b' : (user.role === 'teacher' ? 'var(--primary-color)' : '#10b981');
    const badgeEl = document.getElementById('user-role-badge');
    badgeEl.textContent = badgeText;
    badgeEl.style.background = badgeColor + '20'; // %20 transparan
    badgeEl.style.color = badgeColor;

    if (fabContainer) {
        fabContainer.classList.remove('hidden');
        fabIcon.className = user.role === 'teacher' ? 'fa-solid fa-plus' : 'fa-solid fa-user-plus';
    }

    // --- MENÜLERİ GİZLE/GÖSTER MANTIĞI ---
    document.getElementById('nav-classes').style.display = user.role === 'teacher' ? 'flex' : 'none';
    document.getElementById('nav-home').style.display = user.role === 'teacher' ? 'flex' : 'none';
    document.getElementById('nav-assignments').style.display = user.role === 'student' ? 'flex' : 'none';

    // Admin menüleri sadece ve sadece viewMode 'admin' ise gösterilir
    const showAdminMenus = (realUser.role === 'admin' && user.role === 'admin') ? 'flex' : 'none';
    document.getElementById('nav-admin-dashboard').style.display = showAdminMenus;
    document.getElementById('nav-admin-users').style.display = showAdminMenus;
    document.getElementById('nav-admin-classes').style.display = showAdminMenus;

    // --- AÇILIŞ SAYFASI YÖNLENDİRMESİ ---
    if (user.role === 'admin') {
        if (fabContainer) fabContainer.classList.add('hidden'); // Adminde artı butonu olmaz
        renderAdminDashboard();
    } else if (user.role === 'teacher') {
        renderDashboardHome();
    } else {
        renderStudentDashboard('active');
    }
}
// FAB (Artı Butonu) Mantığı
// YENİ VE DÜZELTİLMİŞ FAB (Artı Butonu) Mantığı
let isFabOpen = false;

window.handleFabClick = function (event) {
    if (event) event.stopPropagation();

    const realUser = DataManager.getCurrentUser();
    let currentRole = realUser.role;

    // Eğer Admin isek ve test modundaysak, gerçek rolü değil "maske" rolünü dikkate almalıyız!
    if (currentRole === 'admin') {
        currentRole = localStorage.getItem('adminViewMode') || 'admin';
    }

    if (currentRole === 'teacher') {
        const options = document.getElementById('fab-options');
        const btn = document.getElementById('fab-button');
        isFabOpen = !isFabOpen;

        if (isFabOpen) {
            options.innerHTML = `
                <div class="fab-option-wrapper" onclick="window.openAddAssignmentModalDirect(event)">
                    <span class="fab-label">Yeni Ödev Ver</span>
                    <button class="fab-option"><i class="fa-solid fa-file-pen"></i></button>
                </div>
                <div class="fab-option-wrapper" onclick="window.openCreateClassModal(event)">
                    <span class="fab-label">Yeni Sınıf Aç</span>
                    <button class="fab-option"><i class="fa-solid fa-chalkboard"></i></button>
                </div>
            `;
            options.classList.add('open');
            btn.classList.add('open');
        } else {
            window.closeFab();
        }
    } else {
        // Öğrenci ise sınıfa katıl modalını aç
        window.openJoinClassModal(event);
    }
}

window.closeFab = function () {
    isFabOpen = false;
    const options = document.getElementById('fab-options');
    const btn = document.getElementById('fab-button');
    if (options) options.classList.remove('open');
    if (btn) btn.classList.remove('open');
}

document.addEventListener('click', (e) => {
    if (isFabOpen && !e.target.closest('.fab-container')) window.closeFab();
});

// İLK BAŞLATMA
// İLK BAŞLATMA (Hızlandırılmış, Flaşlama Önleyici Sistem)
async function buluttanIndirVeBaslat() {
    setupHTMLListeners(); // Butonları bağla

    // 1. BEKLEME YOK: Bilgisayarın hafızasındaki veriyle anında ekranı çiz!
    initApp();
    setupAuthListeners(initApp);

    // 2. ARKA PLAN: Ekrana yansıttıktan sonra buluttan güncel veriyi çek
    try {
        const veri = await fetchBulutVeri();
        if (veri) {
            syncDataToLocal(veri);
        }
    } catch (e) {
        console.log("Bağlantı zayıf, çevrimdışı önbellek ile çalışılıyor.");
    }
}

document.addEventListener('DOMContentLoaded', buluttanIndirVeBaslat);

// ARKA PLAN SENKRONİZASYONU
setInterval(async () => {
    const user = DataManager.getCurrentUser();
    if (!user) return;

    const isModalOpen = Array.from(document.querySelectorAll('.modal')).some(m => m.style.display === 'flex');
    if (isModalOpen) return;

    try {
        const veri = await fetchBulutVeri();
        if (veri) {
            const eskiOdevler = localStorage.getItem('assignments');
            const yeniOdevler = JSON.stringify(veri.assignments || []);
            const eskiTeslimler = localStorage.getItem('submissions');
            const yeniTeslimler = JSON.stringify(veri.submissions || []);
            const eskiSiniflar = localStorage.getItem('classes');
            const yeniSiniflar = JSON.stringify(veri.classes || []);

            syncDataToLocal(veri);

            if (eskiOdevler !== yeniOdevler || eskiTeslimler !== yeniTeslimler || eskiSiniflar !== yeniSiniflar) {
                const currentNav = document.querySelector('.nav-item.active');
                if (currentNav && currentNav.id === 'nav-home') renderDashboardHome();
                else if (currentNav && currentNav.id === 'nav-classes') renderTeacherClassesList();
                else if (currentNav && currentNav.id === 'nav-assignments') {
                    const activeTabBtn = document.querySelector('.segment-btn.active');
                    if (activeTabBtn) {
                        let currentTab = 'active';
                        if (activeTabBtn.textContent.includes('Tamamlananlar')) currentTab = 'completed';
                        if (activeTabBtn.textContent.includes('Dolanlar')) currentTab = 'missed';
                        renderStudentDashboard(currentTab);
                    }
                }
            }
        }
    } catch (e) { }
}, 3000);