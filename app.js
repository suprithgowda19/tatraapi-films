/* ==========================================================================
   Tatraapi Films — app.js

   1. Parallax engine        (TemplateMo 612 Parallax Starter)
   2. Header, scroll-spy, progress bar, back-to-top
   3. Scroll reveal
   4. Enquiry form           (validation, honeypot, CV upload, submit)
   5. Copy email
   ========================================================================== */

(function () {
    'use strict';

    document.documentElement.classList.add('js');

    // --- Elements ---
    var header = document.getElementById('siteHeader');
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');
    var navItems = document.querySelectorAll('.nav-links a');
    var spySections = document.querySelectorAll('[data-spy]');
    var parallaxBgs = document.querySelectorAll('.parallax-bg');
    var revealElements = document.querySelectorAll('.reveal');
    var progressBar = document.getElementById('scrollProgress');
    var backToTop = document.getElementById('backToTop');

    // --- Environment ---
    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var reducedMotion = motionQuery.matches;

    var isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                   || window.innerWidth < 600;

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    // =============================================
    // 0. Bal Krishna Stop-Motion Hero Canvas Scrubber
    // =============================================
    var heroCanvas = document.getElementById('heroCanvas');
    var heroStage = document.getElementById('heroStage');
    var heroTrack = document.getElementById('heroTrack');
    var heroScrollCue = document.getElementById('heroScrollCue');
    var heroCtx = heroCanvas ? heroCanvas.getContext('2d') : null;

    var HERO_TOTAL_FRAMES = 20;
    var heroFrames = [];
    var heroLoadedCount = 0;
    var heroCurrentFrame = 0;
    var heroIsGiggling = false;
    var heroAnimId = null;

    function getHeroFrameSrc(index) {
        var num = String(index + 1);
        while (num.length < 3) num = '0' + num;
        return 'assets/frame_' + num + '.jpg';
    }

    function drawHeroFrame(frameIndex) {
        if (!heroCtx || !heroCanvas) return;
        frameIndex = clamp(Math.round(frameIndex), 0, HERO_TOTAL_FRAMES - 1);
        var img = heroFrames[frameIndex];
        if (!img || !img.complete || img.naturalWidth === 0) return;

        heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
        heroCtx.drawImage(img, 0, 0, heroCanvas.width, heroCanvas.height);
        heroCurrentFrame = frameIndex;
    }

    function animateHeroToFrame(targetFrame, duration, onComplete) {
        cancelAnimationFrame(heroAnimId);
        var startFrame = heroCurrentFrame;
        var startTime = performance.now();

        function step(now) {
            var elapsed = now - startTime;
            var progress = Math.min(elapsed / duration, 1);
            // easeInOutQuad
            var ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
            var current = startFrame + (targetFrame - startFrame) * ease;
            drawHeroFrame(current);

            if (progress < 1) {
                heroAnimId = requestAnimationFrame(step);
            } else {
                heroAnimId = null;
                if (typeof onComplete === 'function') onComplete();
            }
        }
        heroAnimId = requestAnimationFrame(step);
    }

    function initHeroScrubber() {
        if (!heroCanvas || !heroCtx || !heroStage) return;

        for (var i = 0; i < HERO_TOTAL_FRAMES; i++) {
            (function (idx) {
                var img = new Image();
                img.src = getHeroFrameSrc(idx);
                img.onload = function () {
                    heroLoadedCount++;
                    if (heroLoadedCount === 1) {
                        drawHeroFrame(0);
                        heroStage.classList.add('hero-stage--canvas-ready');
                    }
                    if (heroLoadedCount === HERO_TOTAL_FRAMES) {
                        // After everything is ready, trigger the initial playful peek
                        setTimeout(function () {
                            if (window.scrollY < 40 && !heroIsGiggling) {
                                animateHeroToFrame(1, 450); // Frame 002: Krishna peeks over logo
                            }
                        }, 750);
                    }
                };
                heroFrames.push(img);
            })(i);
        }

        // Hover giggle on desktop
        heroCanvas.addEventListener('mouseenter', function () {
            if (window.scrollY > 80 || heroIsGiggling) return;
            heroIsGiggling = true;
            // Playful giggle sequence: tastes butter, giggles, looks up
            animateHeroToFrame(6, 260, function () {
                setTimeout(function () {
                    animateHeroToFrame(7, 200, function () {
                        setTimeout(function () {
                            if (window.scrollY < 40) {
                                animateHeroToFrame(1, 400, function () {
                                    heroIsGiggling = false;
                                });
                            } else {
                                heroIsGiggling = false;
                                updateHeroScrubber();
                            }
                        }, 550);
                    });
                }, 300);
            });
        });

        // Click on hero stage triggers giggle
        heroCanvas.addEventListener('click', function () {
            if (window.scrollY > 80 || heroIsGiggling) return;
            heroIsGiggling = true;
            animateHeroToFrame(6, 220, function () {
                setTimeout(function () {
                    animateHeroToFrame(1, 350, function () {
                        heroIsGiggling = false;
                    });
                }, 400);
            });
        });
    }

    function updateHeroScrubber() {
        var track = heroTrack || heroStage;
        if (!heroCanvas || !heroStage || !track) return;

        var rect = track.getBoundingClientRect();
        var totalScrollable = track.offsetHeight - window.innerHeight;
        if (totalScrollable <= 0) return;

        // Current scroll within the track
        var currentScroll = -rect.top;
        var progress = clamp(currentScroll / totalScrollable, 0, 1);

        // Fade overlay tagline & cue when scrolling starts
        var overlay = heroStage.querySelector('.hero-overlay');
        if (overlay) {
            overlay.classList.toggle('is-scrolled', progress > 0.04);
        }
        if (heroScrollCue) {
            heroScrollCue.classList.toggle('is-hidden', progress > 0.02);
        }

        // Dissolve transition at the very end when the pot pours
        var exitOpacity = progress > 0.88 ? ((progress - 0.88) / 0.12) : 0;
        heroStage.style.setProperty('--hero-exit-opacity', exitOpacity.toFixed(2));

        if (heroIsGiggling || heroAnimId) return;

        // Frame pacing across 20 frames (0 to 19):
        // 0.00 -> 0.08: Frame 0 to 1 (stillness to Krishna peeking from logo)
        // 0.08 -> 0.42: Frame 1 to 5 (crawling to pot, reaching inside, eating butter)
        // 0.42 -> 0.68: Frame 5 to 8 (butter on face, innocent giggle)
        // 0.68 -> 1.00: Frame 8 -> 19 (pot tilts, creamy butter pours forward into next section)
        var targetFrame;
        if (progress <= 0.08) {
            targetFrame = (progress / 0.08) * 1.0;
        } else if (progress <= 0.42) {
            var p1 = (progress - 0.08) / 0.34;
            targetFrame = 1.0 + p1 * 4.0;
        } else if (progress <= 0.68) {
            var p2 = (progress - 0.42) / 0.26;
            targetFrame = 5.0 + p2 * 3.0;
        } else {
            var p3 = (progress - 0.68) / 0.32;
            targetFrame = 8.0 + p3 * 11.0;
        }

        drawHeroFrame(targetFrame);
    }

    initHeroScrubber();

    // =============================================
    // 1. Smooth Parallax Engine (TemplateMo 612)
    // =============================================
    function parallaxEnabled() {
        return !isMobile && !reducedMotion;
    }

    function updateParallax() {
        if (!parallaxEnabled()) return;

        var windowHeight = window.innerHeight;

        parallaxBgs.forEach(function (bg) {
            var section = bg.closest('.parallax-section') || bg.parentElement;
            if (!section) return;

            var rect = section.getBoundingClientRect();
            if (rect.bottom < -200 || rect.top > windowHeight + 200) return;

            var speed = parseFloat(bg.dataset.speed) || 0.42;
            var sectionCenterY = rect.top + rect.height / 2;
            var viewportCenterY = windowHeight / 2;
            var offset = sectionCenterY - viewportCenterY;

            var totalTravel = windowHeight + rect.height;
            var normalized = offset / (totalTravel / 2); // -1 to +1
            normalized = Math.max(-1, Math.min(1, normalized));

            var maxShift = windowHeight * speed;
            var translateY = normalized * maxShift;

            bg.style.transform = 'translate3d(0, ' + translateY.toFixed(1) + 'px, 0)';
        });
    }

    function resetParallax() {
        parallaxBgs.forEach(function (bg) {
            bg.style.transform = 'translate3d(0, 0, 0)';
        });
    }

    // =============================================
    // 2. Header, scroll-spy, progress, back-to-top
    // =============================================
    function handleNavScroll() {
        header.classList.toggle('scrolled', window.scrollY > 40);
    }

    function updateActiveLink() {
        var marker = window.innerHeight / 3;
        var currentId = spySections.length ? spySections[0].id : '';

        // The active tab is the last section whose top has passed the marker,
        // so the untabbed interlude stays under "About Us".
        spySections.forEach(function (section) {
            if (section.getBoundingClientRect().top <= marker) {
                currentId = section.id;
            }
        });

        // At the very bottom the last section wins even if it is short
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
            currentId = spySections[spySections.length - 1].id;
        }

        navItems.forEach(function (link) {
            var isActive = link.getAttribute('href') === '#' + currentId;
            link.classList.toggle('active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    function updateProgress() {
        var scrollable = document.documentElement.scrollHeight - window.innerHeight;
        var progress = scrollable > 0 ? clamp(window.scrollY / scrollable, 0, 1) : 0;
        progressBar.style.transform = 'scaleX(' + progress.toFixed(4) + ')';
        backToTop.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8);
    }

    // --- Mobile menu ---
    function setMenu(open) {
        navToggle.classList.toggle('active', open);
        navLinks.classList.toggle('open', open);
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        document.body.style.overflow = open ? 'hidden' : '';
    }

    navToggle.addEventListener('click', function () {
        setMenu(!navLinks.classList.contains('open'));
    });

    navItems.forEach(function (link) {
        link.addEventListener('click', function () {
            setMenu(false);
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navLinks.classList.contains('open')) {
            setMenu(false);
            navToggle.focus();
        }
    });

    // =============================================
    // 3. Scroll reveal
    // =============================================
    if ('IntersectionObserver' in window && !reducedMotion) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -80px 0px', threshold: 0.08 });

        revealElements.forEach(function (el) {
            revealObserver.observe(el);
        });
    } else {
        revealElements.forEach(function (el) {
            el.classList.add('visible');
        });
    }

    // =============================================
    // Shared scroll / resize loop (one rAF per frame)
    // =============================================
    var ticking = false;

    function onFrame() {
        updateHeroScrubber();
        updateParallax();
        handleNavScroll();
        updateActiveLink();
        updateProgress();
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(onFrame);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestTick, { passive: true });

    window.addEventListener('resize', function () {
        isMobile = window.innerWidth < 600;
        if (!parallaxEnabled()) resetParallax();
        if (!isMobile) setMenu(false);
        requestTick();
    });

    function onMotionChange(e) {
        reducedMotion = e.matches;
        if (reducedMotion) resetParallax();
        requestTick();
    }

    if (motionQuery.addEventListener) {
        motionQuery.addEventListener('change', onMotionChange);
    } else if (motionQuery.addListener) {
        motionQuery.addListener(onMotionChange);
    }

    // Images change the page height as they load
    window.addEventListener('load', requestTick);
    onFrame();

    // =============================================
    // 4. Enquiry form
    // =============================================
    (function initForm() {
        var form = document.getElementById('enquiryForm');
        if (!form) return;

        var success = document.getElementById('enquirySuccess');
        var successMessage = document.getElementById('successMessage');
        var resetBtn = document.getElementById('enquiryReset');
        var submitBtn = document.getElementById('enquirySubmit');
        var status = document.getElementById('formStatus');
        var cvInput = document.getElementById('f-cv');
        var cvDrop = document.getElementById('cvDrop');
        var cvName = document.getElementById('cvName');
        var cvClear = document.getElementById('cvClear');
        var cvHintDefault = cvName.textContent;

        var MAX_CV_BYTES = 5 * 1024 * 1024;
        var CV_EXTENSIONS = /\.(pdf|doc|docx)$/i;
        var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        var validators = {
            name: function (value) {
                if (!value) return 'Please tell us your name.';
                if (value.length < 2) return 'That name looks a little short.';
                return '';
            },
            email: function (value) {
                if (!value) return 'Please add an email so we can reply.';
                if (!EMAIL_PATTERN.test(value)) return 'That email address doesn\'t look right — check for a typo?';
                return '';
            },
            phone: function (value) {
                if (!value) return 'Please add a phone number.';
                if (/[^\d\s()+.\-]/.test(value)) return 'Use digits only, with an optional + country code.';
                var digits = value.replace(/\D/g, '');
                if (digits.length < 7 || digits.length > 15) return 'A phone number should have 7 to 15 digits.';
                return '';
            },
            role: function (value) {
                return value ? '' : 'Please choose what your enquiry is about.';
            },
            portfolio: function (value) {
                if (!value) return '';
                try {
                    var url = new URL(/^https?:\/\//i.test(value) ? value : 'https://' + value);
                    if (url.hostname.indexOf('.') === -1) throw new Error('no tld');
                    return '';
                } catch (err) {
                    return 'That link doesn\'t look complete — try something like https://example.com/reel';
                }
            },
            message: function (value) {
                return value.length > 3000 ? 'Please keep the message under 3,000 characters.' : '';
            },
            cv: function () {
                var file = cvInput.files && cvInput.files[0];
                if (!file) return '';
                if (!CV_EXTENSIONS.test(file.name)) return 'Please upload a PDF, DOC or DOCX file.';
                if (file.size > MAX_CV_BYTES) return 'That file is over 5 MB — a smaller version, please.';
                return '';
            }
        };

        function fieldValue(name) {
            var el = form.elements[name];
            return el && typeof el.value === 'string' ? el.value.trim() : '';
        }

        function showError(name, message) {
            var el = form.elements[name];
            var wrap = el.closest('.field');
            var errorEl = document.getElementById(el.id + '-err');
            wrap.classList.toggle('has-error', Boolean(message));
            errorEl.textContent = message;
            if (message) {
                el.setAttribute('aria-invalid', 'true');
            } else {
                el.removeAttribute('aria-invalid');
            }
        }

        function validateField(name) {
            var message = validators[name](fieldValue(name));
            showError(name, message);
            return !message;
        }

        // Validate on blur, then live once a field has an error showing
        Object.keys(validators).forEach(function (name) {
            var el = form.elements[name];
            if (name === 'cv') return;
            el.addEventListener('blur', function () {
                validateField(name);
            });
            el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', function () {
                if (el.closest('.field').classList.contains('has-error')) validateField(name);
            });
        });

        // --- CV upload ---
        function refreshCv() {
            var file = cvInput.files && cvInput.files[0];
            if (file) {
                var sizeMb = file.size / (1024 * 1024);
                cvName.textContent = file.name + ' · ' + (sizeMb < 0.1 ? '< 0.1' : sizeMb.toFixed(1)) + ' MB';
            } else {
                cvName.textContent = cvHintDefault;
            }
            cvDrop.classList.toggle('has-file', Boolean(file));
            cvClear.hidden = !file;
            validateField('cv');
        }

        cvInput.addEventListener('change', refreshCv);

        cvClear.addEventListener('click', function () {
            cvInput.value = '';
            refreshCv();
            cvInput.focus();
        });

        ['dragenter', 'dragover'].forEach(function (type) {
            cvDrop.addEventListener(type, function (e) {
                e.preventDefault();
                cvDrop.classList.add('is-dragover');
            });
        });

        ['dragleave', 'drop'].forEach(function (type) {
            cvDrop.addEventListener(type, function (e) {
                e.preventDefault();
                cvDrop.classList.remove('is-dragover');
            });
        });

        cvDrop.addEventListener('drop', function (e) {
            var files = e.dataTransfer && e.dataTransfer.files;
            if (!files || !files.length) return;
            try {
                var transfer = new DataTransfer();
                transfer.items.add(files[0]);
                cvInput.files = transfer.files;
            } catch (err) {
                cvInput.files = files;
            }
            refreshCv();
        });

        // --- Submit ---
        function showSuccess(message) {
            successMessage.textContent = message;
            form.hidden = true;
            success.hidden = false;
            success.focus();
        }

        function buildMailto(address) {
            var lines = [
                'Name: ' + fieldValue('name'),
                'Email: ' + fieldValue('email'),
                'Phone: ' + fieldValue('phone'),
                'Role / enquiry type: ' + fieldValue('role'),
                'Portfolio / showreel: ' + (fieldValue('portfolio') || '—'),
                '',
                fieldValue('message')
            ];
            return 'mailto:' + address +
                   '?subject=' + encodeURIComponent('Enquiry (' + fieldValue('role') + ') — ' + fieldValue('name')) +
                   '&body=' + encodeURIComponent(lines.join('\n'));
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            status.textContent = '';

            // Honeypot: a filled hidden field means a bot. Pretend all is well
            // and send nothing.
            if (form.elements.company_website.value) {
                showSuccess('Your enquiry is on its way to us.');
                return;
            }

            var firstInvalid = null;
            Object.keys(validators).forEach(function (name) {
                if (!validateField(name) && !firstInvalid) {
                    firstInvalid = form.elements[name];
                }
            });

            if (firstInvalid) {
                status.textContent = 'Almost there — please check the highlighted fields.';
                firstInvalid.focus();
                return;
            }

            var endpoint = form.getAttribute('data-endpoint');
            var hasCv = Boolean(cvInput.files && cvInput.files[0]);

            // No form backend configured: hand the enquiry to the visitor's
            // mail app. Attachments cannot travel through a mailto link.
            if (!endpoint) {
                window.location.href = buildMailto(form.getAttribute('data-mailto'));
                showSuccess(
                    'Your mail app should now be open with your enquiry ready to send' +
                    (hasCv ? ' — please attach your CV to that email before sending.' : '.') +
                    ' If nothing opened, write to us at ' + form.getAttribute('data-mailto') + '.'
                );
                return;
            }

            var data = new FormData(form);
            data.delete('company_website');

            submitBtn.disabled = true;
            status.textContent = 'Sending…';

            fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
                .then(function (response) {
                    if (!response.ok) throw new Error('HTTP ' + response.status);
                    status.textContent = '';
                    showSuccess('Your enquiry has reached us. We read every submission and will reply by email.');
                })
                .catch(function () {
                    status.textContent = 'We couldn\'t send that just now. Please try again, or email ' +
                                         form.getAttribute('data-mailto') + '.';
                })
                .then(function () {
                    submitBtn.disabled = false;
                });
        });

        resetBtn.addEventListener('click', function () {
            form.reset();
            Object.keys(validators).forEach(function (name) {
                showError(name, '');
            });
            refreshCv();
            status.textContent = '';
            success.hidden = true;
            form.hidden = false;
            form.elements.name.focus();
        });
    })();

    // =============================================
    // 5. Copy email to clipboard
    // =============================================
    (function initCopy() {
        var button = document.getElementById('copyEmail');
        var statusEl = document.getElementById('copyStatus');
        if (!button) return;

        var label = button.querySelector('.copy-label');
        var resetTimer = null;

        function legacyCopy(text) {
            var area = document.createElement('textarea');
            area.value = text;
            area.setAttribute('readonly', '');
            area.style.position = 'fixed';
            area.style.opacity = '0';
            document.body.appendChild(area);
            area.select();
            var ok = false;
            try {
                ok = document.execCommand('copy');
            } catch (err) {
                ok = false;
            }
            area.remove();
            return ok ? Promise.resolve() : Promise.reject(new Error('copy failed'));
        }

        function copy(text) {
            if (navigator.clipboard && window.isSecureContext) {
                return navigator.clipboard.writeText(text).catch(function () {
                    return legacyCopy(text);
                });
            }
            return legacyCopy(text);
        }

        button.addEventListener('click', function () {
            var text = button.getAttribute('data-copy');

            copy(text).then(function () {
                button.classList.add('is-copied');
                label.textContent = 'Copied';
                statusEl.textContent = 'Email address copied to your clipboard.';
            }, function () {
                statusEl.textContent = 'Couldn\'t copy automatically — the address is ' + text + '.';
            }).then(function () {
                window.clearTimeout(resetTimer);
                resetTimer = window.setTimeout(function () {
                    button.classList.remove('is-copied');
                    label.textContent = 'Copy';
                    statusEl.textContent = '';
                }, 2600);
            });
        });
    })();

    // --- Footer year ---
    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());

})();
