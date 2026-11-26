const menuButton = document.querySelector('.nav__toggle');
const mobileMenu = document.querySelector('.mobile-menu');

if (menuButton && mobileMenu) {
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
    mobileMenu.hidden = true;
  };

  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    if (open) {
      closeMenu();
    } else {
      menuButton.setAttribute('aria-expanded', 'true');
      menuButton.setAttribute('aria-label', 'Close menu');
      mobileMenu.hidden = false;
    }
  });

  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
}

const form = document.querySelector('.lead-form');

if (form) {
  const messages = {
    name: 'Write your name.',
    company: 'Write your company name.',
    website: 'Write your company website.',
    email: 'Write a work email address with an @.',
    customer: 'Describe the customer you want to reach.',
    geography: 'Write the city, state or market you want to target.'
  };

  form.addEventListener('submit', (event) => {
    const fields = [...form.querySelectorAll('input[required]')];
    const invalid = fields.filter((field) => !field.validity.valid || !field.value.trim());

    fields.forEach((field) => {
      const error = document.getElementById(`${field.id}-error`);
      const hasError = invalid.includes(field);
      field.setAttribute('aria-invalid', String(hasError));
      field.setAttribute('aria-describedby', `${field.id}-error`);
      if (error) error.textContent = hasError ? messages[field.id] : '';
    });

    if (invalid.length) {
      event.preventDefault();
      const status = form.querySelector('[data-form-status]');
      if (status) status.textContent = `${invalid.length} field${invalid.length === 1 ? '' : 's'} need attention.`;
      invalid[0].focus();
    }
  });
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = [...document.querySelectorAll('[data-reveal]')];

revealItems.forEach((item) => {
  item.style.setProperty('--reveal-delay', item.dataset.delay || '0');
});

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' });

  revealItems.forEach((item) => revealObserver.observe(item));
}

const counters = [...document.querySelectorAll('[data-count]')];

const showCounter = (counter) => {
  const end = Number(counter.dataset.count);
  if (reduceMotion || !Number.isFinite(end)) {
    counter.textContent = String(end);
    return;
  }

  const startTime = performance.now();
  const duration = 650;

  const update = (time) => {
    const progress = Math.min((time - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = String(Math.round(end * eased));
    if (progress < 1) requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
};

if ('IntersectionObserver' in window && !reduceMotion) {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      showCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.7 });

  counters.forEach((counter) => {
    counter.textContent = '0';
    counterObserver.observe(counter);
  });
} else {
  counters.forEach(showCounter);
}

const story = document.querySelector('.lead-story');
const storyPause = document.querySelector('.story-pause');

if (story && storyPause) {
  storyPause.addEventListener('click', () => {
    const paused = story.classList.toggle('is-paused');
    storyPause.setAttribute('aria-pressed', String(paused));
    storyPause.setAttribute('aria-label', paused ? 'Play lead flow animation' : 'Pause lead flow animation');
  });
}

const workspace = document.querySelector('.workspace-ui');

const problemAccordion = document.querySelector('[data-problem-accordion]');

if (problemAccordion) {
  const panels = [...problemAccordion.querySelectorAll('[data-problem-panel]')];

  const activatePanel = (activePanel) => {
    panels.forEach((panel) => {
      const active = panel === activePanel;
      panel.classList.toggle('is-active', active);
      panel.setAttribute('aria-expanded', String(active));
    });
  };

  panels.forEach((panel, index) => {
    panel.addEventListener('mouseenter', () => activatePanel(panel));
    panel.addEventListener('focus', () => activatePanel(panel));
    panel.addEventListener('click', () => activatePanel(panel));
    panel.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activatePanel(panel);
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        panels[(index + 1) % panels.length].focus();
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        panels[(index - 1 + panels.length) % panels.length].focus();
      }
    });
  });

  problemAccordion.classList.add('is-ready');
  activatePanel(panels[0]);
}

if (workspace) {
  const tabs = [...workspace.querySelectorAll('[data-workspace-tab]')];
  const panels = [...workspace.querySelectorAll('[data-workspace-panel]')];
  const viewLabel = workspace.querySelector('[data-workspace-view]');
  const stepLabel = workspace.querySelector('[data-workspace-step]');
  const pauseButton = workspace.querySelector('.workspace-pause');
  const viewNames = ['Leads dashboard', 'Campaigns dashboard', 'Follow-ups dashboard', 'Reports dashboard'];
  let activeIndex = 0;
  let cycleTimer;
  let manuallyPaused = false;

  const showPanel = (index) => {
    activeIndex = index;

    tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === activeIndex;
      tab.classList.toggle('current', selected);
      tab.setAttribute('aria-selected', String(selected));
    });

    panels.forEach((panel, panelIndex) => {
      const active = panelIndex === activeIndex;
      panel.classList.toggle('is-active', active);
      panel.setAttribute('aria-hidden', String(!active));
    });

    if (viewLabel) viewLabel.textContent = viewNames[activeIndex];
    if (stepLabel) stepLabel.textContent = `${activeIndex + 1} of ${panels.length}`;
  };

  const stopCycle = () => {
    window.clearInterval(cycleTimer);
    cycleTimer = undefined;
  };

  const startCycle = () => {
    stopCycle();
    if (reduceMotion || manuallyPaused) return;
    cycleTimer = window.setInterval(() => {
      showPanel((activeIndex + 1) % panels.length);
    }, 2600);
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      showPanel(index);
      startCycle();
    });
  });

  if (pauseButton) {
    if (reduceMotion) {
      pauseButton.hidden = true;
    } else {
      pauseButton.addEventListener('click', () => {
        manuallyPaused = !manuallyPaused;
        workspace.classList.toggle('is-paused', manuallyPaused);
        pauseButton.setAttribute('aria-pressed', String(manuallyPaused));
        pauseButton.setAttribute('aria-label', manuallyPaused ? 'Play workspace animation' : 'Pause workspace animation');

        if (manuallyPaused) stopCycle();
        else startCycle();
      });
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopCycle();
    else startCycle();
  });

  showPanel(0);
  startCycle();
}
