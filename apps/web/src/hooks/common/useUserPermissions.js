import { useState, useEffect } from 'react';
import { API } from '../../helpers';

/**
 * User Permissions Hook - Fetch user permissions from backend, replacing frontend role checks
 * Ensures permission control security, prevents frontend bypass
 */
export const useUserPermissions = () => {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user permissions (from user info API)
  const loadPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get('/api/user/self');
      if (res.data.success) {
        const userPermissions = res.data.data.permissions;
        setPermissions(userPermissions);
        console.log('User permissions loaded successfully:', userPermissions);
      } else {
        setError(res.data.message || 'Failed to get permissions');
        console.error('Failed to get permissions:', res.data.message);
      }
    } catch (error) {
      setError('Network error, please try again');
      console.error('User permissions loading exception:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  // Check if has sidebar settings permission
  const hasSidebarSettingsPermission = () => {
    return permissions?.sidebar_settings === true;
  };

  // Check if sidebar section access is allowed
  const isSidebarSectionAllowed = (sectionKey) => {
    if (!permissions?.sidebar_modules) return true;
    const sectionPerms = permissions.sidebar_modules[sectionKey];
    return sectionPerms !== false;
  };

  // Check if sidebar module access is allowed
  const isSidebarModuleAllowed = (sectionKey, moduleKey) => {
    if (!permissions?.sidebar_modules) return true;
    const sectionPerms = permissions.sidebar_modules[sectionKey];

    // If entire section is disabled
    if (sectionPerms === false) return false;

    // If section exists but module is disabled
    if (sectionPerms && sectionPerms[moduleKey] === false) return false;

    return true;
  };

  // Get allowed sidebar sections list
  const getAllowedSidebarSections = () => {
    if (!permissions?.sidebar_modules) return [];

    return Object.keys(permissions.sidebar_modules).filter((sectionKey) =>
      isSidebarSectionAllowed(sectionKey),
    );
  };

  // Get allowed modules list for specific section
  const getAllowedSidebarModules = (sectionKey) => {
    if (!permissions?.sidebar_modules) return [];
    const sectionPerms = permissions.sidebar_modules[sectionKey];

    if (sectionPerms === false) return [];
    if (!sectionPerms || typeof sectionPerms !== 'object') return [];

    return Object.keys(sectionPerms).filter(
      (moduleKey) =>
        moduleKey !== 'enabled' && sectionPerms[moduleKey] === true,
    );
  };

  return {
    permissions,
    loading,
    error,
    loadPermissions,
    hasSidebarSettingsPermission,
    isSidebarSectionAllowed,
    isSidebarModuleAllowed,
    getAllowedSidebarSections,
    getAllowedSidebarModules,
  };
};

export default useUserPermissions;
