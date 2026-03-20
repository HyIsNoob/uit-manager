const EXT_DISABLED =
  'Extended integration not available in this build. Configure optional local module if applicable.';

module.exports = function registerStcIpcStub({ ipcMain }) {
  ipcMain.handle('stc-get-auth-state', () => ({
    success: true,
    data: {
      sid: null,
      hasPassword: false,
      hasToken: false,
      expiresAt: null,
      savedAt: null,
      lastLoginAt: null,
    },
  }));

  ipcMain.handle('stc-save-credentials', () => ({ success: false, error: EXT_DISABLED }));

  ipcMain.handle('stc-clear-credentials', () => ({ success: true }));

  ipcMain.handle('stc-login', () => ({ success: false, error: EXT_DISABLED }));

  ipcMain.handle('stc-get-current', () => ({ success: false, error: EXT_DISABLED }));

  ipcMain.handle('stc-get-all', () => ({ success: false, error: EXT_DISABLED }));
};
