/* ============================================
   Indians Dream Wedding â€” RAJWADI THEME JS
   Animations, Carousels & Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- STICKY HEADER ----------
  const header = document.querySelector('.header');
  const backToTop = document.querySelector('.back-to-top');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (header) {
      header.classList.toggle('scrolled', scrollY > 80);
    }
    if (backToTop) {
      backToTop.classList.toggle('visible', scrollY > 400);
    }
  }, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---------- MOBILE MENU ----------
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ---------- SCROLL ANIMATIONS (IntersectionObserver) ----------
  const animateElements = document.querySelectorAll('.animate-on-scroll');

  if (animateElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    animateElements.forEach(el => observer.observe(el));
  }

  // ---------- COUNTER ANIMATION ----------
  const counters = document.querySelectorAll('.stat-number[data-target]');

  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.dataset.target);
          const suffix = counter.dataset.suffix || '';
          const duration = 2000;
          const start = 0;
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (target - start) * eased);
            counter.textContent = current + suffix;

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            }
          }

          requestAnimationFrame(updateCounter);
          counterObserver.unobserve(counter);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));
  }

  // ---------- TESTIMONIAL CAROUSEL ----------
  const carousel = document.querySelector('.testimonials-carousel');

  if (carousel) {
    const track = carousel.querySelector('.testimonials-track');
    const cards = carousel.querySelectorAll('.testimonial-card');
    const dotsContainer = carousel.querySelector('.carousel-dots');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    let currentSlide = 0;
    let autoPlayInterval;

    // Create dots
    if (dotsContainer) {
      cards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      });
    }

    function goToSlide(index) {
      currentSlide = index;
      if (track) {
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
      }
      updateDots();
    }

    function updateDots() {
      if (!dotsContainer) return;
      const dots = dotsContainer.querySelectorAll('.dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
      });
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % cards.length;
      goToSlide(currentSlide);
    }

    function prevSlide() {
      currentSlide = (currentSlide - 1 + cards.length) % cards.length;
      goToSlide(currentSlide);
    }

    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // Auto-play
    function startAutoPlay() {
      autoPlayInterval = setInterval(nextSlide, 4000);
    }

    function stopAutoPlay() {
      clearInterval(autoPlayInterval);
    }

    startAutoPlay();

    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);

    // Touch/Swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoPlay();
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? nextSlide() : prevSlide();
      }
      startAutoPlay();
    }, { passive: true });
  }

  // ---------- GALLERY PAGINATION & FILTER ----------
  const filterButtons = document.querySelectorAll('.gallery-filters button');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const galleryGrid = document.querySelector('.gallery-grid');

  if (galleryGrid && galleryItems.length > 0) {
    // 1. Create Load More Button Dynamically
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.className = 'btn btn-primary load-more-btn';
    // Style directly to match center alignment and theme styling
    loadMoreBtn.style.display = 'none';
    loadMoreBtn.style.margin = '40px auto 0';
    loadMoreBtn.style.gap = '10px';
    loadMoreBtn.innerHTML = 'Load More <i class="fa-solid fa-chevron-down"></i>';

    // Insert button immediately after the gallery grid
    galleryGrid.parentNode.insertBefore(loadMoreBtn, galleryGrid.nextSibling);

    const ITEMS_PER_PAGE = 12;
    let currentFilter = 'all';
    let visibleCount = ITEMS_PER_PAGE;

    function updateGallery() {
      let shownCount = 0;
      let totalMatching = 0;

      galleryItems.forEach(item => {
        const category = item.dataset.category;
        const matchesFilter = (currentFilter === 'all' || category === currentFilter);

        if (matchesFilter) {
          totalMatching++;
          if (shownCount < visibleCount) {
            item.style.display = '';
            // Trigger animation if the item is newly showing
            if (item.classList.contains('hidden-item')) {
              item.classList.remove('hidden-item');
              item.style.animation = 'scaleIn 0.4s var(--ease) both';
            }
            shownCount++;
          } else {
            item.style.display = 'none';
            item.classList.add('hidden-item');
          }
        } else {
          item.style.display = 'none';
          item.classList.add('hidden-item');
        }
      });

      // Show the button only if there are more matching items to reveal
      if (totalMatching > visibleCount) {
        loadMoreBtn.style.display = 'inline-flex';
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }

    // Initialize state
    galleryItems.forEach(item => item.classList.add('hidden-item'));
    updateGallery();

    // Filter Button Click Handler
    if (filterButtons.length > 0) {
      filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          filterButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          currentFilter = btn.dataset.filter;
          visibleCount = ITEMS_PER_PAGE; // Reset to page 1 count

          galleryItems.forEach(item => item.classList.add('hidden-item'));
          updateGallery();
        });
      });
    }

    // Load More Button Click Handler
    loadMoreBtn.addEventListener('click', () => {
      // Simulate loading state with spinner icon for a premium look
      const icon = loadMoreBtn.querySelector('i');
      icon.className = 'fa-solid fa-spinner fa-spin';
      loadMoreBtn.disabled = true;

      setTimeout(() => {
        visibleCount += ITEMS_PER_PAGE;
        updateGallery();
        icon.className = 'fa-solid fa-chevron-down';
        loadMoreBtn.disabled = false;
      }, 500); // 500ms delay for premium feel
    });
  }

  // ---------- LIGHTBOX ----------
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('img') : null;
  const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img && lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || 'Gallery Image';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  // ---------- SMOOTH SCROLL FOR ANCHOR LINKS ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const top = target.offsetTop - headerHeight - 20;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ---------- ACTIVE NAV LINK HIGHLIGHT ----------
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ---------- LAZY IMAGE LOADING ----------
  const lazyImages = document.querySelectorAll('img[data-src]');
  if (lazyImages.length > 0) {
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    lazyImages.forEach(img => imgObserver.observe(img));
  }

  // ---------- VENUE FAVORITES TOGGLER ----------
  const favBtns = document.querySelectorAll('.venue-fav-btn');
  favBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.toggle('active');
      const heartIcon = btn.querySelector('i');
      if (btn.classList.contains('active')) {
        heartIcon.className = 'fa-solid fa-heart';
        heartIcon.style.color = '#1a0008';
      } else {
        heartIcon.className = 'fa-regular fa-heart';
        heartIcon.style.color = '';
      }
    });
  });

  // ---------- CONTACT FORM SUBMISSION TO GOOGLE SHEET & WHATSAPP ----------
  const contactForm = document.querySelector('.contact-form form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      
      const name = document.getElementById('name').value;
      const phone = document.getElementById('phone').value;
      const email = document.getElementById('email').value;
      const eventType = document.getElementById('event-type').value;
      const eventDate = document.getElementById('date').value || 'Not specified';
      const message = document.getElementById('message').value || 'No message';
      
      const formData = {
        name,
        phone,
        email,
        eventType,
        eventDate,
        message
      };

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

        // 1. Save to Google Sheet (non-blocking in case of CORS or network slowness)
        fetch("https://script.google.com/macros/s/AKfycbw5QzD7yYlBo2eKYexmIJRA-aWUW15V2GPM8EKxTfohpUPQsuMB73gYywwRMHWT4Zdgsw/exec", {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }).catch(err => console.error("Google Sheet save error:", err));

        // 2. WhatsApp Message Format
        const whatsappMessage =
`🔥 New Booking Lead

👤 Name: ${name}
📞 Phone: ${phone}
📧 Email: ${email}
🎉 Event Type: ${eventType}
📅 Event Date: ${eventDate}
💬 Message: ${message}`;

        // 3. Open WhatsApp
        const whatsappURL =
          `https://wa.me/919016786537?text=${encodeURIComponent(whatsappMessage)}`;

        window.open(whatsappURL, "_blank");

        // Restore button state and reset form
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        contactForm.reset();

      } catch (error) {
        console.error(error);
        alert("Something went wrong");
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }

});


/* ── Team Bio Scroll (tbs) ── */
(function () {
  var list  = document.getElementById('tbsList');
  var btnL  = document.getElementById('tbsLeft');
  var btnR  = document.getElementById('tbsRight');
  if (!list || !btnL || !btnR) return;

  var STEP = 280; // px per click

  function updateArrows() {
    btnL.classList.toggle('hidden', list.scrollLeft <= 4);
    btnR.classList.toggle('hidden', list.scrollLeft >= list.scrollWidth - list.clientWidth - 4);
  }

  btnL.addEventListener('click', function () {
    list.scrollBy({ left: -STEP, behavior: 'smooth' });
  });
  btnR.addEventListener('click', function () {
    list.scrollBy({ left: STEP, behavior: 'smooth' });
  });

  list.addEventListener('scroll', updateArrows, { passive: true });
  updateArrows(); // init state
})();

