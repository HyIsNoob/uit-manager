// Global state
const appState = {
    currentUser: null,
    currentToken: null,
    siteInfo: null,
    baseUrl: 'https://courses.uit.edu.vn',
    categories: [],
    semesters: [],
    courses: [],
    assignments: [],
    categoryMap: new Map(),
    courseSemMap: new Map(),
    coursesByCategory: new Map(),
    lastCheckTime: null,
    pollingInterval: null,
    showGroupOnly: false,
    userGroupAssignments: new Map(),
    currentWeek: new Date(),
    dashboardData: {
        urgentAssignments: [],
        upcomingAssignments: [],
        completedAssignments: [],
        completionRate: 0,
        semesterProgress: 0
    },
    breadcrumb: [],
    searchQuery: '',
    currentCourse: null,
};

// DOM elements
const elements = {
    loadingScreen: document.getElementById('loading-screen'),
    loginScreen: document.getElementById('login-screen'),
    mainApp: document.getElementById('main-app'),
    
    // Login form elements
    newUserForm: document.getElementById('new-user-form'),
    existingUserForm: document.getElementById('existing-user-form'),
    newStudentId: document.getElementById('new-student-id'),
    newToken: document.getElementById('new-token'),
    studentId: document.getElementById('student-id'),
    registerBtn: document.getElementById('register-btn'),
    loginBtn: document.getElementById('login-btn'),
    switchToLogin: document.getElementById('switch-to-login'),
    switchToRegister: document.getElementById('switch-to-register'),
    removeAccountBtn: document.getElementById('remove-account-btn'),
    
    // Main app elements
    userName: document.getElementById('user-name'),
    logoutBtn: document.getElementById('logout-btn'),
    navItems: document.querySelectorAll('.nav-item'),
    contentSections: document.querySelectorAll('.content-section'),
    
    // Dashboard elements
    refreshDataBtn: document.getElementById('refresh-data-btn'),
    exportCalendarBtn: document.getElementById('export-calendar-btn'),
    urgentAssignments: document.getElementById('urgent-assignments'),
    upcomingAssignments: document.getElementById('upcoming-assignments'),
    completedAssignments: document.getElementById('completed-assignments'),
    completionRate: document.getElementById('completion-rate'),
    completionProgress: document.getElementById('completion-progress'),
    urgentToday: document.getElementById('urgent-today'),
    upcomingWeek: document.getElementById('upcoming-week'),
    weekCalendar: document.getElementById('week-calendar'),
    currentWeek: document.getElementById('current-week'),
    prevWeek: document.getElementById('prev-week'),
    nextWeek: document.getElementById('next-week'),
    semesterProgressFill: document.getElementById('semester-progress-fill'),
    semesterProgressText: document.getElementById('semester-progress-text'),
    semesterAssignments: document.getElementById('semester-assignments'),
    semesterCourses: document.getElementById('semester-courses'),
    semesterDaysLeft: document.getElementById('semester-days-left'),
    quickAssignments: document.getElementById('quick-assignments'),
    quickNotes: document.getElementById('quick-notes'),
    quickSchedule: document.getElementById('quick-schedule'),
    quickExport: document.getElementById('quick-export'),
    
    // Assignment elements
    semesterFilter: document.getElementById('semester-filter'),
    courseFilter: document.getElementById('course-filter'),
    statusFilter: document.getElementById('status-filter'),
    assignmentsList: document.getElementById('assignments-list'),
    toggleGroupBtn: document.getElementById('toggle-group-btn'),
    
    // Course elements
    coursesList: document.getElementById('courses-list'),
    semesterFilterCourses: document.getElementById('semester-filter-courses'),
    generalCoursesList: document.getElementById('general-courses-list'),
    semesterCoursesList: document.getElementById('semester-courses-list'),
    generalCount: document.getElementById('general-count'),
    semesterCount: document.getElementById('semester-count'),
    
    
    // Settings elements
    currentStudentId: document.getElementById('current-student-id'),
    currentUsername: document.getElementById('current-username'),
    changeAccountBtn: document.getElementById('change-account-btn'),
    allowInsecureTLS: document.getElementById('allow-insecure-tls'),
    baseUrlInput: document.getElementById('base-url-input'),
    enableNotifications: document.getElementById('enable-notifications'),
    pollingInterval: document.getElementById('polling-interval'),
    
    // Smart Notification elements
    enableToastNotifications: document.getElementById('enable-toast-notifications'),
    enableInAppNotifications: document.getElementById('enable-in-app-notifications'),
    enableNotificationSound: document.getElementById('enable-notification-sound'),
    notificationCheckInterval: document.getElementById('notification-check-interval'),
    notifyNewAssignments: document.getElementById('notify-new-assignments'),
    notifyNewContent: document.getElementById('notify-new-content'),
    notifyUpcomingDeadlines: document.getElementById('notify-upcoming-deadlines'),
    testNotificationBtn: document.getElementById('test-notification-btn'),
    clearNotificationHistoryBtn: document.getElementById('clear-notification-history-btn'),
    
    // Notification container
    notificationContainer: document.getElementById('notification-container'),
    
    // Sidebar elements
    sidebar: document.getElementById('sidebar'),
    sidebarUserName: document.getElementById('sidebar-user-name'),
    
    // Course Details Modal elements
    // Assignment Details Page
    assignmentDetailsSection: document.getElementById('assignment-details-section'),
    assignmentDetailsTitle: document.getElementById('assignment-details-title'),
    assignmentDetailsContent: document.getElementById('assignment-details-content'),
    openAssignmentBtn: document.getElementById('open-assignment-btn'),
    
    // Course Details Page
    courseDetailsSection: document.getElementById('course-details-section'),
    courseDetailsTitle: document.getElementById('course-details-title'),
    courseDetailsContent: document.getElementById('course-details-content'),
    openCourseBtn: document.getElementById('open-course-btn'),
    // Course meta elements
    courseInstructor: document.getElementById('course-instructor'),
    courseSemester: document.getElementById('course-semester')
};
// THEME
async function applyThemeFromSettings() {
    try {
        const settings = await window.electronAPI.getSettings();
        const theme = settings?.theme || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            const icon = toggle.querySelector('i');
            const label = toggle.querySelector('span');
            if (theme === 'dark') {
                icon.className = 'fas fa-sun';
                label.textContent = 'Light mode';
            } else {
                icon.className = 'fas fa-moon';
                label.textContent = 'Dark mode';
            }
        }
        // Apply TLS toggle UI
        if (elements.allowInsecureTLS) {
            elements.allowInsecureTLS.checked = Boolean(settings?.allowInsecureTLS);
        }
        if (elements.baseUrlInput) {
            elements.baseUrlInput.value = settings?.baseUrl || 'https://courses.uit.edu.vn';
        }
        if (elements.enableNotifications) {
            elements.enableNotifications.checked = settings?.enableNotifications !== false;
        }
        if (elements.pollingInterval) {
            elements.pollingInterval.value = settings?.pollingInterval || 5;
        }
    } catch (e) {
        console.error('Failed to apply theme', e);
    }
}

async function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    await window.electronAPI.setSetting('theme', next);
    applyThemeFromSettings();
}

// Utility functions
function updateSidebarUserInfo() {
    if (elements.sidebarUserName && appState.currentUser) {
        elements.sidebarUserName.textContent = appState.currentUser.fullname || 'Sinh viên';
    }
}

function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    }[type];
    
    const notificationId = Date.now().toString();
    
    notification.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    notification.id = `notification-${notificationId}`;
    
    // Add click event to dismiss notification
    notification.addEventListener('click', () => {
        dismissNotification(notificationId);
    });
    
    elements.notificationContainer.appendChild(notification);
    
    // Auto dismiss after duration
    const autoDismissTimer = setTimeout(() => {
        dismissNotification(notificationId);
    }, duration);
    
    // Store timer for manual dismissal
    notification.autoDismissTimer = autoDismissTimer;
}

