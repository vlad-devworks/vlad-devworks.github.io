# vlad-devworks.github.io

Source of my portfolio site: https://vlad-devworks.github.io

I build online booking, website chat assistants, instant lead follow-up, customer bots and
in-house tools for small local businesses. Each project has its own repository:

- [online-booking-demo](https://github.com/vlad-devworks/online-booking-demo): booking widget
  and front desk schedule for a dental clinic
- [chat-assistant-demo](https://github.com/vlad-devworks/chat-assistant-demo): website chat for
  an auto repair shop
- [lead-followup-demo](https://github.com/vlad-devworks/lead-followup-demo): instant replies and
  a lead inbox for a home services company
- [repair-status-bot](https://github.com/vlad-devworks/repair-status-bot): Telegram bot that
  keeps auto repair customers updated and takes approvals for extra work (Python)
- [dispatch-board](https://github.com/vlad-devworks/dispatch-board): Windows app for planning a
  home services crew's day, with live conflict checks and auto-schedule (C#, WPF)

The "Right now in Austin" card on the page uses the booking demo's availability code to show
whether the demo clinic is open and how many slots are free this week.

## Running locally

```bash
npm ci
npm run dev
npm run build
```

Pushing to `main` builds the site and deploys it to GitHub Pages.

## License

MIT
