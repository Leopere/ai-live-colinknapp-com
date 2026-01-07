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
                const aiLiveLink = document.getElementById('nav-ailive');
                if (aiLiveLink) aiLiveLink.classList.add('active');
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

    // Setup dropdown behavior with delay
    function setupNavDropdowns() {
        const dropdowns = document.querySelectorAll('.main-nav .dropdown');
        let timeoutId;

        dropdowns.forEach(dropdown => {
            // Mouse interactions
            dropdown.addEventListener('mouseenter', () => {
                clearTimeout(timeoutId);
                dropdowns.forEach(d => {
                    if (d !== dropdown) {
                        d.querySelector('.dropdown-content').style.display = 'none';
                        d.querySelector('.dropdown-content').style.opacity = '0';
                        d.querySelector('.dropdown-content').style.visibility = 'hidden';
                    }
                });

                const dropdownContent = dropdown.querySelector('.dropdown-content');
                dropdownContent.style.display = 'block';
                // Small delay to allow CSS transition to work properly
                setTimeout(() => {
                    dropdownContent.style.opacity = '1';
                    dropdownContent.style.visibility = 'visible';
                }, 10);
            });

            dropdown.addEventListener('mouseleave', () => {
                const dropdownContent = dropdown.querySelector('.dropdown-content');
                // Add delay before hiding the dropdown
                timeoutId = setTimeout(() => {
                    dropdownContent.style.opacity = '0';
                    dropdownContent.style.visibility = 'hidden';
                    // Wait for transition to complete before changing display
                    setTimeout(() => {
                        if (dropdownContent.style.opacity === '0') {
                            dropdownContent.style.display = 'none';
                        }
                    }, 200);
                }, 300); // 300ms delay before starting to close
            });

            // Keyboard interactions
            const dropdownLink = dropdown.querySelector('a');
            dropdownLink.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const dropdownContent = dropdown.querySelector('.dropdown-content');
                    dropdownContent.style.display = 'block';
                    setTimeout(() => {
                        dropdownContent.style.opacity = '1';
                        dropdownContent.style.visibility = 'visible';

                        // Focus the first link in the dropdown
                        const firstLink = dropdownContent.querySelector('a');
                        if (firstLink) firstLink.focus();
                    }, 10);
                }
            });

            // Add keyboard navigation for dropdown items
            const dropdownLinks = dropdown.querySelectorAll('.dropdown-content a');
            dropdownLinks.forEach((link, index) => {
                link.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        const nextLink = dropdownLinks[index + 1] || dropdownLinks[0];
                        nextLink.focus();
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        const prevLink = dropdownLinks[index - 1] || dropdownLinks[dropdownLinks.length - 1];
                        prevLink.focus();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        dropdown.querySelector('a').focus();
                        const dropdownContent = dropdown.querySelector('.dropdown-content');
                        dropdownContent.style.opacity = '0';
                        dropdownContent.style.visibility = 'hidden';
                        setTimeout(() => {
                            dropdownContent.style.display = 'none';
                        }, 200);
                    }
                });
            });
        });
    }

    if (headerElement) {
        includeHTML('header-include', './includes/header.html', () => {
            setActiveNavItem();
            setupNavDropdowns();
            initThemeToggle();
        });
    }

    if (footerElement) {
        includeHTML('footer-include', './includes/footer.html');
    }
});

