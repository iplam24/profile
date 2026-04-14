# Hướng dẫn API Trường Học VNUA

Tài liệu này tổng hợp toàn bộ API liên quan đến nghiệp vụ trường học trong ứng dụng Flutter hiện tại. Nội dung được viết dựa trên các file cấu hình, repository và màn hình đang sử dụng thực tế trong codebase.

## 1. Tổng quan

Các API trường học được quản lý tập trung qua `SchoolRepository` và các endpoint được khai báo trong `AppConfig`.

Luồng sử dụng chính trong ứng dụng:

- Đăng nhập tài khoản sinh viên vào hệ thống đào tạo.
- Lấy danh sách học kỳ.
- Lấy thời khóa biểu theo học kỳ.
- Lấy thông tin cá nhân sinh viên và ảnh đại diện.
- Lấy bảng điểm theo học kỳ.
- Lấy lịch thi theo học kỳ.
- Lấy dữ liệu sổ tay sinh viên.
- Lưu ghi chú lịch học vào cache cục bộ.

## 2. Cấu hình nền tảng

### 2.1 Base URL

Tất cả endpoint trường học đều được ghép từ biến môi trường `SCHOOL_API_URL`.

Nếu biến này chưa được cấu hình, ứng dụng sẽ ném lỗi:

- `SCHOOL_API_URL chưa được cấu hình trong .env`

### 2.2 Danh sách endpoint đang có trong `AppConfig`

- `schoolLogin` -> `/api/auth/login`
- `schoolSchedule` -> `/api/sch/w-locdstkbhockytheodoituong`
- `schoolTerms` -> `/api/sch/w-locdshockytkbuser`
- `schoolExam` -> `/api/epm/w-locdslichthisvtheohocky`
- `schoolGrade` -> `/api/srm/w-locdsdiemsinhvien?hien_thi_mon_theo_hkdk=false`
- `schoolStudentInfo` -> `/api/dkmh/w-locsinhvieninfo`
- `schoolStudentImage(maSv)` -> `/api/sms/w-locthongtinimagesinhvien?MaSV={maSv}`
- `curriculumEndpoint` -> `/api/sch/w-locdsctdtsinhvien`
- `studentHandbookEndpoint` -> `/api/web/w-locdsbaidangbyid`
- `allArticlesEndpoint` -> `/api/web/w-locdsbaidang`

## 3. Cơ chế gọi API trong `SchoolRepository`

### 3.1 Kiểu request

- Dùng `Dio`.
- `responseType` đặt là `bytes`.
- Có `User-Agent` giả lập trình duyệt.
- Timeout kết nối và nhận phản hồi đều là 60 giây.
- Bỏ kiểm tra chứng chỉ SSL bằng `badCertificateCallback`.

### 3.2 Xác thực

Sau khi đăng nhập thành công, repository lưu:

- `access_token` vào `SharedPreferences` với key `student_token`
- trạng thái sinh viên vào `SharedPreferences` với key `is_student`
- thông tin hiển thị sinh viên vào `SharedPreferences` với key `student_info`
- `school_username` và `school_password` vào `FlutterSecureStorage`

Mọi request cần xác thực đều đi qua `_authenticatedPost(...)`:

- tự lấy token hiện tại từ `SharedPreferences`
- nếu token thiếu thì thử đăng nhập lại bằng dữ liệu lưu trong `FlutterSecureStorage`
- nếu gặp lỗi `401`, `403` hoặc `500`, repository sẽ thử refresh token và gửi lại request

### 3.3 Cache cục bộ

Repository còn dùng `DatabaseHelper` để cache:

- danh sách học kỳ
- thời khóa biểu theo học kỳ

Điều này giúp app vẫn có thể hiển thị dữ liệu khi mất mạng.

Ngoài ra repository còn dùng MD5 để kiểm tra dữ liệu thay đổi trước khi lưu lại cache:

