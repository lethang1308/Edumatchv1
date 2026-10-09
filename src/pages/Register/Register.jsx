import { useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BadgeCheck, Eye, EyeOff, Handshake, Landmark } from "lucide-react";
import toast from "react-hot-toast";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { Modal } from "@/components/feedback/Modal";
import {
  accountFields,
  buildRegistrationPayload,
  centerAccountFields,
  centerFields,
  getTodayDate,
  initialForm,
  registrationRoles,
  roleContent,
  teacherFields,
  validateRegistration,
} from "./registerData";
import registerImage from "@/assets/register-student.webp";
import "./register.css";

function FieldError({ name, errors }) {
  return errors[name] ? (
    <p id={`register-${name}-error`} className="register-field__error">
      {errors[name]}
    </p>
  ) : null;
}

function ProfileField({ field, form, errors, onChange }) {
  const { name, label, placeholder, icon: Icon, multiline, maxLength } = field;
  const describedBy = [
    errors[name] && `register-${name}-error`,
    multiline && `register-${name}-count`,
  ]
    .filter(Boolean)
    .join(" ");
  const sharedProps = {
    id: `register-${name}`,
    name,
    placeholder,
    value: form[name],
    onChange,
    maxLength,
    required: true,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": describedBy || undefined,
  };
  return (
    <div className="register-field">
      <label htmlFor={`register-${name}`} className="register-field-label">
        {label} <span aria-hidden="true">*</span>
      </label>
      <div
        className={`register-control ${multiline ? "register-control--textarea" : ""} ${errors[name] ? "is-invalid" : ""}`}
      >
        <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
        {multiline ? (
          <div className="register-textarea-body">
            <textarea {...sharedProps} rows={3} />
            <span className="register-count" id={`register-${name}-count`}>
              {form[name].length}/{maxLength}
            </span>
          </div>
        ) : (
          <input {...sharedProps} type="text" />
        )}
      </div>
      <FieldError name={name} errors={errors} />
    </div>
  );
}

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedRole = searchParams.get("role");
  const role = registrationRoles.some(({ value }) => value === requestedRole)
    ? requestedRole
    : "student";
  const [form, setForm] = useState(initialForm);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTeacherTerms, setShowTeacherTerms] = useState(false);
  const [teacherTermsAccepted, setTeacherTermsAccepted] = useState(false);
  const formRef = useRef(null);
  const content = roleContent[role];
  const fields = role === "center" ? centerAccountFields : accountFields;
  const today = getTodayDate();

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : name === "foundedYear"
            ? value.replace(/\D/g, "")
            : value,
    }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setFormError("");
  };

  const changeRole = (nextRole) => {
    setSearchParams(nextRole === "student" ? {} : { role: nextRole }, {
      replace: true,
    });
    setErrors({});
    setFormError("");
    setShowTeacherTerms(false);
    setTeacherTermsAccepted(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    const nextErrors = validateRegistration(form, role);
    setErrors(nextErrors);
    setFormError("");
    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      formRef.current.elements.namedItem(firstError)?.focus();
      return;
    }

    if (role !== "student") {
      setTeacherTermsAccepted(false);
      setShowTeacherTerms(true);
      return;
    }
    await completeRegistration();
  };

  const completeRegistration = async () => {
    if (loading) return;
    setLoading(true);
    const data = buildRegistrationPayload(form, role);
    try {
      const result = await register(data);
      if (result?.success === false)
        throw new Error(
          result.message || "Chưa thể tạo tài khoản. Vui lòng thử lại.",
        );
      toast.success("Tạo tài khoản thành công!");
      navigate(role === "student" ? ROUTES.STUDENT_WELCOME : ROUTES.HOME, {
        replace: true,
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.response
          ? "Chưa thể tạo tài khoản. Vui lòng kiểm tra thông tin và thử lại."
          : "Chưa thể kết nối để tạo tài khoản. Vui lòng thử lại sau.");
      setFormError(error.response || error.code ? message : error.message);
    } finally {
      setLoading(false);
    }
  };

  const closeTeacherTerms = () => {
    if (loading) return;
    setTeacherTermsAccepted(false);
    setShowTeacherTerms(false);
  };
  const confirmTeacherTerms = () => {
    if (!teacherTermsAccepted || loading) return;
    setShowTeacherTerms(false);
    completeRegistration();
  };

  return (
    <main className={`register-page register-page--${role}`}>
      <div className="register-shell">
        <section className="register-card" aria-labelledby="register-title">
          <div className="register-heading">
            <h1 id="register-title">Tạo tài khoản</h1>
            <p>{content.description}</p>
          </div>

          <fieldset className="register-roles" disabled={loading}>
            <legend className="register-sr-only">Vai trò tài khoản</legend>
            {registrationRoles.map(
              ({ value, label, accessibleLabel, icon: Icon }) => (
                <label
                  key={value}
                  className={`register-role ${role === value ? "is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={value}
                    aria-label={accessibleLabel}
                    checked={role === value}
                    onChange={() => changeRole(value)}
                  />
                  <Icon size={27} strokeWidth={1.8} aria-hidden="true" />
                  <span>{label}</span>
                </label>
              ),
            )}
          </fieldset>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="register-form"
            noValidate
            aria-busy={loading}
          >
            <fieldset className="register-fields" disabled={loading}>
              <legend className="register-sr-only">Thông tin tài khoản</legend>
              {fields.map(
                ({
                  name,
                  label,
                  placeholder,
                  icon: Icon,
                  type = "text",
                  autoComplete,
                  maxLength,
                  showLabel,
                }) => {
                  const isPassword =
                    name === "password" || name === "confirmPassword";
                  return (
                    <div className="register-field" key={name}>
                      <label
                        htmlFor={`register-${name}`}
                        className={
                          role === "center" || showLabel
                            ? "register-field-label"
                            : "register-sr-only"
                        }
                      >
                        {label}{" "}
                        {(role === "center" || showLabel) && (
                          <span aria-hidden="true">*</span>
                        )}
                      </label>
                      <div
                        className={`register-control ${errors[name] ? "is-invalid" : ""}`}
                      >
                        <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
                        <input
                          id={`register-${name}`}
                          name={name}
                          type={
                            isPassword
                              ? visiblePasswords[name]
                                ? "text"
                                : "password"
                              : type
                          }
                          autoComplete={autoComplete}
                          placeholder={placeholder || label}
                          value={form[name]}
                          onChange={updateField}
                          required
                          maxLength={isPassword ? 128 : maxLength}
                          max={type === "date" ? today : undefined}
                          lang={type === "date" ? "vi" : undefined}
                          aria-invalid={Boolean(errors[name])}
                          aria-describedby={
                            errors[name]
                              ? `register-${name}-error`
                              : name === "password"
                                ? "register-password-hint"
                                : undefined
                          }
                        />
                        {isPassword && (
                          <button
                            type="button"
                            className="register-password-toggle"
                            onClick={() =>
                              setVisiblePasswords((current) => ({
                                ...current,
                                [name]: !current[name],
                              }))
                            }
                            aria-label={`${visiblePasswords[name] ? "Ẩn" : "Hiện"} ${label.toLowerCase()}`}
                            aria-pressed={Boolean(visiblePasswords[name])}
                          >
                            {visiblePasswords[name] ? (
                              <EyeOff size={21} />
                            ) : (
                              <Eye size={21} />
                            )}
                          </button>
                        )}
                      </div>
                      <FieldError name={name} errors={errors} />
                    </div>
                  );
                },
              )}
              <p className="register-hint" id="register-password-hint">
                Mật khẩu có ít nhất 8 ký tự.
              </p>
            </fieldset>

            {role !== "student" && (
              <fieldset
                className="register-phone-visibility"
                disabled={loading}
              >
                <legend>Bạn có muốn công khai số điện thoại?</legend>
                <p>
                  Số điện thoại chỉ hiển thị trên hồ sơ, danh sách tìm kiếm và
                  khóa học khi bạn đồng ý.
                </p>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="isPhonePublic"
                      checked={form.isPhonePublic}
                      onChange={() =>
                        setForm((current) => ({
                          ...current,
                          isPhonePublic: true,
                        }))
                      }
                    />{" "}
                    Có, công khai số điện thoại
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="isPhonePublic"
                      checked={!form.isPhonePublic}
                      onChange={() =>
                        setForm((current) => ({
                          ...current,
                          isPhonePublic: false,
                        }))
                      }
                    />{" "}
                    Không, giữ riêng tư
                  </label>
                </div>
              </fieldset>
            )}

            {(role === "teacher" || role === "center") && (
              <fieldset
                className="register-fields register-profile-fields"
                disabled={loading}
              >
                <legend className="register-sr-only">
                  {role === "teacher"
                    ? "Thông tin dành cho giáo viên"
                    : "Thông tin trung tâm đào tạo"}
                </legend>
                <div className="register-profile-heading">
                  <h2>
                    {role === "teacher"
                      ? "Thông tin dành cho giáo viên"
                      : "Thông tin trung tâm đào tạo"}
                  </h2>
                  <p>
                    {role === "teacher"
                      ? "Hoàn thiện hồ sơ chuyên môn để học viên hiểu hơn về bạn."
                      : "Giới thiệu ngắn gọn để học viên hiểu rõ hơn về đơn vị của bạn."}
                  </p>
                </div>
                {(role === "teacher" ? teacherFields : centerFields).map(
                  (field) => (
                    <ProfileField
                      key={field.name}
                      field={field}
                      form={form}
                      errors={errors}
                      onChange={updateField}
                    />
                  ),
                )}
              </fieldset>
            )}

            {formError && (
              <p className="register-alert" role="alert">
                {formError}
              </p>
            )}
            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
            </button>
          </form>
          <p className="register-login-copy">
            Đã có tài khoản? <Link to={ROUTES.LOGIN}>Đăng nhập ngay</Link>
          </p>
        </section>

        <aside
          className="register-hero"
          aria-label="Lợi ích khi tham gia EduMatch"
        >
          <div className="register-hero__content">
            <h2>
              Tham gia <strong>EduMatch</strong>
              <br />
              ngay hôm nay
            </h2>
            <ul className="register-benefits">
              {content.benefits.map(({ icon: Icon, text }) => (
                <li key={text}>
                  <span className="register-benefit-icon">
                    <Icon size={26} strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="register-hero__photo">
            <img
              src={registerImage}
              alt="Học viên mỉm cười bên laptop và vở ghi chép"
              width="1200"
              height="900"
              fetchPriority="high"
            />
          </div>
        </aside>
      </div>
      <Modal
        open={showTeacherTerms}
        onClose={closeTeacherTerms}
        title="Điều khoản dành cho Giáo viên & Đối tác"
        description="Vui lòng đọc kỹ và xác nhận trước khi hoàn tất đăng ký."
        size="xl"
        className="teacher-terms-dialog"
        footer={
          <div className="teacher-terms-dialog__actions">
            <label className="teacher-terms-dialog__consent">
              <input
                type="checkbox"
                checked={teacherTermsAccepted}
                onChange={(event) =>
                  setTeacherTermsAccepted(event.target.checked)
                }
                disabled={loading}
              />
              <span>
                Tôi đã đọc, hiểu và đồng ý với Điều khoản dành cho Giáo viên
                &amp; Đối tác của EduMatch.
              </span>
            </label>
            <button
              type="button"
              className="teacher-terms-dialog__confirm"
              disabled={!teacherTermsAccepted || loading}
              onClick={confirmTeacherTerms}
            >
              {loading ? "Đang tạo tài khoản..." : "Đồng ý & hoàn tất đăng ký"}
            </button>
          </div>
        }
      >
        <article className="teacher-terms-document">
          <header>
            <span className="teacher-terms-document__icon" aria-hidden="true">
              <Handshake size={22} />
            </span>
            <div>
              <p>ĐỒNG HÀNH CÙNG EDUMATCH</p>
              <h2>Chào mừng Quý Giáo viên và Đối tác</h2>
            </div>
          </header>
          <p>
            EduMatch trân trọng cảm ơn Quý Giáo viên và Quý Đối tác đã tin tưởng
            đồng hành. EduMatch là nền tảng kết nối học tập, tạo cầu nối tin cậy
            giữa giảng viên và học viên, hướng đến một môi trường giáo dục
            chuyên nghiệp, minh bạch và chất lượng.
          </p>

          <section>
            <div className="teacher-terms-document__heading">
              <BadgeCheck size={18} />
              <h3>Cam kết giai đoạn khởi nghiệp</h3>
            </div>
            <p>
              EduMatch là đơn vị khởi nghiệp từ năm 2026. Đến hết ngày
              31/12/2026, EduMatch không thu bất kỳ khoản phí nền tảng nào từ
              học viên, Giáo viên hoặc Đối tác.
            </p>
          </section>

          <section>
            <div className="teacher-terms-document__heading">
              <Landmark size={18} />
              <h3>Chính sách phí từ năm 2027</h3>
            </div>
            <p>
              Từ ngày 01/01/2027, EduMatch sẽ áp dụng các khoản phí sau cho khóa
              học được đăng trên nền tảng:
            </p>
            <ul className="teacher-terms-document__fees">
              <li>
                <strong>Phí khởi tạo khóa học:</strong>
                <span>
                  200.000 VNĐ/lần cho mỗi khóa học được đăng ký và thiết lập.
                </span>
              </li>
              <li>
                <strong>Phí duy trì khóa học:</strong>
                <span>
                  200.000 VNĐ/tháng để duy trì hiển thị, quản lý và vận hành
                  khóa học.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <div className="teacher-terms-document__heading">
              <Handshake size={18} />
              <h3>Phương thức hợp tác</h3>
            </div>
            <p>
              Khi Giáo viên tự đăng bài, chủ động liên hệ và chốt lịch với học
              viên, Giáo viên chỉ thanh toán phí khởi tạo và phí duy trì. Khi
              EduMatch chủ động giới thiệu học viên, mức hoa hồng sẽ được thỏa
              thuận trước, thông thường từ 15% đến 20% tổng học phí khóa học.
            </p>
            <p className="teacher-terms-document__notice">
              Giáo viên hoặc Đối tác có toàn quyền đồng ý tiếp nhận hoặc từ chối
              học viên được EduMatch giới thiệu trước khi sắp xếp lớp học.
            </p>
          </section>
          <p className="teacher-terms-document__notice">
            Chính sách tính phí sẽ được điều chỉnh theo thời gian. Chúng tôi
            luôn nỗ lực để tìm ra chính sách phù hợp, có lợi cho Quý Thầy Cô và
            các đơn vị đối tác.
          </p>
        </article>
      </Modal>
    </main>
  );
}

export default Register;