function dismissNotification(notificationId) {
    const notification = document.getElementById(`notification-${notificationId}`);
    if (notification) {
        // Clear auto dismiss timer
        if (notification.autoDismissTimer) {
            clearTimeout(notification.autoDismissTimer);
        }
        
        // Add dismiss animation
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

function formatDate(timestamp) {
    if (!timestamp) return '-';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('vi-VN');
}

function formatDateShort(timestamp) {
    if (!timestamp) return '-';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('vi-VN');
}

// Helpers for assignment status used in details rendering
function getAssignmentStatus(assignment) {
    if (!assignment) return 'pending';
    if (assignment.isGroup) return 'group';
    if (assignment.isLate) return 'late';
    if (assignment.status === 'submitted' || assignment.isSubmitted) return 'submitted';
    return 'pending';
}

function getAssignmentStatusText(assignment) {
    const status = getAssignmentStatus(assignment);
    switch (status) {
        case 'group': return 'Bài tập nhóm';
        case 'late': return 'Nộp muộn';
        case 'submitted': return 'Đã nộp';
        default: return 'Chưa nộp';
    }
}

function isSemesterName(name) {
    if (!name) return false;
    const s = name.toLowerCase();
    return /(học\s*kỳ|hoc\s*ky|semester|hk\s?\d|hk\s?\d{4}|\d{4}-\d{4})/.test(s);
}

function parseSemesterName(name) {
    const result = { sem: null, y1: null, y2: null };
    if (!name) return result;
    
    const s = String(name);
    const semMatch = s.match(/(?:h[ọo]c\s*k[ỳy]|hk|semester)\s*(\d+)/i);
    if (semMatch) result.sem = Number(semMatch[1]);
    
    const yearMatch = s.match(/(\d{4})\s*[-/–]\s*(\d{4})/);
    if (yearMatch) {
        result.y1 = Number(yearMatch[1]);
        result.y2 = Number(yearMatch[2]);
    }
    
    return result;
}

// API functions
async function callAPI(method, ...args) {
    try {
        const result = await window.electronAPI[method](...args);
        if (!result.success) {
            throw new Error(result.error);
        }
        return result.data;
    } catch (error) {
        console.error(`API call failed: ${method}`, error);
        throw error;
    }
}

// Authentication functions
async function registerAccount(studentId, token) {
    try {
        elements.registerBtn.disabled = true;
        elements.registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        
        const result = await window.electronAPI.saveAccount(studentId, token);
        
        if (result.success) {
            showNotification('Đăng ký tài khoản thành công!', 'success');
            await loadSavedAccounts();
            switchToLoginForm();
            elements.newStudentId.value = '';
            elements.newToken.value = '';
        } else {
            showNotification(`Lỗi đăng ký: ${result.error}`, 'error');
        }
    } catch (error) {
        showNotification(`Lỗi đăng ký: ${error.message}`, 'error');
    } finally {
        elements.registerBtn.disabled = false;
        elements.registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> Đăng ký tài khoản';
    }
}

async function loginWithStudentId(studentId) {
    try {
        elements.loginBtn.disabled = true;
        elements.loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng nhập...';
        
        const result = await window.electronAPI.loginWithStudentId(studentId);
        
        if (result.success) {
            appState.currentUser = result.userInfo;
            appState.currentToken = result.token;
            appState.currentStudentId = studentId;
            
            showNotification(`Chào mừng ${result.userInfo.fullname}!`, 'success');
            await initializeApp();
        } else {
            showNotification(`Lỗi đăng nhập: ${result.error}`, 'error');
            return;
        }
    } catch (error) {
        showNotification(`Lỗi đăng nhập: ${error.message}`, 'error');
    } finally {
        elements.loginBtn.disabled = false;
        elements.loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Đăng nhập';
    }
}

async function loadSavedAccounts() {
    try {
        const accounts = await window.electronAPI.getSavedAccounts();
        elements.studentId.innerHTML = '<option value="">Chọn mã số sinh viên</option>';
        
        accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.studentId;
            option.textContent = `${account.studentId} - ${account.fullname}`;
            elements.studentId.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load saved accounts:', error);
    }
}

async function removeAccount() {
    const studentId = elements.studentId.value;
    if (!studentId) {
        showNotification('Vui lòng chọn tài khoản cần xóa', 'warning');
        return;
    }
    
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản ${studentId}?`)) {
        try {
            await window.electronAPI.removeAccount(studentId);
            showNotification('Xóa tài khoản thành công', 'success');
            await loadSavedAccounts();
        } catch (error) {
            showNotification(`Lỗi xóa tài khoản: ${error.message}`, 'error');
        }
    }
}

// Data loading functions
async function loadSiteInfo() {
    try {
        appState.siteInfo = await callAPI('getSiteInfo', appState.currentToken);
        return appState.siteInfo;
    } catch (error) {
        throw new Error(`Không thể tải thông tin site: ${error.message}`);
    }
}

async function loadUserCourses() {
    try {
        if (!appState.siteInfo?.userid) {
            throw new Error('Thiếu thông tin user ID');
        }
        
        appState.courses = await callAPI('getUserCourses', appState.currentToken, appState.siteInfo.userid);
        
        console.log(`Loaded ${appState.courses.length} courses:`, appState.courses.map(c => ({ id: c.id, name: c.fullname, category: c.category })));
        
        // Group courses by category
        appState.coursesByCategory.clear();
        appState.courses.forEach(course => {
            const catId = course.category || course.categoryid || 0;
            if (!appState.coursesByCategory.has(catId)) {
                appState.coursesByCategory.set(catId, []);
            }
            appState.coursesByCategory.get(catId).push(course);
        });
        
        return appState.courses;
    } catch (error) {
        throw new Error(`Không thể tải danh sách khóa học: ${error.message}`);
    }
}

async function fetchCategoriesByIds(ids) {
    if (!ids.length) return [];
    
    const missing = ids.filter(id => !appState.categoryMap.has(id));
    if (!missing.length) return [];
    
    try {
        const categories = await callAPI('getCategoriesByIds', appState.currentToken, missing);
        const arr = Array.isArray(categories) ? categories : [];
        arr.forEach(cat => appState.categoryMap.set(cat.id, cat));
        return arr;
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        return [];
    }
}

function getCategory(id) {
    return appState.categoryMap.get(id);
}

function findSemesterForCategory(catId) {
    let current = getCategory(catId);
    let steps = 0;
    
    while (current && steps < 10) {
        if (isSemesterName(current.name)) {
            return current.id;
        }
        const parentId = Number(current.parent || 0);
        if (!parentId) break;
        current = getCategory(parentId);
        steps++;
    }
    
    return null;
}

async function loadCategoriesForCourses() {
    const catIds = Array.from(new Set(
        appState.courses.map(c => c.category || c.categoryid).filter(Boolean)
    ));
    
    if (catIds.length === 0) {
        appState.categories = [];
        appState.semesters = [];
        return;
    }
    
    // Fetch course categories and their parents
    await fetchCategoriesByIds(catIds);
    let frontier = catIds.slice();
    
    for (let depth = 0; depth < 6; depth++) {
        const parents = Array.from(new Set(
            frontier.map(id => (getCategory(id) || {}).parent)
                .filter(pid => pid && !appState.categoryMap.has(pid))
        ));
        if (!parents.length) break;
        await fetchCategoriesByIds(parents);
        frontier = parents;
    }
    
    // Determine semester category for each course
    appState.courseSemMap.clear();
    const semesterIdsSet = new Set();
    
    for (const course of appState.courses) {
        const cid = Number(course.category || course.categoryid);
        let semId = cid ? findSemesterForCategory(cid) : null;
        
        // Fallback: check direct parent
        if (!semId && cid) {
            const cat = getCategory(cid);
            const parentId = cat ? Number(cat.parent || 0) : 0;
            if (parentId) {
                const parent = getCategory(parentId);
                if (parent && isSemesterName(parent.name)) {
                    semId = parent.id;
                }
            }
        }
        
        if (semId) {
            appState.courseSemMap.set(course.id, semId);
            semesterIdsSet.add(semId);
        }
    }
    
    const semesterIds = Array.from(semesterIdsSet);
    await fetchCategoriesByIds(semesterIds);
    
    appState.semesters = semesterIds.map(id => getCategory(id)).filter(Boolean);
    
    // Sort semesters
    appState.semesters.sort((a, b) => {
        const pa = parseSemesterName(a.name);
        const pb = parseSemesterName(b.name);
        
        const aParsed = (pa.y1 && pa.y2) ? 1 : 0;
        const bParsed = (pb.y1 && pb.y2) ? 1 : 0;
        
        if (aParsed !== bParsed) return bParsed - aParsed;
        
        if (aParsed) {
            if (pa.y1 !== pb.y1) return pa.y1 - pb.y1;
            if (pa.y2 !== pb.y2) return pa.y2 - pb.y2;
            const sa = pa.sem ?? 99;
            const sb = pb.sem ?? 99;
            if (sa !== sb) return sa - sb;
        }
        
        return (a.name || '').localeCompare(b.name || '');
    });
}

async function loadAssignmentsForCourse(courseId) {
    try {
        console.log(`Loading assignments for course ${courseId}`);
        const data = await callAPI('getAssignments', appState.currentToken, [courseId]);
        const course = (data.courses || []).find(c => c.id === Number(courseId));
        const assignments = course ? (course.assignments || []) : [];
        console.log(`Found ${assignments.length} assignments for course ${courseId}:`, assignments.map(a => ({ id: a.id, name: a.name })));
        
        // Get course contents to map cmid for assignments
        let courseContents = null;
        try {
            courseContents = await callAPI('getCourseContents', appState.currentToken, courseId);
            console.log('Course contents loaded for cmid mapping');
        } catch (error) {
            console.error('Error loading course contents for cmid mapping:', error);
        }
        
        // Create cmid mapping from course contents
        const cmidMap = new Map();
        if (courseContents && Array.isArray(courseContents)) {
            courseContents.forEach(section => {
                if (section.modules && Array.isArray(section.modules)) {
                    section.modules.forEach(module => {
                        if (module.modname === 'assign' && module.instance) {
                            cmidMap.set(module.instance, {
                                cmid: module.id,
                                url: module.url
                            });
                        }
                    });
                }
            });
        }
        
        // Load submission status and add cmid/url for each assignment
        const assignmentsWithStatus = await Promise.all(assignments.map(async (assignment) => {
            try {
                const status = await loadSubmissionStatus(assignment.id);
                
                // Add cmid and url from mapping
                const cmidInfo = cmidMap.get(assignment.id);
                const assignmentUrl = assignment.cmid ? 
                    `${appState.baseUrl}/mod/assign/view.php?id=${assignment.cmid}` :
                    (cmidInfo?.url || (cmidInfo?.cmid ? `${appState.baseUrl}/mod/assign/view.php?id=${cmidInfo.cmid}` : null));
                
                if (status && status.lastattempt) {
                    const la = status.lastattempt;
                    const sub = la.submission || {};
                    const isLate = Boolean(assignment.duedate && sub.status === 'submitted' && sub.timemodified > assignment.duedate);
                    
                    return {
                        ...assignment,
                        cmid: assignment.cmid || cmidInfo?.cmid,
                        url: assignmentUrl,
                        submissionStatus: status,
                        isSubmitted: sub.status === 'submitted',
                        isLate: isLate,
                        submittedTime: sub.timemodified || null,
                        timestarted: sub.timestarted || null,
                        timecreated: sub.timecreated || null
                    };
                } else {
                    return {
                        ...assignment,
                        cmid: assignment.cmid || cmidInfo?.cmid,
                        url: assignmentUrl,
                        submissionStatus: status,
                        isSubmitted: false,
                        isLate: false,
                        submittedTime: null,
                        timestarted: null,
                        timecreated: null
                    };
                }
            } catch (error) {
                console.error('Error loading assignment status:', error);
                const cmidInfo = cmidMap.get(assignment.id);
                const assignmentUrl = assignment.cmid ? 
                    `${appState.baseUrl}/mod/assign/view.php?id=${assignment.cmid}` :
                    (cmidInfo?.url || (cmidInfo?.cmid ? `${appState.baseUrl}/mod/assign/view.php?id=${cmidInfo.cmid}` : null));
                
                return {
                    ...assignment,
                    cmid: assignment.cmid || cmidInfo?.cmid,
                    url: assignmentUrl,
                    submissionStatus: null,
                    isSubmitted: false,
                    isLate: false,
                    submittedTime: null,
                    timestarted: null,
                    timecreated: null
                };
            }
        }));
        
        return assignmentsWithStatus;
    } catch (error) {
        console.error('Failed to load assignments:', error);
        return [];
    }
}

async function loadSubmissionStatus(assignId) {
    try {
        return await callAPI('getAssignmentStatus', appState.currentToken, assignId, appState.siteInfo.userid);
    } catch (error) {
        console.error('Failed to load submission status:', error);
        return null;
    }
}

async function mapWithConcurrency(items, limit, mapper) {
    const results = new Array(items.length);
    let i = 0;
    
    async function worker() {
        while (i < items.length) {
            const idx = i++;
            try {
                results[idx] = await mapper(items[idx], idx);
            } catch (e) {
                results[idx] = null;
            }
        }
    }
    
    const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
    await Promise.all(workers);
    return results;
}

// Smart Dashboard Functions
function calculateSmartStats() {
    const now = Math.floor(Date.now() / 1000);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // Calculate urgent assignments (due within 24 hours)
    const urgent = appState.assignments.filter(a => {
        if (!a.duedate || a.status === 'submitted' || a.isGroup) return false;
        const dueDate = new Date(a.duedate * 1000);
        return dueDate <= tomorrow && dueDate >= today;
    });
    
    // Calculate upcoming assignments (due within 7 days)
    const upcoming = appState.assignments.filter(a => {
        if (!a.duedate || a.status === 'submitted' || a.isGroup) return false;
        const dueDate = new Date(a.duedate * 1000);
        return dueDate <= nextWeek && dueDate > tomorrow;
    });
    
    // Calculate completed assignments
    const completed = appState.assignments.filter(a => a.status === 'submitted');
    
    // Calculate completion rate
    const total = appState.assignments.length;
    const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;
    
    // Update dashboard data
    appState.dashboardData = {
        urgentAssignments: urgent,
        upcomingAssignments: upcoming,
        completedAssignments: completed,
        completionRate: completionRate,
        semesterProgress: calculateSemesterProgress()
    };
    
    return appState.dashboardData;
}

function calculateSemesterProgress() {
    if (appState.semesters.length === 0) return 0;
    
    const currentSemester = appState.semesters[0]; // Latest semester
    const semesterCourses = appState.courses.filter(c => 
        appState.courseSemMap.get(c.id) === currentSemester.id
    );
    
    if (semesterCourses.length === 0) return 0;
    
    // Simple progress calculation based on completed assignments
    const semesterAssignments = appState.assignments.filter(a => {
        const course = appState.courses.find(c => c.id === a.course);
        return course && appState.courseSemMap.get(course.id) === currentSemester.id;
    });
    
    const completed = semesterAssignments.filter(a => a.status === 'submitted').length;
    return semesterAssignments.length > 0 ? Math.round((completed / semesterAssignments.length) * 100) : 0;
}

function updateSmartDashboard() {
    const stats = calculateSmartStats();
    
    // Update stat cards
    elements.urgentAssignments.textContent = stats.urgentAssignments.length;
    elements.upcomingAssignments.textContent = stats.upcomingAssignments.length;
    elements.completedAssignments.textContent = stats.completedAssignments.length;
    elements.completionRate.textContent = `${stats.completionRate}%`;
    
    // Update progress bar
    elements.completionProgress.style.width = `${stats.completionRate}%`;
    
    // Update focus content
    updateTodayFocus(stats);
    
    // Update week calendar
    updateWeekCalendar();
    
    // Update semester progress
    updateSemesterProgress();
}

function updateTodayFocus(stats) {
    // Urgent today
    if (stats.urgentAssignments.length > 0) {
        const urgentList = stats.urgentAssignments.slice(0, 3).map(a => a.name).join(', ');
        elements.urgentToday.textContent = urgentList + (stats.urgentAssignments.length > 3 ? '...' : '');
    } else {
        elements.urgentToday.textContent = 'Không có bài tập khẩn cấp';
    }
    
    // Upcoming week
    if (stats.upcomingAssignments.length > 0) {
        const upcomingList = stats.upcomingAssignments.slice(0, 3).map(a => a.name).join(', ');
        elements.upcomingWeek.textContent = upcomingList + (stats.upcomingAssignments.length > 3 ? '...' : '');
    } else {
        elements.upcomingWeek.textContent = 'Không có bài tập sắp đến hạn';
    }
}

function updateWeekCalendar() {
    const startOfWeek = new Date(appState.currentWeek);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        weekDays.push(day);
    }
    
    // Update week label
    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];
    elements.currentWeek.textContent = `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`;
    
    // Generate calendar HTML
    const calendarHTML = weekDays.map(day => {
        const dayAssignments = appState.assignments.filter(a => {
            if (!a.duedate) return false;
            const dueDate = new Date(a.duedate * 1000);
            return dueDate.toDateString() === day.toDateString();
        });
        
        const isToday = day.toDateString() === new Date().toDateString();
        const hasAssignments = dayAssignments.length > 0;
        
        return `
            <div class="calendar-day ${isToday ? 'today' : ''} ${hasAssignments ? 'has-assignments' : ''}" 
                 data-date="${day.toISOString().split('T')[0]}">
                <div class="day-number">${day.getDate()}</div>
                ${hasAssignments ? `<div class="day-assignments">${dayAssignments.length}</div>` : ''}
            </div>
        `;
    }).join('');
    
    elements.weekCalendar.innerHTML = calendarHTML;
}

function updateSemesterProgress() {
    if (appState.semesters.length === 0) return;
    
    const currentSemester = appState.semesters[0];
    const semesterCourses = appState.courses.filter(c => 
        appState.courseSemMap.get(c.id) === currentSemester.id
    );
    
    const semesterAssignments = appState.assignments.filter(a => {
        const course = appState.courses.find(c => c.id === a.course);
        return course && appState.courseSemMap.get(course.id) === currentSemester.id;
    });
    
    // Calculate days left in semester (rough estimate)
    const semesterEnd = new Date();
    semesterEnd.setMonth(semesterEnd.getMonth() + 3); // Assume 3 months per semester
    const daysLeft = Math.ceil((semesterEnd - new Date()) / (1000 * 60 * 60 * 24));
    
    // Update progress
    const progress = calculateSemesterProgress();
    elements.semesterProgressFill.style.width = `${progress}%`;
    elements.semesterProgressText.textContent = `${progress}%`;
    
    // Update stats
    elements.semesterAssignments.textContent = semesterAssignments.length;
    elements.semesterCourses.textContent = semesterCourses.length;
    elements.semesterDaysLeft.textContent = Math.max(0, daysLeft);
}

// Legacy function for backward compatibility
function updateDashboard() {
    updateSmartDashboard();
}

function updateSemesterFilter() {
    // Sort semesters: newest first (by parsed year/sem)
    const sorted = [...appState.semesters].sort((a, b) => {
        const pa = parseSemesterName(a.name);
        const pb = parseSemesterName(b.name);
        const key = (p) => [p.y1 || 0, p.y2 || 0, p.sem || 0];
        const [a1,a2,a3] = key(pa);
        const [b1,b2,b3] = key(pb);
        if (a1 !== b1) return b1 - a1;
        if (a2 !== b2) return b2 - a2;
        return (b3 - a3);
    });

    elements.semesterFilter.innerHTML = '<option value="">Tất cả học kỳ</option>';
    sorted.forEach(semester => {
        const option = document.createElement('option');
        option.value = semester.id;
        option.textContent = semester.name;
        elements.semesterFilter.appendChild(option);
    });
    
    // Populate semester filter for courses
    if (elements.semesterFilterCourses) {
        elements.semesterFilterCourses.innerHTML = '<option value="">Tất cả học kỳ</option>';
        sorted.forEach(semester => {
            const option = document.createElement('option');
            option.value = semester.id;
            option.textContent = semester.name;
            elements.semesterFilterCourses.appendChild(option);
        });
    }

    // Auto-select newest semester if available
    if (sorted.length > 0) {
        elements.semesterFilter.value = String(sorted[0].id);
    }
    // Update course filter based on selected semester
    handleSemesterChangeForCourses();
}

function updateCourseFilter() {
    elements.courseFilter.innerHTML = '<option value="">Tất cả môn học</option>';
    const selectedSemId = Number(elements.semesterFilter.value) || null;
    const filtered = selectedSemId ? appState.courses.filter(c => appState.courseSemMap.get(c.id) === selectedSemId) : appState.courses;
    filtered.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = course.fullname;
        elements.courseFilter.appendChild(option);
    });
}

function handleSemesterChangeForCourses() {
    updateCourseFilter();
    // if a specific course previously selected no longer belongs to semester, reset
    const selCourseId = Number(elements.courseFilter.value) || null;
    if (selCourseId && appState.courseSemMap.get(selCourseId) !== Number(elements.semesterFilter.value)) {
        elements.courseFilter.value = '';
    }
}

// Helper function to detect group assignments
function isGroupAssignment(assignment) {
    // Simple heuristic: check if assignment name contains keywords
    const groupKeywords = ['nhóm', 'group', 'team', 'tập thể'];
    const name = (assignment.name || '').toLowerCase();
    return groupKeywords.some(keyword => name.includes(keyword));
}

async function updateAssignmentsList() {
    const semesterId = elements.semesterFilter.value;
    const courseId = elements.courseFilter.value;
    const status = elements.statusFilter.value;
    
    elements.assignmentsList.innerHTML = `
        <div class="loading-placeholder">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Đang tải danh sách bài tập...</p>
        </div>
    `;
    
    try {
        let assignments = [];
        
        if (courseId) {
            // Load assignments for specific course
            assignments = await loadAssignmentsForCourse(courseId);
        } else if (semesterId) {
            // Load assignments for all courses in semester
            const semesterCourses = appState.courses.filter(c => 
                appState.courseSemMap.get(c.id) === Number(semesterId)
            );
            
            for (const course of semesterCourses) {
                const courseAssignments = await loadAssignmentsForCourse(course.id);
                assignments.push(...courseAssignments);
            }
        } else {
            // Load assignments for all courses
            for (const course of appState.courses) {
                const courseAssignments = await loadAssignmentsForCourse(course.id);
                assignments.push(...courseAssignments);
            }
        }
        
        // Load user-marked group assignments map
        const userGroupMap = await window.electronAPI.getGroupAssignments();

        // Load submission statuses
        const statuses = await mapWithConcurrency(assignments, 5, (assignment) => 
            loadSubmissionStatus(assignment.id)
        );
        
        // Process assignments with group detection
        let processedAssignments = assignments.map((assignment, idx) => {
            const userMark = Boolean(userGroupMap[String(assignment.id)]);
            const isGroup = userMark || isGroupAssignment(assignment);
            const submissionStatus = statuses[idx]?.lastattempt?.submission?.status || 'draft';
            const submission = statuses[idx]?.lastattempt?.submission || null;
            
            // For group assignments, don't consider them "late" even if past due date
            const isLate = !isGroup && submissionStatus === 'submitted' && 
                          assignment.duedate && 
                          submission?.timemodified > assignment.duedate;
            
            return {
                ...assignment,
                isGroup,
                status: submissionStatus,
                submission,
                isLate
            };
        });
        
        // Apply filters
        let filteredAssignments = processedAssignments;
        
        // Group filter
        if (appState.showGroupOnly) {
            filteredAssignments = filteredAssignments.filter(a => a.isGroup);
        }
        
        // Status filter
        if (status) {
            filteredAssignments = filteredAssignments.filter(assignment => {
                if (status === 'late') {
                    return assignment.isLate;
                } else if (status === 'group') {
                    return assignment.isGroup;
                }
                return assignment.status === status;
            });
        }
        
        // Render assignments
        if (filteredAssignments.length === 0) {
            elements.assignmentsList.innerHTML = '<p>Không có bài tập nào</p>';
            return;
        }
        
        elements.assignmentsList.innerHTML = filteredAssignments.map(assignment => {
            let statusClass = 'pending';
            let statusText = 'Chưa nộp';
            let statusIcon = 'fas fa-clock';
            
            if (assignment.isGroup) {
                statusClass = 'group';
                statusText = 'Bài tập nhóm';
                statusIcon = 'fas fa-users';
            } else if (assignment.status === 'submitted') {
                if (assignment.isLate) {
                    statusClass = 'late';
                    statusText = 'Nộp muộn';
                    statusIcon = 'fas fa-exclamation-triangle';
                } else {
                    statusClass = 'submitted';
                    statusText = 'Đã nộp';
                    statusIcon = 'fas fa-check-circle';
                }
            }
            
            const course = appState.courses.find(c => (c.id === assignment.course) || (c.id === assignment.courseid));
            const courseName = course ? (course.fullname || course.displayname || course.shortname) : 'Môn học';

            return `
                <div class="assignment-card ${statusClass}" data-assign-id="${assignment.id}">
                    <div class="assignment-header">
                        <div class="assignment-title">
                            ${assignment.isGroup ? '<i class="fas fa-users" style="margin-right: 8px; color: var(--group);"></i>' : ''}
                            ${assignment.name}
                            <span class="assignment-course-pill" title="${courseName}"><i class="fas fa-book"></i> ${courseName}</span>
                        </div>
                        <div class="assignment-header-right">
                            ${!assignment.isSubmitted ? `
                            <div class="countdown-chip" id="countdown-${assignment.id}">
                                <i class="fas fa-clock"></i>
                                <span class="countdown-text">-- ngày -- giờ -- phút</span>
                            </div>
                            ` : ''}
                            <div class="assignment-status status-${statusClass}">
                                <i class="${statusIcon}"></i>
                                ${statusText}
                            </div>
                        </div>
                    </div>
                    <div class="assignment-meta">
                        <div class="meta-item">
                            <div class="meta-label">Ngày giao</div>
                            <div class="meta-value">${formatDate(assignment.allowsubmissionsfromdate)}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">Hạn chót</div>
                            <div class="meta-value">${formatDate(assignment.duedate)}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">Loại</div>
                            <div class="meta-value">
                                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                                    <input type="checkbox" class="mark-group-checkbox" ${assignment.isGroup ? 'checked' : ''} />
                                    Bài tập nhóm
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="assignment-actions">
                        <button class="btn btn-outline btn-small" onclick="openAssignmentDetails('${assignment.id}')">
                            <i class="fas fa-cog"></i>
                            Chi tiết
                        </button>
                        <button class="btn btn-outline btn-small" onclick="openAssignment('${assignment.id}')">
                            <i class="fas fa-external-link-alt"></i>
                            Mở bài tập
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        // Attach listeners for group checkboxes
        Array.from(document.querySelectorAll('.assignment-card .mark-group-checkbox')).forEach((cb) => {
            cb.addEventListener('change', async (e) => {
                const card = e.target.closest('.assignment-card');
                const assignId = card ? Number(card.getAttribute('data-assign-id')) : null;
                if (!assignId) return;
                await window.electronAPI.setGroupAssignment(assignId, e.target.checked);
                showNotification(e.target.checked ? 'Đã đánh dấu bài tập nhóm' : 'Đã bỏ đánh dấu bài tập nhóm', 'success');
                updateAssignmentsList();
            });
        });
        
        // Initialize countdown timers for unsubmitted assignments
        filteredAssignments.forEach(assignment => {
            if (!assignment.isSubmitted) {
                initializeAssignmentCountdown(assignment.id, assignment.duedate);
            }
        });
        
    } catch (error) {
        elements.assignmentsList.innerHTML = `<p>Lỗi tải bài tập: ${error.message}</p>`;
    }
}

function updateCoursesList() {
    if (!appState.courses || appState.courses.length === 0) {
        elements.generalCoursesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <p>Chưa có khóa học nào</p>
            </div>
        `;
        elements.semesterCoursesList.innerHTML = '';
        return;
    }

    // Separate general and semester courses
    const generalCourses = appState.courses.filter(course => {
        const semester = appState.courseSemMap.get(course.id) ? 
            getCategory(appState.courseSemMap.get(course.id)) : null;
        return !semester;
    });
    
    const semesterCourses = appState.courses.filter(course => {
        const semester = appState.courseSemMap.get(course.id) ? 
            getCategory(appState.courseSemMap.get(course.id)) : null;
        return semester;
    });

    // Update counts
    elements.generalCount.textContent = generalCourses.length;
    elements.semesterCount.textContent = semesterCourses.length;

    // Render general courses
    if (generalCourses.length > 0) {
        elements.generalCoursesList.innerHTML = generalCourses.map(course => 
            createCourseCard(course)
        ).join('');
    } else {
        elements.generalCoursesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-globe"></i>
                <p>Chưa có khóa học chung nào</p>
            </div>
        `;
    }

    // Render semester courses
    if (semesterCourses.length > 0) {
        elements.semesterCoursesList.innerHTML = semesterCourses.map(course => 
            createCourseCard(course)
        ).join('');
    } else {
        elements.semesterCoursesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-alt"></i>
                <p>Chưa có khóa học theo kỳ nào</p>
            </div>
        `;
    }
}

function createCourseCard(course) {
    const semester = appState.courseSemMap.get(course.id) ? 
        getCategory(appState.courseSemMap.get(course.id)) : null;
    const semesterInfo = semester ? semester.name : 'Khóa học chung';
    const instructorInfo = course.instructor || 'Chưa có thông tin giảng viên';
    
    return `
        <div class="course-card-modern" onclick="openCourseDetails(${course.id})">
            <div class="course-card-header">
                <div>
                    <h3 class="course-title">${course.fullname}</h3>
                    <div class="course-code">${course.shortname}</div>
                </div>
            </div>
            <div class="course-meta">
                <div class="course-meta-item">
                    <i class="fas fa-user"></i>
                    <span>${instructorInfo}</span>
                </div>
                <div class="course-meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>${semesterInfo}</span>
                </div>
            </div>
            <div class="course-actions">
                <button class="btn btn-primary" onclick="event.stopPropagation(); openCourseDetails(${course.id})">
                    <i class="fas fa-eye"></i>
                    Xem chi tiết
                </button>
                <button class="btn btn-outline" onclick="event.stopPropagation(); openCourseInBrowser(${course.id})">
                    <i class="fas fa-external-link-alt"></i>
                    Mở web
                </button>
            </div>
        </div>
    `;
}

function updateSettings() {
    elements.currentStudentId.textContent = appState.currentStudentId || '-';
    elements.currentUsername.textContent = appState.currentUser?.fullname || '-';
    updateSidebarUserInfo();
}

// Navigation functions
function showSection(sectionName) {
    // Hide all sections (including new ones)
    const allSections = document.querySelectorAll('.content-section');
    allSections.forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        console.log('Showing section:', sectionName);
    } else {
        console.error('Section not found:', `${sectionName}-section`);
    }
    
    // Update navigation
    elements.navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
}


// Form switching functions
function switchToLoginForm() {
    elements.newUserForm.classList.add('hidden');
    elements.existingUserForm.classList.remove('hidden');
}

function switchToRegisterForm() {
    elements.existingUserForm.classList.add('hidden');
    elements.newUserForm.classList.remove('hidden');
}

// Load assignments for current semester only
async function loadAssignmentsForCurrentSemester() {
    try {
        appState.assignments = [];
        
        // Get current semester (latest one)
        const currentSemester = appState.semesters.length > 0 ? appState.semesters[0] : null;
        if (!currentSemester) {
            console.log('No current semester found');
            return;
        }
        
        // Get courses for current semester
        const currentSemesterCourses = appState.courses.filter(course => {
            const courseSemId = appState.courseSemMap.get(course.id);
            return courseSemId === currentSemester.id;
        });
        
        console.log(`Loading assignments for ${currentSemesterCourses.length} courses in current semester: ${currentSemester.name}`);
        
        // Show loading progress
        elements.assignmentsList.innerHTML = `
            <div class="loading-placeholder">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải bài tập từ học kỳ hiện tại...</p>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" id="assignment-progress-fill"></div>
                    </div>
                    <div class="progress-text" id="assignment-progress-text">0 / ${currentSemesterCourses.length} môn học</div>
                </div>
            </div>
        `;
        
        let loadedCourses = 0;
        
        // Load assignments for current semester courses only
        for (const course of currentSemesterCourses) {
            try {
                const assignments = await loadAssignmentsForCourse(course.id);
                appState.assignments.push(...assignments);
                
                // Update progress
                loadedCourses++;
                const progressPercent = (loadedCourses / currentSemesterCourses.length) * 100;
                const progressFill = document.getElementById('assignment-progress-fill');
                const progressText = document.getElementById('assignment-progress-text');
                
                if (progressFill && progressText) {
                    progressFill.style.width = `${progressPercent}%`;
                    progressText.textContent = `${loadedCourses} / ${currentSemesterCourses.length} môn học - ${course.fullname}`;
                }
                
            } catch (error) {
                console.error(`Failed to load assignments for course ${course.id}:`, error);
                loadedCourses++;
            }
        }
        
        console.log(`Loaded ${appState.assignments.length} assignments for current semester`);
        console.log('Assignments loaded:', appState.assignments.map(a => ({ id: a.id, name: a.name, course: a.course })));
        
    } catch (error) {
        console.error('Error loading assignments for current semester:', error);
        elements.assignmentsList.innerHTML = `<p>Lỗi tải bài tập: ${error.message}</p>`;
    }
}

// Load assignments for specific semester
async function loadAssignmentsForSemester(semesterId) {
    try {
        appState.assignments = [];
        
        // Get courses for specified semester
        const semesterCourses = appState.courses.filter(course => {
            const courseSemId = appState.courseSemMap.get(course.id);
            return courseSemId === semesterId;
        });
        
        console.log(`Loading assignments for ${semesterCourses.length} courses in semester: ${getCategory(semesterId)?.name}`);
        
        // Show loading progress
        elements.assignmentsList.innerHTML = `
            <div class="loading-placeholder">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải bài tập từ học kỳ ${getCategory(semesterId)?.name}...</p>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" id="assignment-progress-fill"></div>
                    </div>
                    <div class="progress-text" id="assignment-progress-text">0 / ${semesterCourses.length} môn học</div>
                </div>
            </div>
        `;
        
        let loadedCourses = 0;
        
        // Load assignments for semester courses
        for (const course of semesterCourses) {
            try {
                const assignments = await loadAssignmentsForCourse(course.id);
                appState.assignments.push(...assignments);
                
                // Update progress
                loadedCourses++;
                const progressPercent = (loadedCourses / semesterCourses.length) * 100;
                const progressFill = document.getElementById('assignment-progress-fill');
                const progressText = document.getElementById('assignment-progress-text');
                
                if (progressFill && progressText) {
                    progressFill.style.width = `${progressPercent}%`;
                    progressText.textContent = `${loadedCourses} / ${semesterCourses.length} môn học - ${course.fullname}`;
                }
                
            } catch (error) {
                console.error(`Failed to load assignments for course ${course.id}:`, error);
                loadedCourses++;
            }
        }
        
        console.log(`Loaded ${appState.assignments.length} assignments for semester`);
        console.log('Assignments loaded:', appState.assignments.map(a => ({ id: a.id, name: a.name, course: a.course })));
        
    } catch (error) {
        console.error('Error loading assignments for semester:', error);
        elements.assignmentsList.innerHTML = `<p>Lỗi tải bài tập: ${error.message}</p>`;
    }
}

// Main initialization
async function initializeApp() {
    try {
        showNotification('Đang tải dữ liệu...', 'info');
        
        // Load settings including baseUrl
        const settings = await window.electronAPI.getSettings();
        if (settings?.baseUrl) {
            appState.baseUrl = settings.baseUrl;
        }
        
        // Load basic data
        await loadSiteInfo();
        await loadUserCourses();
        await loadCategoriesForCourses();
        
        // Update UI
        elements.userName.textContent = appState.currentUser.fullname;
        updateDashboard();
        updateSemesterFilter();
        updateCourseFilter();
        updateCoursesList();
        updateSettings();
        
        // Switch to main app view
        if (elements.loginScreen && elements.mainApp) {
            elements.loginScreen.classList.add('hidden');
            elements.mainApp.classList.remove('hidden');
            showSection('dashboard');
        }

        // Load assignments for current semester only (for better performance)
        await loadAssignmentsForCurrentSemester();
        updateDashboard();

    // Populate instructor names asynchronously for visible courses
    populateCourseInstructors().catch(e => console.warn('Populate instructors failed:', e.message));
        
        showNotification('Tải dữ liệu thành công!', 'success');
        
        // Start polling for new content
        startPolling();
        
    } catch (error) {
        showNotification(`Lỗi khởi tạo ứng dụng: ${error.message}`, 'error');
        console.error('Initialization error:', error);
    }
}

// Fetch and fill instructor names for courses, updating UI as we go
async function populateCourseInstructors() {
    if (!appState.currentToken || !appState.courses.length) return;
    // Limit concurrency to avoid hammering the API
    const courses = [...appState.courses];
    const limit = 4;
    let index = 0;
    const worker = async () => {
        while (index < courses.length) {
            const i = index++;
            const course = courses[i];
            try {
                const teachers = await callAPI('getCourseTeachers', appState.currentToken, course.id);
                if (Array.isArray(teachers) && teachers.length > 0) {
                    const names = teachers.map(t => t.fullname).join(', ');
                    course.instructor = names;
                    // Update the course cards UI for this item if currently rendered
                    updateCoursesList();
                }
            } catch (e) {
                // Ignore errors; keep UI responsive
            }
        }
    };
    await Promise.all(Array.from({ length: Math.min(limit, courses.length) }, () => worker()));
}

// UNIFIED FEED FUNCTIONS
async function loadUnifiedFeed() {
    try {
        // Load content from current semester courses only (for better performance)
        const currentSemester = appState.semesters.length > 0 ? appState.semesters[0] : null;
        const coursesToLoad = currentSemester ? 
            appState.courses.filter(course => appState.courseSemMap.get(course.id) === currentSemester.id) :
            appState.courses;
        
        const totalCourses = coursesToLoad.length;
        let loadedCourses = 0;
        
        elements.feedContent.innerHTML = `
            <div class="loading-placeholder">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải nội dung từ môn học hiện tại...</p>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" id="feed-progress-fill"></div>
                    </div>
                    <div class="progress-text" id="feed-progress-text">0 / ${totalCourses} môn học</div>
                </div>
            </div>
        `;
        
        const allContent = [];
        
        console.log(`Loading unified feed content for ${coursesToLoad.length} courses in current semester`);
        console.log('Courses to load:', coursesToLoad.map(c => ({ id: c.id, name: c.fullname })));
        
        for (const course of coursesToLoad) {
            try {
                console.log(`Loading content for course ${course.id} (${course.fullname})`);
                const contents = await window.electronAPI.getCourseContents(appState.currentToken, course.id);
                const sections = Array.isArray(contents) ? contents : [];
                console.log(`Found ${sections.length} sections for course ${course.id}`);
                
                sections.forEach(section => {
                    (section.modules || []).forEach(module => {
                        if (['forum', 'resource', 'url', 'page'].includes(module.modname)) {
                            const contentItem = {
                                id: `${course.id}-${module.id}`,
                                type: module.modname,
                                title: module.name || 'Untitled',
                                description: module.description || '',
                                url: module.url || '#',
                                courseId: course.id,
                                courseName: course.fullname,
                                sectionName: section.name || 'General',
                                added: module.added || Date.now() / 1000,
                                modified: module.modified || Date.now() / 1000,
                                visible: module.visible !== 0,
                                searchableText: `${module.name} ${module.description} ${course.fullname}`.toLowerCase()
                            };
                            
                            if (contentItem.visible) {
                                allContent.push(contentItem);
                            }
                        }
                    });
                });
                
                // Update progress
                loadedCourses++;
                const progressPercent = (loadedCourses / totalCourses) * 100;
                const progressFill = document.getElementById('feed-progress-fill');
                const progressText = document.getElementById('feed-progress-text');
                
                if (progressFill && progressText) {
                    progressFill.style.width = `${progressPercent}%`;
                    progressText.textContent = `${loadedCourses} / ${totalCourses} môn học - ${course.fullname}`;
                }
                
            } catch (error) {
                console.error(`Failed to load content for course ${course.id}:`, error);
                loadedCourses++;
            }
        }
        
        // Sort by modification date (newest first)
        allContent.sort((a, b) => b.modified - a.modified);
        
        console.log(`Total content items loaded: ${allContent.length}`);
        console.log('Content items:', allContent.map(item => ({ id: item.id, title: item.title, type: item.type, course: item.courseName })));
        
        // Update feed data
        appState.feedData.allContent = allContent;
        appState.feedData.lastUpdated = new Date();
        
        // Build search index
        buildSearchIndex();
        
        // Apply current filters
        applyFeedFilters();
        
        // Update UI
        updateFeedUI();
        updateFeedStats();
        updateRecentContent();
        
        showNotification(`Đã tải ${allContent.length} nội dung từ ${coursesToLoad.length} môn học (học kỳ hiện tại)`, 'success');
        
    } catch (error) {
        elements.feedContent.innerHTML = `<p>Lỗi tải nội dung: ${error.message}</p>`;
        showNotification(`Lỗi tải nội dung: ${error.message}`, 'error');
    }
}

function buildSearchIndex() {
    appState.feedData.searchIndex.clear();
    
    appState.feedData.allContent.forEach((item, index) => {
        // Index by words in searchable text
        const words = item.searchableText.split(/\s+/);
        words.forEach(word => {
            if (word.length > 2) { // Only index words longer than 2 characters
                if (!appState.feedData.searchIndex.has(word)) {
                    appState.feedData.searchIndex.set(word, []);
                }
                appState.feedData.searchIndex.get(word).push(index);
            }
        });
    });
}

function applyFeedFilters() {
    let filtered = [...appState.feedData.allContent];
    
    // Apply type filter
    if (appState.feedData.currentFilters.type !== 'all') {
        filtered = filtered.filter(item => item.type === appState.feedData.currentFilters.type);
    }
    
    // Apply course filter
    if (appState.feedData.currentFilters.course) {
        const courseId = parseInt(appState.feedData.currentFilters.course);
        filtered = filtered.filter(item => item.courseId === courseId);
    }
    
    // Apply search filter
    if (appState.feedData.currentFilters.search) {
        const searchTerm = appState.feedData.currentFilters.search.toLowerCase();
        filtered = filtered.filter(item => 
            item.searchableText.includes(searchTerm)
        );
    }
    
    // Apply sorting
    switch (appState.feedData.currentFilters.sort) {
        case 'newest':
            filtered.sort((a, b) => b.modified - a.modified);
            break;
        case 'oldest':
            filtered.sort((a, b) => a.modified - b.modified);
            break;
        case 'course':
            filtered.sort((a, b) => a.courseName.localeCompare(b.courseName));
            break;
        case 'type':
            filtered.sort((a, b) => a.type.localeCompare(b.type));
            break;
    }
    
    appState.feedData.filteredContent = filtered;
}

function updateFeedUI() {
    const content = appState.feedData.filteredContent;
    
    console.log('Feed UI Update:', {
        allContent: appState.feedData.allContent.length,
        filteredContent: content.length,
        filters: appState.feedData.currentFilters
    });
    
    if (content.length === 0) {
        if (appState.feedData.allContent.length === 0) {
            elements.feedContent.innerHTML = `
                <div class="loading-placeholder">
                    <i class="fas fa-info-circle"></i>
                    <p>Chưa có nội dung nào được tải. Vui lòng làm mới để tải nội dung.</p>
                </div>
            `;
        } else {
            elements.feedContent.innerHTML = `
                <div class="loading-placeholder">
                    <i class="fas fa-search"></i>
                    <p>Không tìm thấy nội dung nào phù hợp với bộ lọc hiện tại.</p>
                </div>
            `;
        }
        return;
    }
    
    elements.feedContent.innerHTML = content.map(item => {
        const typeIcon = {
            'forum': 'fas fa-bullhorn',
            'resource': 'fas fa-file-alt',
            'url': 'fas fa-link',
            'page': 'fas fa-file-text'
        }[item.type] || 'fas fa-file';
        
        const typeLabel = {
            'forum': 'Thông báo',
            'resource': 'Tài liệu',
            'url': 'Liên kết',
            'page': 'Trang'
        }[item.type] || item.type;
        
        return `
            <div class="feed-item" data-id="${item.id}">
                <div class="feed-item-header">
                    <div class="feed-item-type ${item.type}">
                        <i class="${typeIcon}"></i>
                        <span>${typeLabel}</span>
                    </div>
                    <div class="feed-item-actions">
                        <button class="btn btn-outline btn-small" onclick="openContent('${item.url}')">
                            <i class="fas fa-external-link-alt"></i>
                            Mở
                        </button>
                        <button class="btn btn-outline btn-small" onclick="saveContent('${item.id}')">
                            <i class="fas fa-bookmark"></i>
                            Lưu
                        </button>
                    </div>
                </div>
                <div class="feed-item-title">${item.title}</div>
                <div class="feed-item-course">
                    <i class="fas fa-graduation-cap"></i>
                    ${item.courseName}
                </div>
                ${item.description ? `<div class="feed-item-description">${item.description}</div>` : ''}
                <div class="feed-item-meta">
                    <span><i class="fas fa-calendar"></i> ${formatDate(item.modified)}</span>
                    <span><i class="fas fa-folder"></i> ${item.sectionName}</span>
                </div>
            </div>
        `;
    }).join('');
}

function updateFeedStats() {
    const allContent = appState.feedData.allContent;
    const filteredContent = appState.feedData.filteredContent;
    
    // Update counts
    elements.totalContent.textContent = allContent.length;
    elements.totalAnnouncements.textContent = allContent.filter(item => item.type === 'forum').length;
    elements.totalResources.textContent = allContent.filter(item => item.type === 'resource').length;
    elements.totalLinks.textContent = allContent.filter(item => item.type === 'url').length;
    
    // Update results count
    elements.feedResultsCount.textContent = `${filteredContent.length} kết quả`;
    
    // Update last updated time
    if (appState.feedData.lastUpdated) {
        elements.feedLastUpdated.textContent = `Cập nhật lần cuối: ${appState.feedData.lastUpdated.toLocaleTimeString('vi-VN')}`;
    }
}

function updateRecentContent() {
    const recent = appState.feedData.allContent.slice(0, 5);
    
    if (recent.length === 0) {
        elements.recentContent.innerHTML = '<p class="text-muted">Chưa có dữ liệu</p>';
        return;
    }
    
    elements.recentContent.innerHTML = recent.map(item => `
        <div class="recent-item" onclick="scrollToContent('${item.id}')">
            <div class="recent-item-title">${item.title}</div>
            <div class="recent-item-meta">${item.courseName} • ${formatDateShort(item.modified)}</div>
        </div>
    `).join('');
}

function updateSavedContent() {
    const saved = JSON.parse(localStorage.getItem('savedContent') || '[]');
    
    if (saved.length === 0) {
        elements.savedContent.innerHTML = '<p class="text-muted">Chưa có nội dung đã lưu</p>';
        return;
    }
    
    const savedItems = saved.map(id => 
        appState.feedData.allContent.find(item => item.id === id)
    ).filter(Boolean);
    
    elements.savedContent.innerHTML = savedItems.map(item => `
        <div class="saved-item" onclick="scrollToContent('${item.id}')">
            <div class="saved-item-title">${item.title}</div>
            <div class="saved-item-meta">${item.courseName}</div>
        </div>
    `).join('');
}

// Feed interaction functions
function openContent(url) {
    if (url && url !== '#') {
        window.open(url, '_blank');
    }
}

function saveContent(contentId) {
    const saved = JSON.parse(localStorage.getItem('savedContent') || '[]');
    if (!saved.includes(contentId)) {
        saved.push(contentId);
        localStorage.setItem('savedContent', JSON.stringify(saved));
        showNotification('Đã lưu nội dung!', 'success');
        updateSavedContent();
    } else {
        showNotification('Nội dung đã được lưu trước đó', 'info');
    }
}

function scrollToContent(contentId) {
    const element = document.querySelector(`[data-id="${contentId}"]`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }
}

function exportFeedData() {
    try {
        const data = {
            exportDate: new Date().toISOString(),
            totalContent: appState.feedData.allContent.length,
            content: appState.feedData.allContent.map(item => ({
                title: item.title,
                type: item.type,
                course: item.courseName,
                description: item.description,
                url: item.url,
                modified: new Date(item.modified * 1000).toISOString()
            }))
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `UIT-Feed-Export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Đã xuất dữ liệu feed thành công!', 'success');
    } catch (error) {
        showNotification(`Lỗi xuất dữ liệu: ${error.message}`, 'error');
    }
}

// Legacy functions for backward compatibility
function populateInfoCourseSelect() {
    // This is now handled by the unified feed
    if (elements.feedCourseFilter) {
        elements.feedCourseFilter.innerHTML = '<option value="">Tất cả môn học</option>';
        appState.courses.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.fullname;
            elements.feedCourseFilter.appendChild(opt);
        });
    }
}

