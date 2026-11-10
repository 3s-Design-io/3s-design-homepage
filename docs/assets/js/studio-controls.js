document.addEventListener('click', event => {
  const opener = event.target.closest('[data-open]');
  if (opener) {
    document.getElementById(opener.dataset.open).showModal();
    return;
  }

  const jump = event.target.closest('[data-photo]');
  if (jump) {
    event.preventDefault();
    jump.closest('dialog').close();
    const plate = document.getElementById(jump.hash.slice(1));
    plate.scrollIntoView({ block: 'nearest', inline: 'start' });
    plate.focus({ preventScroll: true });
    return;
  }

  const step = event.target.closest('[data-step]');
  if (!step) return;

  const track = document.getElementById('project-track');
  const left = track.getBoundingClientRect().left;
  const direction = Number(step.dataset.step);
  const plates = Array.from(track.children);
  if (direction < 0) plates.reverse();
  const target = plates.find(plate => direction * (plate.getBoundingClientRect().left - left) > 4);
  target?.scrollIntoView({ block: 'nearest', inline: 'start' });
});
