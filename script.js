/* Main page: timer, love notes and interactive particle heart */
const timerEl = document.getElementById("timer");

if (timerEl) {
    const startDate = new Date("2026-01-16T00:00:00");
    const units = ["дней", "часов", "минут", "секунд"];

    const updateTimer = () => {
        const distance = Math.max(0, Date.now() - startDate.getTime());
        const values = [
            Math.floor(distance / 86400000),
            Math.floor(distance / 3600000) % 24,
            Math.floor(distance / 60000) % 60,
            Math.floor(distance / 1000) % 60
        ];

        timerEl.innerHTML = values.map((value, index) =>
            `<span><strong>${String(value).padStart(index ? 2 : 1, "0")}</strong><small>${units[index]}</small></span>`
        ).join("");
    };

    updateTimer();
    window.setInterval(updateTimer, 1000);
}

const loveNote = document.getElementById("love-note");
const noteBackdrop = document.querySelector(".modal-backdrop");
const noteButton = document.getElementById("love-note-button");

if (loveNote && noteBackdrop && noteButton) {
    const messages = [
        "С тобой даже самый обычный день становится особенным.",
        "Если бы мне снова пришлось выбирать — я бы снова выбрал тебя.",
        "Моё любимое место — рядом с тобой.",
        "Спасибо, что превращаешь мои дни в нашу историю.",
        "Ты — та самая мысль, от которой я улыбаюсь без причины.",
        "Я люблю наше «мы» больше, чем можно выразить словами."
    ];
    let messageIndex = 0;
    const closeButton = loveNote.querySelector(".modal-close");
    const shuffleButton = loveNote.querySelector(".shuffle-note");
    const noteText = document.getElementById("love-note-text");

    const toggleNote = (open) => {
        loveNote.hidden = !open;
        noteBackdrop.hidden = !open;
        document.body.style.overflow = open ? "hidden" : "";
        if (open) closeButton.focus();
    };

    noteButton.addEventListener("click", () => toggleNote(true));
    closeButton.addEventListener("click", () => toggleNote(false));
    noteBackdrop.addEventListener("click", () => toggleNote(false));
    shuffleButton.addEventListener("click", () => {
        messageIndex = (messageIndex + 1) % messages.length;
        noteText.animate([{ opacity: 0, transform: "translateY(5px)" }, { opacity: 1, transform: "none" }], { duration: 350 });
        noteText.textContent = messages[messageIndex];
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !loveNote.hidden) toggleNote(false);
    });
}

const canvas = document.getElementById("heart-canvas");

