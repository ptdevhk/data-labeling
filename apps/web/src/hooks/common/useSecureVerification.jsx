import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SecureVerificationService } from '../../services/secureVerification';
import { showError, showSuccess } from '../../helpers';
import { isVerificationRequiredError } from '../../helpers/secureApiCall';

/**
 * Generic Security Verification Hook
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Verification success callback
 * @param {Function} options.onError - Verification failure callback
 * @param {string} options.successMessage - Success message
 * @param {boolean} options.autoReset - Auto-reset state after verification, default true
 */
export const useSecureVerification = ({
  onSuccess,
  onError,
  successMessage,
  autoReset = true,
} = {}) => {
  const { t } = useTranslation();

  // Verification method availability state
  const [verificationMethods, setVerificationMethods] = useState({
    has2FA: false,
    hasPasskey: false,
    passkeySupported: false,
  });

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Current verification state
  const [verificationState, setVerificationState] = useState({
    method: null, // '2fa' | 'passkey'
    loading: false,
    code: '',
    apiCall: null,
  });

  // Check available verification methods
  const checkVerificationMethods = useCallback(async () => {
    const methods =
      await SecureVerificationService.checkAvailableVerificationMethods();
    setVerificationMethods(methods);
    return methods;
  }, []);

  // Initialize - check verification methods
  useEffect(() => {
    checkVerificationMethods();
  }, [checkVerificationMethods]);

  // Reset state
  const resetState = useCallback(() => {
    setVerificationState({
      method: null,
      loading: false,
      code: '',
      apiCall: null,
    });
    setIsModalVisible(false);
  }, []);

  // Start verification process
  const startVerification = useCallback(
    async (apiCall, options = {}) => {
      const { preferredMethod, title, description } = options;

      // Check verification methods
      const methods = await checkVerificationMethods();

      if (!methods.has2FA && !methods.hasPasskey) {
        const errorMessage = t('twoFactorRequiredError');
        showError(errorMessage);
        onError?.(new Error(errorMessage));
        return false;
      }

      // Set default verification method
      let defaultMethod = preferredMethod;
      if (!defaultMethod) {
        if (methods.hasPasskey && methods.passkeySupported) {
          defaultMethod = 'passkey';
        } else if (methods.has2FA) {
          defaultMethod = '2fa';
        }
      }

      setVerificationState((prev) => ({
        ...prev,
        method: defaultMethod,
        apiCall,
        title,
        description,
      }));
      setIsModalVisible(true);

      return true;
    },
    [checkVerificationMethods, onError, t],
  );

  // Execute verification
  const executeVerification = useCallback(
    async (method, code = '') => {
      if (!verificationState.apiCall) {
        showError(t('verificationConfigError'));
        return;
      }

      setVerificationState((prev) => ({ ...prev, loading: true }));

      try {
        // First call verification API, backend will set session on success
        await SecureVerificationService.verify(method, code);

        // Verification successful, call business API (middleware will now pass)
        const result = await verificationState.apiCall();

        // Show success message
        if (successMessage) {
          showSuccess(successMessage);
        }

        // Call success callback
        onSuccess?.(result, method);

        // Auto-reset state
        if (autoReset) {
          resetState();
        }

        return result;
      } catch (error) {
        showError(error.message || t('verificationFailed'));
        onError?.(error);
        throw error;
      } finally {
        setVerificationState((prev) => ({ ...prev, loading: false }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      verificationState.apiCall,
      successMessage,
      onSuccess,
      onError,
      autoReset,
      resetState,
      t,
    ],
  );

  // Set verification code
  const setVerificationCode = useCallback((code) => {
    setVerificationState((prev) => ({ ...prev, code }));
  }, []);

  // Switch verification method
  const switchVerificationMethod = useCallback((method) => {
    setVerificationState((prev) => ({ ...prev, method, code: '' }));
  }, []);

  // Cancel verification
  const cancelVerification = useCallback(() => {
    resetState();
  }, [resetState]);

  // Check if a verification method can be used
  const canUseMethod = useCallback(
    (method) => {
      switch (method) {
        case '2fa':
          return verificationMethods.has2FA;
        case 'passkey':
          return (
            verificationMethods.hasPasskey &&
            verificationMethods.passkeySupported
          );
        default:
          return false;
      }
    },
    [verificationMethods],
  );

  // Get recommended verification method
  const getRecommendedMethod = useCallback(() => {
    if (
      verificationMethods.hasPasskey &&
      verificationMethods.passkeySupported
    ) {
      return 'passkey';
    }
    if (verificationMethods.has2FA) {
      return '2fa';
    }
    return null;
  }, [verificationMethods]);

  /**
   * Wrap API call, automatically handle verification errors
   * When API returns verification required error, automatically show verification modal
   * @param {Function} apiCall - API call function
   * @param {Object} options - Verification options (same as startVerification)
   * @returns {Promise<any>}
   */
  const withVerification = useCallback(
    async (apiCall, options = {}) => {
      try {
        // Directly try to call API
        return await apiCall();
      } catch (error) {
        // Check if it's a verification required error
        if (isVerificationRequiredError(error)) {
          // Automatically trigger verification process
          await startVerification(apiCall, options);
          // Don't throw error, let verification modal handle it
          return null;
        }
        // Other errors continue to throw
        throw error;
      }
    },
    [startVerification],
  );

  return {
    // State
    isModalVisible,
    verificationMethods,
    verificationState,

    // Methods
    startVerification,
    executeVerification,
    cancelVerification,
    resetState,
    setVerificationCode,
    switchVerificationMethod,
    checkVerificationMethods,

    // Helper methods
    canUseMethod,
    getRecommendedMethod,
    withVerification, // New: wrapper function that automatically handles verification

    // Convenience properties
    hasAnyVerificationMethod:
      verificationMethods.has2FA || verificationMethods.hasPasskey,
    isLoading: verificationState.loading,
    currentMethod: verificationState.method,
    code: verificationState.code,
  };
};
