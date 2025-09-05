document.addEventListener('DOMContentLoaded', function() {

    // --- Seleksi Elemen ---
    const menuBtn = document.getElementById('menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const pageContent = document.querySelector('.page-content');
    const pageWrapper = document.querySelector('.page-wrapper');
    const logoTypingEl = document.getElementById('logo-typing-text');
    const heroTypingEl = document.getElementById('hero-typing-text');

    // --- Fungsi untuk menutup menu ---
    const closeMenu = () => {
        menuBtn.classList.remove('active');
        navMenu.classList.remove('active');
        pageContent.classList.remove('content-blurred');
    };

    // --- Fungsionalitas Menu Mobile & Efek Blur ---
    if (menuBtn && navMenu && pageContent) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Mencegah event menyebar ke elemen lain
            menuBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
            pageContent.classList.toggle('content-blurred');
        });

        // Event listener pada page-wrapper untuk menutup menu
        // Menggunakan capture phase untuk memastikan event tertangkap lebih awal
        pageWrapper.addEventListener('click', (e) => {
            // Jika menu aktif dan yang diklik BUKAN bagian dari menu atau tombol menu, maka tutup
            const isClickInsideMenu = navMenu.contains(e.target);
            const isClickOnMenuButton = menuBtn.contains(e.target);
            
            if (navMenu.classList.contains('active') && !isClickInsideMenu && !isClickOnMenuButton) {
                closeMenu();
            }
        });
    }

    // --- Fungsi Animasi Ketik (Typewriter) ---
    class Typewriter {
        constructor(el, words, { wait = 3000, speed = 150, loop = false } = {}) {
            this.el = el;
            this.words = words;
            this.wait = parseInt(wait, 10);
            this.speed = parseInt(speed, 10);
            this.loop = loop;
            this.txt = '';
            this.wordIndex = 0;
            this.type();
            this.isDeleting = false;
        }

        type() {
            const current = this.wordIndex % this.words.length;
            const fullTxt = this.words[current];
            let typeSpeed = this.speed;

            if (this.isDeleting) {
                typeSpeed /= 2;
                this.txt = fullTxt.substring(0, this.txt.length - 1);
            } else {
                this.txt = fullTxt.substring(0, this.txt.length + 1);
            }

            this.el.innerHTML = `<span class="wrap">${this.txt}</span>`;

            if (!this.isDeleting && this.txt === fullTxt) {
                if (this.loop || this.words.length > 1) {
                    typeSpeed = this.wait;
                    this.isDeleting = true;
                } else {
                    this.el.querySelector('.wrap').style.animation = 'none';
                    this.el.querySelector('.wrap').style.border = 'none';
                    return;
                }
            } else if (this.isDeleting) {
                if (this.loop && this.txt.length === 1) {
                    this.isDeleting = false;
                    typeSpeed = 500;
                } else if (this.txt === '') {
                    this.isDeleting = false;
                    this.wordIndex++;
                    typeSpeed = 500;
                }
            }

            setTimeout(() => this.type(), typeSpeed);
        }
    }

    // --- Inisialisasi Animasi Ketik ---
    if (logoTypingEl) {
        new Typewriter(logoTypingEl, ['Sky.'], { speed: 250, wait: 2000, loop: true });
    }
    if (heroTypingEl) {
        const words = ["Hi, Im Septian/Sky", "A Web developer"];
        new Typewriter(heroTypingEl, words, { wait: 3000, speed: 150 });
    }

    // --- ANIMASI: Logika Scroll-triggered ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                entry.target.classList.remove('is-visible');
            }
        });
    }, { threshold: 0.1 });
    animatedElements.forEach(el => { observer.observe(el); });


    // --- LOGIKA MODAL PROYEK (DIPERBARUI) ---
    const projectCards = document.querySelectorAll('.project-card');
    const modalOverlay = document.getElementById('project-modal-overlay');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalImageGallery = document.getElementById('modal-image-gallery');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalVideoBtn = document.getElementById('modal-video-btn');

    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const gallerySrc = card.dataset.gallerySrc;
            const title = card.dataset.title;
            const desc = card.dataset.desc;
            const videoUrl = card.dataset.videoUrl;

            modalImageGallery.innerHTML = '';
            
            if (gallerySrc) {
                const imageUrls = gallerySrc.split(',').map(url => url.trim());
                imageUrls.forEach(url => {
                    const img = document.createElement('img');
                    img.src = url;
                    img.alt = title;
                    modalImageGallery.appendChild(img);
                });
            }

            modalTitle.textContent = title;
            modalDesc.textContent = desc;

            if (videoUrl) {
                modalVideoBtn.href = videoUrl;
                modalVideoBtn.style.display = 'inline-block';
            } else {
                modalVideoBtn.style.display = 'none';
            }

            modalOverlay.classList.add('active');
            pageContent.classList.add('content-blurred');
        });
    });

    const closeModal = () => {
        modalOverlay.classList.remove('active');
        pageContent.classList.remove('content-blurred');
    };

    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

});