async function loadCourseNotices(courseId) {
    // This is now handled by the unified feed
    if (courseId) {
        appState.feedData.currentFilters.course = courseId;
        applyFeedFilters();
        updateFeedUI();
    }
}

async function refreshData() {
    try {
        elements.refreshDataBtn.disabled = true;
        elements.refreshDataBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang làm mới...';
        
        // Reload all data
        await loadSiteInfo();
        await loadUserCourses();
        await loadCategoriesForCourses();
        
        // Reload assignments
        appState.assignments = [];
        for (const course of appState.courses) {
            const assignments = await loadAssignmentsForCourse(course.id);
            appState.assignments.push(...assignments);
        }
        
        // Clear and reload unified feed
        appState.feedData.allContent = [];
        appState.feedData.filteredContent = [];
        appState.feedData.searchIndex.clear();
        
        // Update UI
        updateDashboard();
        updateSemesterFilter();
        updateCourseFilter();
        updateCoursesList();
        updateSettings();
        
        // Reload unified feed if on info tab
        const currentSection = document.querySelector('.content-section:not(.hidden)');
        if (currentSection && currentSection.id === 'info-section') {
            await loadUnifiedFeed();
        }
        
        showNotification('Làm mới dữ liệu thành công!', 'success');
        
    } catch (error) {
        showNotification(`Lỗi làm mới dữ liệu: ${error.message}`, 'error');
    } finally {
        elements.refreshDataBtn.disabled = false;
        elements.refreshDataBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Làm mới dữ liệu';
    }
}

