export enum ErrorMessage {
  OPERATOR_UPLOAD_FILE_ERROR = 'File [%s] tải lên thất bại.',
  FILE_NOT_FOUND_ERROR = 'File không tồn tại (id: %s).',

  FILE_ID_EMPTY_ERROR = 'Bạn vui lòng chọn file.',
  ID_NAN_ERROR = 'Giá trị [id] không hợp lệ.',

  STUDENT_ROLE_INVALID_ERROR = 'Bạn không thể xóa [file minh chứng] của sinh viên khác (name: %s).',

  FILE_SIZE_TOO_LARGE_ERROR = 'File [%s] kích thước không hợp lệ (<= %s)',

  FILE_EMPTY_ERROR = 'File không được để trống.',
}
