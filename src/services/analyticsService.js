// src/services/analyticsService.js
import { analytics } from '../firebase';
import { logEvent } from 'firebase/analytics';

// Track page views
export const trackPageView = (pageTitle) => {
  try {
    logEvent(analytics, 'page_view', {
      page_title: pageTitle || 'Unknown',
      page_location: window.location.href
    });
  } catch (error) {
    console.log('Analytics tracking error:', error);
  }
};

// Track custom events
export const trackEvent = (eventName, eventParams = {}) => {
  try {
    logEvent(analytics, eventName, eventParams);
  } catch (error) {
    console.log('Analytics tracking error:', error);
  }
};

// Track service search
export const trackSearch = (searchQuery, resultsCount) => {
  try {
    logEvent(analytics, 'search', {
      search_term: searchQuery,
      results_count: resultsCount
    });
  } catch (error) {
    console.log('Analytics tracking error:', error);
  }
};

// Track service click
export const trackServiceClick = (serviceName, serviceId) => {
  try {
    logEvent(analytics, 'service_click', {
      service_name: serviceName,
      service_id: serviceId
    });
  } catch (error) {
    console.log('Analytics tracking error:', error);
  }
};

// Track appointment booking
export const trackAppointment = (serviceName, serviceId) => {
  try {
    logEvent(analytics, 'appointment_booked', {
      service_name: serviceName,
      service_id: serviceId
    });
  } catch (error) {
    console.log('Analytics tracking error:', error);
  }
};

// Track donation
export const trackDonation = (amount, cause) => {
  try {
    logEvent(analytics, 'donation_made', {
      amount: amount,
      cause: cause
    });
  } catch (error) {
    console.log('Analytics tracking error:', error);
  }
};