# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## BillDesk Payment Integration (frontend)

This project includes a frontend flow to create a BillDesk checkout session and redirect the user to the BillDesk payment page.

- The registration form component is `src/components/RegistrationForm.jsx`.
- When the form is validated ("Validate Details"), a new button "Pay & Submit (BillDesk)" appears.
- Clicking that button sends the form (multipart/form-data) to the backend endpoint `POST /api/graduation/create-checkout-session` (configured via `src/api.js` -> `API_BASE`).
- The backend should return `{ bdorderid, merchantid, rdata? }`. The frontend then posts a hidden form to BillDesk's embeddedsdk URL to redirect the user for payment.
- After payment, BillDesk should redirect to the configured `BILLDESK_RETURN_URL` which should point to `/payment/callback` on this frontend; the component `src/components/PaymentCallback.jsx` will call the backend `POST /api/graduation/verify-payment` to confirm the transaction and then navigate to `/success` or `/cancel`.

Important: Signing/encryption keys and all BillDesk logic must remain on the backend. The frontend only creates the checkout session and initiates the redirect.
