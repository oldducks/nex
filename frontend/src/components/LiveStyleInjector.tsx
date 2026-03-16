'use client';

import { useEffect } from 'react';
import { useLayoutEditor } from './LayoutEditor';

export function LiveStyleInjector() {
    const { editedConfig, isEditing } = useLayoutEditor();

    useEffect(() => {
        if (!isEditing) return;

        const root = document.documentElement;
        const main = document.getElementById('profile-capture');

        if (!main) return;

        // Apply primary color
        if (editedConfig.primary_color) {
            root.style.setProperty('--primary', editedConfig.primary_color);
        }

        // Apply theme mode
        const lightMode = editedConfig.display_theme !== 'dark';
        root.style.setProperty('--background', lightMode ? '#f4f4f5' : '#050505');
        root.style.setProperty('--foreground', lightMode ? '#18181b' : '#ffffff');
        root.style.setProperty('--glass', lightMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 15, 15, 0.7)');
        root.style.setProperty('--glass-border', lightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)');

        main.style.backgroundColor = lightMode ? '#f4f4f5' : '#050505';
        main.style.color = lightMode ? '#18181b' : '#ffffff';

        // Apply font
        if (editedConfig.font_family) {
            main.style.fontFamily = `"${editedConfig.font_family}", sans-serif`;
            // Load font dynamically
            const fontName = editedConfig.font_family.replace(/\s/g, '+');
            const existingLink = document.getElementById('dynamic-font');
            if (existingLink) {
                existingLink.remove();
            }
            const link = document.createElement('link');
            link.id = 'dynamic-font';
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;700;900&display=swap`;
            document.head.appendChild(link);
        }

        // Apply profile position
        const profileSection = main.querySelector('section');
        if (profileSection && editedConfig.profile_position) {
            // Reset classes
            profileSection.className = profileSection.className
                .replace(/md:flex-row-reverse/g, '')
                .replace(/md:flex-row/g, '')
                .replace(/items-center/g, '');

            switch (editedConfig.profile_position) {
                case 'left':
                    profileSection.classList.add('md:flex-row');
                    break;
                case 'right':
                    profileSection.classList.add('md:flex-row-reverse');
                    break;
                case 'center':
                    profileSection.classList.add('items-center');
                    break;
                case 'overlay':
                    profileSection.classList.add('items-center');
                    break;
            }
        }
    }, [editedConfig, isEditing]);

    return null;
}