- `semesters_hash`
- `schedule_hash_{semester}`

## 4. Danh mục API chi tiết

### 4.1 Đăng nhập sinh viên

**Endpoint:** `AppConfig.schoolLogin`

**Phương thức:** `POST`

**Mục đích:** Xác thực tài khoản sinh viên trên hệ thống đào tạo và lấy token.

**Body gửi lên:**

```json
{
  "username": "Mã sinh viên",
  "password": "Mật khẩu",
  "grant_type": "password"
}
```

**Response mong đợi:**

- `access_token`
- `userName`
- `name`

**Hàm sử dụng:** `loginStudent(maSv, password)`

**Màn hình sử dụng:** `StudentVerificationScreen`

**Lưu ý quan trọng:**

- Nếu login thành công, token được lưu để dùng cho các request sau.
- Repository còn có một nhánh fallback phục vụ tài khoản test cứng trong code khi `maSv == 646380` và `password == 123456`.

### 4.2 Lấy danh sách học kỳ

**Endpoint:** `AppConfig.schoolTerms`

**Phương thức:** `POST`

**Mục đích:** Lấy toàn bộ học kỳ mà sinh viên có dữ liệu và xác định học kỳ hiện tại.

**Body gửi lên:**

```json
{
  "loai_doi_tuong": 1,
  "id_du_lieu": null
}
```

**Response mong đợi:**

- `result: true`
- `data.ds_hoc_ky`: danh sách học kỳ
- `data.hoc_ky_theo_ngay_hien_tai`: mã học kỳ hiện tại

**Hàm sử dụng:** `getSemesters()`

**Màn hình sử dụng:**

- `StudentScheduleScreen`
- `ExamScheduleScreen`
- `SettingsScreen`

**Dữ liệu trả về từ repository:**

```dart
{
  'semesters': List<Map<String, dynamic>>,
  'currentTerm': String?
}
```

**Cách dùng thực tế:**

- Màn hình lịch học dùng để chọn học kỳ đầu tiên nếu chưa có lựa chọn.
- Màn hình lịch thi dùng để build dropdown chọn học kỳ.
- Màn hình cài đặt dùng để lưu học kỳ đang chọn vào `SharedPreferences`.

### 4.3 Lấy thời khóa biểu theo học kỳ

**Endpoint:** `AppConfig.schoolSchedule`

**Phương thức:** `POST`

**Mục đích:** Tải lịch học của sinh viên theo học kỳ đã chọn.

**Body gửi lên:**

```json
{
  "hoc_ky": 20251,
  "loai_doi_tuong": 1,
  "id_du_lieu": null
}
```

**Response mong đợi:**

- `result: true`
- `data.ds_nhom_to`: danh sách nhóm học phần

**Hàm sử dụng:** `getSchedule({String? semester})`

**Màn hình sử dụng:** `StudentScheduleScreen`

**Cách xử lý trong repository:**

- Parse JSON bằng isolate để tránh lag UI.
- Duyệt `ds_nhom_to` và chuyển từng nhóm thành nhiều buổi học `ScheduleItem` dựa trên chuỗi `tkb`.
- Tính ngày học từ trường `tooltip` và `thu`.
- Tạo cache SQLite để đọc offline.
- Nếu API trả về dữ liệu không đổi, repository giữ nguyên cache cũ.

**Dữ liệu trả về từ repository:**

```dart
List<ScheduleItem>
```

**Quan trọng khi dùng:**

- `semester` phải là chuỗi số học kỳ, ví dụ `20251`.
- Nếu API lỗi, repository sẽ đọc cache local trước; nếu cache rỗng mới ném lỗi ra UI.

### 4.4 Lấy thông tin sinh viên

**Endpoint:** `AppConfig.schoolStudentInfo`

**Phương thức:** `POST`

**Mục đích:** Lấy thông tin hồ sơ sinh viên từ hệ thống đào tạo.

