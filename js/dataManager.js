// js/dataManager.js

import { bulutaYukleTekil } from './firebaseApi.js';
import { moveThemeButton } from './ui.js'; // Bu dosyayı bir sonraki adımda yazacağız

export const DataManager = {
    getUsers: () => JSON.parse(localStorage.getItem('users')) || [],
    setUsers: (users) => { 
        localStorage.setItem('users', JSON.stringify(users)); 
        bulutaYukleTekil('users', users); 
    },
    getClasses: () => JSON.parse(localStorage.getItem('classes')) || [],
    setClasses: (classes) => { 
        localStorage.setItem('classes', JSON.stringify(classes)); 
        bulutaYukleTekil('classes', classes); 
    },
    getAssignments: () => JSON.parse(localStorage.getItem('assignments')) || [],
    setAssignments: (asg) => { 
        localStorage.setItem('assignments', JSON.stringify(asg)); 
        bulutaYukleTekil('assignments', asg); 
    },
    getSubmissions: () => JSON.parse(localStorage.getItem('submissions')) || [],
    setSubmissions: (subs) => { 
        localStorage.setItem('submissions', JSON.stringify(subs)); 
        bulutaYukleTekil('submissions', subs); 
    },
    getCurrentUser: () => JSON.parse(sessionStorage.getItem('currentUser')),
    setCurrentUser: (user) => sessionStorage.setItem('currentUser', JSON.stringify(user)),
    getTheme: () => localStorage.getItem('theme') || 'light',
    setTheme: (theme) => localStorage.setItem('theme', theme),
    logout: () => {
        sessionStorage.removeItem('currentUser');
        moveThemeButton('auth'); // Tema butonunu auth ekranına taşı
        location.reload();
    }
};

// Buluttan gelen veriyi LocalStorage'a yazan fonksiyonumuz
export function syncDataToLocal(veri) {
    if (veri) {
        if (veri.users) localStorage.setItem('users', JSON.stringify(veri.users));
        if (veri.classes) localStorage.setItem('classes', JSON.stringify(veri.classes));
        if (veri.assignments) localStorage.setItem('assignments', JSON.stringify(veri.assignments));
        if (veri.submissions) localStorage.setItem('submissions', JSON.stringify(veri.submissions));
    }
}