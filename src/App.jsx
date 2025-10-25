import { BrowserRouter, Routes, Route } from 'react-router';
import GraduationRegistrationForm from './components/RegistrationForm';
import Success from './components/Success';
import Cancel from './components/Cancel';
import PaymentCallback from './components/PaymentCallback';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GraduationRegistrationForm />} />
  <Route path="/success" element={<Success />} />
  <Route path="/cancel" element={<Cancel />} />
  <Route path="/payment/callback" element={<PaymentCallback />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