// SMART NOTIFICATIONS SYSTEM
class SmartNotificationSystem {
    constructor() {
        this.settings = {
            enabled: true,
            showToasts: true,
            showInApp: true,
            soundEnabled: true,
            checkInterval: 5 * 60 * 1000,
            notifyNewAssignments: true,
            notifyNewContent: true,
            notifyUpcomingDeadlines: true
        };
        this.lastCheckData = {
            assignments: new Map(),
            content: new Map(),
            lastCheckTime: null
        };
    }

    async init() {
        try {
            // Load notification settings
            this.settings = await window.electronAPI.getNotificationSettings();
            this.updateUI();
        } catch (error) {
            console.error('Failed to load notification settings:', error);
        }
    }

    updateUI() {
        if (elements.enableToastNotifications) {
            elements.enableToastNotifications.checked = this.settings.showToasts;
        }
        if (elements.enableInAppNotifications) {
            elements.enableInAppNotifications.checked = this.settings.showInApp;
        }
        if (elements.enableNotificationSound) {
            elements.enableNotificationSound.checked = this.settings.soundEnabled;
        }
        if (elements.notificationCheckInterval) {
            elements.notificationCheckInterval.value = this.settings.checkInterval / (60 * 1000);
        }
        if (elements.notifyNewAssignments) {
            elements.notifyNewAssignments.checked = this.settings.notifyNewAssignments;
        }
        if (elements.notifyNewContent) {
            elements.notifyNewContent.checked = this.settings.notifyNewContent;
        }
        if (elements.notifyUpcomingDeadlines) {
            elements.notifyUpcomingDeadlines.checked = this.settings.notifyUpcomingDeadlines;
        }
    }

    async saveSettings() {
        try {
            await window.electronAPI.updateNotificationSettings(this.settings);
            showNotification('Đã lưu cài đặt thông báo', 'success');
        } catch (error) {
            showNotification(`Lỗi lưu cài đặt: ${error.message}`, 'error');
        }
    }

    async testNotification() {
        try {
            await window.electronAPI.testNotification(
                'Test thông báo',
                'Đây là thông báo test từ UIT Assignment Manager',
                'info'
            );
        } catch (error) {
            showNotification(`Lỗi test thông báo: ${error.message}`, 'error');
        }
    }

    async checkForChanges() {
        if (!appState.currentToken || !appState.siteInfo?.userid) return;
        
        try {
            // Filter assignments to only include current/recent ones (last 3 months)
            const threeMonthsAgo = Date.now() - (3 * 30 * 24 * 60 * 60 * 1000);
            const recentAssignments = appState.assignments.filter(assignment => {
                const dueDate = assignment.duedate * 1000;
                const createdDate = assignment.timecreated * 1000;
                return dueDate > threeMonthsAgo || createdDate > threeMonthsAgo;
            });
            
            // Check assignment changes (only recent assignments)
            if (this.settings.notifyNewAssignments && recentAssignments.length > 0) {
                await window.electronAPI.checkAssignmentChanges(recentAssignments);
            }

            // Filter content to only include recent ones (last 2 months)
            const twoMonthsAgo = Date.now() - (2 * 30 * 24 * 60 * 60 * 1000);
            const recentContent = appState.feedData.allContent.filter(content => {
                const modifiedDate = content.modified * 1000;
                return modifiedDate > twoMonthsAgo;
            });
            
            // Check content changes (only recent content)
            if (this.settings.notifyNewContent && recentContent.length > 0) {
                await window.electronAPI.checkContentChanges(recentContent);
            }

            // Check upcoming deadlines (only recent assignments)
            if (this.settings.notifyUpcomingDeadlines) {
                this.checkUpcomingDeadlines(recentAssignments);
            }

        } catch (error) {
            console.error('Error checking for changes:', error);
        }
    }

    checkUpcomingDeadlines(assignments = appState.assignments) {
        const now = Math.floor(Date.now() / 1000);
        const tomorrow = now + (24 * 60 * 60);
        
        const upcomingDeadlines = assignments.filter(assignment => {
            if (!assignment.duedate || assignment.status === 'submitted' || assignment.isGroup) {
                return false;
            }
            return assignment.duedate > now && assignment.duedate <= tomorrow;
        });

        if (upcomingDeadlines.length > 0) {
            upcomingDeadlines.forEach(assignment => {
                const course = appState.courses.find(c => c.id === assignment.course);
                const courseName = course ? course.fullname : 'Unknown Course';
                const hoursLeft = Math.ceil((assignment.duedate - now) / 3600);
                
                showNotification(
                    `⏰ Deadline sắp tới: ${assignment.name} (${courseName}) - Còn ${hoursLeft} giờ`,
                    'warning',
                    10000
                );
            });
        }
    }
}

