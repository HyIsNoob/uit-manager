const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Account management
  saveAccount: (studentId, token) => ipcRenderer.invoke('save-account', studentId, token),
  getSavedAccounts: () => ipcRenderer.invoke('get-saved-accounts'),
  loginWithStudentId: (studentId) => ipcRenderer.invoke('login-with-student-id', studentId),
  removeAccount: (studentId) => ipcRenderer.invoke('remove-account', studentId),
  
  // Moodle API
  getSiteInfo: (token) => ipcRenderer.invoke('get-site-info', token),
  getCategories: (token, parentId) => ipcRenderer.invoke('get-categories', token, parentId),
  getCategoriesByIds: (token, ids) => ipcRenderer.invoke('get-categories-by-ids', token, ids),
  getUserCourses: (token, userId) => ipcRenderer.invoke('get-user-courses', token, userId),
  getAssignments: (token, courseIds) => ipcRenderer.invoke('get-assignments', token, courseIds),
  getAssignmentStatus: (token, assignId, userId) => ipcRenderer.invoke('get-assignment-status', token, assignId, userId),
  getCourseContents: (token, courseId) => ipcRenderer.invoke('get-course-contents', token, courseId),
  getCourseTeachers: (token, courseId) => ipcRenderer.invoke('get-course-teachers', token, courseId),
  getCourseDetails: (token, courseId) => ipcRenderer.invoke('get-course-details', token, courseId),
  getCourseAnnouncements: (token, courseId) => ipcRenderer.invoke('get-course-announcements', token, courseId),
  // Group assignments (user defined)
  getGroupAssignments: () => ipcRenderer.invoke('get-group-assignments'),
  setGroupAssignment: (assignmentId, isGroup) => ipcRenderer.invoke('set-group-assignment', assignmentId, isGroup),
  // Assignments cache
  getAssignmentsCache: (userId, courseIds) => ipcRenderer.invoke('get-assignments-cache', userId, courseIds),
  setAssignmentsCache: (userId, courseId, data) => ipcRenderer.invoke('set-assignments-cache', userId, courseId, data),
  
  // Smart Notifications
  getNotificationSettings: () => ipcRenderer.invoke('get-notification-settings'),
  updateNotificationSettings: (settings) => ipcRenderer.invoke('update-notification-settings', settings),
  testNotification: (title, message, type) => ipcRenderer.invoke('test-notification', title, message, type),
  checkAssignmentChanges: (assignments) => ipcRenderer.invoke('check-assignment-changes', assignments),
  checkContentChanges: (content) => ipcRenderer.invoke('check-content-changes', content),
  
  // Assignment Enhancements
  getAssignmentEnhancements: (assignmentId) => ipcRenderer.invoke('get-assignment-enhancements', assignmentId),
  setAssignmentPriority: (assignmentId, priority) => ipcRenderer.invoke('set-assignment-priority', assignmentId, priority),
  setAssignmentNotes: (assignmentId, notes) => ipcRenderer.invoke('set-assignment-notes', assignmentId, notes),
  addAssignmentSubtask: (assignmentId, subtask) => ipcRenderer.invoke('add-assignment-subtask', assignmentId, subtask),
  updateAssignmentSubtask: (assignmentId, subtaskId, updates) => ipcRenderer.invoke('update-assignment-subtask', assignmentId, subtaskId, updates),
  deleteAssignmentSubtask: (assignmentId, subtaskId) => ipcRenderer.invoke('delete-assignment-subtask', assignmentId, subtaskId),
  setAssignmentReminder: (assignmentId, reminder) => ipcRenderer.invoke('set-assignment-reminder', assignmentId, reminder),
  
  // AI Assistant
  aiSummarizeContent: (content, type) => ipcRenderer.invoke('ai-summarize-content', content, type),
  aiGenerateStudyPlan: (assignments, courses) => ipcRenderer.invoke('ai-generate-study-plan', assignments, courses),
  aiGetCachedSummary: (contentId) => ipcRenderer.invoke('ai-get-cached-summary', contentId),
  aiCacheSummary: (contentId, summary) => ipcRenderer.invoke('ai-cache-summary', contentId, summary),
  checkConnection: (token) => ipcRenderer.invoke('check-connection', token),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  // Auto update
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  getSetting: (key) => ipcRenderer.invoke('get-setting', key),
  setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
  setBaseUrl: (url) => ipcRenderer.invoke('set-setting', 'baseUrl', url),
  setMinimizeToTray: (enabled) => ipcRenderer.invoke('set-setting', 'minimizeToTray', enabled),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  // Windows Auto-start
  getAutoStart: () => ipcRenderer.invoke('get-auto-start'),
  setAutoStart: (enabled) => ipcRenderer.invoke('set-auto-start', enabled),
  // Import ICS
  importIcsFile: () => ipcRenderer.invoke('import-ics-file'),

  // Word-backed Notes (RTF)
  ensureCourseNoteDoc: (courseId, courseName) => ipcRenderer.invoke('ensure-course-note-doc', courseId, courseName),
  deleteCourseNoteDoc: (courseId) => ipcRenderer.invoke('delete-course-note-doc', courseId),
  ensureAssignmentNoteDoc: (assignmentId, name) => ipcRenderer.invoke('ensure-assignment-note-doc', assignmentId, name),
  deleteAssignmentNoteDoc: (assignmentId) => ipcRenderer.invoke('delete-assignment-note-doc', assignmentId),

  // Custom manual deadlines
  getCustomDeadlines: () => ipcRenderer.invoke('get-custom-deadlines'),
  createCustomDeadline: (payload) => ipcRenderer.invoke('create-custom-deadline', payload),
  updateCustomDeadline: (id, updates) => ipcRenderer.invoke('update-custom-deadline', id, updates),
  toggleCompleteCustomDeadline: (id, completed) => ipcRenderer.invoke('toggle-complete-custom-deadline', id, completed),
  deleteCustomDeadline: (id) => ipcRenderer.invoke('delete-custom-deadline', id),

  // Survey Tools
  startSurvey: (credentials) => ipcRenderer.invoke('start-survey', credentials),
  pauseSurvey: () => ipcRenderer.invoke('pause-survey'),
  resumeSurvey: () => ipcRenderer.invoke('resume-survey'),
  stopSurvey: () => ipcRenderer.invoke('stop-survey'),
  onSurveyLog: (callback) => ipcRenderer.on('survey-log', (e, message) => callback(message)),
  onSurveyStatus: (callback) => ipcRenderer.on('survey-status', (e, status) => callback(status)),

  // Events
  onHasSavedAccounts: (callback) => ipcRenderer.on('has-saved-accounts', callback),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (e, info) => callback(info)),
  onUpdateProgress: (callback) => ipcRenderer.on('update-download-progress', (e, p) => callback(p)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (e, info) => callback(info)),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