if (canvas) {
    const context = canvas.getContext("2d");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, screenX: -9999, screenY: -9999 };
    let width = 0;
    let height = 0;
    let scale = 1;
    let pixelRatio = 1;
    let burst = 0;
    let lastTime = 0;
    let particles = [];

    const makeHeart = () => {
        const count = width < 700 ? 2200 : 4200;
        particles = Array.from({ length: count }, (_, index) => {
            // Равномерная выборка внутри неявной формы сердца. В отличие от
            // радиального масштабирования она не стягивает частицы к центру.
            let heartX;
            let heartY;
            let equation;
            do {
                heartX = Math.random() * 2.5 - 1.25;
                heartY = Math.random() * 2.45 - 1.12;
                const base = heartX * heartX + heartY * heartY - 1;
                equation = base * base * base - heartX * heartX * heartY * heartY * heartY;
            } while (equation > 0);
            const edgeNoise = (Math.random() - .5) * .42;
            const x = heartX * 12.7;
            const y = -heartY * 12.7;
            const depthRange = 5.6;
            return {
                x: x + edgeNoise,
                y: y + edgeNoise,
                z: (Math.random() - .5) * depthRange,
                size: .45 + Math.random() * 1.45,
                alpha: .35 + Math.random() * .65,
                twinkle: Math.random() * Math.PI * 2,
                speed: .45 + Math.random() * 1.1,
                red: index % 12 === 0 ? 255 : 220 + Math.floor(Math.random() * 24)
            };
        });
    };

    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(width * pixelRatio);
        canvas.height = Math.floor(height * pixelRatio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        scale = Math.min(width < 700 ? width / 42 : width / 58, height / 35);
        makeHeart();
    };

    const updatePointer = (clientX, clientY) => {
        pointer.screenX = clientX;
        pointer.screenY = clientY;
        pointer.targetX = (clientX / width - .5) * 1.45;
        pointer.targetY = (clientY / height - .5) * 1.05;
    };

    window.addEventListener("pointermove", (event) => updatePointer(event.clientX, event.clientY), { passive: true });
    window.addEventListener("pointerdown", (event) => {
        updatePointer(event.clientX, event.clientY);
        burst = 1;
    }, { passive: true });
    window.addEventListener("resize", resize);

    const draw = (time = 0) => {
        const delta = Math.min(32, time - lastTime || 16);
        lastTime = time;
        pointer.x += (pointer.targetX - pointer.x) * .035;
        pointer.y += (pointer.targetY - pointer.y) * .035;
        burst *= Math.pow(.965, delta / 16);
        context.clearRect(0, 0, width, height);

        const mobile = width < 700;
        const centerX = mobile ? width * .51 : width * .73;
        const centerY = mobile ? height * .27 : height * .49;
        const rotationY = (prefersReducedMotion ? -.2 : Math.sin(time * .00015) * .16) + pointer.x * .48;
        const rotationX = -.08 - pointer.y * .25;
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const beat = 1 + Math.sin(time * .0032) * .018 + Math.max(0, Math.sin(time * .0064)) * .012;

        const projected = particles.map((particle) => {
            let x = particle.x;
            let y = particle.y;
            let z = particle.z;
            const rotatedX = x * cosY - z * sinY;
            const rotatedZ = x * sinY + z * cosY;
            const rotatedY = y * cosX - rotatedZ * sinX;
            z = y * sinX + rotatedZ * cosX;
            const perspective = 1 / (1 + z * .018);
            let screenX = centerX + rotatedX * scale * perspective * beat;
            let screenY = centerY + rotatedY * scale * perspective * beat;
            const dx = screenX - pointer.screenX;
            const dy = screenY - pointer.screenY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 105 && distance > 0) {
                const force = Math.pow(1 - distance / 105, 2) * (27 + burst * 75);
                screenX += (dx / distance) * force;
                screenY += (dy / distance) * force;
            }
            if (burst > .01) {
                const bx = screenX - centerX;
                const by = screenY - centerY;
                const length = Math.sqrt(bx * bx + by * by) || 1;
                screenX += bx / length * burst * 18;
                screenY += by / length * burst * 18;
            }
            return { ...particle, screenX, screenY, z, perspective };
        }).sort((a, b) => a.z - b.z);

        context.globalCompositeOperation = "lighter";
        projected.forEach((particle) => {
            const shimmer = .7 + Math.sin(time * .0018 * particle.speed + particle.twinkle) * .3;
            const size = particle.size * particle.perspective * (mobile ? .82 : 1);
            context.beginPath();
            context.arc(particle.screenX, particle.screenY, Math.max(.35, size), 0, Math.PI * 2);
            context.fillStyle = `rgba(${particle.red},${18 + Math.floor(shimmer * 25)},${40 + Math.floor(shimmer * 33)},${particle.alpha * shimmer})`;
            context.fill();
        });
        context.globalCompositeOperation = "source-over";

        if (!prefersReducedMotion) requestAnimationFrame(draw);
    };

    resize();
    draw();
}

/* Gallery: slider, timeline, keyboard/swipe navigation and lightbox */
const slides = [...document.querySelectorAll(".slide")];

