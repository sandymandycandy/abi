/* ============================================
   ABINAYA'S 19TH BIRTHDAY — ADVANCED JS
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {

    // ===== PRELOADER =====
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => { preloader.classList.add('loaded'); initParticles(); }, 2400);
    });

    // ===== CUSTOM CURSOR =====
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    let mx = 0, my = 0, dx = 0, dy = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    (function cursorLoop() {
        dx += (mx - dx) * 0.15; dy += (my - dy) * 0.15;
        if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }
        if (ring) { ring.style.left = dx + 'px'; ring.style.top = dy + 'px'; }
        requestAnimationFrame(cursorLoop);
    })();
    document.querySelectorAll('a,button,.masonry-item,.showcase-card,.nav-dot').forEach(el => {
        el.addEventListener('mouseenter', () => { if (ring) ring.style.transform = 'translate(-50%,-50%) scale(1.8)'; if (dot) dot.style.transform = 'scale(2)'; });
        el.addEventListener('mouseleave', () => { if (ring) ring.style.transform = 'translate(-50%,-50%) scale(1)'; if (dot) dot.style.transform = 'scale(1)'; });
    });

    // ===== ENHANCED PARTICLES =====
    function initParticles() {
        const c = document.getElementById('particles-canvas');
        if (!c) return;
        const ctx = c.getContext('2d');
        const resize = () => { c.width = innerWidth; c.height = innerHeight; };
        resize(); addEventListener('resize', resize);
        const count = innerWidth < 768 ? 30 : 70;
        const particles = Array.from({ length: count }, () => ({
            x: Math.random() * c.width, y: Math.random() * c.height,
            s: Math.random() * 3 + 0.5, sx: (Math.random() - 0.5) * 0.5, sy: (Math.random() - 0.5) * 0.5,
            o: Math.random() * 0.5 + 0.1, ts: Math.random() * 0.015 + 0.005, to: Math.random() * Math.PI * 2,
            clr: ['168,85,247','236,72,153','245,158,11','6,182,212','255,255,255','192,132,252','251,191,36'][Math.floor(Math.random() * 7)]
        }));
        let mouseX = c.width / 2, mouseY = c.height / 2;
        document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
        
        (function draw() {
            ctx.clearRect(0, 0, c.width, c.height);
            const t = Date.now();
            particles.forEach(p => {
                p.x += p.sx; p.y += p.sy;
                if (p.x < 0) p.x = c.width; if (p.x > c.width) p.x = 0;
                if (p.y < 0) p.y = c.height; if (p.y > c.height) p.y = 0;
                
                // Mouse interaction - particles gently pushed away
                const ddx = p.x - mouseX, ddy = p.y - mouseY;
                const dist = Math.sqrt(ddx * ddx + ddy * ddy);
                if (dist < 120) {
                    p.x += (ddx / dist) * 0.8;
                    p.y += (ddy / dist) * 0.8;
                }
                
                const a = p.o * (0.5 + 0.5 * Math.sin(t * p.ts + p.to));
                // Glow effect
                if (p.s > 1.5) {
                    ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 4, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${p.clr},${a * 0.06})`; ctx.fill();
                }
                // Star shape for larger particles
                if (p.s > 2) {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(t * 0.001 + p.to);
                    ctx.beginPath();
                    for (let i = 0; i < 4; i++) {
                        ctx.moveTo(0, 0);
                        ctx.lineTo(p.s * 1.5, 0);
                        ctx.rotate(Math.PI / 2);
                    }
                    ctx.strokeStyle = `rgba(${p.clr},${a * 0.3})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                    ctx.restore();
                }
                ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.clr},${a})`; ctx.fill();
            });
            
            // Draw connecting lines between close particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const ddx = particles[i].x - particles[j].x;
                    const ddy = particles[i].y - particles[j].y;
                    const d = Math.sqrt(ddx * ddx + ddy * ddy);
                    if (d < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(168,85,247,${0.04 * (1 - d / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(draw);
        })();
    }

    // ===== BIRTHDAY MUSIC — Web Audio API =====
    const musicBtn = document.getElementById('music-toggle');
    let audioCtx = null;
    let isPlaying = false;
    let musicTimeout = null;
    let currentNodes = [];

    // Happy Birthday melody notes (frequency, duration in seconds)
    const melody = [
        // Happy birthday to you
        [262, 0.3], [262, 0.3], [294, 0.6], [262, 0.6], [349, 0.6], [330, 1.2],
        // Happy birthday to you
        [262, 0.3], [262, 0.3], [294, 0.6], [262, 0.6], [392, 0.6], [349, 1.2],
        // Happy birthday dear Abinaya
        [262, 0.3], [262, 0.3], [523, 0.6], [440, 0.6], [349, 0.6], [330, 0.6], [294, 0.8],
        // Happy birthday to you
        [466, 0.3], [466, 0.3], [440, 0.6], [349, 0.6], [392, 0.6], [349, 1.2],
    ];

    function playNote(ctx, freq, startTime, duration) {
        // Main oscillator (warm tone)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, startTime);
        gain1.gain.setValueAtTime(0, startTime);
        gain1.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
        gain1.gain.linearRampToValueAtTime(0.12, startTime + duration * 0.5);
        gain1.gain.linearRampToValueAtTime(0, startTime + duration - 0.02);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(startTime);
        osc1.stop(startTime + duration);

        // Harmony oscillator (softer triangle wave)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 1.5, startTime); // Fifth harmony
        gain2.gain.setValueAtTime(0, startTime);
        gain2.gain.linearRampToValueAtTime(0.04, startTime + 0.05);
        gain2.gain.linearRampToValueAtTime(0, startTime + duration - 0.02);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(startTime);
        osc2.stop(startTime + duration);

        // Soft sub bass
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(freq / 2, startTime);
        gain3.gain.setValueAtTime(0, startTime);
        gain3.gain.linearRampToValueAtTime(0.05, startTime + 0.05);
        gain3.gain.linearRampToValueAtTime(0, startTime + duration - 0.02);
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.start(startTime);
        osc3.stop(startTime + duration);

        currentNodes.push(osc1, osc2, osc3);
    }

    function playBirthdaySong() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        let time = audioCtx.currentTime + 0.1;
        const gap = 0.05; // Small gap between notes

        melody.forEach(([freq, dur]) => {
            playNote(audioCtx, freq, time, dur);
            time += dur + gap;
        });

        // Loop the song
        const totalDuration = melody.reduce((sum, [, dur]) => sum + dur + gap, 0);
        musicTimeout = setTimeout(() => {
            if (isPlaying) playBirthdaySong();
        }, totalDuration * 1000);
    }

    function stopMusic() {
        if (musicTimeout) clearTimeout(musicTimeout);
        currentNodes.forEach(n => { try { n.stop(); } catch(e) {} });
        currentNodes = [];
        if (audioCtx) {
            audioCtx.close();
            audioCtx = null;
        }
    }

    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            if (isPlaying) {
                isPlaying = false;
                musicBtn.classList.remove('playing');
                stopMusic();
            } else {
                isPlaying = true;
                musicBtn.classList.add('playing');
                playBirthdaySong();
            }
        });
    }

    // ===== SCROLL REVEAL =====
    const sr = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('revealed');
                e.target.querySelectorAll('.counter-value[data-count]').forEach(c => animateCounter(c));
                e.target.querySelectorAll('.counter-item').forEach(c => c.classList.add('counted'));
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.scroll-reveal').forEach(el => sr.observe(el));

    // ===== COUNTER ANIMATION =====
    function animateCounter(el) {
        if (el.dataset.done) return; el.dataset.done = '1';
        const target = +el.dataset.count, dur = 2000, start = Date.now();
        (function tick() {
            const p = Math.min((Date.now() - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.floor(target * ease).toLocaleString();
            if (p < 1) requestAnimationFrame(tick); else el.textContent = target.toLocaleString();
        })();
    }

    // ===== NAV DOTS =====
    const dots = document.querySelectorAll('.nav-dot');
    const sections = document.querySelectorAll('.section');
    const secObs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) dots.forEach(d => d.classList.toggle('active', d.dataset.section === e.target.id)); });
    }, { threshold: 0.25 });
    sections.forEach(s => secObs.observe(s));
    dots.forEach(d => d.addEventListener('click', e => { e.preventDefault(); document.getElementById(d.dataset.section)?.scrollIntoView({ behavior: 'smooth' }); }));

    // ===== PARALLAX =====
    let ticking = false;
    addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(() => { doParallax(); ticking = false; }); ticking = true; }
    });
    function doParallax() {
        const sy = scrollY;
        const hero = document.querySelector('.hero-content');
        if (hero) { hero.style.transform = `translateY(${sy * 0.25}px)`; hero.style.opacity = Math.max(0, 1 - sy / 700); }
        document.querySelectorAll('.masonry-col').forEach((col, i) => {
            const speed = [0.03, -0.02, 0.04][i] || 0;
            col.style.transform = `translateY(${sy * speed}px)`;
        });
        // Floating hero images parallax
        document.querySelectorAll('.hero-float-img').forEach((img, i) => {
            const speed = [0.08, 0.12, 0.06][i];
            img.style.transform += ` translateY(${sy * speed}px)`;
        });
    }

    // ===== HORIZONTAL SHOWCASE DRAG SCROLL =====
    const showcaseWrap = document.getElementById('showcase-scroll');
    const progressBar = document.getElementById('showcase-progress-bar');
    if (showcaseWrap) {
        let isDown = false, startX, scrollLeft;
        showcaseWrap.addEventListener('mousedown', e => { isDown = true; showcaseWrap.style.cursor = 'grabbing'; startX = e.pageX - showcaseWrap.offsetLeft; scrollLeft = showcaseWrap.scrollLeft; });
        showcaseWrap.addEventListener('mouseleave', () => { isDown = false; showcaseWrap.style.cursor = 'grab'; });
        showcaseWrap.addEventListener('mouseup', () => { isDown = false; showcaseWrap.style.cursor = 'grab'; });
        showcaseWrap.addEventListener('mousemove', e => { if (!isDown) return; e.preventDefault(); showcaseWrap.scrollLeft = scrollLeft - (e.pageX - showcaseWrap.offsetLeft - startX) * 1.5; });
        showcaseWrap.addEventListener('scroll', () => {
            if (progressBar) {
                const pct = showcaseWrap.scrollLeft / (showcaseWrap.scrollWidth - showcaseWrap.clientWidth) * 100;
                progressBar.style.width = pct + '%';
            }
        });
    }

    // ===== 3D TILT EFFECT =====
    document.querySelectorAll('[data-tilt]').forEach(el => {
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            const rx = ((e.clientY - r.top) / r.height - 0.5) * -12;
            const ry = ((e.clientX - r.left) / r.width - 0.5) * 12;
            el.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px) scale(1.02)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });

    // ===== MAGNETIC HOVER =====
    document.querySelectorAll('[data-magnetic]').forEach(el => {
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left - r.width / 2) * 0.2;
            const y = (e.clientY - r.top - r.height / 2) * 0.2;
            el.style.transform = `translate(${x}px, ${y}px) translateY(-6px)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });

    // ===== BLOW CANDLES =====
    const blowBtn = document.getElementById('blow-btn');
    const flames = document.querySelectorAll('.flame');
    const wishMsg = document.getElementById('wish-message');
    if (blowBtn) {
        blowBtn.addEventListener('click', () => {
            flames.forEach((f, i) => setTimeout(() => f.querySelector('span').classList.add('blown'), i * 150));
            setTimeout(() => { blowBtn.style.opacity = '0'; blowBtn.style.pointerEvents = 'none'; }, 300);
            setTimeout(() => { if (wishMsg) { wishMsg.classList.remove('hidden'); launchConfetti(); launchGrandConfetti(); } }, flames.length * 150 + 400);
        });
    }

    // ===== CONFETTI =====
    function launchConfetti() {
        const colors = ['#a855f7','#ec4899','#f59e0b','#06b6d4','#f472b6','#c084fc','#fbbf24','#22d3ee'];
        for (let i = 0; i < 120; i++) {
            setTimeout(() => {
                const el = document.createElement('div');
                el.className = 'confetti';
                const s = Math.random() * 10 + 5;
                el.style.cssText = `left:${Math.random()*100}%;top:-10px;width:${s}px;height:${s*.6}px;background:${colors[Math.floor(Math.random()*colors.length)]};animation-duration:${Math.random()*3+2}s;border-radius:${Math.random()>.5?'50%':'2px'}`;
                document.body.appendChild(el);
                setTimeout(() => el.remove(), 5000);
            }, i * 25);
        }
    }

    // ===== GRAND CONFETTI (extra celebration) =====
    function launchGrandConfetti() {
        const emojis = ['🎉','🎊','✨','💜','🎈','⭐','🥳','💖','🌟','🎁'];
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const el = document.createElement('div');
                el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                el.style.cssText = `position:fixed;left:${Math.random()*100}%;top:-40px;font-size:${Math.random()*20+16}px;pointer-events:none;z-index:99999;animation:confettiFall ${Math.random()*4+3}s linear forwards`;
                document.body.appendChild(el);
                setTimeout(() => el.remove(), 7000);
            }, i * 80);
        }
    }

    // ===== GALLERY LIGHTBOX =====
    const galleryImages = [];
    const masonryItems = document.querySelectorAll('.masonry-item');
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbCounter = document.getElementById('lightbox-counter');
    let lbIdx = 0;

    masonryItems.forEach((item, i) => {
        const img = item.querySelector('img');
        galleryImages.push(img.src);
        item.addEventListener('click', () => { lbIdx = i; openLB(img.src); });
    });

    function openLB(src) {
        lbImg.src = src;
        lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        updateLBCounter();
    }
    function closeLB() { lightbox.classList.add('hidden'); document.body.style.overflow = ''; }
    function updateLBCounter() { if (lbCounter) lbCounter.textContent = `${lbIdx + 1} / ${galleryImages.length}`; }
    function nextLB() {
        lbIdx = (lbIdx + 1) % galleryImages.length;
        lbImg.style.animation = 'none'; lbImg.offsetHeight; lbImg.style.animation = 'lbImgIn .4s var(--ease)';
        lbImg.src = galleryImages[lbIdx]; updateLBCounter();
    }
    function prevLB() {
        lbIdx = (lbIdx - 1 + galleryImages.length) % galleryImages.length;
        lbImg.style.animation = 'none'; lbImg.offsetHeight; lbImg.style.animation = 'lbImgIn .4s var(--ease)';
        lbImg.src = galleryImages[lbIdx]; updateLBCounter();
    }

    document.getElementById('lightbox-close')?.addEventListener('click', closeLB);
    document.getElementById('lightbox-next')?.addEventListener('click', nextLB);
    document.getElementById('lightbox-prev')?.addEventListener('click', prevLB);
    lightbox?.addEventListener('click', e => { if (e.target === lightbox || e.target.classList.contains('lightbox-backdrop')) closeLB(); });
    addEventListener('keydown', e => {
        if (lightbox && !lightbox.classList.contains('hidden')) {
            if (e.key === 'Escape') closeLB();
            if (e.key === 'ArrowRight') nextLB();
            if (e.key === 'ArrowLeft') prevLB();
        }
    });

    // ===== STAGGERED GALLERY REVEAL =====
    const masonryObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.querySelectorAll('.masonry-item').forEach((item, i) => {
                    item.style.opacity = '0'; item.style.transform = 'translateY(40px) scale(0.95)';
                    item.style.transition = `opacity .7s ease ${i * 0.1}s, transform .7s ease ${i * 0.1}s`;
                    setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'translateY(0) scale(1)'; }, 50);
                });
                masonryObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.05 });
    document.getElementById('gallery-masonry') && masonryObs.observe(document.getElementById('gallery-masonry'));

    // ===== WISHES STAGGER =====
    const wishObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.querySelectorAll('.wish-p').forEach((p, i) => {
                    p.style.opacity = '0'; p.style.transform = 'translateY(20px)';
                    p.style.transition = `opacity .6s ease ${i * 0.25}s, transform .6s ease ${i * 0.25}s`;
                    setTimeout(() => { p.style.opacity = '1'; p.style.transform = 'translateY(0)'; }, 100);
                });
                wishObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.3 });
    document.querySelector('.wishes-card-content') && wishObs.observe(document.querySelector('.wishes-card-content'));

    // ===== SMOOTH ANCHOR SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => { e.preventDefault(); document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' }); });
    });

    // ===== CURSOR SPARKLE TRAIL =====
    let lastSparkle = 0;
    addEventListener('mousemove', e => {
        if (Date.now() - lastSparkle < 100 || innerWidth < 768) return;
        lastSparkle = Date.now();
        const s = document.createElement('div');
        const colors = ['#a855f7','#ec4899','#f59e0b','#06b6d4','#c084fc','#fbbf24'];
        s.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:5px;height:5px;border-radius:50%;background:${colors[Math.floor(Math.random()*colors.length)]};pointer-events:none;z-index:99997;animation:sparkleOut .6s ease-out forwards;box-shadow:0 0 6px currentColor`;
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 600);
    });

    // Add sparkle animation
    const sty = document.createElement('style');
    sty.textContent = '@keyframes sparkleOut{0%{transform:scale(1);opacity:1}50%{transform:scale(1.5) translateY(-8px);opacity:0.8}100%{transform:scale(0) translateY(-20px);opacity:0}}';
    document.head.appendChild(sty);

    // ===== FLOATING EMOJI RAIN (subtle) =====
    function spawnFloatingEmoji() {
        if (Math.random() > 0.3) return; // Only spawn 30% of the time
        const emojis = ['✨','💜','⭐','🌟','💫'];
        const el = document.createElement('div');
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.cssText = `position:fixed;left:${Math.random()*100}%;bottom:-30px;font-size:${Math.random()*12+10}px;pointer-events:none;z-index:3;opacity:0.15;animation:emojiRise ${Math.random()*8+6}s linear forwards`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 14000);
    }
    setInterval(spawnFloatingEmoji, 2000);

    // Emoji rise animation
    const emojiStyle = document.createElement('style');
    emojiStyle.textContent = '@keyframes emojiRise{0%{transform:translateY(0) rotate(0deg);opacity:0}10%{opacity:0.15}90%{opacity:0.1}100%{transform:translateY(-110vh) rotate(360deg);opacity:0}}';
    document.head.appendChild(emojiStyle);

    // ===== KONAMI EASTER EGG =====
    const kc = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let ki = 0;
    addEventListener('keydown', e => { if (e.key === kc[ki]) { ki++; if (ki === kc.length) { ki = 0; launchConfetti(); launchGrandConfetti(); } } else ki = 0; });

    // ===== SECTION ENTRANCE ANIMATIONS =====
    const sectionObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.style.opacity = '1';
                e.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section-divider').forEach(div => {
        div.style.opacity = '0';
        div.style.transform = 'scaleX(0)';
        div.style.transition = 'opacity 1s ease, transform 1.5s ease';
        const divObs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.style.opacity = '1';
                    e.target.style.transform = 'scaleX(1)';
                }
            });
        }, { threshold: 0.5 });
        divObs.observe(div);
    });

    console.log('%c🎂 Happy 19th Birthday, Abinaya (Gibix)! 🎂', 'font-size:24px;color:#a855f7;font-weight:bold');
});
