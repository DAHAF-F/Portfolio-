document.addEventListener('DOMContentLoaded', () => {
  // scroll reveal for cards, case files, and method steps
  const revealEls = document.querySelectorAll('.card, .file, .step');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    revealEls.forEach((el) => io.observe(el));
  }

  // copy-to-clipboard email row
  const copyRow = document.getElementById('copyRow');
  if (copyRow) {
    copyRow.addEventListener('click', async () => {
      const text = document.getElementById('emailText').textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        /* clipboard not available, fail silently */
      }
      copyRow.classList.add('copied');
      setTimeout(() => copyRow.classList.remove('copied'), 1600);
    });
  }
});
