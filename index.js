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
        this.darkMode = localStorage.getItem("darkMode") === "true";
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
        this.darkMode = !this.darkMode;
        localStorage.setItem("darkMode", this.darkMode);
        this.applyTheme();
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