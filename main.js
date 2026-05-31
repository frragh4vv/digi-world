document.addEventListener('DOMContentLoaded', () => {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const elementsToAnimate = document.querySelectorAll('.polaroid-interactive, .polaroid-simple, .mini-section, .hero-text-block');
  
  elementsToAnimate.forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });

  // Live time for the "My Time" mini section
  const timeElement = document.getElementById('live-time');
  if (timeElement) {
    setInterval(() => {
      const now = new Date();
      timeElement.innerText = now.toLocaleTimeString();
    }, 1000);
  }
});
