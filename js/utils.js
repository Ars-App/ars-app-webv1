// js/utils.js

export const generateId = () => '_' + Math.random().toString(36).substr(2, 9);
export const generateClassCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();