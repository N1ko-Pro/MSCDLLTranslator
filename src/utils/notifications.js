export const notify = {
  success: (title, message, duration = 3000) => dispatch('success', title, message, duration),
  info: (title, message, duration = 3000) => dispatch('info', title, message, duration),
  warning: (title, message, duration = 4000) => dispatch('warning', title, message, duration),
  error: (title, message, duration = 5000) => dispatch('error', title, message, duration)
};

const dispatch = (type, title, message, duration) => {
  window.dispatchEvent(new CustomEvent('app-notification', {
    detail: { 
      id: Date.now().toString() + Math.random().toString(), 
      type, 
      title, 
      message, 
      duration 
    }
  }));
};
