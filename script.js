// === ТАЙМЕР ===
const timerEl = document.getElementById("timer");

if (timerEl) {
    const startDate = new Date("2026-01-16T00:00:00");

    function updateTimer() {
        const now = new Date();
        let diff = now - startDate;

        const seconds = Math.floor(diff / 1000) % 60;
        const minutes = Math.floor(diff / 1000 / 60) % 60;
        const hours = Math.floor(diff / 1000 / 60 / 60) % 24;
        const days = Math.floor(diff / 1000 / 60 / 60 / 24);

        timerEl.innerText =
            `${days} дней ${hours} часов ${minutes} минут ${seconds} секунд`;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

// === ПЕРЕХОДЫ ===
function goToGallery() {
    window.location.href = "gallery.html";
}

function goHome() {
    window.location.href = "index.html";
}

// === СЛАЙДЕР ===
const slides = document.querySelectorAll(".slide");

if (slides.length > 0) {
    let current = 0;

    const prevBtn = document.querySelector(".prev");
    const nextBtn = document.querySelector(".next");

    // === ТОЧКИ ===
    const nav = document.createElement("div");
    nav.className = "nav";
    document.body.appendChild(nav);

    slides.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.className = "dot";
        if (i === 0) dot.classList.add("active");

        dot.addEventListener("click", () => {
            goToSlide(i);
        });

        nav.appendChild(dot);
    });

    const dots = document.querySelectorAll(".dot");

    function goToSlide(index) {
        // стопаем все видео
        document.querySelectorAll("video").forEach(v => v.pause());
        const video = slides[current].querySelector("video");
        if (video) {
            video.play().catch(() => {});
        }

        slides[current].classList.remove("active");
        dots[current].classList.remove("active");

        current = index;

        slides[current].classList.add("active");
        dots[current].classList.add("active");

        animateSlide(slides[current]);
    }

    function nextSlide() {
        goToSlide((current + 1) % slides.length);
    }

    function prevSlide() {
        goToSlide((current - 1 + slides.length) % slides.length);
    }

    // === КНОПКИ ===
    nextBtn?.addEventListener("click", nextSlide);
    prevBtn?.addEventListener("click", prevSlide);

    function animateSlide(slide) {
        const imgs = slide.querySelectorAll("img");

        imgs.forEach((img, i) => {
            img.style.animationDelay = `${0.2 * i}s`;
        });
    }

    // автослайд
    setInterval(() => {
        // если мы НЕ на последнем слайде — листаем
        if (current < slides.length - 1) {
            nextSlide();
        }
    }, 5000);

    // свайп
    let startX = 0;

    document.addEventListener("mousedown", (e) => {
        startX = e.clientX;
    });

    document.addEventListener("mouseup", (e) => {
        let diff = e.clientX - startX;

        if (diff > 50) prevSlide();
        else if (diff < -50) nextSlide();
    });

    animateSlide(slides[0]);

    // === TOUCH СВАЙП (МОБИЛКА) ===
    let touchStartX = 0;

    document.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
    });

    document.addEventListener("touchend", (e) => {
        let touchEndX = e.changedTouches[0].clientX;
        let diff = touchEndX - touchStartX;

        if (diff > 50) prevSlide();
        else if (diff < -50) nextSlide();
    });
}