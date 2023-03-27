export enum ErrorMessage {
  ACCOUNT_NOT_FOUND_ERROR = 'Tài khoản không tồn tại.',
  EMAIL_NOT_FOUND_ERROR = 'Tài khoản không tồn tại (email: %s).',
  INVALID_TOKEN_ERROR = 'Invalid token (access_token: %s)',
  NO_TOKEN_ERROR = 'No token',
  LOGIN_FAILD = 'Tài khoản hoặc mật khẩu không hợp lệ.',

  PASSWORD_NO_MATCHING_ERROR = 'Xác nhận mật khẩu không chính xác.',
  OLD_PASSWORD_NO_MATCHING_ERROR = 'Mật khẩu hiện tại không chính xác.',

  OPERATOR_PASSWORD_ERROR = 'Cập nhật mật khẩu thất bại.',

  USERNAME_DUPLICATE_ERROR = 'Tên đăng nhập đã tồn tại (username: %s).',
  OPERATOR_USER_ERROR = 'Lưu thông tin người dùng thất bại.',

  PERMISSION_NOT_FOUND_ERROR = 'Tính năng truy cập không tồn tại.',
}
