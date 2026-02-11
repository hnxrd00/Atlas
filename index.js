class SoundController {
    constructor() {
        this.sounds = new Map();
        this.soundPaths = {
            hover: "sounds/hover.wav",
            click: "sounds/click.wav"
        };
        this.volumes = {
            hover: 0.4,
            click: 0.7
        };
        this.preloadSounds();
    }

    preloadSounds() {
        for (const [key, path] of Object.entries(this.soundPaths)) {
            const audio = new Audio(path);
            audio.preload = "auto";
            audio.volume = this.volumes[key] || 0.5;
            this.sounds.set(key, audio);
        }
    }

    play(soundKey) {
        if (!this.sounds.has(soundKey)) {
            console.warn(`Sound "${soundKey}" not found`);
            return;
        }
        const audio = this.sounds.get(soundKey);
        audio.currentTime = 0;
        audio.play().catch(err => {
            if (err.name !== "NotAllowedError") {
                console.error("Audio play error:", err);
            }
        });
    }

    playHover() {
        this.play("hover");
    }

    playClick() {
        this.play("click");
    }
}

class ThemeController {
    constructor() {
        const stored = localStorage.getItem("darkMode");
        this.darkMode = stored !== null ? stored === "true" : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
        this.init();
    }

    init() {
        this.applyTheme();
        this.attachToggleListener();
    }

    applyTheme() {
        if (this.darkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }

    toggle() {
        // Use an overlay crossfade to mask abrupt gradient/background changes
        return (async () => {
            document.documentElement.classList.add('theme-transition');

            const overlay = await this._createThemeOverlay();

            this.darkMode = !this.darkMode;
            localStorage.setItem("darkMode", this.darkMode);
            this.applyTheme();

            // fade overlay out to reveal new theme
            overlay.style.opacity = '0';
            window.setTimeout(() => overlay.remove(), 420);

            // cleanup transition helper
            window.setTimeout(() => {
                document.documentElement.classList.remove('theme-transition');
            }, 650);
        })();
    }

    _createThemeOverlay() {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'theme-overlay';

            const bodyStyle = getComputedStyle(document.body);
            const bgImage = bodyStyle.backgroundImage;

            // prefer using the computed background image, fallback to background color
            overlay.style.background = (bgImage && bgImage !== 'none') ? bgImage : bodyStyle.backgroundColor;
            overlay.style.backgroundRepeat = 'no-repeat';
            overlay.style.backgroundSize = 'cover';
            overlay.style.backgroundPosition = 'center';

            overlay.style.position = 'fixed';
            overlay.style.inset = '0';
            overlay.style.zIndex = '9999';
            overlay.style.pointerEvents = 'none';
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 220ms ease';

            document.documentElement.appendChild(overlay);

            // kick off fade-in then resolve once visible
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
            });

            window.setTimeout(() => resolve(overlay), 240);
        });
    }

    attachToggleListener() {
        const darkModeToggle = document.getElementById("darkModeToggle");
        if (darkModeToggle) {
            darkModeToggle.addEventListener("click", () => this.toggle());
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const themeCtrl = new ThemeController();
    const soundCtrl = new SoundController();
    const navLinks = document.querySelectorAll(".navbar a");

    navLinks.forEach(link => {
        link.addEventListener("mouseenter", () => {
            soundCtrl.playHover();
        });

        link.addEventListener("pointerdown", (e) => {
            if (e.pointerType === "mouse" && e.button !== 0) return;
            soundCtrl.playClick();
        });
    });

    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
        darkModeToggle.addEventListener("mouseenter", () => {
            soundCtrl.playHover();
        });
        darkModeToggle.addEventListener("pointerdown", () => {
            soundCtrl.playClick();
        });
    }

    const ctaButton = document.querySelector(".call-to-action a");
    if (ctaButton) {
        ctaButton.addEventListener("pointerdown", () => {
            soundCtrl.playClick();
        });
        ctaButton.addEventListener("mouseenter", () => {
            soundCtrl.playHover();
        });
    }
});