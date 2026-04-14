import axios from 'axios';
import { computed, ref } from 'vue';

const API_HOST = 'https://daotao.vnua.edu.vn';
const BASE_URL = import.meta.env.VITE_VNUA_API_BASE || '/vnua-api';

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

const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/plain, */*',
  },
  validateStatus: () => true,
});

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
  const scheduleMeta = ref({});
  const grades = ref([]);
  const exams = ref([]);
  const lastStatus = ref('');
  const activeBaseUrl = ref(BASE_URL === '/vnua-api' ? API_HOST : BASE_URL);

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

  function isOk(response) {
    return response?.status >= 200 && response?.status < 300;
  }

  async function postJson(path, body, accessToken) {
    const response = await axiosClient.post(path, body, {
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

    const payload = response?.data ?? null;

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
      let response;
      let payload;

      // API login thường cần x-www-form-urlencoded như Postman.
      const tryBodies = [
        new URLSearchParams({
          username: username.value,
          password: password.value,
          grant_type: 'password',
        }),
        new URLSearchParams({
          userName: username.value,
          password: password.value,
          grant_type: 'password',
        }),
      ];

      for (const body of tryBodies) {
        const formResp = await axiosClient.post(ENDPOINTS.login, body, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        response = formResp;
        payload = formResp?.data ?? null;

        if (isOk(response) && pickAccessToken(payload)) {
          break;
        }
      }

      // Fallback JSON nếu server instance chấp nhận JSON payload.
      if (!isOk(response) || !pickAccessToken(payload)) {
        const fallbackBody = {
          username: username.value,
          password: password.value,
          grant_type: 'password',
        };
        const fallback = await postJson(ENDPOINTS.login, fallbackBody);
        response = fallback.response;
        payload = fallback.payload;
      }

      const tokenValue = pickAccessToken(payload);

      if (!isOk(response) || !tokenValue) {
        if ([403, 451].includes(response?.status)) {
          setError('Endpoint đăng nhập bị chặn theo IP/vùng mạng. Hãy dùng relay/proxy đặt tại VN và cấu hình VITE_VNUA_API_BASE.');
          lastStatus.value = `login:blocked:${response.status}`;
          return false;
        }
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
      if (err?.code === 'ECONNABORTED') {
        setError('Hết thời gian chờ khi đăng nhập VNUA (60s). Vui lòng thử lại.');
        lastStatus.value = 'login:timeout';
        return false;
      }
      setError('Không kết nối được VNUA. Nếu server ở Singapore bị chặn, hãy đặt relay/proxy tại VN và cấu hình VITE_VNUA_API_BASE.');
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

    if (!isOk(response)) {
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

      const data = payload?.data ?? {};
      scheduleMeta.value = {
        totalItems: Number(data?.total_items ?? 0),
        totalPages: Number(data?.total_pages ?? 0),
        loaiHienThiTuan: payload?.loai_hien_thi_tuan ?? null,
      };
      schedule.value = Array.isArray(data?.ds_nhom_to) ? data.ds_nhom_to : [];
      lastStatus.value = `schedule:ok:${schedule.value.length}`;
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
    scheduleMeta.value = {};
    grades.value = [];
    exams.value = [];
    clearError();
  }

  function logoutAll() {
    logoutStudent();
    username.value = '';
    password.value = '';
    rememberCredential.value = false;
    window.localStorage.removeItem(STORAGE_KEYS.credentials);
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
    scheduleMeta,
    grades,
    exams,
    lastStatus,
    activeBaseUrl,
    isLoggedIn,
    loadCredentials,
    loginStudent,
    logoutStudent,
    logoutAll,
    loadTerms,
    loadSchedule,
    loadGrades,
    loadExams,
  };
}
