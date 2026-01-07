/**
 * Includes.js - Handles the inclusion of header and footer files
 * and applies the correct active states to navigation items
 */

document.addEventListener('DOMContentLoaded', function () {
    // Helper: recreate and execute a <script> element
    function recreateAndExecuteScript(originalScriptElement, targetParent) {
        const executableScript = document.createElement('script');

        // Copy attributes (e.g., src, async, defer)
        for (const { name, value } of Array.from(originalScriptElement.attributes)) {
            executableScript.setAttribute(name, value);
        }

        // Inline script content
        if (!originalScriptElement.src) {
            executableScript.textContent = originalScriptElement.textContent;
        }

        // Append to target to trigger execution
        (targetParent || document.head || document.body).appendChild(executableScript);
    }

    // Helper: find and execute all scripts within a container element
    function executeScriptsInContainer(containerElement, targetParent) {
        if (!containerElement) return;
        const scriptElements = Array.from(containerElement.querySelectorAll('script'));
        scriptElements.forEach((scriptEl) => {
            recreateAndExecuteScript(scriptEl, targetParent);
        });
    }

    // Function to include HTML content
    async function includeHTML(elementId, filePath, callback) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}: ${response.status} ${response.statusText}`);
            }
            const content = await response.text();
            const targetElement = document.getElementById(elementId);
            targetElement.innerHTML = content;

            // Ensure any scripts inside included content (e.g., Matomo) are executed
            executeScriptsInContainer(targetElement, document.head);

            if (callback) callback();
        } catch (error) {
            console.error('Error including HTML:', error);
        }
    }

    // Function to include HTML content in the head
    async function includeInHead(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}: ${response.status} ${response.statusText}`);
            }
            const content = await response.text();
            const headElement = document.getElementsByTagName('head')[0];
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;

            // Append each child from the loaded content to the head
            while (tempDiv.firstChild) {
                const node = tempDiv.firstChild;
                if (node.tagName && node.tagName.toLowerCase() === 'script') {
                    recreateAndExecuteScript(node, headElement);
                    node.remove();
                } else {
                    headElement.appendChild(node);
                }
            }
        } catch (error) {
            console.error('Error including HTML in head:', error);
        }
    }

    // Function to set active navigation item
    function setActiveNavItem() {
        const currentPath = window.location.pathname;

        // Wait for the navigation to be loaded
        setTimeout(() => {
            // Remove all active classes first
            document.querySelectorAll('.main-nav a').forEach(link => {
                link.classList.remove('active');
            });

            // Set active class based on current path
            if (currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/')) {
                const nixosLink = document.getElementById('nav-nixos');
                if (nixosLink) nixosLink.classList.add('active');
            }
        }, 100); // Small delay to ensure the DOM is updated
    }

    // Function to initialize theme toggle
    function initThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
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

            const html = document.documentElement;
            if (theme === 'auto') {
                html.removeAttribute('data-theme');
            } else {
                html.setAttribute('data-theme', theme);
            }
        }

        themeToggle.addEventListener('click', () => {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme') || 'auto';
            let newTheme;

            switch (currentTheme) {
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
    }

    // Process header and footer placeholders
    const headerElement = document.getElementById('header-include');
    const footerElement = document.getElementById('footer-include');

    if (headerElement) {
        includeHTML('header-include', './includes/header.html', () => {
            setActiveNavItem();
            initThemeToggle();
        });
    }

    if (footerElement) {
        includeHTML('footer-include', './includes/footer.html');
    }
});

