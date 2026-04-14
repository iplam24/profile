<script setup>
import { computed, onMounted, proxyRefs, ref } from 'vue';
import { BookOpenCheck, CalendarDays, ChevronDown, ChevronUp, GraduationCap, LogIn, LogOut, ShieldCheck } from 'lucide-vue-next';
import { useVnuaSchoolApi } from '../composables/useVnuaSchoolApi';

const open = ref(true);
const showLoginForm = ref(true);
const detailView = ref('schedule');
const api = proxyRefs(useVnuaSchoolApi());

function pickValue(source, keys, fallback = '-') {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
  }
  return fallback;
}

const scheduleRows = computed(() => (Array.isArray(api.schedule) ? api.schedule : []));
const examRows = computed(() => (Array.isArray(api.exams) ? api.exams : []));
const gradeRows = computed(() => {
  if (!Array.isArray(api.grades)) return [];
  return api.grades.flatMap((semester) => {
    const semesterName = pickValue(semester, ['ten_hoc_ky', 'hoc_ky'], 'Không rõ học kỳ');
    const subjects = Array.isArray(semester?.ds_diem_mon_hoc) ? semester.ds_diem_mon_hoc : [];
    return subjects.map((subject) => ({
      semesterName,
      subject,
    }));
  });
});

const weekdayOrder = [2, 3, 4, 5, 6, 7, 8];

function normalizeThu(value) {
  const thu = Number(value);
  if (!Number.isFinite(thu)) return 0;
  if (thu === 1) return 8;
  return thu;
}

function weekdayLabel(thu) {
  const labels = {
    2: 'Thứ 2',
    3: 'Thứ 3',
    4: 'Thứ 4',
    5: 'Thứ 5',
    6: 'Thứ 6',
    7: 'Thứ 7',
    8: 'Chủ nhật',
  };
  return labels[thu] ?? `Thứ ${thu}`;
}

function slotSortValue(item) {
  const from = pickValue(item, ['tu_gio'], '99:99');
  const tbd = Number(pickValue(item, ['tbd'], '99'));
  return `${from}-${String(Number.isFinite(tbd) ? tbd : 99).padStart(2, '0')}`;
}

const scheduleCalendar = computed(() => {
  return weekdayOrder.map((weekday) => {
    const items = scheduleRows.value
      .filter((item) => normalizeThu(item?.thu) === weekday)
      .slice()
      .sort((a, b) => slotSortValue(a).localeCompare(slotSortValue(b)));

    return {
      weekday,
      label: weekdayLabel(weekday),
      items,
    };
  });
});

function togglePanel() {
  open.value = !open.value;
}

async function submitLogin() {
  const ok = await api.loginStudent();
  if (!ok) return;
  showLoginForm.value = false;
  await api.loadTerms();
}

function handleLogoutAll() {
  api.logoutAll();
  showLoginForm.value = true;
}

async function refreshAll() {
  await api.loadTerms();
  await api.loadSchedule();
  await api.loadGrades();
  await api.loadExams();
}

onMounted(async () => {
  await api.loadCredentials();
  showLoginForm.value = !api.isLoggedIn;
});
</script>

