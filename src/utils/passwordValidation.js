export function validateNewPassword(form) {
  const errors = {};
  if (form.password.length < 8) errors.password = 'Mật khẩu cần có ít nhất 8 ký tự.';
  else if (form.password.length > 128) errors.password = 'Mật khẩu tối đa 128 ký tự.';
  if (form.password_confirmation !== form.password)
    errors.password_confirmation = 'Mật khẩu xác nhận chưa khớp.';
  return errors;
}
