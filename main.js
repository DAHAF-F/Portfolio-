// ── Page load curtain ──
(function () {
    const curtain = document.getElementById('curtain');
    if (!curtain) return;

    let hidden = false;
    function hideCurtain() {
        if (hidden) return;
        hidden = true;
        curtain.classList.add('hide');
    }

    // Primary: hide as soon as the page itself is parsed and ready —
    // don't wait on slow/blocked third-party resources (fonts, analytics scripts).
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(hideCurtain, 200));
    } else {
        setTimeout(hideCurtain, 200);
    }

    // Safety net: no matter what happens above, never leave the curtain stuck.
    setTimeout(hideCurtain, 2500);
})();

// ── Page-to-page transition (internal .html links) ──
(function () {
    const curtain = document.getElementById('curtain');
    if (!curtain) return;
    document.querySelectorAll('a[href$=".html"], a[href*=".html#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (link.target === '_blank' || e.metaKey || e.ctrlKey) return;
            e.preventDefault();
            curtain.classList.remove('hide');
            curtain.classList.add('enter');
            setTimeout(() => { window.location.href = href; }, 420);
        });
    });
})();

// ── Scroll progress bar ──
const progressBar = document.getElementById('scrollProgress');
function updateProgress() {
    if (!progressBar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
}

// ── Header shrink on scroll ──
const header = document.getElementById('siteHeader');
function updateHeader() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 40);
}

// ── Back to top button ──
const backToTop = document.getElementById('backToTop');
function updateBackToTop() {
    if (!backToTop) return;
    backToTop.classList.toggle('show', window.scrollY > 500);
}
if (backToTop) {
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

window.addEventListener('scroll', () => {
    updateProgress();
    updateHeader();
    updateBackToTop();
}, { passive: true });
updateProgress();
updateHeader();

// ── Scroll reveal ──
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            revealObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Scrollspy: top nav active link + side dot nav ──
(function () {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav ul li a[data-spy]');
    const dotLinks = document.querySelectorAll('.dot-nav a');
    if (!sections.length) return;

    function onScroll() {
        let current = '';
        sections.forEach(s => {
            if (window.scrollY >= s.offsetTop - window.innerHeight * 0.4) {
                current = s.getAttribute('id');
            }
        });
        navLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + current);
        });
        dotLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + current);
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

// ── Hero canvas particles (only runs if canvas present) ──
(function () {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', () => { resize(); init(); });

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function init() {
        particles = [];
        const count = Math.floor((W * H) / 14000);
        for (let i = 0; i < count; i++) {
            particles.push({
                x: rand(0, W), y: rand(0, H),
                vx: rand(-0.25, 0.25), vy: rand(-0.25, 0.25),
                r: rand(1, 2.2),
                gold: Math.random() > 0.7
            });
        }
    }
    init();

    function draw() {
        ctx.clearRect(0, 0, W, H);

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    const alpha = (1 - dist / 120) * 0.25;
                    const color = (particles[i].gold || particles[j].gold)
                        ? `rgba(200,153,58,${alpha})`
                        : `rgba(100,140,200,${alpha})`;
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.gold ? 'rgba(200,153,58,0.7)' : 'rgba(140,180,255,0.55)';
            ctx.fill();
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        });

        requestAnimationFrame(draw);
    }
    draw();

    if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
        const orbs = document.querySelectorAll('.orb');
        const hero = document.querySelector('.hero');
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const cx = (e.clientX - rect.left) / rect.width - 0.5;
            const cy = (e.clientY - rect.top) / rect.height - 0.5;
            orbs.forEach(orb => {
                const depth = parseFloat(orb.dataset.depth) || 20;
                orb.style.transform = `translate(${cx * depth}px, ${cy * depth}px)`;
            });
        });
        hero.addEventListener('mouseleave', () => {
            orbs.forEach(orb => orb.style.transform = '');
        });
    }
})();

// ── Magnetic CTA buttons ──
(function () {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('.cta').forEach(cta => {
        cta.addEventListener('mousemove', (e) => {
            const rect = cta.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            cta.style.transform = `translate(${x * 0.18}px, ${y * 0.35 - 3}px)`;
        });
        cta.addEventListener('mouseleave', () => {
            cta.style.transform = '';
        });
    });
})();

// ── Copy to clipboard on contact items ──
document.querySelectorAll('.contact-item[data-copy]').forEach(item => {
    item.addEventListener('click', async () => {
        const text = item.dataset.copy;
        const hint = item.querySelector('.copy-hint');
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            // clipboard API unavailable — fail silently, still show feedback
        }
        if (hint) {
            const original = hint.textContent;
            hint.textContent = 'Copied!';
            hint.classList.add('copied');
            setTimeout(() => {
                hint.textContent = original;
                hint.classList.remove('copied');
            }, 1400);
        }
    });
});