<template>
  <section class="card vnua-card">
    <button class="vnua-toggle" type="button" @click="togglePanel">
      <span class="left">
        <ShieldCheck :size="18" />
        Cổng đào tạo VNUA
      </span>
      <span class="right">
        {{ open ? 'Thu gọn' : 'Mở nhanh' }}
        <ChevronUp v-if="open" :size="16" />
        <ChevronDown v-else :size="16" />
      </span>
    </button>

    <div v-if="open" class="vnua-content">
      <p class="vnua-note">
        Hệ thống daotao vnua chặn ip nước ngoài!!!!!!!!!!!!.
      </p>
      <p class="vnua-note" v-if="api.activeBaseUrl">
        
      </p>

      <div class="auth-grid" v-if="!api.isLoggedIn || showLoginForm">
        <label>
          <span>Mã sinh viên</span>
          <input v-model.trim="api.username" placeholder="Nhập mã sinh viên" />
        </label>
        <label>
          <span>Mật khẩu</span>
          <input v-model="api.password" type="password" placeholder="Nhập mật khẩu" />
        </label>
        <label class="check-wrap">
          <input v-model="api.rememberCredential" type="checkbox" />
          <span>Lưu mã hóa tài khoản và mật khẩu trên trình duyệt này</span>
        </label>

        <button class="primary-btn" type="button" :disabled="api.loading" @click="submitLogin">
          <LogIn :size="16" />
          Đăng nhập VNUA
        </button>
      </div>

      <div class="toolbar" v-else>
        <label>
          <span>Học kỳ</span>
          <select v-model="api.selectedTerm">
            <option v-for="term in api.terms" :key="term.hoc_ky ?? term.value" :value="String(term.hoc_ky ?? term.value)">
              {{ term.ten_hoc_ky ?? term.text ?? term.hoc_ky }}
            </option>
          </select>
        </label>

        <div class="actions">
          <button class="secondary-btn" type="button" :disabled="api.loading" @click="api.loadSchedule">
            <CalendarDays :size="16" />
            Lịch học
          </button>
          <button class="secondary-btn" type="button" :disabled="api.loading" @click="api.loadGrades">
            <GraduationCap :size="16" />
            Bảng điểm
          </button>
          <button class="secondary-btn" type="button" :disabled="api.loading" @click="api.loadExams">
            <BookOpenCheck :size="16" />
            Lịch thi
          </button>
          <button class="primary-btn" type="button" :disabled="api.loading" @click="refreshAll">Tải tất cả</button>
          <button class="secondary-btn" type="button" :disabled="api.loading" @click="handleLogoutAll">
            <LogOut :size="16" />
            Đăng xuất hẳn
          </button>
        </div>
      </div>

      <p v-if="api.error" class="error-text">{{ api.error }}</p>
      <p v-if="api.lastStatus" class="status-text">Trạng thái: {{ api.lastStatus }}</p>

      <div v-if="api.isLoggedIn" class="data-grid">
        <article class="mini-card">
          <h4>Lịch học</h4>
          <p>{{ api.scheduleMeta?.totalItems || api.schedule.length }} buổi</p>
        </article>
        <article class="mini-card">
          <h4>Bảng điểm</h4>
          <p>{{ api.grades.length }} học kỳ</p>
        </article>
        <article class="mini-card">
          <h4>Lịch thi</h4>
          <p>{{ api.exams.length }} ca thi</p>
        </article>
      </div>

      <div v-if="api.isLoggedIn" class="detail-wrap">
        <div class="detail-tabs">
          <button class="secondary-btn" :class="{ active: detailView === 'schedule' }" type="button" @click="detailView = 'schedule'">
            Xem TKB
          </button>
          <button class="secondary-btn" :class="{ active: detailView === 'grades' }" type="button" @click="detailView = 'grades'">
            Xem điểm
          </button>
          <button class="secondary-btn" :class="{ active: detailView === 'exams' }" type="button" @click="detailView = 'exams'">
            Xem lịch thi
          </button>
        </div>

        <div class="detail-panel calendar-panel" v-if="detailView === 'schedule'">
          <p class="detail-empty" v-if="!scheduleRows.length">Chưa có dữ liệu TKB, bấm nút Lịch học để tải.</p>
          <p class="detail-empty" v-else>
            Tổng: {{ api.scheduleMeta?.totalItems || scheduleRows.length }} buổi,
            trang: {{ api.scheduleMeta?.totalPages || 1 }}
          </p>
          <div class="calendar-grid" v-if="scheduleRows.length">
            <article class="calendar-col" v-for="day in scheduleCalendar" :key="day.weekday">
              <header class="calendar-head">
                <strong>{{ day.label }}</strong>
                <small>{{ day.items.length }} buổi</small>
              </header>

              <div class="calendar-list" v-if="day.items.length">
                <article class="calendar-item" v-for="(item, idx) in day.items" :key="`${pickValue(item, ['id_to_hoc', 'ma_mon'], idx)}-${idx}`">
                  <h6>{{ pickValue(item, ['ten_mon', 'ma_mon'], 'Môn học') }}</h6>
                  <p>{{ pickValue(item, ['tu_gio']) }} - {{ pickValue(item, ['den_gio']) }} | Tiết {{ pickValue(item, ['tbd']) }} ({{ pickValue(item, ['so_tiet']) }})</p>
                  <p>Phòng: {{ pickValue(item, ['phong', 'phong_hoc', 'ma_phong']) }}</p>
                  <p>{{ pickValue(item, ['nhom_to']) }} / {{ pickValue(item, ['lop']) }}</p>
                </article>
              </div>

              <p class="calendar-empty" v-else>Không có lịch</p>
            </article>
          </div>
        </div>

        <div class="detail-panel" v-if="detailView === 'grades'">
          <p class="detail-empty" v-if="!gradeRows.length">Chưa có dữ liệu điểm, bấm nút Bảng điểm để tải.</p>
          <article class="detail-card" v-for="(row, idx) in gradeRows.slice(0, 80)" :key="`${pickValue(row.subject, ['ma_mon', 'ten_mon'], idx)}-${idx}`">
            <h5>{{ pickValue(row.subject, ['ten_mon', 'ma_mon'], 'Môn học') }}</h5>
            <p>Học kỳ: {{ row.semesterName }}</p>
            <p>Tín chỉ: {{ pickValue(row.subject, ['so_tin_chi']) }}</p>
            <p>Điểm số: {{ pickValue(row.subject, ['diem_tk_so', 'diem_tk']) }}</p>
            <p>Điểm chữ: {{ pickValue(row.subject, ['diem_tk_chu', 'ketQua']) }}</p>
          </article>
        </div>

        <div class="detail-panel" v-if="detailView === 'exams'">
          <p class="detail-empty" v-if="!examRows.length">Chưa có dữ liệu lịch thi, bấm nút Lịch thi để tải.</p>
          <article class="detail-card" v-for="(item, idx) in examRows.slice(0, 60)" :key="`${pickValue(item, ['ma_mon', 'ten_mon', 'id'], idx)}-${idx}`">
            <h5>{{ pickValue(item, ['ten_mon', 'ma_mon'], 'Ca thi') }}</h5>
            <p>Ngày thi: {{ pickValue(item, ['ngay_thi']) }}</p>
            <p>Giờ bắt đầu: {{ pickValue(item, ['gio_bat_dau', 'tiet_bat_dau']) }}</p>
            <p>Phòng: {{ pickValue(item, ['ma_phong']) }}</p>
            <p>Hình thức: {{ pickValue(item, ['hinh_thuc_thi']) }}</p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.vnua-card {
  padding: 16px;
  display: grid;
  gap: 12px;
}

