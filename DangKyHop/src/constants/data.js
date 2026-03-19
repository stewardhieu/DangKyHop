// src/constants/data.js

export const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
export const HOURS = Array.from({ length: 14 }, (_, i) => i + 8);
export const TAB_ALL = 'Tất cả Giảng viên';

export const MOCK_CLASSES = [
  { id: 'C_MOCK_1', name: 'K13-KTCĐT', students: 19, major: 'Khoa Cơ khí - Cơ điện tử', instructor: 'Đoàn Vy Hiếu', description: 'DH_K13.45', isAssigned: false },
  { id: 'C_MOCK_2', name: 'K13-KTDK_TDH', students: 29, major: 'Khoa Điện - Điện tử', instructor: 'Đoàn Vy Hiếu', description: 'DH_K13.45', isAssigned: false }
];

export const MOCK_ROOMS = [{ id: 'R_MOCK_1', name: 'A501', capacity: 100 }];
export const MOCK_INSTRUCTORS = ['Chưa phân bổ', 'Đoàn Vy Hiếu'];
