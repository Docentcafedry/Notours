import { errorMonitor } from 'nodemailer/lib/xoauth2';
import { showAlert } from './alerts';
import axios from 'axios';

const stripe = Stripe(
  'pk_test_51P3jznA8IieYHfEP0J7G65XwZpLg5qlQ7qAnLknpaodOCBTTv25aFDApI1y0uCGYedycvQ3OeOxRJBrAdyEmr5jm00MRQ0AtOV'
);

export async function bookTour(tourId, tourDate) {
  try {
    const resp = await axios.get(
      `http://127.0.0.1:5555/api/v1/bookings/checkout-session/${tourId}/${tourDate}`
    );
    await stripe.redirectToCheckout({ sessionId: resp.data.session.id });
  } catch (err) {
    console.log(errorMonitor);
    showAlert(err.response.data.message, 'error');
  }
}