.vnua-toggle {
  width: 100%;
  min-height: 52px;
  border-radius: 16px;
  border: 1px solid rgba(106, 241, 230, 0.36);
  background: rgba(8, 28, 36, 0.82);
  color: #dffbff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  font-weight: 700;
  cursor: pointer;
}

.left,
.right {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.vnua-content {
  display: grid;
  gap: 12px;
}

.vnua-note {
  margin: 0;
  color: #9dd8e7;
  font-size: 0.92rem;
}

.auth-grid,
.toolbar {
  display: grid;
  gap: 10px;
}

label {
  display: grid;
  gap: 6px;
  color: #d3e6ff;
}

input,
select {
  min-height: 42px;
  border-radius: 12px;
  border: 1px solid rgba(106, 241, 230, 0.28);
  background: rgba(9, 24, 35, 0.88);
  color: #dffbff;
  padding: 0 10px;
}

.check-wrap {
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 10px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.error-text {
  margin: 0;
  color: #ff9ba3;
  font-weight: 600;
}

.status-text {
  margin: 0;
  color: #9dd8e7;
  font-size: 0.9rem;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.detail-wrap {
  display: grid;
  gap: 10px;
}

.detail-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-tabs .secondary-btn.active {
  border-color: rgba(125, 249, 255, 0.58);
  background: linear-gradient(135deg, rgba(0, 201, 167, 0.22), rgba(0, 212, 255, 0.24));
  box-shadow: 0 0 16px rgba(125, 249, 255, 0.24);
}

.detail-panel {
  display: grid;
  gap: 8px;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 4px;
}

.calendar-panel {
  max-height: none;
  overflow: visible;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(220px, 1fr));
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 6px;
}

.calendar-col {
  min-height: 180px;
  border: 1px solid rgba(106, 241, 230, 0.22);
  border-radius: 12px;
  background: rgba(9, 24, 35, 0.62);
  padding: 10px;
  display: grid;
  gap: 8px;
}

.calendar-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.calendar-head strong {
  color: #e5f7ff;
}

.calendar-head small {
  color: #95c8d5;
}

.calendar-list {
  display: grid;
  gap: 8px;
}

.calendar-item {
  border: 1px solid rgba(106, 241, 230, 0.2);
  border-radius: 10px;
  background: rgba(8, 21, 31, 0.78);
  padding: 8px;
}

.calendar-item h6,
.calendar-item p {
  margin: 0;
}

.calendar-item h6 {
  color: #dcf6ff;
  font-size: 0.92rem;
}

.calendar-item p {
  margin-top: 5px;
  color: #98cddc;
  font-size: 0.85rem;
}

.calendar-empty {
  margin: 0;
  color: #88b9c6;
  font-size: 0.88rem;
}

.detail-card {
  border: 1px solid rgba(106, 241, 230, 0.24);
  border-radius: 12px;
  background: rgba(9, 24, 35, 0.68);
  padding: 10px;
}

.detail-card h5,
.detail-card p {
  margin: 0;
}

.detail-card p {
  margin-top: 5px;
  color: #a5d8e6;
  font-size: 0.92rem;
}

.detail-empty {
  margin: 0;
  color: #9dd8e7;
}

.mini-card {
  border: 1px solid rgba(106, 241, 230, 0.24);
  border-radius: 14px;
  background: rgba(9, 24, 35, 0.75);
  padding: 10px;
}

.mini-card h4,
.mini-card p {
  margin: 0;
}

.mini-card p {
  margin-top: 6px;
  color: #9dd8e7;
}

@media (max-width: 720px) {
  .data-grid {
    grid-template-columns: 1fr;
  }
}
</style>
