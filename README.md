# Nameleas Events

Website for an event management team, with online booking.

## Features

- **Public website** — services (weddings, corporate, birthdays, concerts), packages, team, recent events.
- **Online booking form** — clients pick event type, package, location, date and guest count; they get a booking reference straight away.
- **Team dashboard** (`/admin.html`) — password-protected list of all bookings, where the team can mark each one `pending`, `confirmed`, `completed` or `cancelled`.

## Run it

Requires Node.js 18+. No packages to install.

```bash
ADMIN_PASSWORD=your-secret npm start
```

Then open:

- Website: http://localhost:3000
- Team dashboard: http://localhost:3000/admin.html

Bookings are saved to `data/bookings.json` (not committed to git).

The server will not start without `ADMIN_PASSWORD`.

Run the tests with `npm test`.

## Customise

- Business name, phone, email, team members and prices: `public/index.html`
- Colours and fonts: the variables at the top of `public/styles.css`
- Event types, packages and locations accepted by the server: `EVENT_TYPES`, `PACKAGES` and `LOCATIONS` in `server.js` (keep them in sync with the form's dropdowns)