**Body gửi lên:**

```json
{
  "ma_sv": "...",
  "MaSinhVien": "...",
  "id_sinh_vien": null
}
```

**Response mong đợi:**

- `result: true`
- `data`: object thông tin sinh viên

**Hàm sử dụng:** `getStudentInfo()`

**Màn hình sử dụng:** `StudentInfoScreen`

**Cách lấy mã sinh viên:**

- ưu tiên đọc từ `student_info`
- nếu thiếu, fallback sang `school_username` trong secure storage

**Dữ liệu trả về từ repository:**

```dart
StudentInfo?
```

**Mapping dữ liệu chính:**

- `ma_sv` -> `maSv`
- `ten_day_du` -> `tenDayDu`
- `gioi_tinh` -> `gioiTinh`
- `ngay_sinh` -> `ngaySinh`
- `noi_sinh` -> `noiSinh`
- `dan_toc` -> `danToc`
- `quoc_tich` -> `quocTich`
- `dien_thoai` -> `dienThoai`
- `email` -> `email`
- `so_cmnd` -> `soCmnd`
- `ho_khau_quan_huyen` + `ho_khau_tinh_thanh` -> `hoKhauThuongTru`
- `lop` -> `lop`
- `nganh` -> `nganh`
- `khoa` -> `khoa`
- `bac_he_dao_tao` -> `heDaoTao`
- `nien_khoa` -> `nienKhoa`
- `hien_dien_sv` -> `tinhTrang`

### 4.5 Lấy ảnh sinh viên

**Endpoint:** `AppConfig.schoolStudentImage(maSv)`

**Phương thức:** `POST`

**Mục đích:** Lấy ảnh đại diện sinh viên dạng Base64.

**URL đặc biệt:** `MaSV` vừa nằm trong query string, vừa được gửi trong body.

**Body gửi lên:**

```json
{
  "MaSV": "..."
}
```

**Hàm sử dụng:** `getStudentImage()`

**Màn hình sử dụng:** `StudentInfoScreen`

**Dữ liệu trả về từ repository:**

```dart
String?
```

**Cách dùng thực tế:**

- Màn hình lấy `getStudentInfo()` và `getStudentImage()` song song.
- Nếu có ảnh, gán vào `StudentInfo.avatarBase64`.

### 4.6 Lấy bảng điểm

**Endpoint:** `AppConfig.schoolGrade`

**Phương thức:** `POST`

**Mục đích:** Lấy kết quả học tập theo học kỳ.

**Body gửi lên:**

```json
{
  "ma_sv": "...",
  "loai_doi_tuong": 1
}
```

**Response mong đợi:**

- `result: true`
- `data.ds_diem_hocky`: danh sách học kỳ điểm

**Hàm sử dụng:** `getGrades()`

**Màn hình sử dụng:** `GradeScreen`

**Dữ liệu trả về từ repository:**

```dart
List<GradeSemester>
```

**Mapping dữ liệu chính của `GradeSemester`:**

- `hoc_ky`
- `ten_hoc_ky`
- `dtb_hk_he10`
- `dtb_hk_he4`
- `dtb_tich_luy_he_10`
- `dtb_tich_luy_he_4`
- `so_tin_chi_dat_hk`
- `so_tin_chi_dat_tich_luy`
- `xep_loai_tkb_hk`
- `ds_diem_mon_hoc` -> danh sách `GradeSubject`

**Mapping của `GradeSubject`:**

- `ma_mon`
- `ten_mon`
- `so_tin_chi`
- `diem_tk`
- `diem_tk_so`
- `diem_tk_chu`
- `ketQua`

### 4.7 Lấy lịch thi theo học kỳ

**Endpoint:** `AppConfig.schoolExam`

**Phương thức:** `POST`

**Mục đích:** Lấy danh sách lịch thi của sinh viên theo học kỳ.

**Body gửi lên:**

