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

// Event date must be today or later (the customer's local day, as YYYY-MM-DD)
form.date.min = new Date().toLocaleDateString('en-CA');

// Show the free-text city field only when "Other" location is picked
const otherLocation = $('#other-location');
function syncOtherLocation() {
  const isOther = form.location.value === 'Other';
  otherLocation.hidden = !isOther;
  form.otherLocation.disabled = !isOther;
  form.otherLocation.required = isOther;
}
form.location.addEventListener('change', syncOtherLocation);

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

async function saveBooking(data) {
  let res, body;
  try {
    res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    body = await res.json();
  } catch {
    throw new Error('We could not send your booking. Please try again or call us.');
  }
  if (!res.ok) throw new Error(body.error || 'Booking failed. Please try again or call us.');
  return body.booking;
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
    syncOtherLocation();
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
