// js/ui.js
import { DataManager } from './dataManager.js';

export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info');
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export function togglePassword(id) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
}

export function switchAuth(type) {
    if (type === 'register') {
        document.getElementById('login-form-container').classList.add('hidden');
        document.getElementById('register-form-container').classList.remove('hidden');
    } else {
        document.getElementById('register-form-container').classList.add('hidden');
        document.getElementById('login-form-container').classList.remove('hidden');
    }
}

export function toggleStudentFields() {
    const role = document.querySelector('input[name="role"]:checked').value;
    const studentNoGroup = document.getElementById('student-no-group');
    // Eğer kutu varsa işlem yap, yoksa görmezden gel
    if (studentNoGroup) {
        studentNoGroup.style.display = role === 'student' ? 'block' : 'none';
    }
}

export function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

export function setActiveNav(id) {
    document.querySelectorAll('.nav-item').forEach(a => a.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
}

export function updateThemeText(theme) {
    const textEl = document.getElementById('sidebar-theme-text');
    const iconEl = document.getElementById('sidebar-theme-icon');
    if (textEl && iconEl) {
        if (theme === 'dark') { textEl.textContent = 'Karanlık Mod'; iconEl.className = 'fa-solid fa-moon'; }
        else { textEl.textContent = 'Aydınlık Mod'; iconEl.className = 'fa-solid fa-sun'; }
    }
}

export function initTheme() {
    const theme = DataManager.getTheme();
    document.documentElement.setAttribute('data-theme', theme);
    const checkbox = document.getElementById('theme-checkbox');
    if (checkbox) checkbox.checked = (theme === 'dark');
    updateThemeText(theme);
}

export function toggleDarkMode() {
    const checkbox = document.getElementById('theme-checkbox');
    const newTheme = checkbox.checked ? 'dark' : 'light';
    DataManager.setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    updateThemeText(newTheme);
}

export function moveThemeButton(location) {
    const component = document.getElementById('theme-toggle-component');
    const sidebarWrapper = document.getElementById('theme-switch-wrapper');
    const body = document.body;
    if (!component) return;

    if (location === 'dashboard') {
        component.classList.remove('auth-toggle-pos');
        sidebarWrapper.appendChild(component);
    } else {
        component.classList.add('auth-toggle-pos');
        body.insertBefore(component, body.firstChild);
    }
}

export function updateAuthTheme(role) {
    const root = document.documentElement;
    const accentText = document.getElementById('accent-text');
    // Butonu her seferinde taze olarak yakalayalım
    const regBtn = document.querySelector('#register-form button[type="submit"]');

    if (role === 'teacher') {
        const teacherSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 24 24' fill='none' stroke='%23F97316' stroke-width='1.5' stroke-opacity='0.1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'/%3E%3C/svg%3E")`;
        root.style.setProperty('--pattern-image', teacherSvg);
        if (accentText) accentText.style.color = '#F97316';
        if (regBtn) regBtn.style.backgroundColor = '#F97316'; // Turuncu yap
    } else {
        const studentSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 24 24' fill='none' stroke='%233182CE' stroke-width='1.5' stroke-opacity='0.1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 14l9-5-9-5-9 5 9 5z'/%3E%3Cpath d='M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z'/%3E%3C/svg%3E")`;
        root.style.setProperty('--pattern-image', studentSvg);
        if (accentText) accentText.style.color = '#3182CE';
        if (regBtn) regBtn.style.backgroundColor = '#3182CE'; // Mavi yap
    }
}