```json
{
  "filter": {
    "hoc_ky": 20251,
    "is_giua_ky": false
  },
  "additional": {
    "paging": {"limit": 100, "page": 1},
    "ordering": [{"name": null, "order_type": null}]
  }
}
```

**Response mong đợi:**

- `result: true`
- `data.ds_lich_thi`: danh sách lịch thi

**Hàm sử dụng:** `getExamSchedule(String semesterId)`

**Màn hình sử dụng:** `ExamScheduleScreen`

**Dữ liệu trả về từ repository:**

```dart
List<ExamScheduleModel>
```

**Mapping dữ liệu chính của `ExamScheduleModel`:**

- `ma_mon`
- `ten_mon`
- `nhom_thi` -> `lop`
- `ngay_thi`
- `gio_bat_dau`
- `ma_phong`
- `hinh_thuc_thi`
- `so_phut`
- `tiet_bat_dau`
- `si_so`
- `ghi_chu_sv`

### 4.8 Lấy sổ tay sinh viên

**Endpoint:** `AppConfig.studentHandbookEndpoint`

**Phương thức:** `POST`

**Mục đích:** Tìm bài viết chứa nội dung sổ tay sinh viên và trích xuất các liên kết tài liệu bên trong.

**Body gửi lên:**

```json
{
  "filter": {
    "id": "-4928369928960704712",
    "is_noi_dung": true,
    "is_hinh_dai_dien": false,
    "ky_hieu": "ttk",
    "is_quyen_xem": true,
    "is_hien_thi": true
  },
  "additional": {
    "paging": {"limit": 50, "page": 1},
    "ordering": [{"name": null, "order_type": null}]
  }
}
```

**Response mong đợi:**

- `data.ds_bai_viet`: danh sách bài viết

**Hàm sử dụng:** `getStudentHandbook()`

**Màn hình sử dụng:** `StudentHandbookScreen`

**Cách xử lý trong repository:**

- Tìm bài viết có tiêu đề chứa `sổ tay`.
- Giải mã HTML entity như `&lt;`, `&gt;`, `&quot;`, `&amp;`.
- Dùng regex để trích xuất các thẻ `<a href="...">...<\/a>`.
- Trả về danh sách map gồm:
  - `title`
  - `url`

**Dữ liệu trả về từ repository:**

```dart
List<Map<String, String>>
```

**Cách dùng thực tế:**

- Mỗi item trong UI mở liên kết PDF hoặc tài liệu bằng `url_launcher`.

### 4.9 Lấy chương trình đào tạo

**Endpoint:** `AppConfig.curriculumEndpoint`

**Phương thức:** `POST`

**Trạng thái trong code hiện tại:** Chưa thấy hàm nào trong `SchoolRepository` gọi endpoint này.

**Ghi chú:**

- Endpoint đã được khai báo sẵn để mở rộng sau này.
- Nếu cần sử dụng, nên tạo một method mới trong `SchoolRepository` để giữ logic gọi API tập trung.

### 4.10 Lấy toàn bộ bài viết trường học

**Endpoint:** `AppConfig.allArticlesEndpoint`

**Phương thức:** `POST`

**Trạng thái trong code hiện tại:** Chưa thấy hàm nào trong `SchoolRepository` gọi endpoint này.

**Ghi chú:**

- Endpoint này hữu ích nếu muốn build màn hình tin tức hoặc danh sách bài viết của trường.

## 5. API phụ trợ trong repository

### 5.1 Kiểm tra sinh viên đã liên kết chưa

**Hàm:** `isStudent()`

**Mục đích:** Đọc cờ `is_student` trong `SharedPreferences`.

**Dùng ở đâu:** `StudentVerificationScreen`.

### 5.2 Đăng xuất sinh viên

**Hàm:** `logoutStudent()`

**Mục đích:** Xóa toàn bộ token và thông tin đăng nhập đã lưu.

