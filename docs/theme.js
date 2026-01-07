document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // Check if themeToggle exists before proceeding
    if (!themeToggle) {
        console.log('Theme toggle button not found on this page');
        return;
    }
    
    // Check for saved theme preference, default to auto
    const savedTheme = localStorage.getItem('theme') || 'auto';
    
    // Set initial value for aria-checked attribute
    themeToggle.setAttribute('aria-checked', savedTheme !== 'auto');
    
    updateTheme(savedTheme);
    
    function updateTheme(theme) {
        // Update button state and labels
        const themeLabels = {
            light: 'Theme mode: Light',
            dark: 'Theme mode: Dark',
            auto: 'Theme mode: Auto'
        };
        
        themeToggle.setAttribute('aria-label', themeLabels[theme]);
        themeToggle.setAttribute('aria-checked', theme !== 'auto');
        
        // Update button icon
        const themeIcons = {
            light: '🌞',
            dark: '🌙',
            auto: '🌓'
        };
        
        themeToggle.textContent = themeIcons[theme];
        
        if (theme === 'auto') {
            html.removeAttribute('data-theme');
        } else {
            html.setAttribute('data-theme', theme);
        }
    }
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme') || 'auto';
        let newTheme;
        
        switch(currentTheme) {
            case 'light':
                newTheme = 'dark';
                break;
            case 'dark':
                newTheme = 'auto';
                break;
            default:
                newTheme = 'light';
        }
        
        updateTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Handle keyboard navigation
    themeToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            themeToggle.click();
        }
    });
});

