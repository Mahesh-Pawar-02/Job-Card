import { toast } from 'react-toastify'

// Toast configuration
const toastConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
}

// Success toast
export const showSuccessToast = (message) => {
  toast.success(message, {
    ...toastConfig,
    toastId: `success-${Date.now()}`, // Prevent duplicate toasts
  })
}

// Error toast
export const showErrorToast = (message) => {
  toast.error(message, {
    ...toastConfig,
    toastId: `error-${Date.now()}`, // Prevent duplicate toasts
    autoClose: 7000, // Keep error messages longer
  })
}

// Warning toast
export const showWarningToast = (message) => {
  toast.warning(message, {
    ...toastConfig,
    toastId: `warning-${Date.now()}`,
  })
}

// Info toast
export const showInfoToast = (message) => {
  toast.info(message, {
    ...toastConfig,
    toastId: `info-${Date.now()}`,
  })
}

// API response handler - automatically shows success or error based on response
export const handleApiResponse = (response, successMessage = null) => {
  if (response && response.success) {
    const message = successMessage || response.message || 'Operation completed successfully'
    showSuccessToast(message)
    return true
  } else {
    const errorMessage = response?.error || 'An error occurred'
    showErrorToast(errorMessage)
    return false
  }
}

// Error handler for API failures
export const handleApiError = (error, fallbackMessage = 'An error occurred') => {
  const message = error?.message || fallbackMessage
  showErrorToast(message)
}

// Loading toast (for long operations)
export const showLoadingToast = (message = 'Processing...') => {
  return toast.loading(message, {
    position: "top-right",
    autoClose: false,
    closeOnClick: false,
    draggable: false,
  })
}

// Update loading toast to success/error
export const updateLoadingToast = (toastId, type, message) => {
  toast.update(toastId, {
    render: message,
    type: type,
    isLoading: false,
    autoClose: type === 'success' ? 3000 : 7000,
  })
}
