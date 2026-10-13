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