// Initialize smart notification system
const smartNotifications = new SmartNotificationSystem();

// Assignment Enhancements System
class AssignmentEnhancements {
    constructor() {
        this.currentAssignmentId = null;
        this.currentEnhancements = {};
    }

    async openAssignmentDetails(assignmentId) {
        this.currentAssignmentId = assignmentId;
        
        try {
            // Convert string ID to number for comparison
            const numericId = Number(assignmentId);
            
            console.log('Opening assignment details:', {
                assignmentId,
                numericId,
                assignmentsCount: appState.assignments.length,
                availableIds: appState.assignments.map(a => ({ id: a.id, name: a.name }))
            });
            
            // Get assignment data
            let assignment = appState.assignments.find(a => a.id === numericId);
            
            // If not found in current assignments, try to load it
            if (!assignment) {
                console.log('Assignment not found in current list, trying to load...');
                // Find the course that contains this assignment
                // We need to search through all courses to find which one has this assignment
                for (const course of appState.courses) {
                    try {
                        const assignments = await loadAssignmentsForCourse(course.id);
                        const foundAssignment = assignments.find(a => a.id === numericId);
                        if (foundAssignment) {
                            assignment = foundAssignment;
                            // Add to current assignments if not already there
                            if (!appState.assignments.find(a => a.id === numericId)) {
                                appState.assignments.push(assignment);
                            }
                            break;
                        }
                    } catch (error) {
                        console.error('Error loading assignment for course:', error);
                    }
                }
            }
            
            if (!assignment) {
                console.error('Assignment not found:', {
                    assignmentId,
                    numericId,
                    availableIds: appState.assignments.map(a => a.id),
                    assignmentsCount: appState.assignments.length
                });
                showNotification('Không tìm thấy bài tập', 'error');
                return;
            }

            // Get course name
            const course = appState.courses.find(c => c.id === assignment.course);
            const courseName = course ? course.fullname : 'Unknown Course';

            // Load enhancements
            const result = await window.electronAPI.getAssignmentEnhancements(assignmentId);
            this.currentEnhancements = result.success ? result.data : {};

            // Populate modal
            this.populateAssignmentDetails(assignment, courseName);
            this.populateEnhancements();

            // Show modal
            document.getElementById('assignment-details-modal').classList.remove('hidden');
        } catch (error) {
            showNotification(`Lỗi mở chi tiết bài tập: ${error.message}`, 'error');
        }
    }

    populateAssignmentDetails(assignment, courseName) {
        document.getElementById('details-assignment-name').textContent = assignment.name;
        document.getElementById('details-course-name').textContent = courseName;
        document.getElementById('details-deadline').textContent = assignment.duedate 
            ? new Date(assignment.duedate * 1000).toLocaleString('vi-VN')
            : 'Không có deadline';
        
        const statusElement = document.getElementById('details-status');
        statusElement.textContent = assignment.status === 'submitted' ? 'Đã nộp' : 'Chưa nộp';
        statusElement.className = `assignment-status ${assignment.status}`;
    }

    populateEnhancements() {
        // Priority
        const priority = this.currentEnhancements.priority || 'medium';
        document.querySelector(`input[name="priority"][value="${priority}"]`).checked = true;

        // Notes
        document.getElementById('assignment-notes').value = this.currentEnhancements.notes || '';

        // Subtasks
        this.renderSubtasks();

        // Reminder
        const reminder = this.currentEnhancements.reminder;
        document.getElementById('enable-reminder').checked = !!reminder;
        if (reminder) {
            document.getElementById('reminder-options').classList.remove('hidden');
            document.getElementById('reminder-time').value = reminder.hoursBefore || 24;
        } else {
            document.getElementById('reminder-options').classList.add('hidden');
        }
    }

    renderSubtasks() {
        const subtasksList = document.getElementById('subtasks-list');
        const subtasks = this.currentEnhancements.subtasks || [];

        if (subtasks.length === 0) {
            subtasksList.innerHTML = '<p class="text-muted">Chưa có công việc nào</p>';
            return;
        }

        subtasksList.innerHTML = subtasks.map(subtask => `
            <div class="subtask-item ${subtask.completed ? 'completed' : ''}">
                <input type="checkbox" class="subtask-checkbox" ${subtask.completed ? 'checked' : ''}
                       onchange="toggleSubtask('${subtask.id}', this.checked)">
                <span class="subtask-text">${subtask.text}</span>
                <div class="subtask-actions">
                    <button class="subtask-btn" onclick="editSubtask('${subtask.id}')" title="Sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="subtask-btn" onclick="deleteSubtask('${subtask.id}')" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    async setPriority(priority) {
        if (!this.currentAssignmentId) return;

        try {
            await window.electronAPI.setAssignmentPriority(this.currentAssignmentId, priority);
            this.currentEnhancements.priority = priority;
            showNotification('Đã cập nhật mức độ ưu tiên', 'success');
        } catch (error) {
            showNotification(`Lỗi cập nhật ưu tiên: ${error.message}`, 'error');
        }
    }

    async saveNotes(notes) {
        if (!this.currentAssignmentId) return;

        try {
            await window.electronAPI.setAssignmentNotes(this.currentAssignmentId, notes);
            this.currentEnhancements.notes = notes;
        } catch (error) {
            showNotification(`Lỗi lưu ghi chú: ${error.message}`, 'error');
        }
    }

    async addSubtask(text) {
        if (!this.currentAssignmentId || !text.trim()) return;

        try {
            const result = await window.electronAPI.addAssignmentSubtask(this.currentAssignmentId, { text: text.trim() });
            if (result.success) {
                if (!this.currentEnhancements.subtasks) {
                    this.currentEnhancements.subtasks = [];
                }
                this.currentEnhancements.subtasks.push(result.data);
                this.renderSubtasks();
                document.getElementById('new-subtask-input').value = '';
                showNotification('Đã thêm công việc mới', 'success');
            }
        } catch (error) {
            showNotification(`Lỗi thêm công việc: ${error.message}`, 'error');
        }
    }

    async toggleSubtask(subtaskId, completed) {
        if (!this.currentAssignmentId) return;

        try {
            await window.electronAPI.updateAssignmentSubtask(this.currentAssignmentId, subtaskId, { completed });
            const subtask = this.currentEnhancements.subtasks.find(st => st.id === subtaskId);
            if (subtask) {
                subtask.completed = completed;
                this.renderSubtasks();
            }
        } catch (error) {
            showNotification(`Lỗi cập nhật công việc: ${error.message}`, 'error');
        }
    }

    async deleteSubtask(subtaskId) {
        if (!this.currentAssignmentId) return;

        try {
            await window.electronAPI.deleteAssignmentSubtask(this.currentAssignmentId, subtaskId);
            this.currentEnhancements.subtasks = this.currentEnhancements.subtasks.filter(st => st.id !== subtaskId);
            this.renderSubtasks();
            showNotification('Đã xóa công việc', 'success');
        } catch (error) {
            showNotification(`Lỗi xóa công việc: ${error.message}`, 'error');
        }
    }

    async setReminder(enabled, hoursBefore = 24) {
        if (!this.currentAssignmentId) return;

        try {
            const reminder = enabled ? { hoursBefore, enabled: true } : null;
            await window.electronAPI.setAssignmentReminder(this.currentAssignmentId, reminder);
            this.currentEnhancements.reminder = reminder;
        } catch (error) {
            showNotification(`Lỗi cập nhật nhắc nhở: ${error.message}`, 'error');
        }
    }

    close() {
        document.getElementById('assignment-details-modal').classList.add('hidden');
        this.currentAssignmentId = null;
        this.currentEnhancements = {};
    }
}

// Initialize assignment enhancements
const assignmentEnhancements = new AssignmentEnhancements();

// Global functions for assignment enhancements
let currentAssignmentId = null;

async function openAssignment(assignmentId) {
    try {
        const numericId = Number(assignmentId);
        let assignment = appState.assignments.find(a => a.id === numericId);
        
        // If not found in current assignments, try to load it
        if (!assignment) {
            console.log('Assignment not found in current list, trying to load...');
            // Find the course that contains this assignment
            for (const course of appState.courses) {
                try {
                    const assignments = await loadAssignmentsForCourse(course.id);
                    const foundAssignment = assignments.find(a => a.id === numericId);
                    if (foundAssignment) {
                        assignment = foundAssignment;
                        // Add to current assignments if not already there
                        if (!appState.assignments.find(a => a.id === numericId)) {
                            appState.assignments.push(assignment);
                        }
                        break;
                    }
                } catch (error) {
                    console.error('Error loading assignment for course:', error);
                }
            }
        }
        
        if (!assignment) {
            showNotification('Không tìm thấy bài tập', 'error');
            return;
        }
        
        // Open assignment URL in external browser, build fallback from cmid if needed
        let openUrl = assignment.url || null;
        if (!openUrl && assignment.cmid) {
            openUrl = `${appState.baseUrl}/mod/assign/view.php?id=${assignment.cmid}`;
        }
        if (!openUrl) {
            // Try map cmid from course contents
            try {
                const contents = await callAPI('getCourseContents', appState.currentToken, assignment.course);
                let cmid = null;
                if (Array.isArray(contents)) {
                    contents.forEach(section => {
                        (section.modules || []).forEach(module => {
                            if (module.modname === 'assign' && module.instance === assignment.id) {
                                cmid = module.id;
                                if (!assignment.cmid) assignment.cmid = cmid;
                                if (!assignment.url && module.url) assignment.url = module.url;
                            }
                        });
                    });
                }
                if (!openUrl && cmid) {
                    openUrl = `${appState.baseUrl}/mod/assign/view.php?id=${cmid}`;
                }
            } catch (e) {
                console.warn('Failed to map assignment cmid from contents:', e.message);
            }
        }
        if (openUrl) {
            window.electronAPI.openExternal(openUrl);
        } else {
            showNotification('Không có liên kết bài tập', 'warning');
        }
    } catch (error) {
        console.error('Error opening assignment:', error);
        showNotification('Lỗi mở bài tập', 'error');
    }
}

async function openAssignmentDetails(assignmentId) {
    try {
        console.log('Opening assignment details for ID:', assignmentId);
        currentAssignmentId = assignmentId;
        const numericId = Number(assignmentId);
        console.log('Numeric ID:', numericId);
        console.log('Current assignments count:', appState.assignments.length);
        console.log('Available assignment IDs:', appState.assignments.map(a => a.id));
        
        let assignment = appState.assignments.find(a => a.id === numericId);
        console.log('Found assignment:', assignment ? assignment.name : 'Not found');
        
        // If not found in current assignments, try to load it
        if (!assignment) {
            console.log('Assignment not found in current list, trying to load...');
            console.log('Available courses:', appState.courses.map(c => ({ id: c.id, name: c.fullname })));
            
            // Find the course that contains this assignment
            for (const course of appState.courses) {
                try {
                    console.log(`Checking course ${course.id}: ${course.fullname}`);
                    const assignments = await loadAssignmentsForCourse(course.id);
                    console.log(`Found ${assignments.length} assignments in course ${course.id}`);
                    
                    const foundAssignment = assignments.find(a => a.id === numericId);
                    if (foundAssignment) {
                        console.log('Found assignment in course:', course.fullname, foundAssignment);
                        assignment = foundAssignment;
                        // Add to current assignments if not already there
                        if (!appState.assignments.find(a => a.id === numericId)) {
                            appState.assignments.push(assignment);
                        }
                        break;
                    }
                } catch (error) {
                    console.error('Error loading assignment for course:', course.id, error);
                }
            }
        }
        
        if (!assignment) {
            console.error('Assignment not found after searching all courses');
            showNotification('Không tìm thấy bài tập', 'error');
            return;
        }
        
        // Validate assignment data
        if (!assignment.id || !assignment.name) {
            console.error('Invalid assignment data:', assignment);
            showNotification('Dữ liệu bài tập không hợp lệ', 'error');
            return;
        }
        
        console.log('Showing assignment details page for:', assignment.name);
        // Show assignment details page
        showAssignmentDetailsPage(assignment);
        
    } catch (error) {
        console.error('Error opening assignment details:', error);
        showNotification('Lỗi mở chi tiết bài tập', 'error');
    }
}

function showAssignmentDetailsPage(assignment) {
    try {
        console.log('showAssignmentDetailsPage called with:', assignment);
        
        // Validate assignment
        if (!assignment || !assignment.id || !assignment.name) {
            console.error('Invalid assignment passed to showAssignmentDetailsPage:', assignment);
            showNotification('Dữ liệu bài tập không hợp lệ', 'error');
            return;
        }
        
        // Update title
        if (elements.assignmentDetailsTitle) {
            elements.assignmentDetailsTitle.textContent = assignment.name;
        }
        
        // Update open assignment button
        if (elements.openAssignmentBtn) {
            elements.openAssignmentBtn.onclick = () => openAssignment(assignment.id);
        }
        
        // Set current assignment ID for the button
        currentAssignmentId = assignment.id;
    
        // Get course name
        const course = appState.courses.find(c => c.id === assignment.course);
        const courseName = course ? course.fullname : 'Unknown Course';
        
        console.log('Course found:', courseName);
        
        // Render assignment details with teacher description
        if (elements.assignmentDetailsContent) {
            elements.assignmentDetailsContent.innerHTML = `
        <div class="assignment-details-card">
            <div class="assignment-details-header">
                <div class="header-content">
                    <div class="header-left">
                        <button class="btn-back" onclick="showSection('assignments')" title="Quay lại">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <h1 class="assignment-details-title">${assignment.name}</h1>
                    </div>
                    <div class="header-right">
                        ${!assignment.isSubmitted ? `
                        <div class="header-countdown" id="header-countdown-${assignment.id}">
                            <div class="countdown-icon-small">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="countdown-text">
                                <span class="countdown-days">--</span> ngày
                                <span class="countdown-hours">--</span> giờ
                                <span class="countdown-minutes">--</span> phút
                            </div>
                        </div>
                        ` : ''}
                        <button class="btn-header btn-primary" id="open-assignment-btn" onclick="openAssignment(${assignment.id})" title="Mở bài tập">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="assignment-details-meta">
                <!-- Priority Information (Highlighted) -->
                <div class="meta-priority">
                    <div class="assignment-meta-item priority-highlight">
                        <span class="assignment-meta-label">Môn học</span>
                        <span class="assignment-meta-value">${courseName}</span>
                    </div>
                    <div class="assignment-meta-item priority-highlight">
                        <span class="assignment-meta-label">Hạn nộp</span>
                        <span class="assignment-meta-value">${formatDate(assignment.duedate)}</span>
                    </div>
                    <div class="assignment-meta-item priority-highlight status-${assignment.isSubmitted ? 'submitted' : 'pending'}">
                        <span class="assignment-meta-label">Trạng thái</span>
                        <span class="assignment-meta-value">${assignment.isSubmitted ? 'Đã nộp' : 'Chưa nộp'}</span>
                    </div>
                </div>
                
                
                <!-- Secondary Information -->
                <div class="meta-secondary">
                    ${assignment.isSubmitted && assignment.submittedTime ? `
                    <div class="assignment-meta-item">
                        <span class="assignment-meta-label">Thời gian nộp</span>
                        <span class="assignment-meta-value">${formatDate(assignment.submittedTime)}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            ${assignment.intro ? `
            <div class="assignment-description">
                <h4>Mô tả bài tập</h4>
                <div class="assignment-description-content">${assignment.intro}</div>
            </div>
            ` : ''}
            
            ${assignment.introattachments && assignment.introattachments.length > 0 ? `
            <div class="assignment-attachments">
                <h4>Tài liệu đính kèm</h4>
                <div class="attachment-list">
                    ${assignment.introattachments.map(attachment => `
                        <div class="attachment-item">
                            <i class="fas fa-file"></i>
                            <a href="${ensureUrlWithToken(attachment.fileurl)}" target="_blank" rel="noopener" download>${attachment.filename}</a>
                            <span class="attachment-size">(${Math.round(attachment.filesize/1024)} KB)</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>
            `;
        }
        
        // Show assignment details section
        showSection('assignment-details');
        
        // Initialize countdown if not submitted
        if (!assignment.isSubmitted) {
            initializeHeaderCountdown(assignment.id, assignment.duedate);
        }
        
    } catch (error) {
        console.error('Error in showAssignmentDetailsPage:', error);
        showNotification('Lỗi hiển thị chi tiết bài tập', 'error');
    }
}

function initializeHeaderCountdown(assignmentId, dueDate) {
    const countdownElement = document.getElementById(`header-countdown-${assignmentId}`);
    if (!countdownElement) return;
    
    const dueTime = new Date(dueDate * 1000).getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const timeLeft = dueTime - now;
        
        if (timeLeft <= 0) {
            countdownElement.innerHTML = '<div class="countdown-expired">Đã hết hạn</div>';
            return;
        }
        
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        const daysElement = countdownElement.querySelector('.countdown-days');
        const hoursElement = countdownElement.querySelector('.countdown-hours');
        const minutesElement = countdownElement.querySelector('.countdown-minutes');
        
        if (daysElement) daysElement.textContent = days;
        if (hoursElement) hoursElement.textContent = hours;
        if (minutesElement) minutesElement.textContent = minutes;
        
        // Add urgency styling
        if (days <= 1) {
            countdownElement.classList.add('urgent');
        } else if (days <= 3) {
            countdownElement.classList.add('warning');
        }
    }
    
    // Update immediately
    updateCountdown();
    
    // Update every minute
    const interval = setInterval(updateCountdown, 60000);
    
    // Store interval for cleanup
    if (!window.countdownIntervals) {
        window.countdownIntervals = {};
    }
    window.countdownIntervals[assignmentId] = interval;
}

function initializeAssignmentCountdown(assignmentId, dueDate) {
    const countdownElement = document.getElementById(`countdown-${assignmentId}`);
    if (!countdownElement) return;
    
    const dueTime = new Date(dueDate * 1000).getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const timeLeft = dueTime - now;
        
        if (timeLeft <= 0) {
            countdownElement.innerHTML = '<i class="fas fa-clock"></i><span class="countdown-text">Đã hết hạn</span>';
            countdownElement.classList.add('expired');
            return;
        }
        
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        const countdownText = countdownElement.querySelector('.countdown-text');
        if (countdownText) {
            countdownText.textContent = `${days} ngày ${hours} giờ ${minutes} phút`;
        }
        
        // Add urgency styling
        if (days <= 1) {
            countdownElement.classList.add('urgent');
        } else if (days <= 3) {
            countdownElement.classList.add('warning');
        }
    }
    
    // Update immediately
    updateCountdown();
    
    // Update every minute
    const interval = setInterval(updateCountdown, 60000);
    
    // Store interval for cleanup
    if (!window.assignmentCountdownIntervals) {
        window.assignmentCountdownIntervals = {};
    }
    window.assignmentCountdownIntervals[assignmentId] = interval;
}

function closeAssignmentDetails() {
    assignmentEnhancements.close();
    
    // Clear countdown intervals
    if (window.countdownIntervals) {
        Object.values(window.countdownIntervals).forEach(interval => {
            clearInterval(interval);
        });
        window.countdownIntervals = {};
    }
    
    // Clear assignment countdown intervals
    if (window.assignmentCountdownIntervals) {
        Object.values(window.assignmentCountdownIntervals).forEach(interval => {
            clearInterval(interval);
        });
        window.assignmentCountdownIntervals = {};
    }
}

// Ensure global accessibility for inline onclick handlers
window.openCourseDetails = openCourseDetails;
window.openCourseInBrowser = openCourseInBrowser;

function setAssignmentPriority(priority) {
    assignmentEnhancements.setPriority(priority);
}

function saveAssignmentNotes(notes) {
    assignmentEnhancements.saveNotes(notes);
}

function addSubtask() {
    const input = document.getElementById('new-subtask-input');
    assignmentEnhancements.addSubtask(input.value);
}

function handleSubtaskKeypress(event) {
    if (event.key === 'Enter') {
        addSubtask();
    }
}

function toggleSubtask(subtaskId, completed) {
    assignmentEnhancements.toggleSubtask(subtaskId, completed);
}

function deleteSubtask(subtaskId) {
    if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
        assignmentEnhancements.deleteSubtask(subtaskId);
    }
}

