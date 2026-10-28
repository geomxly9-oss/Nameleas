const test = require('node:test');
const assert = require('node:assert');
const { validateBooking } = require('./server');

const valid = {
  name: 'Ana', phone: '0400 000 000', email: 'ana@example.com', eventType: 'Wedding',
  package: 'Basic', date: '2099-06-01', guests: '80', location: 'North',
};

test('accepts a valid booking', () => {
  assert.ok(validateBooking(valid).booking);
});

test('accepts a free-text location when "Other" is picked', () => {
  assert.strictEqual(validateBooking({ ...valid, location: 'Other', otherLocation: 'Lakeside' }).booking.location, 'Lakeside');
});

test('rejects bad input', () => {
  for (const bad of [
    { email: 'not-an-email' },
    { date: '2000-01-01' },
    { date: '2099-02-31' },
    { guests: '0' },
    { eventType: 'Funeral' },
    { location: 'Other', otherLocation: '' },
  ]) {
    assert.ok(validateBooking({ ...valid, ...bad }).error, JSON.stringify(bad));
  }
});
