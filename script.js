/**
 * English Mind — script.js
 * Micro-interactions, Motion Narrative, Accessibility
 */

'use strict';

/* ============================================
   NAVBAR: Scroll shadow + mobile toggle
   ============================================ */
const navbar  = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

// Sticky scroll effect
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// Mobile menu toggle
if (navToggle && navLinks) {
  // Create overlay if it doesn't exist
  let overlay = document.querySelector('.nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }

  const originalParent = navbar; // navbar is the <nav> element

  const handleResponsiveMenu = () => {
    if (window.innerWidth <= 900) {
      if (navLinks.parentElement !== document.body) {
        document.body.appendChild(navLinks);
      }
    } else {
      if (navLinks.parentElement !== originalParent) {
        originalParent.appendChild(navLinks);
      }
      // Always close menu on desktop
      toggleMenu(false);
    }
  };

  const toggleMenu = (open) => {
    navToggle.setAttribute('aria-expanded', String(open));
    navLinks.classList.toggle('open', open);
    overlay.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : ''; 
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('open');
    toggleMenu(!isOpen);
    if (!isOpen) {
      const firstLink = navLinks.querySelector('a, button');
      if (firstLink) firstLink.focus();
    }
  });

  overlay.addEventListener('click', () => toggleMenu(false));

  // Initial check
  handleResponsiveMenu();
  window.addEventListener('resize', handleResponsiveMenu);

  // Close with mobile close button
  const closeSidebar = document.getElementById('closeSidebar');
  if (closeSidebar) {
    closeSidebar.addEventListener('click', () => {
      toggleMenu(false);
      navToggle.focus();
    });
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      toggleMenu(false);
      navToggle.focus();
    }
  });

  // Close when clicking a link (mobile only)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900) toggleMenu(false);
    });
  });
}

/* ============================================
   MOBILE COURSES COLLAPSE
   ============================================ */
document.querySelectorAll('.nav-dropdown > a').forEach(dropdownLink => {
  dropdownLink.addEventListener('click', (e) => {
    if (window.innerWidth <= 900) {
      e.preventDefault();
      dropdownLink.parentElement.classList.toggle('expanded');
    }
  });
});

/* ============================================
   REVEAL ANIMATIONS (Intersection Observer)
   ============================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ============================================
   COUNTER ANIMATIONS
   ============================================ */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const suffixEl = el.querySelector('.suffix');
  const duration = 1800;
  const start = performance.now();

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.round(easeOut(progress) * target);
    // Replace text but keep suffix span
    el.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) node.textContent = value.toLocaleString('en-IN');
    });
    if (suffixEl) suffixEl.textContent = suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.count-number[data-target]').forEach(el => counterObserver.observe(el));

/* ============================================
   ACCORDION (Time / FAQ pages)
   ============================================ */
document.querySelectorAll('.accordion-item').forEach(item => {
  const header = item.querySelector('.accordion-header');
  if (!header) return;

  header.setAttribute('aria-expanded', 'false');
  const bodyId = 'acc-body-' + Math.random().toString(36).slice(2, 9);
  const body = item.querySelector('.accordion-body');
  if (body) { body.id = bodyId; header.setAttribute('aria-controls', bodyId); }

  header.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // Close all siblings
    item.closest('.accordion').querySelectorAll('.accordion-item.open').forEach(openItem => {
      openItem.classList.remove('open');
      openItem.querySelector('.accordion-header')?.setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      header.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ============================================
   ENQUIRY FORM — Client-side validation & UX
   ============================================ */
const form = document.getElementById('enquiryForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fname = form.querySelector('#fname');
    const phone = form.querySelector('#phone');
    let valid = true;

    [fname, phone].forEach(field => {
      if (field && !field.value.trim()) {
        field.style.borderColor = 'var(--clr-crimson-light)';
        field.setAttribute('aria-invalid', 'true');
        valid = false;
      } else if (field) {
        field.style.borderColor = '';
        field.removeAttribute('aria-invalid');
      }
    });

    if (!valid) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    // Simulate async submission (replace with actual endpoint)
    await new Promise(r => setTimeout(r, 1200));

    btn.textContent = '✓ Sent!';
    btn.style.background = 'linear-gradient(135deg, #0d9488, #059669)';

    const successDiv = document.getElementById('formSuccess');
    if (successDiv) { successDiv.style.display = 'block'; successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }

    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
      btn.style.background = '';
      form.reset();
      if (successDiv) successDiv.style.display = 'none';
    }, 4000);
  });

  // Live field validation
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true' && field.value.trim()) {
        field.style.borderColor = 'var(--clr-teal)';
        field.removeAttribute('aria-invalid');
      }
    });
  });
}

/* ============================================
   SMOOTH SCROLL for anchor links
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Close mobile menu if open
      if (navLinks?.classList.contains('open')) {
        navLinks.classList.remove('open');
        navToggle?.setAttribute('aria-expanded', 'false');
      }
    }
  });
});

/* ============================================
   MICRO-INTERACTION: Card tilt effect on mouse move
   ============================================ */
const tiltCards = document.querySelectorAll('.glass-card');
tiltCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-4px) rotateX(${y * -4}deg) rotateY(${x * 4}deg)`;
    card.style.transition = 'transform 0.1s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 400ms cubic-bezier(0.16,1,0.3,1), border-color 400ms, box-shadow 400ms';
  });
});

/* ============================================
   HERO: Staggered entrance animation trigger
   ============================================ */
window.addEventListener('load', () => {
  // Hero elements animate immediately on load
  document.querySelectorAll('.hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 120);
  });
});

/* ============================================
   ACTIVE NAV LINK: highlight current page
   ============================================ */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const isHomepage = document.getElementById('home-section');

if (!isHomepage) {
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* ============================================
   SCROLL SPY (Auto-switch active nav link)
   ============================================ */
if (isHomepage) {
  const sectionsMap = {
    'home-section': 'index.html',
    'about-section': 'about.html',
    'methods-section': 'teaching-methods.html',
    'pricing-section': 'fee-structure.html',
    'contact-section': 'contact.html'
  };

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const targetHref = sectionsMap[entry.target.id];
        if (targetHref) {
          document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
          });
          
          const activeLink = Array.from(document.querySelectorAll('.nav-links a')).find(link => 
            link.getAttribute('href') === targetHref || (targetHref === 'index.html' && link.getAttribute('href') === '')
          );
          
          if (activeLink) {
            activeLink.classList.add('active');
            activeLink.setAttribute('aria-current', 'page');
          }
        }
      }
    });
  }, { threshold: 0.3, rootMargin: '-10% 0px -40% 0px' });

  Object.keys(sectionsMap).forEach(id => {
    const el = document.getElementById(id);
    if (el) spyObserver.observe(el);
  });
}

/* ============================================
   PERFORMANCE: Lazy load images
   ============================================ */
if ('loading' in HTMLImageElement.prototype) {
  // Native lazy loading supported — images handle themselves
} else {
  // Fallback: IntersectionObserver-based lazy load
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  const imageObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) img.src = img.dataset.src;
        imageObserver.unobserve(img);
      }
    });
  });
  lazyImages.forEach(img => imageObserver.observe(img));
}

/* ============================================
   OFFER MODAL AUTO-SHOW
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const offerModal = document.getElementById('offerModal');
    if (offerModal) {
      offerModal.classList.add('active');
    }
  }, 1000); // 1-second delay so it's not jarring
});
