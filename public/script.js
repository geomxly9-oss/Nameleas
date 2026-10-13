// Nameleas Events — front-end behaviour (menu, package picker, booking form).

const $ = (sel, root = document) => root.querySelector(sel);

$('#year').textContent = new Date().getFullYear();

// Mobile menu
const toggle = $('.nav-toggle');
const links = $('.nav-links');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
links.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') links.classList.remove('open');
});

const form = $('#booking-form');
const errorBox = $('.form-error', form);
const success = $('#booking-success');

// Event date must be today or later
const today = new Date().toISOString().slice(0, 10);
form.date.min = today;

// "Choose package" buttons prefill the form and jump to it
document.querySelectorAll('.choose').forEach((btn) => {
  btn.addEventListener('click', () => {
    form.package.value = btn.dataset.package;
    $('#booking').scrollIntoView({ behavior: 'smooth' });
    form.name.focus({ preventScroll: true });
  });
});

function validate() {
  let firstInvalid = null;
  for (const el of form.elements) {
    if (!el.name) continue;
    const ok = el.checkValidity();
    el.classList.toggle('invalid', !ok);
    if (!ok && !firstInvalid) firstInvalid = el;
  }
  if (firstInvalid) {
    errorBox.textContent = 'Please complete the highlighted fields.';
    errorBox.hidden = false;
    firstInvalid.focus();
    return false;
  }
  errorBox.hidden = true;
  return true;
}

// Saves to the server API when available; falls back to this browser's
// storage when the page is opened directly as a file.
async function saveBooking(data) {
  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) throw Object.assign(new Error(body.error || 'Booking failed'), { fromServer: true });
    return body.booking;
  } catch (err) {
    if (err.fromServer) throw err;
    const booking = {
      ...data,
      id: 'NE-' + Date.now().toString(36).toUpperCase(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const list = JSON.parse(localStorage.getItem('bookings') || '[]');
    list.push(booking);
    localStorage.setItem('bookings', JSON.stringify(list));
    return booking;
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validate()) return;

  const submit = $('button[type="submit"]', form);
  submit.disabled = true;
  submit.textContent = 'Sending…';
  try {
    const data = Object.fromEntries(new FormData(form));
    const booking = await saveBooking(data);
    $('#booking-ref').textContent = booking.id;
    form.hidden = true;
    success.hidden = false;
    form.reset();
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.hidden = false;
  } finally {
    submit.disabled = false;
    submit.textContent = 'Request Booking';
  }
});

$('#new-booking').addEventListener('click', () => {
  success.hidden = true;
  form.hidden = false;
});
