import { computed, ref } from 'vue';

const BASE_URL = '/vnua-api';

const ENDPOINTS = {
  login: '/api/auth/login',
  terms: '/api/sch/w-locdshockytkbuser',
  schedule: '/api/sch/w-locdstkbhockytheodoituong',
  grades: '/api/srm/w-locdsdiemsinhvien?hien_thi_mon_theo_hkdk=false',
  exam: '/api/epm/w-locdslichthisvtheohocky',
};

const STORAGE_KEYS = {
  token: 'vnua_student_token',
  tokenAt: 'vnua_student_token_at',
  credentials: 'vnua_student_credentials_enc',
};

const TOKEN_TTL_MS = 15 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 60 * 1000;

function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(base64) {
  const bin = atob(base64);
  return Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
}

async function getAesKey() {
  const encoder = new TextEncoder();
  const material = `${window.location.origin}::vnua-secret-v1`;
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoder.encode(material));
  return window.crypto.subtle.importKey('raw', hashBuffer, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

async function encryptPayload(payload) {
  const key = await getAesKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const cipherBuffer = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  const cipher = new Uint8Array(cipherBuffer);
  return JSON.stringify({
    iv: toBase64(iv),
    data: toBase64(cipher),
  });
}

async function decryptPayload(cipherText) {
  const parsed = JSON.parse(cipherText);
  const key = await getAesKey();
  const iv = fromBase64(parsed.iv);
  const data = fromBase64(parsed.data);
  const plainBuffer = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return JSON.parse(new TextDecoder().decode(plainBuffer));
}

export function useVnuaSchoolApi() {
  const username = ref('');
  const password = ref('');
  const rememberCredential = ref(true);
  const loading = ref(false);
  const error = ref('');

  const token = ref(window.sessionStorage.getItem(STORAGE_KEYS.token) ?? '');
  const tokenIssuedAt = ref(Number(window.sessionStorage.getItem(STORAGE_KEYS.tokenAt) ?? 0));

  const terms = ref([]);
  const selectedTerm = ref('');
  const schedule = ref([]);
  const grades = ref([]);
  const exams = ref([]);
  const lastStatus = ref('');
  const activeBaseUrl = ref(BASE_URL);

  const isLoggedIn = computed(() => Boolean(token.value));

  function setError(message) {
    error.value = message;
  }

  function clearError() {
    error.value = '';
    lastStatus.value = '';
  }

  function pickAccessToken(payload) {
    return payload?.access_token
      ?? payload?.token
      ?? payload?.data?.access_token
      ?? payload?.data?.token
      ?? '';
  }

  function pickApiMessage(payload) {
    return payload?.message
      ?? payload?.msg
      ?? payload?.error_description
      ?? payload?.error
      ?? '';
  }

  function saveToken(nextToken) {
    token.value = nextToken;
    tokenIssuedAt.value = Date.now();
    window.sessionStorage.setItem(STORAGE_KEYS.token, nextToken);
    window.sessionStorage.setItem(STORAGE_KEYS.tokenAt, String(tokenIssuedAt.value));
  }

  function clearToken() {
    token.value = '';
    tokenIssuedAt.value = 0;
    window.sessionStorage.removeItem(STORAGE_KEYS.token);
    window.sessionStorage.removeItem(STORAGE_KEYS.tokenAt);
  }

  async function saveCredentialsIfNeeded() {
    if (!rememberCredential.value) {
      window.localStorage.removeItem(STORAGE_KEYS.credentials);
      return;
    }
    const encrypted = await encryptPayload({
      username: username.value,
      password: password.value,
    });
    window.localStorage.setItem(STORAGE_KEYS.credentials, encrypted);
  }

  async function loadCredentials() {
    const raw = window.localStorage.getItem(STORAGE_KEYS.credentials);
    if (!raw) return;
    try {
      const payload = await decryptPayload(raw);
      username.value = payload.username ?? '';
      password.value = payload.password ?? '';
      rememberCredential.value = Boolean(username.value && password.value);
    } catch {
      window.localStorage.removeItem(STORAGE_KEYS.credentials);
    }
  }

  function isTokenExpired() {
    if (!token.value || !tokenIssuedAt.value) return true;
    return Date.now() - tokenIssuedAt.value >= TOKEN_TTL_MS;
  }

  async function postJson(path, body, accessToken) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);

    let payload = null;
    try {
      const text = await response.text();
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = null;
    }

    return { response, payload };
  }

  async function loginStudent() {
    clearError();
    if (!username.value || !password.value) {
      setError('Nhập mã sinh viên và mật khẩu trước khi đăng nhập.');
      return false;
    }

    loading.value = true;
    try {
      const primaryBody = {
        username: username.value,
        password: password.value,
        grant_type: 'password',
      };

      let { response, payload } = await postJson(ENDPOINTS.login, primaryBody);

      // Some deployments validate different key names for username.
      if (!response.ok || !pickAccessToken(payload)) {
        const fallbackBody = {
          ma_sv: username.value,
          password: password.value,
          grant_type: 'password',
        };
        const fallback = await postJson(ENDPOINTS.login, fallbackBody);
        response = fallback.response;
        payload = fallback.payload;
      }

      const tokenValue = pickAccessToken(payload);

      if (!response.ok || !tokenValue) {
        const reason = pickApiMessage(payload);
        const suffix = reason ? ` (${reason})` : '';
        setError(`Đăng nhập thất bại. Kiểm tra lại tài khoản hoặc mật khẩu.${suffix}`);
        lastStatus.value = `login:${response.status || 'network'}`;
        return false;
      }

      saveToken(tokenValue);
      await saveCredentialsIfNeeded();
      return true;
    } catch (err) {
      if (err?.name === 'AbortError') {
        setError('Hết thời gian chờ khi đăng nhập VNUA (60s). Vui lòng thử lại.');
        lastStatus.value = 'login:timeout';
        return false;
      }
      setError('Không kết nối được VNUA. Hãy chạy app bằng npm run dev hoặc npm run start để /vnua-api proxy hoạt động.');
      lastStatus.value = 'login:network-error';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function ensureSession() {
    if (!isTokenExpired()) return true;
    return loginStudent();
  }

  async function authenticatedPost(path, body, retry = true) {
    const hasSession = await ensureSession();
    if (!hasSession) {
      throw new Error('NO_SESSION');
    }

    const { response, payload } = await postJson(path, body, token.value);

    if ((response.status === 401 || response.status === 403 || response.status === 500) && retry) {
      lastStatus.value = `retry:${response.status}`;
      const relogin = await loginStudent();
      if (!relogin) throw new Error('RELOGIN_FAILED');
      return authenticatedPost(path, body, false);
    }

    if (!response.ok) {
      throw new Error(`HTTP_${response.status}`);
    }

    return payload;
  }

  async function loadTerms() {
    clearError();
    loading.value = true;
    try {
      const payload = await authenticatedPost(ENDPOINTS.terms, {
        loai_doi_tuong: 1,
        id_du_lieu: null,
      });

      const list = payload?.data?.ds_hoc_ky ?? [];
      terms.value = Array.isArray(list) ? list : [];

      const current = payload?.data?.hoc_ky_theo_ngay_hien_tai;
      const fallback = terms.value[0]?.hoc_ky ?? terms.value[0]?.value ?? '';
      selectedTerm.value = String(current ?? fallback ?? '');
    } catch {
      setError('Không lấy được học kỳ. Nếu server trả 500, app đã thử đăng nhập lại 1 lần.');
    } finally {
      loading.value = false;
    }
  }

  async function loadSchedule() {
    if (!selectedTerm.value) return;
    clearError();
    loading.value = true;
    try {
      const payload = await authenticatedPost(ENDPOINTS.schedule, {
        hoc_ky: Number(selectedTerm.value),
        loai_doi_tuong: 1,
        id_du_lieu: null,
      });
      schedule.value = payload?.data?.ds_nhom_to ?? [];
    } catch {
      setError('Không tải được lịch học.');
    } finally {
      loading.value = false;
    }
  }

  async function loadGrades() {
    clearError();
    loading.value = true;
    try {
      const payload = await authenticatedPost(ENDPOINTS.grades, {
        ma_sv: username.value,
        loai_doi_tuong: 1,
      });
      grades.value = payload?.data?.ds_diem_hocky ?? [];
    } catch {
      setError('Không tải được bảng điểm.');
    } finally {
      loading.value = false;
    }
  }

  async function loadExams() {
    if (!selectedTerm.value) return;
    clearError();
    loading.value = true;
    try {
      const payload = await authenticatedPost(ENDPOINTS.exam, {
        filter: {
          hoc_ky: Number(selectedTerm.value),
          is_giua_ky: false,
        },
        additional: {
          paging: { limit: 100, page: 1 },
          ordering: [{ name: null, order_type: null }],
        },
      });
      exams.value = payload?.data?.ds_lich_thi ?? [];
    } catch {
      setError('Không tải được lịch thi.');
    } finally {
      loading.value = false;
    }
  }

  function logoutStudent() {
    clearToken();
    terms.value = [];
    selectedTerm.value = '';
    schedule.value = [];
    grades.value = [];
    exams.value = [];
  }

  return {
    username,
    password,
    rememberCredential,
    loading,
    error,
    terms,
    selectedTerm,
    schedule,
    grades,
    exams,
    lastStatus,
    activeBaseUrl,
    isLoggedIn,
    loadCredentials,
    loginStudent,
    logoutStudent,
    loadTerms,
    loadSchedule,
    loadGrades,
    loadExams,
  };
}
