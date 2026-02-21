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
    document.getElementById('student-no-group').style.display = role === 'student' ? 'block' : 'none';
}

export function closeModal(id) { 
    document.getElementById(id).style.display = 'none'; 
}

export function setActiveNav(id) {
    document.querySelectorAll('.nav-item').forEach(a => a.classList.remove('active'));
    const el = document.getElementById(id);
    if(el) el.classList.add('active');
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
    if(checkbox) checkbox.checked = (theme === 'dark');
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
    if(!component) return;

    if (location === 'dashboard') {
        component.classList.remove('auth-toggle-pos');
        sidebarWrapper.appendChild(component);
    } else {
        component.classList.add('auth-toggle-pos');
        body.insertBefore(component, body.firstChild);
    }
}