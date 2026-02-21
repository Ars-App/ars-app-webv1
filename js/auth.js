// js/auth.js
import { DataManager } from './dataManager.js';
import { generateId } from './utils.js';
import { showToast, switchAuth } from './ui.js';

export function setupAuthListeners(onSuccessCallback) {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // --- YENİ EKLENEN ŞİFRE KONTROLÜ ---
            const password = document.getElementById('reg-password').value;
            const passwordConfirm = document.getElementById('reg-password-confirm').value;

            if (password !== passwordConfirm) {
                showToast('Şifreler birbiriyle uyuşmuyor!', 'error');
                return;
            }

            const users = DataManager.getUsers();
            const role = document.querySelector('input[name="role"]:checked').value;
            const username = document.getElementById('reg-username').value;
            
            if (users.find(u => u.username === username)) {
                showToast('Bu kullanıcı adı zaten alınmış.', 'error');
                return;
            }

            const newUser = {
                id: generateId(), 
                role,
                name: document.getElementById('reg-name').value,
                surname: document.getElementById('reg-surname').value,
                username, 
                password: password,
                studentNo: role === 'student' ? document.getElementById('reg-student-no').value : null,
                enrolledClasses: []
            };
            
            users.push(newUser); 
            DataManager.setUsers(users);
            showToast('Kayıt başarılı! Giriş yapabilirsiniz.', 'success');
            switchAuth('login');
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const users = DataManager.getUsers();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            const user = users.find(u => u.username === username && u.password === password);

            if (user) { 
                DataManager.setCurrentUser(user); 
                if (typeof onSuccessCallback === 'function') onSuccessCallback();
            } 
            else { 
                showToast('Hatalı kullanıcı adı veya şifre.', 'error'); 
            }
        });
    }
}
// İsim Güncelleme Fonksiyonu
export function updateProfile(newName, newSurname) {
    const user = DataManager.getCurrentUser();
    let users = DataManager.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if(index > -1) {
        users[index].name = newName;
        users[index].surname = newSurname;
        DataManager.setUsers(users);
        DataManager.setCurrentUser(users[index]); // Oturumu da güncelle
        return true;
    }
    return false;
}

// Şifre Güncelleme Fonksiyonu
export function updatePassword(newPassword) {
    const user = DataManager.getCurrentUser();
    let users = DataManager.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if(index > -1) {
        users[index].password = newPassword;
        DataManager.setUsers(users);
        DataManager.setCurrentUser(users[index]);
        return true;
    }
    return false;
}
// --- YENİ EKLENEN HESAP SİLME FONKSİYONU ---
export function deleteAccount() {
    const user = DataManager.getCurrentUser();
    if(!user) return;
    
    // Güvenlik uyarısı
    if(!confirm("Hesabınızı ve tüm verilerinizi tamamen silmek istediğinize emin misiniz?\nBU İŞLEM GERİ ALINAMAZ!")) return;

    // 1. Kullanıcıyı users listesinden çıkar
    let users = DataManager.getUsers();
    users = users.filter(u => u.id !== user.id);

    if (user.role === 'teacher') {
        // 2. Öğretmense: Sınıflarını, Ödevlerini ve Teslimleri temizle
        let classes = DataManager.getClasses();
        const teacherClasses = classes.filter(c => c.teacherId === user.id).map(c => c.id);
        classes = classes.filter(c => c.teacherId !== user.id);
        DataManager.setClasses(classes);

        let assignments = DataManager.getAssignments();
        const teacherAssignments = assignments.filter(a => teacherClasses.includes(a.classId)).map(a => a.id);
        assignments = assignments.filter(a => !teacherClasses.includes(a.classId));
        DataManager.setAssignments(assignments);

        let submissions = DataManager.getSubmissions();
        submissions = submissions.filter(s => !teacherAssignments.includes(s.assignmentId));
        DataManager.setSubmissions(submissions);

        // Öğrencileri silinen sınıflardan çıkar
        users.forEach(u => {
            if (u.role === 'student' && u.enrolledClasses) {
                u.enrolledClasses = u.enrolledClasses.filter(cId => !teacherClasses.includes(cId));
            }
        });

    } else {
        // 3. Öğrenciyse: Sadece teslim ettiği ödev kayıtlarını sil
        let submissions = DataManager.getSubmissions();
        submissions = submissions.filter(s => s.studentId !== user.id);
        DataManager.setSubmissions(submissions);
    }

    // Değişiklikleri kaydet ve çıkış yap
    DataManager.setUsers(users);
    showToast("Hesabınız ve tüm verileriniz sistemden silindi.", "info");
    
    setTimeout(() => {
        DataManager.logout();
    }, 1500); // 1.5 saniye bekle ki Toast mesajını okuyabilsin
}