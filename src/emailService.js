// src/emailService.js (The Correct Version)
import emailjs from '@emailjs/browser';

export const sendEmail = (templateParams, subject, setEmailStatus) => {
    // Add the subject to the templateParams
    templateParams.subject = subject;

    return emailjs.send(
    // For local testing, we hardcode the keys as strings.
    // For the live site, Netlify will use the environment variables.
    process.env.REACT_APP_EMAILJS_SERVICE_ID || 'service_yvafohl',
    process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'template_9apvv2k',
    templateParams,
    process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'SNySoHaJnSh4_sSQz'
  )
  .then((response) => {
     console.log('SUCCESS!', response.status, response.text);
     if (setEmailStatus) setEmailStatus('sent');
  }, (err) => {
     console.error('FAILED...', err);
     if (setEmailStatus) setEmailStatus('error');
     // Re-throw the error so the calling component knows it failed
     throw err;
  });
};