function editSubtask(subtaskId) {
    const subtask = assignmentEnhancements.currentEnhancements.subtasks.find(st => st.id === subtaskId);
    if (subtask) {
        const newText = prompt('Sửa công việc:', subtask.text);
        if (newText && newText.trim() !== subtask.text) {
            assignmentEnhancements.updateSubtask(subtaskId, { text: newText.trim() });
        }
    }
}

function toggleReminder(enabled) {
    const hoursBefore = document.getElementById('reminder-time').value;
    assignmentEnhancements.setReminder(enabled, parseInt(hoursBefore));
    
    const options = document.getElementById('reminder-options');
    if (enabled) {
        options.classList.remove('hidden');
    } else {
        options.classList.add('hidden');
    }
}

function updateReminderTime() {
    const enabled = document.getElementById('enable-reminder').checked;
    const hoursBefore = document.getElementById('reminder-time').value;
    if (enabled) {
        assignmentEnhancements.setReminder(true, parseInt(hoursBefore));
    }
}

// Quick Notes functions
function openQuickNotes() {
    document.getElementById('quick-notes-modal').classList.remove('hidden');
    // Load saved notes
    const savedNotes = localStorage.getItem('quickNotes') || '';
    document.getElementById('quick-notes-text').value = savedNotes;
}

function closeQuickNotes() {
    document.getElementById('quick-notes-modal').classList.add('hidden');
}

function saveQuickNotes() {
    const notes = document.getElementById('quick-notes-text').value;
    localStorage.setItem('quickNotes', notes);
    showNotification('Đã lưu ghi chú nhanh', 'success');
    closeQuickNotes();
}

// AI Assistant functions
async function openAIStudyPlan() {
    document.getElementById('ai-study-plan-modal').classList.remove('hidden');
    await generateAIStudyPlan();
}

function closeAIStudyPlan() {
    document.getElementById('ai-study-plan-modal').classList.add('hidden');
}

async function refreshAIStudyPlan() {
    await generateAIStudyPlan();
}

