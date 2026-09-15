(() => {
  const html = document.documentElement;
  const body = document.body;
  const languageButton = document.querySelector('.language-switch');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelectorAll('.main-nav a');
  const translatable = document.querySelectorAll('[data-ar][data-en]');
  const placeholderNodes = document.querySelectorAll('[data-placeholder-ar][data-placeholder-en]');
  const yearNode = document.getElementById('year');
  yearNode.textContent = new Date().getFullYear();

  let language = localStorage.getItem('oasis-language') || 'ar';

  function applyLanguage(lang) {
    language = lang;
    localStorage.setItem('oasis-language', lang);
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    body.classList.toggle('lang-en', lang === 'en');
    languageButton.textContent = lang === 'ar' ? 'EN' : 'AR';

    translatable.forEach(node => {
      const value = node.dataset[lang];
      if (!value) return;
      if (node.tagName === 'OPTION') node.textContent = value;
      else node.textContent = value;
    });
    placeholderNodes.forEach(node => {
      node.placeholder = lang === 'ar' ? node.dataset.placeholderAr : node.dataset.placeholderEn;
    });
  }

  applyLanguage(language);
  languageButton.addEventListener('click', () => applyLanguage(language === 'ar' ? 'en' : 'ar'));

  navToggle.addEventListener('click', () => {
    const open = !body.classList.contains('menu-open');
    body.classList.toggle('menu-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navLinks.forEach(link => link.addEventListener('click', () => {
    body.classList.remove('menu-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));

  // Brand filtering + search.
  const brandButtons = [...document.querySelectorAll('.brand-card')];
  const filters = [...document.querySelectorAll('.brand-filter')];
  const search = document.getElementById('brandSearch');
  const empty = document.getElementById('brandEmpty');
  let activeFilter = 'all';

  function filterBrands() {
    const query = (search.value || '').trim().toLowerCase();
    let visible = 0;
    brandButtons.forEach(card => {
      const categories = card.dataset.cat.split(' ');
      const matchesCategory = activeFilter === 'all' || categories.includes(activeFilter);
      const matchesQuery = !query || card.dataset.brand.toLowerCase().includes(query) || card.textContent.toLowerCase().includes(query);
      const show = matchesCategory && matchesQuery;
      card.classList.toggle('hidden', !show);
      if (show) visible += 1;
    });
    empty.hidden = visible !== 0;
  }

  filters.forEach(button => {
    button.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      activeFilter = button.dataset.filter;
      filterBrands();
    });
  });
  search.addEventListener('input', filterBrands);

  // Clicking a brand opens a ready-to-send WhatsApp enquiry.
  brandButtons.forEach(card => {
    card.addEventListener('click', () => {
      const brand = card.dataset.brand;
      const text = language === 'ar'
        ? `مرحباً OASIS، أريد الاستفسار عن عطور ${brand} المتوفرة لديكم.`
        : `Hello OASIS, I would like to ask which ${brand} fragrances are currently available.`;
      window.open(`https://wa.me/970569238514?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    });
  });

  // Consultation form -> WhatsApp.
  const form = document.getElementById('consultationForm');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = document.getElementById('customerName').value.trim() || (language === 'ar' ? 'غير مذكور' : 'Not provided');
    const style = document.getElementById('scentStyle').value;
    const occasion = document.getElementById('occasion').value;
    const budget = document.getElementById('budget').value.trim() || (language === 'ar' ? 'غير محددة' : 'Not specified');
    const message = language === 'ar'
      ? `مرحباً OASIS، أريد ترشيح عطر مناسب لي.\n\nالاسم: ${name}\nالطابع المفضل: ${style}\nالمناسبة: ${occasion}\nالميزانية التقريبية: ${budget}`
      : `Hello OASIS, I would like a fragrance recommendation.\n\nName: ${name}\nPreferred style: ${style}\nOccasion: ${occasion}\nApprox. budget: ${budget}`;
    window.open(`https://wa.me/970569238514?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  });

  // Gallery lightbox.
  const dialog = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      lightboxImage.src = item.dataset.image;
      if (typeof dialog.showModal === 'function') dialog.showModal();
    });
  });
  document.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {
    const rect = dialog.getBoundingClientRect();
    const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!inside) dialog.close();
  });

  // Reveal animation.
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .11 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();