**Xóa những gì:**

- `is_student`
- `student_token`
- `student_info`
- `school_username`
- `school_password`

### 5.3 Lưu ghi chú lịch học

**Hàm:** `saveNote(maMon, date, tietBatDau, note)`

**Mục đích:** Lưu ghi chú vào SQLite thông qua `DatabaseHelper.updateNote(...)`.

**Dùng ở đâu:** `StudentScheduleScreen` và `DailyScheduleList`.

## 6. Luồng dùng API theo màn hình

### 6.1 StudentVerificationScreen

- Gọi `isStudent()` để kiểm tra trạng thái liên kết.
- Gọi `loginStudent()` để xác thực.
- Nếu thành công, điều hướng về `MainLayout`.

### 6.2 StudentScheduleScreen

- Gọi `loadSemesterFromSettings()`.
- Nếu chưa có học kỳ lưu, gọi `getSemesters()`.
- Sau đó gọi `getSchedule(semester)`.
- Dữ liệu được hiển thị qua calendar và danh sách lịch học theo ngày.

### 6.3 StudentInfoScreen

- Gọi song song `getStudentInfo()` và `getStudentImage()`.
- Hiển thị avatar Base64, thông tin cá nhân, thông tin đào tạo và liên hệ.

### 6.4 GradeScreen

- Gọi `getGrades()`.
- Tách dữ liệu theo học kỳ để cho phép đổi kỳ trong bottom sheet.

### 6.5 ExamScheduleScreen

- Gọi `getSemesters()` trước.
- Chọn học kỳ hiện tại hoặc học kỳ đầu tiên.
- Gọi `getExamSchedule(semesterId)`.

### 6.6 StudentHandbookScreen

- Gọi `getStudentHandbook()`.
- Hiển thị danh sách link tài liệu.
- Mở link bằng `url_launcher`.

## 7. Lưu ý khi tích hợp hoặc mở rộng

- Luôn đi qua `_authenticatedPost(...)` với các API cần token để được refresh tự động.
- Nếu thêm API mới, nên khai báo đường dẫn trong `AppConfig` trước rồi mới thêm method trong `SchoolRepository`.
- Nếu API trả về JSON lớn, tiếp tục dùng `compute(_parseJsonData, ...)` để tránh block UI.
- Nếu cần hỗ trợ offline cho màn hình mới, nên dùng cùng pattern với `getSchedule()` và `getSemesters()`.
- Dữ liệu nhạy cảm như username/password trường nên tiếp tục lưu trong `FlutterSecureStorage`, không lưu thuần văn bản.

## 8. Tóm tắt nhanh

| API | Hàm gọi | Màn hình dùng |
| --- | --- | --- |
| Đăng nhập | `loginStudent()` | `StudentVerificationScreen` |
| Học kỳ | `getSemesters()` | `StudentScheduleScreen`, `ExamScheduleScreen`, `SettingsScreen` |
| Lịch học | `getSchedule()` | `StudentScheduleScreen` |
| Thông tin SV | `getStudentInfo()` | `StudentInfoScreen` |
| Ảnh SV | `getStudentImage()` | `StudentInfoScreen` |
| Bảng điểm | `getGrades()` | `GradeScreen` |
| Lịch thi | `getExamSchedule()` | `ExamScheduleScreen` |
| Sổ tay sinh viên | `getStudentHandbook()` | `StudentHandbookScreen` |
| Lưu ghi chú | `saveNote()` | `StudentScheduleScreen` |

## 9. Ghi chú cuối

Các endpoint trên phản ánh đúng phần API trường học đang có trong code hiện tại. Hai endpoint `curriculumEndpoint` và `allArticlesEndpoint` đã được khai báo nhưng chưa có method sử dụng trong `SchoolRepository`, nên nếu bạn muốn mở rộng tài liệu hoặc tính năng, đây là nơi nên bắt đầu.