async function generateAIStudyPlan() {
    const content = document.getElementById('ai-study-plan-content');
    content.innerHTML = `
        <div class="ai-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>AI đang phân tích và tạo lịch ôn tập...</p>
        </div>
    `;

    try {
        console.log('Generating AI Study Plan:', {
            assignments: appState.assignments.length,
            courses: appState.courses.length
        });
        
        const result = await window.electronAPI.aiGenerateStudyPlan(appState.assignments, appState.courses);
        
        if (result.success) {
            renderAIStudyPlan(result.data);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('AI Study Plan Error:', error);
        content.innerHTML = `
            <div class="ai-no-data">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Lỗi tạo lịch ôn tập</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="refreshAIStudyPlan()">
                    <i class="fas fa-retry"></i>
                    Thử lại
                </button>
            </div>
        `;
    }
}

function renderAIStudyPlan(data) {
    const content = document.getElementById('ai-study-plan-content');
    
    if (!data.plan || data.plan.length === 0) {
        content.innerHTML = `
            <div class="ai-no-data">
                <i class="fas fa-check-circle"></i>
                <h3>Tuyệt vời!</h3>
                <p>Không có bài tập nào sắp đến hạn. Bạn có thể tận dụng thời gian để ôn tập kiến thức cũ.</p>
            </div>
        `;
        return;
    }

    const statsHtml = `
        <div class="ai-stats">
            <div class="ai-stat-item">
                <div class="ai-stat-number">${data.urgentCount || 0}</div>
                <div class="ai-stat-label">Cần ưu tiên cao</div>
            </div>
            <div class="ai-stat-item">
                <div class="ai-stat-number">${data.totalUpcoming || 0}</div>
                <div class="ai-stat-label">Bài tập sắp tới</div>
            </div>
            <div class="ai-stat-item">
                <div class="ai-stat-number">${data.plan.length}</div>
                <div class="ai-stat-label">Trong lịch ôn tập</div>
            </div>
        </div>
    `;

    const scheduleHtml = data.plan.map(item => `
        <div class="ai-schedule-item">
            <div class="ai-schedule-header">
                <div class="ai-schedule-title">${item.assignment}</div>
                <div class="ai-schedule-priority ${item.priority.toLowerCase()}">${item.priority}</div>
            </div>
            <div class="ai-schedule-meta">
                <span><i class="fas fa-book"></i> ${item.course}</span>
                <span><i class="fas fa-clock"></i> Còn ${item.daysLeft} ngày</span>
            </div>
            <div class="ai-schedule-recommendation">
                <i class="fas fa-lightbulb"></i> ${item.recommendation}
            </div>
        </div>
    `).join('');

    const suggestionsHtml = data.suggestions.map(suggestion => `
        <div class="ai-suggestion-item">
            <i class="fas fa-info-circle"></i>
            <span>${suggestion}</span>
        </div>
    `).join('');

    content.innerHTML = `
        <div class="ai-summary-section">
            <h4><i class="fas fa-chart-bar"></i> Tổng quan</h4>
            ${statsHtml}
        </div>

        <div class="ai-summary-section">
            <h4><i class="fas fa-calendar-alt"></i> Lịch ôn tập được đề xuất</h4>
            <div class="ai-study-schedule">
                ${scheduleHtml}
            </div>
        </div>

        <div class="ai-summary-section">
            <h4><i class="fas fa-lightbulb"></i> Gợi ý thông minh</h4>
            <div class="ai-suggestions">
                ${suggestionsHtml}
            </div>
        </div>
    `;
}

// AI Content Summarization
async function summarizeContentWithAI(content, type = 'announcement') {
    try {
        const result = await window.electronAPI.aiSummarizeContent(content, type);
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('AI summarization error:', error);
        return {
            summary: 'Không thể tóm tắt nội dung này.',
            keyWords: [],
            sentiment: 'neutral',
            wordCount: 0,
            confidence: 0
        };
    }
}

// POLLING & NOTIFICATIONS
async function checkForNewContent() {
    if (!appState.currentToken || !appState.siteInfo?.userid) return;
    
    try {
        // Use smart notification system
        await smartNotifications.checkForChanges();
        
        appState.lastCheckTime = Date.now();
    } catch (error) {
        console.error('Error checking for new content:', error);
    }
}

function startPolling() {
    if (appState.pollingInterval) {
        clearInterval(appState.pollingInterval);
    }
    
    const settings = getNotificationSettings();
    if (!settings.enabled) return;
    
    const intervalMs = settings.interval * 60 * 1000; // convert minutes to ms
    appState.pollingInterval = setInterval(checkForNewContent, intervalMs);
    
    // Initial check after 10 seconds
    setTimeout(checkForNewContent, 10000);
}

function stopPolling() {
    if (appState.pollingInterval) {
        clearInterval(appState.pollingInterval);
        appState.pollingInterval = null;
    }
}

function getNotificationSettings() {
    // This would normally read from settings, but for now return defaults
    return { enabled: true, interval: 5 };
}

// Calendar Export Functions
function exportCalendar() {
    try {
        const icsContent = generateICSContent();
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `UIT-Assignments-${new Date().toISOString().split('T')[0]}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Đã xuất lịch thành công!', 'success');
    } catch (error) {
        showNotification(`Lỗi xuất lịch: ${error.message}`, 'error');
    }
}

function generateICSContent() {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    let ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//UIT Assignment Manager//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ];
    
    appState.assignments.forEach(assignment => {
        if (!assignment.duedate) return;
        
        const dueDate = new Date(assignment.duedate * 1000);
        const startDate = dueDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endDate = new Date(dueDate.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        const course = appState.courses.find(c => c.id === assignment.course);
        const courseName = course ? course.fullname : 'Unknown Course';
        
        ics.push(
            'BEGIN:VEVENT',
            `UID:${assignment.id}@uit-assignment-manager`,
            `DTSTAMP:${timestamp}`,
            `DTSTART:${startDate}`,
            `DTEND:${endDate}`,
            `SUMMARY:${assignment.name}`,
            `DESCRIPTION:Course: ${courseName}\\nStatus: ${assignment.status}`,
            'STATUS:CONFIRMED',
            'TRANSP:OPAQUE',
            'END:VEVENT'
        );
    });
    
    ics.push('END:VCALENDAR');
    return ics.join('\r\n');
}

// Quick Actions Functions
function openQuickNotes() {
    const note = prompt('Ghi chú nhanh:');
    if (note && note.trim()) {
        // Store note in localStorage for now
        const notes = JSON.parse(localStorage.getItem('quickNotes') || '[]');
        notes.push({
            id: Date.now(),
            text: note.trim(),
            timestamp: new Date().toISOString(),
            type: 'quick'
        });
        localStorage.setItem('quickNotes', JSON.stringify(notes));
        showNotification('Đã lưu ghi chú!', 'success');
    }
}

function openQuickSchedule() {
    document.getElementById('quick-schedule-modal').classList.remove('hidden');
    
    // Populate assignment dropdown
    const assignmentSelect = document.getElementById('schedule-assignment');
    assignmentSelect.innerHTML = '<option value="">Chọn bài tập...</option>';
    
    appState.assignments.forEach(assignment => {
        const option = document.createElement('option');
        option.value = assignment.id;
        option.textContent = assignment.name;
        assignmentSelect.appendChild(option);
    });
    
    // Set default time to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    document.getElementById('schedule-time').value = tomorrow.toISOString().slice(0, 16);
}

function closeQuickSchedule() {
    document.getElementById('quick-schedule-modal').classList.add('hidden');
}

function saveQuickSchedule() {
    const assignmentId = document.getElementById('schedule-assignment').value;
    const scheduleTime = document.getElementById('schedule-time').value;
    const message = document.getElementById('schedule-message').value || 'Nhắc nhở bài tập';
    
    if (!scheduleTime) {
        showNotification('Vui lòng chọn thời gian nhắc nhở', 'error');
        return;
    }
    
    // Store schedule in localStorage
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    schedules.push({
        id: Date.now(),
        assignmentId: assignmentId || null,
        scheduleTime: scheduleTime,
        message: message,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('schedules', JSON.stringify(schedules));
    
    showNotification('Đã lên lịch nhắc nhở!', 'success');
    closeQuickSchedule();
}

function exportReport() {
    try {
        const report = generateReport();
        const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `UIT-Report-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Đã xuất báo cáo thành công!', 'success');
    } catch (error) {
        showNotification(`Lỗi xuất báo cáo: ${error.message}`, 'error');
    }
}

function generateReport() {
    const now = new Date();
    const stats = calculateSmartStats();
    
    let report = [
        '=== BÁO CÁO HỌC TẬP UIT ===',
        `Ngày tạo: ${now.toLocaleString('vi-VN')}`,
        `Sinh viên: ${appState.currentUser?.fullname || 'N/A'}`,
        `Mã số sinh viên: ${appState.currentStudentId || 'N/A'}`,
        '',
        '=== THỐNG KÊ TỔNG QUAN ===',
        `Tổng số môn học: ${appState.courses.length}`,
        `Tổng số bài tập: ${appState.assignments.length}`,
        `Bài tập đã hoàn thành: ${stats.completedAssignments.length}`,
        `Bài tập khẩn cấp: ${stats.urgentAssignments.length}`,
        `Bài tập sắp đến hạn: ${stats.upcomingAssignments.length}`,
        `Tỷ lệ hoàn thành: ${stats.completionRate}%`,
        '',
        '=== BÀI TẬP KHẨN CẤP ==='
    ];
    
    if (stats.urgentAssignments.length > 0) {
        stats.urgentAssignments.forEach(assignment => {
            const course = appState.courses.find(c => c.id === assignment.course);
            report.push(`- ${assignment.name} (${course?.fullname || 'Unknown'}) - Hạn: ${formatDate(assignment.duedate)}`);
        });
    } else {
        report.push('Không có bài tập khẩn cấp');
    }
    
    report.push('', '=== BÀI TẬP SẮP ĐẾN HẠN ===');
    
    if (stats.upcomingAssignments.length > 0) {
        stats.upcomingAssignments.forEach(assignment => {
            const course = appState.courses.find(c => c.id === assignment.course);
            report.push(`- ${assignment.name} (${course?.fullname || 'Unknown'}) - Hạn: ${formatDate(assignment.duedate)}`);
        });
    } else {
        report.push('Không có bài tập sắp đến hạn');
    }
    
    report.push('', '=== CHI TIẾT THEO MÔN HỌC ===');
    
    appState.courses.forEach(course => {
        const courseAssignments = appState.assignments.filter(a => a.course === course.id);
        if (courseAssignments.length > 0) {
            report.push(`\n${course.fullname}:`);
            courseAssignments.forEach(assignment => {
                const status = assignment.status === 'submitted' ? 'Đã nộp' : 'Chưa nộp';
                report.push(`  - ${assignment.name} (${status}) - Hạn: ${formatDate(assignment.duedate)}`);
            });
        }
    });
    
    return report.join('\n');
}

function logout() {
    stopPolling();
    
    appState.currentUser = null;
    appState.currentToken = null;
    appState.currentStudentId = null;
    appState.siteInfo = null;
    appState.categories = [];
    appState.semesters = [];
    appState.courses = [];
    appState.assignments = [];
    appState.categoryMap.clear();
    appState.courseSemMap.clear();
    appState.coursesByCategory.clear();
    appState.lastCheckTime = null;
    appState.userGroupAssignments.clear();
    appState.currentWeek = new Date();
    appState.dashboardData = {
        urgentAssignments: [],
        upcomingAssignments: [],
        completedAssignments: [],
        completionRate: 0,
        semesterProgress: 0
    };
    
    elements.mainApp.classList.add('hidden');
    elements.loginScreen.classList.remove('hidden');
    
    showNotification('Đã đăng xuất', 'info');
}

// Event listeners
function setupEventListeners() {
    // Login form events
    elements.registerBtn.addEventListener('click', async () => {
        const studentId = elements.newStudentId.value.trim();
        const token = elements.newToken.value.trim();
        
        if (!studentId || !token) {
            showNotification('Vui lòng nhập đầy đủ thông tin', 'warning');
            return;
        }
        
        await registerAccount(studentId, token);
    });
    
    elements.loginBtn.addEventListener('click', async () => {
        const studentId = elements.studentId.value;
        
        if (!studentId) {
            showNotification('Vui lòng chọn mã số sinh viên', 'warning');
            return;
        }
        
        await loginWithStudentId(studentId);
    });
    
    elements.switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchToLoginForm();
    });
    
    elements.switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        switchToRegisterForm();
    });
    
    elements.removeAccountBtn.addEventListener('click', removeAccount);
    
    // Main app events
    elements.logoutBtn.addEventListener('click', logout);
    
    // Navigation events
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            showSection(section);
            
            // Load section-specific data
            if (section === 'assignments') {
                updateAssignmentsList();
            } else if (section === 'info') {
                populateInfoCourseSelect();
                // Always load unified feed when switching to info tab
                loadUnifiedFeed();
            }
        });
    });
    
    // Filter events
    elements.semesterFilter.addEventListener('change', async () => { 
        handleSemesterChangeForCourses(); 
        const selectedSemId = Number(elements.semesterFilter.value);
        if (selectedSemId) {
            await loadAssignmentsForSemester(selectedSemId);
        } else {
            await loadAssignmentsForCurrentSemester();
        }
        updateAssignmentsList(); 
    });
    elements.courseFilter.addEventListener('change', updateAssignmentsList);
    elements.statusFilter.addEventListener('change', updateAssignmentsList);
    
    // Breadcrumb navigation
    if (elements.breadcrumbNav) {
        elements.breadcrumbNav.addEventListener('click', (e) => {
            const breadcrumbItem = e.target.closest('.breadcrumb-item');
            if (breadcrumbItem && breadcrumbItem.dataset.section) {
                showSection(breadcrumbItem.dataset.section);
            }
        });
    }
    
    // Global search
    if (elements.globalSearch) {
        elements.globalSearch.addEventListener('input', (e) => {
            appState.searchQuery = e.target.value.toLowerCase();
            elements.clearSearch.style.display = appState.searchQuery ? 'block' : 'none';
            performGlobalSearch();
        });
    }
    
    // Clear search
    if (elements.clearSearch) {
        elements.clearSearch.addEventListener('click', () => {
            elements.globalSearch.value = '';
            appState.searchQuery = '';
            elements.clearSearch.style.display = 'none';
            performGlobalSearch();
        });
    }
    
    // Semester filter for courses
    if (elements.semesterFilterCourses) {
        elements.semesterFilterCourses.addEventListener('change', () => {
            filterCoursesBySemester();
        });
    }
    
    // Group toggle button
    if (elements.toggleGroupBtn) {
        elements.toggleGroupBtn.addEventListener('click', () => {
            appState.showGroupOnly = !appState.showGroupOnly;
            const icon = elements.toggleGroupBtn.querySelector('i');
            const span = elements.toggleGroupBtn.querySelector('span');
            
            if (appState.showGroupOnly) {
                icon.className = 'fas fa-eye-slash';
                span.textContent = 'Hiện tất cả';
                elements.toggleGroupBtn.classList.add('active');
            } else {
                icon.className = 'fas fa-users';
                span.textContent = 'Chỉ hiện bài tập nhóm';
                elements.toggleGroupBtn.classList.remove('active');
            }
            
            updateAssignmentsList();
        });
    }

    // Info select (legacy)
    if (elements.infoCourseSelect) {
        elements.infoCourseSelect.addEventListener('change', (e) => loadCourseNotices(e.target.value));
    }
    
    // Unified Feed events
    if (elements.refreshFeedBtn) {
        elements.refreshFeedBtn.addEventListener('click', loadUnifiedFeed);
    }
    
    if (elements.exportFeedBtn) {
        elements.exportFeedBtn.addEventListener('click', exportFeedData);
    }

    // App Update controls
    const checkBtn = document.getElementById('check-update-btn');
    const restartBtn = document.getElementById('restart-update-btn');
    const progressRow = document.getElementById('update-progress-row');
    const progressBar = document.getElementById('update-progress-bar');
    const progressText = document.getElementById('update-progress-text');

    if (checkBtn) {
        checkBtn.addEventListener('click', async () => {
            try {
                checkBtn.disabled = true;
                checkBtn.innerHTML = '<i class="fas fa-sync fa-spin"></i> Đang kiểm tra...';
                const res = await window.electronAPI.checkForUpdates();
                if (!res || !res.success) {
                    showNotification(res?.error || 'Không thể kiểm tra cập nhật', 'error');
                }
            } finally {
                checkBtn.disabled = false;
                checkBtn.innerHTML = '<i class=\"fas fa-sync-alt\"></i> Kiểm tra cập nhật';
            }
        });
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', async () => {
            await window.electronAPI.quitAndInstall();
        });
    }

    if (window.electronAPI.onUpdateAvailable) {
        window.electronAPI.onUpdateAvailable(() => {
            showNotification('Có bản cập nhật mới. Đang tải...', 'info');
            if (progressRow) progressRow.style.display = 'flex';
        });
    }
    if (window.electronAPI.onUpdateProgress) {
        window.electronAPI.onUpdateProgress((p) => {
            const percent = Math.floor(p.percent || 0);
            if (progressBar) progressBar.style.width = `${percent}%`;
            if (progressText) progressText.textContent = `${percent}%`;
        });
    }
    if (window.electronAPI.onUpdateDownloaded) {
        window.electronAPI.onUpdateDownloaded(() => {
            showNotification('Tải xong bản cập nhật. Nhấn "Khởi động lại để cập nhật"', 'success');
            if (restartBtn) restartBtn.style.display = 'inline-flex';
        });
    }
    
    if (elements.feedSearch) {
        elements.feedSearch.addEventListener('input', (e) => {
            appState.feedData.currentFilters.search = e.target.value;
            applyFeedFilters();
            updateFeedUI();
            updateFeedStats();
        });
    }
    
    if (elements.clearSearch) {
        elements.clearSearch.addEventListener('click', () => {
            elements.feedSearch.value = '';
            appState.feedData.currentFilters.search = '';
            applyFeedFilters();
            updateFeedUI();
            updateFeedStats();
        });
    }
    
    if (elements.feedCourseFilter) {
        elements.feedCourseFilter.addEventListener('change', (e) => {
            appState.feedData.currentFilters.course = e.target.value;
            applyFeedFilters();
            updateFeedUI();
            updateFeedStats();
        });
    }
    
    if (elements.feedSort) {
        elements.feedSort.addEventListener('change', (e) => {
            appState.feedData.currentFilters.sort = e.target.value;
            applyFeedFilters();
            updateFeedUI();
        });
    }
    
    // Filter chips
    document.addEventListener('click', (e) => {
        if (e.target.closest('.filter-chip')) {
            const chip = e.target.closest('.filter-chip');
            const type = chip.dataset.type;
            
            // Update active state
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            
            // Update filter
            appState.feedData.currentFilters.type = type;
            applyFeedFilters();
            updateFeedUI();
            updateFeedStats();
        }
    });
    
    // Refresh data
    elements.refreshDataBtn.addEventListener('click', refreshData);
    
    // Export calendar
    if (elements.exportCalendarBtn) {
        elements.exportCalendarBtn.addEventListener('click', exportCalendar);
    }
    
    // Week calendar navigation
    if (elements.prevWeek) {
        elements.prevWeek.addEventListener('click', () => {
            appState.currentWeek.setDate(appState.currentWeek.getDate() - 7);
            updateWeekCalendar();
        });
    }
    
    if (elements.nextWeek) {
        elements.nextWeek.addEventListener('click', () => {
            appState.currentWeek.setDate(appState.currentWeek.getDate() + 7);
            updateWeekCalendar();
        });
    }
    
    // Quick actions
    if (elements.quickAssignments) {
        elements.quickAssignments.addEventListener('click', () => {
            showSection('assignments');
        });
    }
    
    if (elements.quickNotes) {
        elements.quickNotes.addEventListener('click', openQuickNotes);
    }
    
    if (elements.quickSchedule) {
        elements.quickSchedule.addEventListener('click', openQuickSchedule);
    }
    
    if (elements.quickExport) {
        elements.quickExport.addEventListener('click', exportReport);
    }
    
    // AI Study Plan button
    const aiStudyPlanBtn = document.getElementById('ai-study-plan');
    if (aiStudyPlanBtn) {
        aiStudyPlanBtn.addEventListener('click', openAIStudyPlan);
    }
    
    // Change account
    elements.changeAccountBtn.addEventListener('click', logout);

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Sidebar user profile click
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.addEventListener('click', () => {
            showSection('settings');
        });
    }

    // TLS checkbox
    if (elements.allowInsecureTLS) {
        elements.allowInsecureTLS.addEventListener('change', async (e) => {
            await window.electronAPI.setSetting('allowInsecureTLS', e.target.checked);
            showNotification('Thiết lập TLS đã được lưu. Vui lòng thử lại thao tác.', 'info');
        });
    }
    if (elements.baseUrlInput) {
        elements.baseUrlInput.addEventListener('change', async (e) => {
            const url = e.target.value.trim();
            if (url) {
                await window.electronAPI.setBaseUrl(url);
                showNotification('Đã lưu Base URL. Vui lòng thử lại.', 'success');
            }
        });
    }
    if (elements.enableNotifications) {
        elements.enableNotifications.addEventListener('change', async (e) => {
            await window.electronAPI.setSetting('enableNotifications', e.target.checked);
            showNotification('Đã lưu cài đặt thông báo.', 'success');
            // Restart polling with new settings
            if (appState.currentUser) {
                stopPolling();
                startPolling();
            }
        });
    }
    if (elements.pollingInterval) {
        elements.pollingInterval.addEventListener('change', async (e) => {
            const interval = Math.max(1, Math.min(60, parseInt(e.target.value) || 5));
            await window.electronAPI.setSetting('pollingInterval', interval);
            showNotification('Đã lưu chu kỳ kiểm tra.', 'success');
            // Restart polling with new interval
            if (appState.currentUser) {
                stopPolling();
                startPolling();
            }
        });
    }
    
    // Smart Notification event listeners
    if (elements.enableToastNotifications) {
        elements.enableToastNotifications.addEventListener('change', (e) => {
            smartNotifications.settings.showToasts = e.target.checked;
            smartNotifications.saveSettings();
        });
    }
    
    if (elements.enableInAppNotifications) {
        elements.enableInAppNotifications.addEventListener('change', (e) => {
            smartNotifications.settings.showInApp = e.target.checked;
            smartNotifications.saveSettings();
        });
    }
    
    if (elements.enableNotificationSound) {
        elements.enableNotificationSound.addEventListener('change', (e) => {
            smartNotifications.settings.soundEnabled = e.target.checked;
            smartNotifications.saveSettings();
        });
    }
    
    if (elements.notificationCheckInterval) {
        elements.notificationCheckInterval.addEventListener('change', (e) => {
            const interval = Math.max(1, Math.min(60, parseInt(e.target.value) || 5));
            smartNotifications.settings.checkInterval = interval * 60 * 1000;
            smartNotifications.saveSettings();
        });
    }
    
    if (elements.notifyNewAssignments) {
        elements.notifyNewAssignments.addEventListener('change', (e) => {
            smartNotifications.settings.notifyNewAssignments = e.target.checked;
            smartNotifications.saveSettings();
        });
    }
    
    if (elements.notifyNewContent) {
        elements.notifyNewContent.addEventListener('change', (e) => {
            smartNotifications.settings.notifyNewContent = e.target.checked;
            smartNotifications.saveSettings();
        });
    }
    
    if (elements.notifyUpcomingDeadlines) {
        elements.notifyUpcomingDeadlines.addEventListener('change', (e) => {
            smartNotifications.settings.notifyUpcomingDeadlines = e.target.checked;
            smartNotifications.saveSettings();
        });
    }
    
    if (elements.testNotificationBtn) {
        elements.testNotificationBtn.addEventListener('click', () => {
            smartNotifications.testNotification();
        });
    }
    
    if (elements.clearNotificationHistoryBtn) {
        elements.clearNotificationHistoryBtn.addEventListener('click', () => {
            if (confirm('Bạn có chắc chắn muốn xóa lịch sử thông báo?')) {
                // Clear notification history logic here
                showNotification('Đã xóa lịch sử thông báo', 'success');
            }
        });
    }
    
    // Enter key events
    elements.newStudentId.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            elements.newToken.focus();
        }
    });
    
    elements.newToken.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            elements.registerBtn.click();
        }
    });
}

// COURSE DETAILS MODAL FUNCTIONS
let currentCourseDetails = null;

async function openCourseDetails(courseId) {
    try {
        console.log('Opening course details for ID:', courseId);
        const course = appState.courses.find(c => c.id === courseId);
        if (!course) {
            console.error('Course not found:', courseId);
            showNotification('Không tìm thấy khóa học', 'error');
            return;
        }
        
        console.log('Found course:', course.fullname);
        currentCourseDetails = course;
        appState.currentCourse = course;
        
        // Show course details page
        console.log('Showing course details page');
        showCourseDetailsPage(course);
        
    } catch (error) {
        console.error('Error opening course details:', error);
        showNotification('Lỗi tải thông tin môn học', 'error');
    }
}