/* Team bios scroll with mouse drag & auto-slide */
(function () {
  const slider = document.getElementById('teamBiosList');
  const btnRight = document.getElementById('teamScrollRight');
  if (!slider) return;

  let isDown = false;
  let startX;
  let scrollLeft;
  let autoplayTimer = null;
  const AUTOPLAY_DELAY = 3000; // auto slide every 3 seconds

  // Dragging event handlers
  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.style.scrollBehavior = 'auto'; // disable smooth scrolling while dragging for responsive movement
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
    stopAutoplay();
  });

  slider.addEventListener('mouseleave', () => {
    if (isDown) {
      slider.style.scrollBehavior = 'smooth';
    }
    isDown = false;
    startAutoplay();
  });

  slider.addEventListener('mouseup', () => {
    if (isDown) {
      slider.style.scrollBehavior = 'smooth';
    }
    isDown = false;
    startAutoplay();
  });

  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.5; // multiplier for speed
    slider.scrollLeft = scrollLeft - walk;
  });

  // Prevent default image drag behaviors
  slider.querySelectorAll('img').forEach(img => {
    img.addEventListener('dragstart', (e) => e.preventDefault());
  });

  // Touch support for mobile devices
  slider.addEventListener('touchstart', () => {
    stopAutoplay();
    slider.style.scrollBehavior = 'auto';
  }, { passive: true });

  slider.addEventListener('touchend', () => {
    slider.style.scrollBehavior = 'smooth';
    startAutoplay();
  }, { passive: true });

  // Autoplay function
  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      const firstCard = slider.querySelector('li');
      let step = 260; // fallback step
      if (firstCard) {
        step = firstCard.offsetWidth + parseFloat(window.getComputedStyle(firstCard).marginRight || 0);
      }
      
      const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
      if (slider.scrollLeft >= maxScrollLeft - 10) {
        slider.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        slider.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  // Button right click handler
  if (btnRight) {
    btnRight.addEventListener('click', () => {
      stopAutoplay();
      const firstCard = slider.querySelector('li');
      let step = 260;
      if (firstCard) {
        step = firstCard.offsetWidth + parseFloat(window.getComputedStyle(firstCard).marginRight || 0);
      }
      const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
      if (slider.scrollLeft >= maxScrollLeft - 10) {
        slider.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        slider.scrollBy({ left: step, behavior: 'smooth' });
      }
      startAutoplay();
    });
  }

  // Hover container to pause/resume autoplay
  const biosContainer = document.querySelector('#our-team .bios');
  if (biosContainer) {
    biosContainer.addEventListener('mouseenter', stopAutoplay);
    biosContainer.addEventListener('mouseleave', startAutoplay);
  }

  // Initialize
  startAutoplay();
})();