if (slides.length) {
    const previousButton = document.querySelector(".prev");
    const nextButton = document.querySelector(".next");
    const timeline = document.querySelector(".timeline");
    const autoplayButton = document.querySelector(".autoplay-toggle");
    const currentNumber = document.getElementById("current-number");
    const totalNumber = document.getElementById("total-number");
    const galleryShell = document.querySelector(".gallery-shell");
    const lightbox = document.querySelector(".lightbox");
    const lightboxImage = lightbox?.querySelector("img");
    const lightboxClose = lightbox?.querySelector(".lightbox-close");
    const intervalDuration = 8000;
    let current = 0;
    let autoplay = true;
    let autoplayTimer;
    let touchStartX = 0;

    totalNumber.textContent = String(slides.length).padStart(2, "0");

    const tabs = slides.map((slide, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `timeline-item${index === 0 ? " active" : ""}`;
        button.setAttribute("role", "tab");
        button.setAttribute("aria-label", `Открыть: ${slide.dataset.label}`);
        button.setAttribute("aria-selected", index === 0 ? "true" : "false");
        button.textContent = slide.dataset.label;
        button.addEventListener("click", () => goToSlide(index));
        timeline.appendChild(button);
        return button;
    });

    const stopVideos = () => {
        document.querySelectorAll("video").forEach((video) => video.pause());
    };

    const clearSlideState = (slide) => {
        slide.classList.remove("active", "from-right", "from-left", "leaving-left", "leaving-right");
    };

    const restartAutoplay = () => {
        window.clearTimeout(autoplayTimer);
        tabs.forEach((tab) => tab.classList.toggle("paused", !autoplay));
        if (!autoplay) return;
        const activeTab = tabs[current];
        activeTab.classList.remove("active");
        void activeTab.offsetWidth;
        activeTab.classList.add("active");
        autoplayTimer = window.setTimeout(() => goToSlide((current + 1) % slides.length, 1), intervalDuration);
    };

    const goToSlide = (index, forcedDirection = 0) => {
        if (index === current) {
            restartAutoplay();
            return;
        }
        const nextIndex = (index + slides.length) % slides.length;
        const oldSlide = slides[current];
        const newSlide = slides[nextIndex];
        const direction = forcedDirection || (nextIndex > current ? 1 : -1);
        stopVideos();

        clearSlideState(oldSlide);
        oldSlide.classList.add(direction > 0 ? "leaving-left" : "leaving-right");
        tabs[current].classList.remove("active");
        tabs[current].setAttribute("aria-selected", "false");
        current = nextIndex;
        clearSlideState(newSlide);
        newSlide.classList.add("active", direction > 0 ? "from-right" : "from-left");
        tabs[current].classList.add("active");
        tabs[current].setAttribute("aria-selected", "true");
        currentNumber.textContent = String(current + 1).padStart(2, "0");
        tabs[current].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });

        window.setTimeout(() => {
            slides.forEach((slide, slideIndex) => {
                if (slideIndex !== current) clearSlideState(slide);
            });
        }, 760);
        restartAutoplay();
    };

    const setAutoplay = (enabled) => {
        autoplay = enabled;
        autoplayButton.classList.toggle("paused", !enabled);
        autoplayButton.setAttribute("aria-label", enabled ? "Остановить автопрокрутку" : "Запустить автопрокрутку");
        restartAutoplay();
    };

    previousButton.addEventListener("click", () => goToSlide(current - 1, -1));
    nextButton.addEventListener("click", () => goToSlide(current + 1, 1));
    autoplayButton.addEventListener("click", () => setAutoplay(!autoplay));
    document.querySelectorAll("video").forEach((video) => {
        video.addEventListener("play", () => setAutoplay(false));
    });

    document.addEventListener("keydown", (event) => {
        if (lightbox && !lightbox.hidden) {
            if (event.key === "Escape") closeLightbox();
            return;
        }
        if (event.key === "ArrowRight") goToSlide(current + 1, 1);
        if (event.key === "ArrowLeft") goToSlide(current - 1, -1);
        if (event.key === " ") {
            event.preventDefault();
            setAutoplay(!autoplay);
        }
    });

    galleryShell.addEventListener("touchstart", (event) => {
        touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });
    galleryShell.addEventListener("touchend", (event) => {
        const distance = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(distance) > 55) goToSlide(current + (distance < 0 ? 1 : -1), distance < 0 ? 1 : -1);
    }, { passive: true });

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.hidden = true;
        lightboxImage.src = "";
        restartAutoplay();
    }

    document.querySelectorAll(".photos img").forEach((image) => {
        image.draggable = false;
        image.addEventListener("click", () => {
            if (!lightbox) return;
            window.clearTimeout(autoplayTimer);
            lightboxImage.src = image.currentSrc || image.src;
            lightboxImage.alt = image.alt;
            lightbox.hidden = false;
            lightboxClose.focus();
        });
    });
    lightbox?.addEventListener("click", (event) => {
        if (event.target !== lightboxImage) closeLightbox();
    });

    restartAutoplay();
}