async function showCourseDetailsPage(course) {
    console.log('showCourseDetailsPage called for course:', course.fullname);
    
    // Update title
    elements.courseDetailsTitle.innerHTML = `<i class="fas fa-graduation-cap"></i> ${course.fullname}`;
    console.log('Updated course title');
    
    // Update open course button
    elements.openCourseBtn.onclick = () => openCourseInBrowser(course.id);
    console.log('Updated open course button');
    
    // Update course meta (optional elements - may not exist after UI cleanup)
    try {
        if (elements.courseInstructor) {
            const span = elements.courseInstructor.querySelector('span');
            if (span) span.textContent = `${course.instructor || 'Chưa có thông tin'}`;
            console.log('Updated course instructor');
        }
        if (elements.courseSemester) {
            const semester = appState.courseSemMap.get(course.id) ? 
                getCategory(appState.courseSemMap.get(course.id)) : null;
            const span = elements.courseSemester.querySelector('span');
            if (span) span.textContent = `${semester ? semester.name : 'Khóa học chung'}`;
            console.log('Updated course semester');
        }
    } catch (e) {
        console.warn('Optional course meta not updated:', e.message);
    }
    
    console.log('Updated breadcrumb');
    
    // Show loading
    elements.courseDetailsContent.innerHTML = `
        <div class="loading-placeholder">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Đang tải nội dung khóa học...</p>
        </div>
    `;
    console.log('Set loading content');
    
    
    // Show course details section
    console.log('Calling showSection with course-details');
    showSection('course-details');
    
    // Load course content
    console.log('Loading course details content');
    await loadCourseDetailsContent(course.id);
}

async function loadCourseDetailsContent(courseId) {
    try {
        console.log('Loading course details content for course:', courseId);
        
        // Load course details, teachers, announcements, and contents in parallel (like @upgrade/)
        console.log('Loading course data with token:', appState.currentToken, 'courseId:', courseId);
        
        const [courseDetails, teachers, announcements, contents] = await Promise.all([
            callAPI('getCourseDetails', appState.currentToken, courseId).catch(err => {
                console.error('Error loading course details:', err);
                return {};
            }),
            callAPI('getCourseTeachers', appState.currentToken, courseId).catch(err => {
                console.error('Error loading course teachers:', err);
                return [];
            }),
            callAPI('getCourseAnnouncements', appState.currentToken, courseId).catch(err => {
                console.error('Error loading course announcements:', err);
                return [];
            }),
            callAPI('getCourseContents', appState.currentToken, courseId).catch(err => {
                console.error('Error loading course contents:', err);
                return [];
            })
        ]);
        
        console.log('Course data loaded:', {
            details: courseDetails,
            teachers: teachers.length,
            announcements: announcements.length,
            contents: contents.length
        });
        
        // Update course instructor info (guard missing DOM)
        if (teachers.length > 0 && elements.courseInstructor) {
            const instructorNames = teachers.map(t => t.fullname).join(', ');
            const span = elements.courseInstructor.querySelector('span');
            if (span) span.textContent = instructorNames;
            console.log('Updated instructor info:', instructorNames);
        } else {
            console.log('No teachers found or instructor element missing');
        }
        
        // Get assignments for this course (ensure we load them fresh for this course)
        let courseAssignments = [];
        try {
            courseAssignments = await loadAssignmentsForCourse(courseId);
        } catch (e) {
            console.warn('Failed to load assignments for course details, falling back to cached list:', e.message);
            courseAssignments = appState.assignments.filter(a => (a.course === courseId) || (a.courseid === courseId));
        }
        
        // Organize content by type
        const contentByType = {
            assignments: courseAssignments,
            announcements: announcements,
            resources: [],
            links: [],
            pages: []
        };
        
        contents.forEach(section => {
            (section.modules || []).forEach(module => {
                const contentItem = {
                    id: module.id,
                    name: module.name || 'Untitled',
                    description: module.description || '',
                    url: module.url || '#',
                    added: module.added || Date.now() / 1000,
                    modified: module.modified || Date.now() / 1000,
                    visible: module.visible !== 0,
                    sectionName: section.name || 'General',
                    contents: module.contents || []
                };
                
                if (contentItem.visible) {
                    switch (module.modname) {
                        case 'forum':
                            contentByType.announcements.push(contentItem);
                            break;
                        case 'resource':
                            contentByType.resources.push(contentItem);
                            break;
                        case 'url':
                            contentByType.links.push(contentItem);
                            break;
                        case 'page':
                            contentByType.pages.push(contentItem);
                            break;
                    }
                }
            });
        });
        
    // Render content with course details for summary/links
    renderCourseDetailsContent(contentByType, courseDetails);
        
    } catch (error) {
        console.error('Error loading course content:', error);
        elements.courseDetailsContent.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Lỗi tải nội dung môn học: ${error.message}</p>
            </div>
        `;
    }
}

function renderCourseDetailsContent(contentByType, courseDetails = {}) {
    const { assignments, announcements, resources, links, pages } = contentByType;
    
    elements.courseDetailsContent.innerHTML = `
        <div class="course-details-content">
            <!-- Unified Header Card -->
            <div class="course-header-card">
                <div class="course-header-content">
                    <div class="course-icon">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <div class="course-header-info">
                        <h3 class="course-name">${currentCourseDetails.fullname}</h3>
                        <div class="course-meta-line">
                            <span class="meta-chip"><i class="fas fa-hashtag"></i> ${currentCourseDetails.shortname}</span>
                            ${courseDetails.instructor || (courseDetails.contacts && courseDetails.contacts[0]?.fullname) ? `
                                <span class="meta-chip"><i class="fas fa-user-tie"></i> ${courseDetails.instructor || courseDetails.contacts[0].fullname}</span>
                            ` : ''}
                            ${courseDetails.categoryname ? `
                                <span class="meta-chip"><i class="fas fa-calendar-alt"></i> ${courseDetails.categoryname}</span>
                            ` : ''}
                        </div>
                        ${courseDetails.summary ? `
                            <p class="course-description">${courseDetails.summary.replace(/<[^>]*>/g, '').substring(0, 150)}${courseDetails.summary.length > 150 ? '...' : ''}</p>
                        ` : ''}
                    </div>
                    <div class="course-header-actions">
                        ${courseDetails.viewurl ? `
                            <a href="${courseDetails.viewurl}" target="_blank" class="btn btn-primary">
                                <i class="fas fa-external-link-alt"></i>
                                Vào môn học
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>

            <!-- Course Stats Grid -->
            <div class="course-stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">${assignments.length}</div>
                        <div class="stat-label">Bài tập</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-bullhorn"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">${announcements.length}</div>
                        <div class="stat-label">Thông báo</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">${resources.length}</div>
                        <div class="stat-label">Tài liệu</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-link"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">${links.length + pages.length}</div>
                        <div class="stat-label">Liên kết</div>
                    </div>
                </div>
            </div>
            
            <!-- Assignments Section -->
            <div class="details-section">
                <h4><i class="fas fa-tasks"></i> Bài tập (${assignments.length})</h4>
                ${assignments.length > 0 ? `
                    <div class="content-list">
                        ${assignments.map(assignment => `
                            <div class="content-item">
                                <div class="content-item-header">
                                    <span class="content-type-badge assignment">Bài tập</span>
                                    <span class="content-date">${formatDate(assignment.duedate)}</span>
                                </div>
                                <h5 class="content-title">${assignment.name}</h5>
                                <p class="content-description">${assignment.intro || 'Không có mô tả'}</p>
                                <div class="content-meta">
                                    <span class="status-badge ${getAssignmentStatus(assignment)}">${getAssignmentStatusText(assignment)}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-content">Không có bài tập nào</p>'}
            </div>
            
            <!-- Announcements Section -->
            <div class="details-section">
                <h4><i class="fas fa-bullhorn"></i> Thông báo (${announcements.length})</h4>
                ${announcements.length > 0 ? `
                    <div class="content-list">
                        ${announcements.map(announcement => `
                            <div class="content-item">
                                <div class="content-item-header">
                                    <span class="content-type-badge announcement">Thông báo</span>
                                    <span class="content-date">${formatDate(announcement.timemodified)}</span>
                                </div>
                                <h5 class="content-title">
                                    <a href="${announcement.url}" target="_blank" rel="noopener">${announcement.name}</a>
                                </h5>
                                <div class="content-meta">
                                    <span class="author">${announcement.userfullname || 'Không rõ tác giả'}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-content">Không có thông báo nào</p>'}
            </div>
            
            <!-- Resources Section -->
            <div class="details-section">
                <h4><i class="fas fa-file-alt"></i> Tài liệu (${resources.length})</h4>
                ${resources.length > 0 ? `
                    <div class="content-list">
                        ${resources.map(resource => `
                            <div class="content-item">
                                <div class="content-item-header">
                                    <span class="content-type-badge resource">Tài liệu</span>
                                    <span class="content-date">${formatDate(resource.added)}</span>
                                </div>
                                <h5 class="content-title">
                                    ${resource.url ? `<a href="${ensureUrlWithToken(resource.url)}" target="_blank" rel="noopener">${resource.name}</a>` : resource.name}
                                </h5>
                                <p class="content-description">${resource.description || 'Không có mô tả'}</p>
                                ${resource.contents && resource.contents.length > 0 ? `
                                    <div class="resource-files">
                                        <h6>Files:</h6>
                                        <ul class="file-list">
                                            ${resource.contents.map(file => `
                                                <li>
                                                    <a href="${ensureUrlWithToken(file.proxyurl || file.moodleurl || file.fileurl || '#')}" target="_blank" rel="noopener">
                                                        ${file.filename || file.filepath || 'file'}
                                                    </a>
                                                    ${file.filesize ? ` <small>(${Math.round(file.filesize/1024)} KB)</small>` : ''}
                                                </li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-content">Không có tài liệu nào</p>'}
            </div>
            
            <!-- Links Section -->
            <div class="details-section">
                <h4><i class="fas fa-link"></i> Liên kết (${links.length})</h4>
                ${links.length > 0 ? `
                    <div class="content-list">
                        ${links.map(item => `
                            <div class="content-item">
                                <div class="content-item-header">
                                    <span class="content-type-badge link">Liên kết</span>
                                    <span class="content-date">${formatDate(item.modified)}</span>
                                </div>
                                <h5 class="content-title">${item.name}</h5>
                                <p class="content-description">${item.description || 'Không có mô tả'}</p>
                                <div class="content-meta">
                                    <span>Phần: ${item.sectionName}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-content">Không có liên kết nào</p>'}
            </div>
            
            <!-- Pages Section -->
            <div class="details-section">
                <h4><i class="fas fa-file-text"></i> Trang (${pages.length})</h4>
                ${pages.length > 0 ? `
                    <div class="content-list">
                        ${pages.map(item => `
                            <div class="content-item">
                                <div class="content-item-header">
                                    <span class="content-type-badge page">Trang</span>
                                    <span class="content-date">${formatDate(item.modified)}</span>
                                </div>
                                <h5 class="content-title">${item.name}</h5>
                                <p class="content-description">${item.description || 'Không có mô tả'}</p>
                                <div class="content-meta">
                                    <span>Phần: ${item.sectionName}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-content">Không có trang nào</p>'}
            </div>
        </div>
    `;
}

function closeCourseDetails() {
    elements.courseDetailsModal.classList.add('hidden');
    currentCourseDetails = null;
    appState.currentCourse = null;
    
}

function openCourseInBrowser(courseId) {
    const course = appState.courses.find(c => c.id === courseId);
    if (!course) {
        console.error('Course not found:', courseId);
        return;
    }
    
    // Open course URL in external browser
    const courseUrl = `${appState.baseUrl}/course/view.php?id=${courseId}`;
    console.log('Opening course URL:', courseUrl);
    window.electronAPI.openExternal(courseUrl);
}

// Helper: append token to Moodle file URLs when missing to avoid missingparam errors
function ensureUrlWithToken(url) {
    try {
        if (!url || !appState || !appState.currentToken) return url;
        const hasToken = url.includes('token=');
        if (hasToken) return url;
        const hasQuery = url.includes('?');
        return `${url}${hasQuery ? '&' : '?'}token=${encodeURIComponent(appState.currentToken)}`;
    } catch (e) {
        console.warn('ensureUrlWithToken error:', e.message);
        return url;
    }
}

function refreshCourseDetails() {
    if (currentCourseDetails) {
        loadCourseDetailsContent(currentCourseDetails.id);
    }
}

// Search and filter functions
function performGlobalSearch() {
    if (!appState.searchQuery) {
        // Clear search - show all content
        updateCoursesList();
        return;
    }
    
    const query = appState.searchQuery.toLowerCase();
    const filteredCourses = appState.courses.filter(course => {
        return course.fullname.toLowerCase().includes(query) ||
               course.shortname.toLowerCase().includes(query) ||
               (course.instructor && course.instructor.toLowerCase().includes(query));
    });
    
    // Update course lists with filtered results
    updateCoursesListWithFilter(filteredCourses);
}

function updateCoursesListWithFilter(filteredCourses) {
    if (!filteredCourses || filteredCourses.length === 0) {
        elements.generalCoursesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>Không tìm thấy khóa học nào</p>
            </div>
        `;
        elements.semesterCoursesList.innerHTML = '';
        return;
    }

    // Separate general and semester courses
    const generalCourses = filteredCourses.filter(course => {
        const semester = appState.courseSemMap.get(course.id) ? 
            getCategory(appState.courseSemMap.get(course.id)) : null;
        return !semester;
    });
    
    const semesterCourses = filteredCourses.filter(course => {
        const semester = appState.courseSemMap.get(course.id) ? 
            getCategory(appState.courseSemMap.get(course.id)) : null;
        return semester;
    });

    // Update counts
    elements.generalCount.textContent = generalCourses.length;
    elements.semesterCount.textContent = semesterCourses.length;

    // Render filtered courses
    if (generalCourses.length > 0) {
        elements.generalCoursesList.innerHTML = generalCourses.map(course => 
            createCourseCard(course)
        ).join('');
    } else {
        elements.generalCoursesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-globe"></i>
                <p>Không có khóa học chung nào</p>
            </div>
        `;
    }

    if (semesterCourses.length > 0) {
        elements.semesterCoursesList.innerHTML = semesterCourses.map(course => 
            createCourseCard(course)
        ).join('');
    } else {
        elements.semesterCoursesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-alt"></i>
                <p>Không có khóa học theo kỳ nào</p>
            </div>
        `;
    }
}

function filterCoursesBySemester() {
    const selectedSemester = elements.semesterFilterCourses.value;
    
    if (!selectedSemester) {
        // Show all courses
        updateCoursesList();
        return;
    }
    
    const filteredCourses = appState.courses.filter(course => {
        const semester = appState.courseSemMap.get(course.id) ? 
            getCategory(appState.courseSemMap.get(course.id)) : null;
        return semester && semester.id.toString() === selectedSemester;
    });
    
    updateCoursesListWithFilter(filteredCourses);
}

// App initialization
async function init() {
    // Hide loading screen
    setTimeout(() => {
        elements.loadingScreen.classList.add('hidden');
        elements.loginScreen.classList.remove('hidden');
    }, 2000);
    
    // Setup event listeners
    setupEventListeners();
    await applyThemeFromSettings();
    
    // Initialize sidebar
    updateSidebarUserInfo();
    
    // Initialize smart notifications
    await smartNotifications.init();
    
    // Load saved accounts
    await loadSavedAccounts();
    
    // Listen for saved accounts from main process
    window.electronAPI.onHasSavedAccounts((event, accounts) => {
        if (accounts.length > 0) {
            showNotification(`Tìm thấy ${accounts.length} tài khoản đã lưu`, 'info');
        }
    });
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
