import { useEffect, useRef, useState } from 'react';
import { Camera, Check, ShieldCheck, UserRound } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { profileService } from '@/services/profileService';
import { fieldErrors, requestError } from '@/utils/formErrors';
import { getTodayDate } from '@/pages/Register/registerData';
import { syncTeacherCourseProfile } from '@/features/learning/marketplace';
import { SecurityForm } from './SecurityForm';
import '@/components/auth/account.css';
import './profileSettings.css';

const readImageAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh.'));
    reader.readAsDataURL(file);
  });

const createPersistentProfileImage = async (file, maxDimension = 512) => {
  const source = await readImageAsDataUrl(file);
  const image = await new Promise((resolve, reject) => {
    const preview = new Image();
    preview.onload = () => resolve(preview);
    preview.onerror = reject;
    preview.src = source;
  });
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.86);
};

const profileForm = (user) => ({
  name: user.name || '',
  date_of_birth: user.dob || '',
  bio: user.bio || '',
  province_id: user.student_profile?.province_id || '',
  district_id: user.student_profile?.district_id || '',
  ward_id: user.student_profile?.ward_id || '',
});

export function ProfileSettingsPage() {
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'security' ? 'security' : 'profile';
  const [form, setForm] = useState(() => profileForm(user));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [areasError, setAreasError] = useState('');
  const [provinces, setProvinces] = useState([]);
  const [provinceChildren, setProvinceChildren] = useState([]);
  const [districtWards, setDistrictWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [avatarBusy, setAvatarBusy] = useState(false);
  const avatarInput = useRef(null);
  const isStudent = user.role === 'student';

  const selectTab = (nextTab) => {
    setSearchParams(nextTab === 'security' ? { tab: 'security' } : {});
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await profileService.get();
        if (active) {
          updateUser(response.user);
          setForm(profileForm(response.user));
          setMessage('');
        }
      } catch (error) {
        if (active) setMessage(requestError(error));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    profileService
      .areas({ level: 'province' })
      .then((areas) => {
        if (active) setProvinces(areas);
      })
      .catch((error) => {
        if (active) setAreasError(requestError(error));
      });
    return () => {
      active = false;
    };
  }, [updateUser, retry]);

  useEffect(() => {
    if (!form.province_id) return;
    let active = true;
    profileService
      .areas({ parent_id: form.province_id })
      .then((areas) => {
        if (active) {
          setProvinceChildren(areas);
          setAreasError('');
        }
      })
      .catch((error) => {
        if (active) setAreasError(requestError(error));
      });
    return () => {
      active = false;
    };
  }, [form.province_id]);

  useEffect(() => {
    if (!form.district_id) return;
    let active = true;
    profileService
      .areas({ parent_id: form.district_id, level: 'ward' })
      .then((areas) => {
        if (active) {
          setDistrictWards(areas);
          setAreasError('');
        }
      })
      .catch((error) => {
        if (active) setAreasError(requestError(error));
      });
    return () => {
      active = false;
    };
  }, [form.district_id]);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'province_id'
        ? { district_id: '', ward_id: '' }
        : name === 'district_id'
          ? { ward_id: '' }
          : {}),
    }));
    if (name === 'province_id') {
      setProvinceChildren([]);
      setDistrictWards([]);
    }
    if (name === 'district_id') setDistrictWards([]);
    setErrors((current) => ({ ...current, [name]: '' }));
    setMessage('');
  };
  const save = async (event) => {
    event.preventDefault();
    if (busy) return;
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Họ và tên cần có ít nhất 2 ký tự.';
    if (form.date_of_birth && form.date_of_birth > getTodayDate())
      next.date_of_birth = 'Ngày sinh không được nằm trong tương lai.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setMessage('');
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        date_of_birth: form.date_of_birth || null,
      };
      for (const key of ['province_id', 'district_id', 'ward_id'])
        payload[key] = form[key] ? Number(form[key]) : null;
      const response = await profileService.update(payload);
      const currentAvatar = user?.avatar;
      const currentAvatarVersion = user?.avatarVersion;
      const { avatar: responseAvatar, ...otherUserData } = response?.user || {};
      updateUser({
        ...otherUserData,
        ...(currentAvatar ? { avatar: currentAvatar, avatarVersion: currentAvatarVersion } : (responseAvatar ? { avatar: responseAvatar } : {})),
      });
      setForm(profileForm(response.user));
      toast.success('Đã lưu hồ sơ cá nhân.');
      setMessage('Thông tin của bạn đã được lưu.');
    } catch (error) {
      setErrors(fieldErrors(error));
      setMessage(requestError(error));
    } finally {
      setBusy(false);
    }
  };
  const chooseAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setAvatarError('Chọn ảnh JPG, PNG hoặc WebP, tối đa 2 MB.');
      event.target.value = '';
      return;
    }
    setAvatarError('');
    setAvatarFile(file);

    try {
      const localImage = await createPersistentProfileImage(file, 512);
      setPreview(localImage);
      const avatarVersion = Date.now();
      updateUser({ avatar: localImage, avatarVersion });
      if (['teacher', 'center'].includes(user?.role)) {
        syncTeacherCourseProfile(user.id, { avatar: localImage });
      }
    } catch {
      setPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile || avatarBusy) return;
    setAvatarBusy(true);
    try {
      const avatarVersion = Date.now();
      let localImage = preview;
      if (!localImage || !localImage.startsWith('data:image/')) {
        try {
          localImage = await createPersistentProfileImage(avatarFile, 512);
        } catch {
          // ignore
        }
      }
      if (localImage) {
        updateUser({ avatar: localImage, avatarVersion });
        if (['teacher', 'center'].includes(user?.role)) {
          syncTeacherCourseProfile(user.id, { avatar: localImage });
        }
      }

      try {
        const response = await profileService.uploadAvatar(avatarFile);
        if (response?.user) {
          const { avatar: serverAvatar, ...otherUserData } = response.user;
          updateUser({
            ...otherUserData,
            avatar: localImage || serverAvatar || user?.avatar,
            avatarVersion,
          });
        }
      } catch (uploadError) {
        console.warn('API avatar upload failed, keeping local avatar:', uploadError);
      }

      setAvatarFile(null);
      if (localImage) {
        setPreview(localImage);
      }
      if (avatarInput.current) avatarInput.current.value = '';
      toast.success('Đã lưu ảnh đại diện.');
    } catch (error) {
      setAvatarError(fieldErrors(error).avatar || requestError(error));
    } finally {
      setAvatarBusy(false);
    }
  };
  const districts = provinceChildren.filter((area) => area.level === 'district');
  const wards = form.district_id
    ? districtWards
    : provinceChildren.filter((area) => area.level === 'ward');
  const areaSelect = (name, label, options, disabled) => (
    <label className="account-field">
      <span>{label}</span>
      <select
        aria-label={label}
        name={name}
        value={form[name]}
        onChange={change}
        disabled={disabled}
        aria-invalid={Boolean(errors[name])}
      >
        <option value="">Chưa chọn</option>
        {options.map((area) => (
          <option value={area.id} key={area.id}>
            {area.name}
          </option>
        ))}
      </select>
      {errors[name] && <small className="account-error">{errors[name]}</small>}
    </label>
  );

  return (
    <main className="profile-settings-page">
      <header className="profile-settings-heading">
        <p>TÀI KHOẢN EDUMATCH</p>
        <h1>Hồ sơ & bảo mật</h1>
        <span>Quản lý thông tin cá nhân và các lựa chọn bảo mật của bạn.</span>
      </header>
      <div className="profile-settings-layout">
        <aside className="profile-settings-sidebar">
          <div className="profile-settings-avatar">
            {preview || user.avatar ? (
              <img src={preview || user.avatar} alt={`Ảnh đại diện của ${user.name}`} />
            ) : (
              <UserRound size={42} />
            )}
          </div>
          <h2>{user.name}</h2>
          <p>
            {isStudent
              ? 'Học viên'
              : user.role === 'teacher'
                ? 'Giáo viên'
                : user.role === 'center'
                  ? 'Trung tâm đào tạo'
                  : 'Tài khoản quản trị'}
          </p>
          <label className="account-secondary profile-avatar-label">
            <Camera size={16} /> Chọn ảnh đại diện
            <input
              ref={avatarInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={chooseAvatar}
              disabled={avatarBusy}
            />
          </label>
          <small>JPG, PNG, WebP · tối đa 2 MB</small>
          {['teacher', 'center'].includes(user.role) && <Link to={ROUTES.VERIFICATION}>Hồ sơ xác minh chuyên môn / pháp lý</Link>}
          {avatarFile && (
            <>
              <small>Ảnh xem trước chưa được lưu.</small>
              <button
                type="button"
                className="account-primary"
                disabled={avatarBusy}
                onClick={uploadAvatar}
              >
                {avatarBusy ? 'Đang tải ảnh...' : 'Lưu ảnh đại diện'}
              </button>
            </>
          )}
          {avatarError && (
            <p className="account-error" role="alert">
              {avatarError}
            </p>
          )}
          {!isStudent && <Link to={ROUTES.TEACHER_PROFILE(user.id)}>Xem hồ sơ cá nhân</Link>}
        </aside>
        <section className="profile-settings-panel">
          <nav className="profile-settings-tabs" aria-label="Cài đặt tài khoản">
            <button
              type="button"
              aria-current={tab === 'profile' ? 'page' : undefined}
              onClick={() => selectTab('profile')}
            >
              <UserRound size={17} /> Thông tin cá nhân
            </button>
            <button
              type="button"
              aria-current={tab === 'security' ? 'page' : undefined}
              onClick={() => selectTab('security')}
            >
              <ShieldCheck size={17} /> Bảo mật & mật khẩu
            </button>
          </nav>
          {tab === 'security' ? (
            <SecurityForm />
          ) : loading ? (
            <p role="status">Đang tải hồ sơ...</p>
          ) : (
            <form className="account-form" onSubmit={save} noValidate>
              <div className="profile-section-heading">
                <UserRound size={23} />
                <div>
                  <h2>Thông tin cá nhân</h2>
                  <p>
                    {isStudent
                      ? 'Thông tin chính xác giúp EduMatch hiểu nhu cầu học tập của bạn.'
                      : 'Thông tin tài khoản và hồ sơ đã đăng ký.'}
                  </p>
                </div>
              </div>
              {message && (
                <p className="account-notice" role="status">
                  {message}
                </p>
              )}
              <fieldset disabled={busy}>
                <label className="account-field">
                  <span>{user.role === 'center' ? 'Tên trung tâm' : 'Họ và tên'}</span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={change}
                    maxLength={150}
                    readOnly={!isStudent}
                    required
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <small className="account-error">{errors.name}</small>}
                </label>
                <div className="account-grid">
                  <label className="account-field">
                    <span>Email</span>
                    <input value={user.email || 'Chưa cung cấp'} readOnly />
                  </label>
                  <label className="account-field">
                    <span>Số điện thoại</span>
                    <input value={user.phone || ''} readOnly />
                  </label>
                </div>
                {user.role !== 'center' && (
                  <label className="account-field">
                    <span>Ngày sinh</span>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={form.date_of_birth}
                      onChange={change}
                      max={getTodayDate()}
                      readOnly={!isStudent}
                    />
                    {errors.date_of_birth && (
                      <small className="account-error">{errors.date_of_birth}</small>
                    )}
                  </label>
                )}
                {isStudent && (
                  <>
                    {areasError && (
                      <p className="account-error" role="alert">
                        {areasError}{' '}
                        <button type="button" onClick={() => setRetry(retry + 1)}>
                          Thử tải lại
                        </button>
                      </p>
                    )}
                    {areaSelect('province_id', 'Tỉnh / Thành phố', provinces, false)}
                    {districts.length > 0 &&
                      areaSelect(
                        'district_id',
                        'Quận / Huyện (địa giới lịch sử)',
                        districts,
                        !form.province_id
                      )}
                    {areaSelect('ward_id', 'Phường / Xã', wards, !form.province_id)}
                  </>
                )}
                <label className="account-field">
                  <span>{isStudent ? 'Giới thiệu & mục tiêu học tập' : 'Giới thiệu'}</span>
                  <textarea
                    aria-label="Giới thiệu & mục tiêu học tập"
                    name="bio"
                    value={form.bio}
                    onChange={change}
                    maxLength={1000}
                    rows={5}
                    readOnly={!isStudent}
                  />
                  {errors.bio && <small className="account-error">{errors.bio}</small>}
                  <small>{form.bio.length}/1000 ký tự</small>
                </label>
              </fieldset>
              {isStudent && (
                <div className="account-actions">
                  <button className="account-primary" type="submit" disabled={busy}>
                    <Check size={17} /> {busy ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              )}
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

export default ProfileSettingsPage;
