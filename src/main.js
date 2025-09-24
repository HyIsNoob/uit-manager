const { app, BrowserWindow, ipcMain, dialog, Notification, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const axios = require('axios');
const notifier = require('node-notifier');

// Khởi tạo electron-store để lưu trữ dữ liệu
const store = new Store();

// Smart Notifications System
class SmartNotificationManager {
  constructor() {
    this.lastCheckData = {
      assignments: new Map(),
      content: new Map(),
      lastCheckTime: null
    };
    this.notificationSettings = {
      enabled: true,
      showToasts: true,
      showInApp: true,
      soundEnabled: true,
      checkInterval: 5 * 60 * 1000 // 5 minutes
    };
    this.pollingInterval = null;
  }

  // Initialize notification system
  init() {
    // Request notification permission
    if (process.platform === 'win32') {
      app.setAppUserModelId('com.uit.assignment-manager');
    }
    
    // Load notification settings
    this.loadSettings();
    
    // Start polling if enabled
    if (this.notificationSettings.enabled) {
      this.startPolling();
    }
  }

  // Load notification settings from store
  loadSettings() {
    try {
      const settings = store.get('notificationSettings', {});
      this.notificationSettings = { ...this.notificationSettings, ...settings };
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  }

  // Save notification settings
  saveSettings() {
    try {
      store.set('notificationSettings', this.notificationSettings);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  // Start polling for changes
  startPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    
    this.pollingInterval = setInterval(() => {
      this.checkForChanges();
    }, this.notificationSettings.checkInterval);
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Check for changes in assignments and content
  async checkForChanges() {
    try {
      // This will be called by the main process when data is available
      // For now, we'll implement the notification logic
    } catch (error) {
      console.error('Error checking for changes:', error);
    }
  }

  // Show Windows Toast notification
  showToastNotification(title, message, options = {}) {
    if (!this.notificationSettings.showToasts) return;

    const notificationOptions = {
      title: title || 'UIT Assignment Manager',
      message: message,
      icon: path.join(__dirname, '../assets/uit_logo.png'),
      sound: this.notificationSettings.soundEnabled,
      wait: true,
      timeout: 10,
      ...options
    };

    notifier.notify(notificationOptions, (err, response) => {
      if (err) {
        console.error('Notification error:', err);
      }
    });
  }

  // Show Electron notification
  showElectronNotification(title, message, options = {}) {
    if (!this.notificationSettings.showInApp) return;

    const notification = new Notification({
      title: title || 'UIT Assignment Manager',
      body: message,
      icon: path.join(__dirname, '../assets/uit_logo.png'),
      silent: !this.notificationSettings.soundEnabled,
      ...options
    });

    notification.show();
  }

  // Show smart notification (both toast and in-app)
  showSmartNotification(title, message, type = 'info', options = {}) {
    const iconMap = {
      'assignment': '📝',
      'announcement': '📢',
      'deadline': '⏰',
      'new_content': '📄',
      'info': 'ℹ️',
      'warning': '⚠️',
      'error': '❌'
    };

    const fullMessage = `${iconMap[type] || iconMap.info} ${message}`;

    // Show both types of notifications
    this.showToastNotification(title, fullMessage, options);
    this.showElectronNotification(title, fullMessage, options);

    // Send to renderer process for in-app display
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('show-notification', {
        title,
        message: fullMessage,
        type,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Detect changes in assignments
  detectAssignmentChanges(newAssignments) {
    const changes = [];
    const currentAssignments = new Map();
    
    // Build current assignments map
    newAssignments.forEach(assignment => {
      currentAssignments.set(assignment.id, assignment);
    });

    // Check for new assignments
    currentAssignments.forEach((assignment, id) => {
      if (!this.lastCheckData.assignments.has(id)) {
        changes.push({
          type: 'new_assignment',
          assignment,
          message: `Bài tập mới: ${assignment.name}`
        });
      } else {
        // Check for changes in existing assignments
        const lastAssignment = this.lastCheckData.assignments.get(id);
        if (this.hasAssignmentChanged(lastAssignment, assignment)) {
          changes.push({
            type: 'assignment_updated',
            assignment,
            message: `Bài tập đã cập nhật: ${assignment.name}`
          });
        }
      }
    });

    // Update last check data
    this.lastCheckData.assignments = currentAssignments;
    this.lastCheckData.lastCheckTime = Date.now();

    return changes;
  }

  // Detect changes in course content
  detectContentChanges(newContent) {
    const changes = [];
    const currentContent = new Map();
    
    // Build current content map
    newContent.forEach(item => {
      currentContent.set(item.id, item);
    });

    // Check for new content
    currentContent.forEach((item, id) => {
      if (!this.lastCheckData.content.has(id)) {
        changes.push({
          type: 'new_content',
          content: item,
          message: `Nội dung mới: ${item.title} (${item.courseName})`
        });
      }
    });

    // Update last check data
    this.lastCheckData.content = currentContent;

    return changes;
  }

  // Check if assignment has changed
  hasAssignmentChanged(oldAssignment, newAssignment) {
    if (!oldAssignment) return false;
    
    return (
      oldAssignment.name !== newAssignment.name ||
      oldAssignment.duedate !== newAssignment.duedate ||
      oldAssignment.description !== newAssignment.description ||
      oldAssignment.status !== newAssignment.status
    );
  }

  // Process and show notifications for changes
  processChanges(changes) {
    changes.forEach(change => {
      switch (change.type) {
        case 'new_assignment':
          this.showSmartNotification(
            'Bài tập mới',
            change.message,
            'assignment',
            { priority: 'high' }
          );
          break;
        case 'assignment_updated':
          this.showSmartNotification(
            'Bài tập cập nhật',
            change.message,
            'assignment',
            { priority: 'normal' }
          );
          break;
        case 'new_content':
          this.showSmartNotification(
            'Nội dung mới',
            change.message,
            'new_content',
            { priority: 'normal' }
          );
          break;
      }
    });
  }

  // Update settings
  updateSettings(newSettings) {
    this.notificationSettings = { ...this.notificationSettings, ...newSettings };
    this.saveSettings();
    
    // Restart polling if interval changed
    if (newSettings.checkInterval) {
      this.startPolling();
    }
  }
}

// Initialize notification manager
const notificationManager = new SmartNotificationManager();

// Cấu hình Moodle API - đọc từ settings, mặc định courses.uit.edu.vn

// Tạo HTTPS agent (dựa theo settings để cho phép TLS tự ký)
const https = require('https');

function shouldAllowInsecureTLS() {
  try {
    const settings = store.get('settings', {});
    if (settings.allowInsecureTLS === undefined) {
      // default true for first run so user có thể đăng ký/đăng nhập
      settings.allowInsecureTLS = true;
      store.set('settings', settings);
    }
    return Boolean(settings.allowInsecureTLS);
  } catch {
    return false;
  }
}

function getNotificationSettings() {
  try {
    const settings = store.get('settings', {});
    return {
      enabled: settings.enableNotifications !== false, // default true
      interval: settings.pollingInterval || 5 // default 5 minutes
    };
  } catch {
    return { enabled: true, interval: 5 };
  }
}

function getBaseUrl() {
  try {
    const settings = store.get('settings', {});
    if (!settings.baseUrl) {
      settings.baseUrl = 'https://courses.uit.edu.vn';
      store.set('settings', settings);
    }
    return settings.baseUrl;
  } catch {
    return 'https://courses.uit.edu.vn';
  }
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: 'default',
    show: false,
    backgroundColor: '#1a1a1a'
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

  // Hiển thị cửa sổ khi đã sẵn sàng
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.maximize();
    
    // Kiểm tra xem đã có tài khoản nào được lưu chưa
    const accounts = store.get('accounts', {});
    if (Object.keys(accounts).length > 0) {
      mainWindow.webContents.send('has-saved-accounts', Object.keys(accounts));
    }
  });

  // Mở DevTools trong chế độ development
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

// Xây dựng query parameters cho Moodle API
function buildQuery(params) {
  const sp = new URLSearchParams();
  const append = (key, val) => {
    if (val === undefined || val === null) return;
    sp.append(key, String(val));
  };
  
  Object.entries(params || {}).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      val.forEach((item, i) => {
        if (item && typeof item === 'object') {
          Object.entries(item).forEach(([k2, v2]) => append(`${key}[${i}][${k2}]`, v2));
        } else {
          append(`${key}[${i}]`, item);
        }
      });
    } else if (val && typeof val === 'object') {
      Object.entries(val).forEach(([k2, v2]) => append(`${key}[${k2}]`, v2));
    } else {
      append(key, val);
    }
  });
  
  return sp.toString();
}

// Gọi Moodle REST API
async function moodleRest(token, params) {
  const MOODLE_BASE_URL = getBaseUrl();
  if (!MOODLE_BASE_URL || !token) {
    throw new Error('Missing MOODLE_BASE_URL or token');
  }
  
  const base = `${MOODLE_BASE_URL}/webservice/rest/server.php`;
  const finalParams = {
    wstoken: token,
    moodlewsrestformat: 'json',
    ...params,
  };
  
  const query = buildQuery(finalParams);
  const url = `${base}?${query}`;
  
  try {
    const response = await axios.get(url, { 
      httpsAgent: new https.Agent({ rejectUnauthorized: !shouldAllowInsecureTLS() })
    });
    
    if (response.data && response.data.exception) {
      throw new Error(`${response.data.exception}: ${response.data.message}`);
    }
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
    }
    throw error;
  }
}

async function resolveUserId(token, username) {
  if (!username) return null;
  try {
    const data = await moodleRest(token, {
      wsfunction: 'core_user_get_users_by_field',
      field: 'username',
      values: [username]
    });
    const arr = Array.isArray(data) ? data : [];
    return arr[0]?.id || null;
  } catch {
    return null;
  }
}

async function fetchUserById(token, userId) {
  if (!userId) return null;
  try {
    const data = await moodleRest(token, {
      wsfunction: 'core_user_get_users_by_field',
      field: 'id',
      values: [userId]
    });
    const arr = Array.isArray(data) ? data : [];
    return arr[0] || null;
  } catch {
    return null;
  }
}

function normalizeId(value) {
  return String(value || '').toLowerCase().trim();
}

// Lưu tài khoản mới
ipcMain.handle('save-account', async (event, studentId, token) => {
  try {
    // Kiểm tra token có hợp lệ không
    const siteInfo = await moodleRest(token, { wsfunction: 'core_webservice_get_site_info' });
    const username = String(siteInfo?.username || '').trim();
    const sid = String(studentId || '').trim();
    if (!sid) throw new Error('Chưa nhập mã số sinh viên');
    // Đảm bảo có userid, nếu thiếu thì resolve qua API khác
    let userid = siteInfo?.userid;
    if (!userid) {
      userid = await resolveUserId(token, username);
    }
    if (!userid) {
      throw new Error('Token không hợp lệ (không tìm thấy user id)');
    }

    // Lấy thông tin user chi tiết để kiểm tra các khả năng trùng khớp MSSV
    const user = await fetchUserById(token, userid);
    const sidNorm = normalizeId(sid);
    const usernameNorm = normalizeId(user?.username || username);
    const emailLocal = normalizeId((user?.email || '').split('@')[0]);
    const idnumberNorm = normalizeId(user?.idnumber);

    const matches = [usernameNorm, emailLocal, idnumberNorm].some(v => v && v === sidNorm);
    if (!matches) {
      throw new Error('Token không thuộc MSSV này (không khớp username/email/idnumber)');
    }
    
    // Lưu tài khoản
    const accounts = store.get('accounts', {});
    accounts[studentId] = {
      token: token,
      username: username,
      fullname: siteInfo?.fullname || user?.fullname || username,
      userid: userid,
      savedAt: new Date().toISOString()
    };
    store.set('accounts', accounts);
    
    return { success: true, userInfo: siteInfo };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// SETTINGS: get/set
function getSettings() {
  const settings = store.get('settings', {});
  if (!settings.theme) settings.theme = 'light';
  return settings;
}

ipcMain.handle('get-settings', () => {
  return getSettings();
});

ipcMain.handle('get-setting', (event, key) => {
  const settings = store.get('settings', {});
  return settings[key];
});

ipcMain.handle('set-setting', (event, key, value) => {
  const settings = store.get('settings', {});
  settings[key] = value;
  store.set('settings', settings);
  return { success: true };
});

// --- Notes as Word-compatible RTF files ---
function ensureNotesDir() {
  const notesDir = path.join(app.getPath('userData'), 'notes');
  if (!fs.existsSync(notesDir)) fs.mkdirSync(notesDir, { recursive: true });
  return notesDir;
}

function rtfEscape(text) {
  const safe = String(text || '')
    .replace(/[\\{}]/g, match => `\\${match}`);
  let out = '';
  for (const ch of safe) {
    const code = ch.codePointAt(0);
    if (code <= 0x7f) {
      out += ch;
    } else if (code <= 0xffff) {
      // RTF expects signed 16-bit number for \u
      const signed = code >= 0x8000 ? code - 0x10000 : code;
      out += `\\u${signed}?`;
    } else {
      // Surrogate pair for non-BMP (rare in vi text)
      const high = Math.floor((code - 0x10000) / 0x400) + 0xD800;
      const low = ((code - 0x10000) % 0x400) + 0xDC00;
      const sHigh = high >= 0x8000 ? high - 0x10000 : high;
      const sLow = low >= 0x8000 ? low - 0x10000 : low;
      out += `\\u${sHigh}?\\u${sLow}?`;
    }
  }
  return out;
}

function writeRtfIfMissing(filePath, title) {
  if (fs.existsSync(filePath)) return;
  const now = new Date().toLocaleString('vi-VN');
  const rtfTitle = rtfEscape(title);
  const rtfNow = rtfEscape(`Tạo lúc ${now}`);
  const rtf = [
    '{\\rtf1\\ansi\\ansicpg1258\\deff0',
    '{\\fonttbl{\\f0 Arial;}}',
    '\\uc1\\pard',
    `\\b ${rtfTitle}\\b0\\par`,
    `${rtfNow}\\par`,
    '}'
  ].join('\n');
  fs.writeFileSync(filePath, rtf, 'utf8');
}

ipcMain.handle('ensure-course-note-doc', async (event, courseId, courseName) => {
  try {
    const notesDir = ensureNotesDir();
    const safeName = String(courseName || `Course_${courseId}`).replace(/[^\p{L}\p{N}\s_-]+/gu, '').trim().slice(0,80) || `Course_${courseId}`;
    const filePath = path.join(notesDir, `course-${courseId}-${safeName}.rtf`);
    writeRtfIfMissing(filePath, `Ghi chú môn: ${safeName}`);
    const settings = store.get('settings', {});
    settings[`courseNoteDoc_${courseId}`] = filePath;
    store.set('settings', settings);
    const { shell } = require('electron');
    await shell.openPath(filePath);
    return { success: true, path: filePath };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('delete-course-note-doc', async (event, courseId) => {
  try {
    const settings = store.get('settings', {});
    const filePath = settings[`courseNoteDoc_${courseId}`];
    const { response } = await dialog.showMessageBox({
      type: 'warning',
      title: 'Xóa ghi chú',
      message: 'Bạn có chắc muốn xóa file ghi chú Word của môn học này? Hành động không thể hoàn tác.',
      buttons: ['Hủy', 'Xóa'],
      defaultId: 0,
      cancelId: 0
    });
    if (response !== 1) return { success: false, cancelled: true };
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    delete settings[`courseNoteDoc_${courseId}`];
    store.set('settings', settings);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('ensure-assignment-note-doc', async (event, assignmentId, name) => {
  try {
    const notesDir = ensureNotesDir();
    const safeName = String(name || `Assignment_${assignmentId}`).replace(/[^\p{L}\p{N}\s_-]+/gu, '').trim().slice(0,80) || `Assignment_${assignmentId}`;
    const filePath = path.join(notesDir, `assignment-${assignmentId}-${safeName}.rtf`);
    writeRtfIfMissing(filePath, `Ghi chú bài tập: ${safeName}`);
    const settings = store.get('settings', {});
    settings[`assignmentNoteDoc_${assignmentId}`] = filePath;
    store.set('settings', settings);
    const { shell } = require('electron');
    await shell.openPath(filePath);
    return { success: true, path: filePath };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('delete-assignment-note-doc', async (event, assignmentId) => {
  try {
    const settings = store.get('settings', {});
    const filePath = settings[`assignmentNoteDoc_${assignmentId}`];
    const { response } = await dialog.showMessageBox({
      type: 'warning',
      title: 'Xóa ghi chú',
      message: 'Bạn có chắc muốn xóa file ghi chú Word của bài tập này? Hành động không thể hoàn tác.',
      buttons: ['Hủy', 'Xóa'],
      defaultId: 0,
      cancelId: 0
    });
    if (response !== 1) return { success: false, cancelled: true };
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    delete settings[`assignmentNoteDoc_${assignmentId}`];
    store.set('settings', settings);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// User-defined group assignments store
ipcMain.handle('get-group-assignments', () => {
  const settings = store.get('settings', {});
  return settings.groupAssignments || {};
});

ipcMain.handle('set-group-assignment', (event, assignmentId, isGroup) => {
  const settings = store.get('settings', {});
  const map = settings.groupAssignments || {};
  map[String(assignmentId)] = Boolean(isGroup);
  settings.groupAssignments = map;
  store.set('settings', settings);
  return { success: true };
});

// Get course contents for unified feed
ipcMain.handle('get-course-contents', async (event, token, courseId) => {
  try {
    const response = await moodleRest(token, {
      wsfunction: 'core_course_get_contents',
      courseid: courseId,
      options: [{ name: 'includestealthmodules', value: 1 }]
    });
    if (response && response.exception) {
      return { success: false, error: `${response.exception}: ${response.message}` };
    }
    return { success: true, data: Array.isArray(response) ? response : [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Helper: build assign cmid map from course contents
async function buildAssignCmidMap(token, courseId) {
  try {
    const sections = await moodleRest(token, {
      wsfunction: 'core_course_get_contents',
      courseid: courseId,
      options: [{ name: 'includestealthmodules', value: 1 }]
    });
    const map = new Map();
    (Array.isArray(sections) ? sections : []).forEach(sec => {
      (sec.modules || []).forEach(m => {
        if ((m.modname === 'assign' || m.modplural === 'Assignments') && m.instance && m.id) {
          map.set(Number(m.instance), Number(m.id)); // assignment.id -> cmid
        }
      });
    });
    return map;
  } catch {
    return new Map();
  }
}

// Get assignments for course ids (array or single)
ipcMain.handle('get-assignments', async (event, token, courseIds) => {
  try {
    const ids = Array.isArray(courseIds) ? courseIds.map(Number) : [Number(courseIds)];
    const resp = await moodleRest(token, {
      wsfunction: 'mod_assign_get_assignments',
      courseids: ids
    });
    const courses = (resp && Array.isArray(resp.courses)) ? resp.courses : [];
    // Enrich assignments with cmid when missing
    for (const c of courses) {
      const list = Array.isArray(c.assignments) ? c.assignments : [];
      if (list.some(a => !a.cmid)) {
        const cmidMap = await buildAssignCmidMap(token, c.id);
        list.forEach(a => {
          if (!a.cmid) {
            const cmid = cmidMap.get(Number(a.id));
            if (cmid) a.cmid = cmid;
          }
        });
      }
    }
    return { success: true, data: { courses } };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get submission status for a given assignment id and user id
ipcMain.handle('get-assignment-status', async (event, token, assignId, userId) => {
  try {
    const data = await moodleRest(token, {
      wsfunction: 'mod_assign_get_submission_status',
      assignid: Number(assignId),
      userid: Number(userId)
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Assignments cache (per user, per course)
ipcMain.handle('get-assignments-cache', (event, userId, courseIds) => {
  try {
    const cache = store.get('assignmentsCache', {});
    const userKey = String(userId || '');
    const byUser = cache[userKey] || {};
    const ids = Array.isArray(courseIds) ? courseIds : [courseIds];
    const result = {};
    ids.filter(id => id !== undefined && id !== null)
      .forEach(id => {
        const key = String(id);
        if (byUser[key]) {
          result[key] = byUser[key];
        }
      });
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('set-assignments-cache', (event, userId, courseId, data) => {
  try {
    const cache = store.get('assignmentsCache', {});
    const userKey = String(userId || '');
    if (!cache[userKey]) cache[userKey] = {};
    cache[userKey][String(courseId)] = {
      data,
      timestamp: Date.now()
    };
    store.set('assignmentsCache', cache);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get course teachers/lecturers
ipcMain.handle('get-course-teachers', async (event, token, courseId) => {
  try {
    console.log('Getting course teachers for course:', courseId, 'with token:', token);
    const baseUrl = getBaseUrl();
    console.log('Base URL:', baseUrl);
    
    const response = await moodleRest(token, {
      wsfunction: 'core_enrol_get_enrolled_users',
      courseid: courseId,
      options: [
        { name: 'onlyactive', value: 1 },
        { name: 'userfields', value: 'id,fullname,firstname,lastname,email,profileimageurl,profileimageurlsmall,department,city,country' }
      ]
    });
    
    console.log('Course teachers response:', response);
    
    if (response.error) {
      return { success: false, error: response.error };
    }

    // Filter for teacher-like users by roles (same logic as @upgrade/)
    const teachers = (Array.isArray(response) ? response : []).filter(user => {
      const roles = Array.isArray(user.roles) ? user.roles : [];
      return roles.some(role => {
        const sn = (role.shortname || '').toLowerCase();
        const nm = (role.name || '').toLowerCase();
        return (
          sn === 'editingteacher' || sn === 'teacher' || sn === 'noneditingteacher' ||
          sn === 'lecturer' || sn === 'giangvien' ||
          /giảng\s*viên|teacher|lecturer/.test(nm)
        );
      });
    }).map(user => ({
      id: user.id,
      fullname: user.fullname || `${user.firstname || ''} ${user.lastname || ''}`.trim(),
      email: user.email || '',
      profileimageurl: user.profileimageurl || user.profileimageurlsmall || '',
      department: user.department || '',
      city: user.city || '',
      country: user.country || '',
      profileurl: `${baseUrl}/user/view.php?id=${user.id}&course=${courseId}`
    }));

    return { success: true, data: teachers };
  } catch (error) {
    // Fallback: if lacking capability to list enrolled users, try course contacts from course details
    const msg = String(error && error.message || '');
    console.log('Course teachers API failed, trying fallback:', msg);
    
    if (/required_capability_exception/i.test(msg) || /access/i.test(msg.toLowerCase())) {
      try {
        // Try core_course_get_courses_by_field first
        let course = null;
        try {
          const data = await moodleRest(token, { 
            wsfunction: 'core_course_get_courses_by_field',
            field: 'id', 
            value: String(courseId) 
          });
          course = (data && Array.isArray(data.courses)) ? 
            data.courses.find(c => Number(c.id) === courseId) : null;
        } catch (err2) {
          console.log('core_course_get_courses_by_field failed, trying core_course_get_courses');
          // Try core_course_get_courses as second fallback
          const data2 = await moodleRest(token, {
            wsfunction: 'core_course_get_courses',
            options: { ids: [courseId] }
          });
          course = (data2 && Array.isArray(data2)) ? 
            data2.find(c => Number(c.id) === courseId) : null;
        }
        
        const contacts = (course && Array.isArray(course.contacts)) ? course.contacts : [];
        const base = getBaseUrl().replace(/\/$/, '');
        const teachers = contacts.map(c => ({
          id: c.id,
          fullname: c.fullname || c.name || '',
          email: '',
          profileimageurl: '',
          profileurl: base ? `${base}/user/view.php?id=${c.id}&course=${courseId}` : '',
          department: '',
          city: '',
          country: '',
        }));
        
        console.log('Fallback teachers found:', teachers.length);
        return { success: true, data: teachers };
      } catch (err2) {
        console.log('All fallbacks failed:', err2.message);
        // Return empty array instead of error
        return { success: true, data: [] };
      }
    }
    console.error('Error getting course teachers:', error);
    return { success: false, error: error.message };
  }
});

// Get course details with fallback
ipcMain.handle('get-course-details', async (event, token, courseId) => {
  try {
    console.log('Getting course details for course:', courseId);
    const baseUrl = getBaseUrl();
    const viewurl = `${baseUrl}/course/view.php?id=${courseId}`;
    const enrolurl = `${baseUrl}/enrol/index.php?id=${courseId}`;
    
    // Try core_course_get_courses_by_field first
    try {
      const response = await moodleRest(token, {
        wsfunction: 'core_course_get_courses_by_field',
        field: 'id',
        value: String(courseId)
      });
      
      console.log('Course details response:', response);
      
      if (response.error) {
        throw new Error(response.error);
      }

      const course = (response && Array.isArray(response.courses)) ? 
        response.courses.find(c => Number(c.id) === courseId) : null;
      
      if (course) {
        return { 
          success: true, 
          data: { 
            ...course, 
            viewurl, 
            enrolurl 
          } 
        };
      }
    } catch (error) {
      console.log('core_course_get_courses_by_field failed, trying fallback:', error.message);
    }
    
    // Fallback: try core_course_get_courses
    try {
      const response = await moodleRest(token, {
        wsfunction: 'core_course_get_courses',
        options: { ids: [courseId] }
      });
      
      console.log('Course details fallback response:', response);
      
      if (response.error) {
        throw new Error(response.error);
      }

      const course = (response && Array.isArray(response)) ? 
        response.find(c => Number(c.id) === courseId) : null;
      
      if (course) {
        return { 
          success: true, 
          data: { 
            ...course, 
            viewurl, 
            enrolurl 
          } 
        };
      }
    } catch (error) {
      console.log('core_course_get_courses fallback failed:', error.message);
    }

    // Fallback 2: try to get summary from first section of course contents
    try {
      const sections = await moodleRest(token, {
        wsfunction: 'core_course_get_contents',
        courseid: courseId,
      });
      const first = Array.isArray(sections) ? sections.find(s => s.summary) : null;
      const summary = first?.summary || '';
      return {
        success: true,
        data: {
          id: courseId,
          fullname: `Course ${courseId}`,
          shortname: `C${courseId}`,
          summary,
          viewurl,
          enrolurl,
        }
      };
    } catch {}
    
    // Final fallback: return minimal data
    console.log('Using minimal fallback for course details');
    return { 
      success: true, 
      data: { 
        id: courseId, 
        fullname: `Course ${courseId}`,
        shortname: `C${courseId}`,
        summary: '',
        viewurl, 
        enrolurl 
      } 
    };
    
  } catch (error) {
    console.error('Error getting course details:', error);
    return { success: false, error: error.message };
  }
});

// Get course announcements
ipcMain.handle('get-course-announcements', async (event, token, courseId) => {
  try {
    const baseUrl = getBaseUrl();
    const forums = await moodleRest(token, {
      wsfunction: 'mod_forum_get_forums_by_courses',
      courseids: [courseId]
    });
    
    if (forums.error) {
      return { success: false, error: forums.error };
    }

    const list = Array.isArray(forums) ? forums : [];
    const newsForum = list.find(f => 
      (f.type === 'news') || 
      /announcements|thông\s*báo|tin\s*tức/i.test(f.name || '')
    ) || list[0];
    
    if (!newsForum) {
      return { success: true, data: [] };
    }

    let discussionsResp;
    try {
      discussionsResp = await moodleRest(token, {
        wsfunction: 'mod_forum_get_forum_discussions_paginated',
        forumid: newsForum.id,
        page: 0,
        perpage: 50
      });
    } catch (e) {
      // Fallback older function name
      discussionsResp = await moodleRest(token, {
        wsfunction: 'mod_forum_get_forum_discussions',
        forumid: newsForum.id
      });
    }

    const discussions = discussionsResp && Array.isArray(discussionsResp.discussions) ? 
      discussionsResp.discussions : 
      (Array.isArray(discussionsResp) ? discussionsResp : []);
    
    const items = discussions.map(d => ({
      id: d.id || d.discussion || d.discussionid || 0,
      name: d.name || d.subject || '',
      userfullname: d.userfullname || d.user_fullname || '',
      timemodified: d.timemodified || d.modified || 0,
      url: `${baseUrl}/mod/forum/discuss.php?d=${d.discussion || d.id}`
    }));

    return { success: true, data: items };
  } catch (error) {
    console.error('Error getting course announcements:', error);
    return { success: false, error: error.message };
  }
});

// Smart Notifications IPC handlers
ipcMain.handle('get-notification-settings', () => {
  return notificationManager.notificationSettings;
});

ipcMain.handle('update-notification-settings', (event, settings) => {
  notificationManager.updateSettings(settings);
  return { success: true };
});

ipcMain.handle('test-notification', (event, title, message, type) => {
  notificationManager.showSmartNotification(title, message, type);
  return { success: true };
});

ipcMain.handle('check-assignment-changes', (event, assignments) => {
  const changes = notificationManager.detectAssignmentChanges(assignments);
  if (changes.length > 0) {
    notificationManager.processChanges(changes);
  }
  return { success: true, changes };
});

ipcMain.handle('check-content-changes', (event, content) => {
  const changes = notificationManager.detectContentChanges(content);
  if (changes.length > 0) {
    notificationManager.processChanges(changes);
  }
  return { success: true, changes };
});

// Assignment Enhancements IPC handlers
ipcMain.handle('get-assignment-enhancements', (event, assignmentId) => {
  try {
    const settings = store.get('settings', {});
    const enhancements = settings.assignmentEnhancements || {};
    return { success: true, data: enhancements[assignmentId] || {} };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('set-assignment-priority', (event, assignmentId, priority) => {
  try {
    const settings = store.get('settings', {});
    if (!settings.assignmentEnhancements) {
      settings.assignmentEnhancements = {};
    }
    if (!settings.assignmentEnhancements[assignmentId]) {
      settings.assignmentEnhancements[assignmentId] = {};
    }
    settings.assignmentEnhancements[assignmentId].priority = priority;
    store.set('settings', settings);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('set-assignment-notes', (event, assignmentId, notes) => {
  try {
    const settings = store.get('settings', {});
    if (!settings.assignmentEnhancements) {
      settings.assignmentEnhancements = {};
    }
    if (!settings.assignmentEnhancements[assignmentId]) {
      settings.assignmentEnhancements[assignmentId] = {};
    }
    settings.assignmentEnhancements[assignmentId].notes = notes;
    store.set('settings', settings);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('add-assignment-subtask', (event, assignmentId, subtask) => {
  try {
    const settings = store.get('settings', {});
    if (!settings.assignmentEnhancements) {
      settings.assignmentEnhancements = {};
    }
    if (!settings.assignmentEnhancements[assignmentId]) {
      settings.assignmentEnhancements[assignmentId] = { subtasks: [] };
    }
    if (!settings.assignmentEnhancements[assignmentId].subtasks) {
      settings.assignmentEnhancements[assignmentId].subtasks = [];
    }
    
    const newSubtask = {
      id: Date.now().toString(),
      text: subtask.text,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    settings.assignmentEnhancements[assignmentId].subtasks.push(newSubtask);
    store.set('settings', settings);
    return { success: true, data: newSubtask };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-assignment-subtask', (event, assignmentId, subtaskId, updates) => {
  try {
    const settings = store.get('settings', {});
    if (!settings.assignmentEnhancements || !settings.assignmentEnhancements[assignmentId]) {
      return { success: false, error: 'Assignment not found' };
    }
    
    const subtasks = settings.assignmentEnhancements[assignmentId].subtasks || [];
    const subtaskIndex = subtasks.findIndex(st => st.id === subtaskId);
    
    if (subtaskIndex === -1) {
      return { success: false, error: 'Subtask not found' };
    }
    
    settings.assignmentEnhancements[assignmentId].subtasks[subtaskIndex] = {
      ...subtasks[subtaskIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    store.set('settings', settings);
    return { success: true, data: settings.assignmentEnhancements[assignmentId].subtasks[subtaskIndex] };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-assignment-subtask', (event, assignmentId, subtaskId) => {
  try {
    const settings = store.get('settings', {});
    if (!settings.assignmentEnhancements || !settings.assignmentEnhancements[assignmentId]) {
      return { success: false, error: 'Assignment not found' };
    }
    
    const subtasks = settings.assignmentEnhancements[assignmentId].subtasks || [];
    settings.assignmentEnhancements[assignmentId].subtasks = subtasks.filter(st => st.id !== subtaskId);
    
    store.set('settings', settings);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('set-assignment-reminder', (event, assignmentId, reminder) => {
  try {
    const settings = store.get('settings', {});
    if (!settings.assignmentEnhancements) {
      settings.assignmentEnhancements = {};
    }
    if (!settings.assignmentEnhancements[assignmentId]) {
      settings.assignmentEnhancements[assignmentId] = {};
    }
    settings.assignmentEnhancements[assignmentId].reminder = reminder;
    store.set('settings', settings);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// AI Assistant System
class AIAssistant {
  constructor() {
    this.summaries = new Map();
    this.studyPlans = new Map();
    this.aiSettings = {
      enabled: true,
      autoSummarize: true,
      generateStudyPlans: true,
      language: 'vi',
      model: 'local' // 'local' or 'api'
    };
  }

  // Summarize content using local AI logic
  summarizeContent(content, type = 'announcement') {
    try {
      const words = content.split(' ');
      const keyWords = this.extractKeywords(content);
      const sentiment = this.analyzeSentiment(content);
      
      let summary = '';
      
      switch (type) {
        case 'announcement':
          summary = this.summarizeAnnouncement(content, keyWords);
          break;
        case 'assignment':
          summary = this.summarizeAssignment(content, keyWords);
          break;
        case 'resource':
          summary = this.summarizeResource(content, keyWords);
          break;
        default:
          summary = this.summarizeGeneric(content, keyWords);
      }
      
      return {
        summary,
        keyWords,
        sentiment,
        wordCount: words.length,
        confidence: this.calculateConfidence(content, summary)
      };
    } catch (error) {
      console.error('AI Summarization error:', error);
      return {
        summary: 'Không thể tóm tắt nội dung này.',
        keyWords: [],
        sentiment: 'neutral',
        wordCount: 0,
        confidence: 0
      };
    }
  }

  // Extract keywords from content
  extractKeywords(content) {
    const stopWords = new Set([
      'và', 'của', 'cho', 'với', 'từ', 'đến', 'trong', 'trên', 'dưới', 'sau', 'trước',
      'này', 'đó', 'đây', 'khi', 'nếu', 'thì', 'mà', 'để', 'được', 'có', 'là', 'đã',
      'sẽ', 'phải', 'cần', 'nên', 'không', 'chưa', 'chỉ', 'cũng', 'rất', 'quá', 'như',
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'
    ]);
    
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
    
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  // Analyze sentiment
  analyzeSentiment(content) {
    const positiveWords = ['tốt', 'tuyệt', 'xuất sắc', 'hoàn hảo', 'thành công', 'đạt', 'vượt', 'cao'];
    const negativeWords = ['xấu', 'tệ', 'thất bại', 'thấp', 'kém', 'không đạt', 'thiếu', 'lỗi'];
    
    const lowerContent = content.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Summarize announcement
  summarizeAnnouncement(content, keyWords) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length <= 2) {
      return content.length > 100 ? content.substring(0, 100) + '...' : content;
    }
    
    // Find most important sentences based on keywords
    const scoredSentences = sentences.map(sentence => {
      const score = keyWords.reduce((acc, keyword) => {
        return acc + (sentence.toLowerCase().includes(keyword) ? 1 : 0);
      }, 0);
      return { sentence: sentence.trim(), score };
    });
    
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(s => s.sentence);
    
    return topSentences.join('. ') + (topSentences.length > 0 ? '.' : '');
  }

  // Summarize assignment
  summarizeAssignment(content, keyWords) {
    const deadlineMatch = content.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/);
    const deadline = deadlineMatch ? deadlineMatch[0] : 'Không rõ deadline';
    
    const requirements = this.extractRequirements(content);
    const summary = `Bài tập với deadline ${deadline}. ${requirements}`;
    
    return summary;
  }

  // Summarize resource
  summarizeResource(content, keyWords) {
    const typeMatch = content.match(/(tài liệu|bài giảng|slide|video|file|document)/i);
    const type = typeMatch ? typeMatch[0] : 'Tài liệu';
    
    return `${type} mới được chia sẻ. Từ khóa chính: ${keyWords.slice(0, 3).join(', ')}.`;
  }

  // Generic summarization
  summarizeGeneric(content, keyWords) {
    const firstSentence = content.split(/[.!?]+/)[0];
    return firstSentence.length > 150 
      ? firstSentence.substring(0, 150) + '...'
      : firstSentence;
  }

  // Extract requirements from assignment content
  extractRequirements(content) {
    const requirements = [];
    
    if (content.includes('word') || content.includes('từ')) {
      const wordMatch = content.match(/(\d+)\s*(word|từ)/i);
      if (wordMatch) requirements.push(`Yêu cầu ${wordMatch[1]} từ`);
    }
    
    if (content.includes('page') || content.includes('trang')) {
      const pageMatch = content.match(/(\d+)\s*(page|trang)/i);
      if (pageMatch) requirements.push(`${pageMatch[1]} trang`);
    }
    
    if (content.includes('format') || content.includes('định dạng')) {
      requirements.push('Có yêu cầu định dạng');
    }
    
    return requirements.length > 0 ? requirements.join(', ') : 'Chi tiết trong nội dung';
  }

  // Calculate confidence score
  calculateConfidence(content, summary) {
    const contentLength = content.length;
    const summaryLength = summary.length;
    const compressionRatio = summaryLength / contentLength;
    
    // Higher confidence for better compression ratios
    return Math.min(0.9, Math.max(0.3, 1 - compressionRatio));
  }

  // Generate study plan
  generateStudyPlan(assignments, courses) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const upcomingAssignments = assignments
        .filter(a => a.duedate && a.duedate > now && a.status !== 'submitted')
        .sort((a, b) => a.duedate - b.duedate);

      if (upcomingAssignments.length === 0) {
        return {
          plan: 'Không có bài tập nào sắp đến hạn.',
          suggestions: ['Tận dụng thời gian để ôn tập kiến thức cũ', 'Chuẩn bị cho các bài tập sắp tới']
        };
      }

      const urgentAssignments = upcomingAssignments.filter(a => {
        const daysLeft = (a.duedate - now) / (24 * 60 * 60);
        return daysLeft <= 3;
      });

      const studyPlan = this.createStudySchedule(upcomingAssignments, courses);
      const suggestions = this.generateStudySuggestions(upcomingAssignments, urgentAssignments);

      return {
        plan: studyPlan,
        suggestions,
        urgentCount: urgentAssignments.length,
        totalUpcoming: upcomingAssignments.length
      };
    } catch (error) {
      console.error('Study plan generation error:', error);
      return {
        plan: 'Không thể tạo lịch ôn tập.',
        suggestions: ['Vui lòng thử lại sau']
      };
    }
  }

  // Create study schedule
  createStudySchedule(assignments, courses) {
    const schedule = [];
    const now = Math.floor(Date.now() / 1000);
    
    assignments.slice(0, 5).forEach(assignment => {
      const course = courses.find(c => c.id === assignment.course);
      const courseName = course ? course.fullname : 'Unknown Course';
      const daysLeft = Math.ceil((assignment.duedate - now) / (24 * 60 * 60));
      
      let priority = 'Trung bình';
      if (daysLeft <= 1) priority = 'Cao';
      else if (daysLeft <= 3) priority = 'Trung bình';
      else priority = 'Thấp';
      
      schedule.push({
        assignment: assignment.name,
        course: courseName,
        daysLeft,
        priority,
        recommendation: this.getStudyRecommendation(daysLeft, assignment)
      });
    });
    
    return schedule;
  }

  // Get study recommendation based on time left
  getStudyRecommendation(daysLeft, assignment) {
    if (daysLeft <= 1) {
      return 'Làm ngay hôm nay - deadline gần kề!';
    } else if (daysLeft <= 3) {
      return 'Ưu tiên cao - bắt đầu làm trong 1-2 ngày tới';
    } else if (daysLeft <= 7) {
      return 'Lên kế hoạch chi tiết và bắt đầu nghiên cứu';
    } else {
      return 'Có thể bắt đầu sớm để tránh áp lực cuối kỳ';
    }
  }

  // Generate study suggestions
  generateStudySuggestions(upcoming, urgent) {
    const suggestions = [];
    
    if (urgent.length > 0) {
      suggestions.push(`⚠️ Có ${urgent.length} bài tập deadline trong 3 ngày tới - cần ưu tiên cao!`);
    }
    
    if (upcoming.length > 5) {
      suggestions.push('📚 Có nhiều bài tập sắp tới - nên lập kế hoạch chi tiết');
    }
    
    const courses = [...new Set(upcoming.map(a => a.course))];
    if (courses.length > 3) {
      suggestions.push('🎯 Bài tập từ nhiều môn học - cần phân bổ thời gian hợp lý');
    }
    
    suggestions.push('💡 Gợi ý: Làm bài tập theo thứ tự deadline gần nhất');
    suggestions.push('⏰ Đặt nhắc nhở để không bỏ lỡ deadline');
    
    return suggestions;
  }

  // Cache summary
  cacheSummary(contentId, summary) {
    this.summaries.set(contentId, {
      ...summary,
      timestamp: Date.now()
    });
  }

  // Get cached summary
  getCachedSummary(contentId) {
    const cached = this.summaries.get(contentId);
    if (cached && (Date.now() - cached.timestamp) < 24 * 60 * 60 * 1000) { // 24 hours
      return cached;
    }
    return null;
  }
}

// Initialize AI Assistant
const aiAssistant = new AIAssistant();

// AI Assistant IPC handlers
ipcMain.handle('ai-summarize-content', (event, content, type) => {
  try {
    const summary = aiAssistant.summarizeContent(content, type);
    return { success: true, data: summary };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ai-generate-study-plan', (event, assignments, courses) => {
  try {
    const studyPlan = aiAssistant.generateStudyPlan(assignments, courses);
    return { success: true, data: studyPlan };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ai-get-cached-summary', (event, contentId) => {
  try {
    const cached = aiAssistant.getCachedSummary(contentId);
    return { success: true, data: cached };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ai-cache-summary', (event, contentId, summary) => {
  try {
    aiAssistant.cacheSummary(contentId, summary);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Lấy danh sách tài khoản đã lưu
ipcMain.handle('get-saved-accounts', () => {
  const accounts = store.get('accounts', {});
  return Object.keys(accounts).map(studentId => ({
    studentId,
    username: accounts[studentId]?.username || studentId,
    fullname: accounts[studentId]?.fullname || accounts[studentId]?.username || studentId
  }));
});

// Đăng nhập bằng mã số sinh viên
ipcMain.handle('login-with-student-id', async (event, studentId) => {
  const accounts = store.get('accounts', {});
  const account = accounts[studentId];
  
  if (!account) {
    return { success: false, error: 'Tài khoản chưa được đăng ký' };
  }
  
  try {
    // Kiểm tra token còn hợp lệ không
    const siteInfo = await moodleRest(account.token, { wsfunction: 'core_webservice_get_site_info' });
    
    // Cập nhật thông tin nếu cần
    accounts[studentId] = {
      ...account,
      username: siteInfo.username,
      fullname: siteInfo.fullname,
      userid: siteInfo.userid,
      lastLogin: new Date().toISOString()
    };
    store.set('accounts', accounts);
    
    return { success: true, userInfo: siteInfo, token: account.token };
  } catch (error) {
    return { success: false, error: 'Token đã hết hạn hoặc không hợp lệ' };
  }
});

// Xóa tài khoản
ipcMain.handle('remove-account', (event, studentId) => {
  const accounts = store.get('accounts', {});
  delete accounts[studentId];
  store.set('accounts', accounts);
  return { success: true };
});

// Lấy thông tin site
ipcMain.handle('get-site-info', async (event, token) => {
  try {
    const data = await moodleRest(token, { wsfunction: 'core_webservice_get_site_info' });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Lấy danh sách categories
ipcMain.handle('get-categories', async (event, token, parentId) => {
  try {
    const params = { wsfunction: 'core_course_get_categories' };
    if (parentId) {
      params.criteria = [{ key: 'parent', value: parentId }];
    }
    const data = await moodleRest(token, params);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Lấy categories theo IDs
ipcMain.handle('get-categories-by-ids', async (event, token, ids) => {
  try {
    const data = await moodleRest(token, {
      wsfunction: 'core_course_get_categories',
      criteria: [{ key: 'ids', value: ids.join(',') }]
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Lấy khóa học của user
ipcMain.handle('get-user-courses', async (event, token, userId) => {
  try {
    const data = await moodleRest(token, {
      wsfunction: 'core_enrol_get_users_courses',
      userid: userId
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// (Removed duplicate 'get-assignments' and 'get-assignment-status' handlers)


// Mở URL trong browser ngoài
ipcMain.handle('open-external', async (event, url) => {
  try {
    const { shell } = require('electron');
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Kiểm tra kết nối
ipcMain.handle('check-connection', async (event, token) => {
  try {
    const info = await moodleRest(token, { wsfunction: 'core_webservice_get_site_info' });
    return { 
      success: true, 
      data: { 
        userid: info.userid, 
        sitename: info.fullname, 
        siteurl: info.siteurl 
      } 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-app-version', () => {
  try {
    return app.getVersion();
  } catch (e) {
    return null;
  }
});

app.whenReady().then(() => {
  createWindow();
  notificationManager.init();

  // Auto Update: check on startup
  try {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.checkForUpdatesAndNotify();
  } catch (e) {
    console.warn('AutoUpdater init failed:', e.message);
  }
});

// Auto-start with Windows
ipcMain.handle('get-auto-start', async () => {
  try {
    const settings = app.getLoginItemSettings();
    return { success: true, enabled: settings.openAtLogin };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('set-auto-start', async (event, enabled) => {
  try {
    app.setLoginItemSettings({ openAtLogin: Boolean(enabled) });
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// Import ICS file from dialog
ipcMain.handle('import-ics-file', async () => {
  try {
    const win = BrowserWindow.getFocusedWindow() || (typeof mainWindow !== 'undefined' ? mainWindow : undefined);
    const options = {
      title: 'Chọn file thời khóa biểu (*.ics)',
      filters: [{ name: 'iCalendar', extensions: ['ics'] }],
      properties: ['openFile']
    };
    const res = win ? await dialog.showOpenDialog(win, options) : await dialog.showOpenDialog(options);
    if (res.canceled || !res.filePaths || !res.filePaths[0]) {
      return { success: false, cancelled: true };
    }
    const filePath = res.filePaths[0];
    const content = fs.readFileSync(filePath, 'utf8');
    store.set('timetable.ics', content);
    return { success: true, content, filePath };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Auto Update events
autoUpdater.on('update-available', info => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-available', info);
  }
});

autoUpdater.on('download-progress', progressObj => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', info => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-downloaded', info);
  }
});

ipcMain.handle('check-for-updates', async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    return { success: true, data: result?.updateInfo };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('quit-and-install', () => {
  try {
    autoUpdater.quitAndInstall();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
