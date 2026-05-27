// ===== Mobile menu toggle =====
const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.nav-menu');
if (toggle) {
    toggle.addEventListener('click', () => {
        menu.classList.toggle('open');
        toggle.classList.toggle('open');
    });
    // Close menu when clicking a link (mobile)
    menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            menu.classList.remove('open');
            toggle.classList.remove('open');
        });
    });
}

// ===== Hero slider =====
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.hero-dots button');
let current = 0;
let slideTimer;

function goTo(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
    current = index;
}

function nextSlide() {
    goTo((current + 1) % slides.length);
}

if (slides.length > 0) {
    slideTimer = setInterval(nextSlide, 5500);
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            clearInterval(slideTimer);
            goTo(i);
            slideTimer = setInterval(nextSlide, 5500);
        });
    });
}

// ===== Reveal on scroll =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ===== Header hide on scroll down =====
let lastY = 0;
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (header) {
        if (y > 200 && y > lastY) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
    }
    lastY = y;
});

// ===== Album filter =====
const filterBtns = document.querySelectorAll('.filter-bar button');
const items = document.querySelectorAll('.gallery-item[data-cat]');
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.filter;
        items.forEach(item => {
            if (cat === 'all' || item.dataset.cat === cat) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// ===== Lightbox với mini-album cho mỗi gallery item =====
// Mỗi gallery-item là 1 album riêng. Click vào item → mở album đó.
// Mỗi item có thể khai báo `data-images="url1|url2|url3"` để chỉ định ảnh trong album.
// Nếu không khai báo, fallback: 3 ảnh giống nhau (tạm thời).
const lightbox = document.querySelector('.lightbox');
const lbContent = document.querySelector('.lightbox .lb-content');
const lbClose = document.querySelector('.lightbox .lb-close');

let lbAlbum = [];     // mảng URL ảnh của album đang xem
let lbIndex = 0;      // vị trí ảnh hiện tại trong album
let lbAlbumTitle = ''; // tên album (h3 của item)
let lbPrev = null;
let lbNext = null;
let lbCounter = null;
let lbCaption = null;

if (lightbox) {
    if (!lightbox.querySelector('.lb-prev')) {
        lbPrev = document.createElement('button');
        lbPrev.className = 'lb-prev';
        lbPrev.setAttribute('aria-label', 'Ảnh trước');
        lbPrev.innerHTML = '&#8249;';
        lightbox.appendChild(lbPrev);

        lbNext = document.createElement('button');
        lbNext.className = 'lb-next';
        lbNext.setAttribute('aria-label', 'Ảnh sau');
        lbNext.innerHTML = '&#8250;';
        lightbox.appendChild(lbNext);

        lbCounter = document.createElement('div');
        lbCounter.className = 'lb-counter';
        lightbox.appendChild(lbCounter);

        lbCaption = document.createElement('div');
        lbCaption.className = 'lb-caption';
        lightbox.appendChild(lbCaption);

        lbPrev.addEventListener('click', (e) => { e.stopPropagation(); goPrev(); });
        lbNext.addEventListener('click', (e) => { e.stopPropagation(); goNext(); });
    } else {
        lbPrev = lightbox.querySelector('.lb-prev');
        lbNext = lightbox.querySelector('.lb-next');
        lbCounter = lightbox.querySelector('.lb-counter');
        lbCaption = lightbox.querySelector('.lb-caption');
    }
}

// Lấy danh sách ảnh trong album của 1 item
function getAlbumImages(item) {
    const dataImages = item.getAttribute('data-images');
    if (dataImages) {
        // Format: "url1|url2|url3"
        return dataImages.split('|').map(s => s.trim()).filter(Boolean);
    }
    // Fallback (tạm thời): 3 ảnh giống nhau
    const bgStyle = item.querySelector('.img')?.style.backgroundImage || '';
    const match = bgStyle.match(/url\(['"]?(.+?)['"]?\)/);
    const url = match ? match[1] : '';
    return url ? [url, url, url] : [];
}

function openLightbox(item) {
    lbAlbum = getAlbumImages(item);
    lbIndex = 0;
    lbAlbumTitle = item.querySelector('.overlay h3')?.textContent || '';
    showLbImage('next');
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function showLbImage(direction) {
    if (!lbAlbum.length || !lbContent) return;
    const url = lbAlbum[lbIndex];
    lbContent.style.backgroundImage = `url('${url}')`;
    if (lbCounter) lbCounter.textContent = `${lbIndex + 1} / ${lbAlbum.length}`;
    if (lbCaption) lbCaption.textContent = lbAlbumTitle;
    // Hide nav buttons if only 1 image
    if (lbPrev && lbNext) {
        const single = lbAlbum.length <= 1;
        lbPrev.style.display = single ? 'none' : '';
        lbNext.style.display = single ? 'none' : '';
    }
    // Hiệu ứng slide
    lbContent.classList.remove('slide-next', 'slide-prev');
    // Force reflow để animation chạy lại
    void lbContent.offsetWidth;
    if (direction === 'next') lbContent.classList.add('slide-next');
    else if (direction === 'prev') lbContent.classList.add('slide-prev');
}

function goNext() {
    if (!lbAlbum.length) return;
    lbIndex = (lbIndex + 1) % lbAlbum.length;
    showLbImage('next');
}

function goPrev() {
    if (!lbAlbum.length) return;
    lbIndex = (lbIndex - 1 + lbAlbum.length) % lbAlbum.length;
    showLbImage('prev');
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
        if (!lightbox) return;
        openLightbox(item);
    });
});

if (lbClose) lbClose.addEventListener('click', closeLightbox);

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === lbContent) closeLightbox();
    });
}

// Keyboard nav
document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'Escape') closeLightbox();
});

// Touch swipe
let touchStartX = 0;
let touchEndX = 0;
if (lightbox) {
    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) goPrev();
            else goNext();
        }
    }, { passive: true });
}

// ===== Form submit (demo) =====
const form = document.querySelector('.contact-form form');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const original = btn.textContent;
        btn.textContent = 'Đang gửi...';
        setTimeout(() => {
            btn.textContent = 'Cảm ơn bạn!';
            form.reset();
            setTimeout(() => { btn.textContent = original; }, 2500);
        }, 800);
    });
}
