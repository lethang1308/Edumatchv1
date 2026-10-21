import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { FileCheck2, FilePlus2, ShieldCheck, Trash2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Modal } from '@/components/feedback/Modal';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { verificationService } from '@/services/verificationService';
import { normalizeAuthUser } from '@/services/authService';
import { fieldErrors, requestError } from '@/utils/formErrors';
import '@/components/auth/account.css';
import './verification.css';

const PdfPreview = lazy(() => import('@/components/feedback/PdfPreview'));

const emptyDocument = (document_type) => ({
  document_type,
  document_name: '',
  issuing_authority: '',
  issued_year: '',
  file: null,
});
const emptyCenterDetails = (user) => ({
  center_name: user?.name || '',
  training_field: '',
  training_address: '',
  company_name: '',
  company_address: '',
  tax_code: '',
  representative_name: '',
  representative_phone: '',
});
const statusLabels = {
  unverified: 'Chưa nộp hồ sơ',
  pending: 'Đang chờ xét duyệt',
  approved: 'Đã được phê duyệt',
  verified: 'Đã xác minh',
  rejected: 'Cần bổ sung hồ sơ',
};

export function VerificationPage() {
  const { user, updateUser } = useAuth();
  const isCenter = user?.role === 'center';
  const allowed = ['teacher', 'center'].includes(user?.role);
  const [documents, setDocuments] = useState(() =>
    (isCenter
      ? ['business_registration']
      : ['degree', 'identity_front', 'identity_back']
    ).map(emptyDocument)
  );
  const [centerDetails, setCenterDetails] = useState(() => emptyCenterDetails(user));
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (!allowed) return;
    let active = true;
    const load = async () => {
      try {
        const result = await verificationService.list(page);
        if (active) {
          setData(result);
          setError('');
          updateUser(normalizeAuthUser(result.user));
          window.dispatchEvent(new Event('edumatch:verification-updated'));
        }
      } catch (failure) {
        if (active) setError(requestError(failure));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    window.addEventListener('focus', load);
    return () => {
      active = false;
      window.removeEventListener('focus', load);
    };
  }, [allowed, user?.id, page, retry, updateUser]);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview.url);
    },
    [preview]
  );

  if (!allowed) return <Navigate to={ROUTES.FORBIDDEN} replace />;

  const change = (index, field, value) => {
    setDocuments((current) =>
      current.map((item, at) => (at === index ? { ...item, [field]: value } : item))
    );
    setErrors((current) => ({ ...current, [`documents.${index}.${field}`]: '' }));
  };
  const changeCenterDetail = (field, value) => {
    setCenterDetails((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [`center_details.${field}`]: '' }));
  };
  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    const next = {};
    let totalSize = 0;
    documents.forEach((doc, index) => {
      if (!isCenter) {
        for (const field of ['document_name', 'issuing_authority'])
          if (!doc[field].trim())
            next[`documents.${index}.${field}`] = 'Vui lòng nhập thông tin này.';
        if (
          !/^\d{4}$/.test(doc.issued_year) ||
          Number(doc.issued_year) < 1900 ||
          Number(doc.issued_year) > new Date().getFullYear()
        )
          next[`documents.${index}.issued_year`] = 'Nhập năm cấp hợp lệ, không nằm trong tương lai.';
      }
      if (
        !doc.file ||
        !['image/jpeg', 'image/png', 'application/pdf'].includes(doc.file.type) ||
        doc.file.size > 2 * 1024 * 1024
      )
        next[`documents.${index}.file`] = 'Chọn tệp JPG, PNG hoặc PDF, tối đa 2 MB.';
      totalSize += doc.file?.size || 0;
    });
    if (isCenter) {
      const labels = {
        center_name: 'tên trung tâm đào tạo',
        training_field: 'lĩnh vực đào tạo',
        training_address: 'địa chỉ đào tạo',
        company_name: 'tên công ty',
        company_address: 'địa chỉ công ty',
        tax_code: 'mã số thuế',
        representative_name: 'họ và tên người đại diện liên hệ',
        representative_phone: 'số điện thoại người đại diện liên hệ',
      };
      Object.entries(labels).forEach(([field, label]) => {
        if (!String(centerDetails[field] || '').trim())
          next[`center_details.${field}`] = `Vui lòng nhập ${label}.`;
      });
      const phone = String(centerDetails.representative_phone || '').replace(/\s/g, '');
      if (phone && !/^(?:0|\+84)\d{9,10}$/.test(phone))
        next['center_details.representative_phone'] = 'Nhập số điện thoại Việt Nam hợp lệ.';
      const taxCode = String(centerDetails.tax_code || '').replace(/\s/g, '');
      if (taxCode && !/^\d{10}(?:\d{3})?$/.test(taxCode))
        next['center_details.tax_code'] = 'Mã số thuế gồm 10 hoặc 13 chữ số.';
    }
    if (totalSize > 7 * 1024 * 1024) next.documents = 'Tổng dung lượng hồ sơ tối đa 7 MB.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setError('');
    try {
      const response = await verificationService.submit(documents, isCenter ? centerDetails : null);
      updateUser(normalizeAuthUser(response.user));
      setDocuments((current) => current.map((doc) => emptyDocument(doc.document_type)));
      if (isCenter) setCenterDetails(emptyCenterDetails(user));
      setRetry((current) => current + 1);
      setPage(1);
      toast.success(response.message);
    } catch (failure) {
      setErrors(fieldErrors(failure));
      setError(requestError(failure));
    } finally {
      setBusy(false);
    }
  };
  const openDocument = async (doc) => {
    if (previewBusy) return;
    setPreviewBusy(true);
    try {
      const blob = await verificationService.document(doc.id);
      if (mounted.current)
        setPreview({
          url: URL.createObjectURL(blob),
          type: doc.mime_type,
          name: doc.document_name || doc.original_name,
        });
    } catch (failure) {
      if (mounted.current) setError(requestError(failure));
    } finally {
      if (mounted.current) setPreviewBusy(false);
    }
  };
  const status = data?.verification_status || 'unverified';
  const canSubmit = data && !['pending', 'verified'].includes(status);
  const renderError = (index, field) =>
    errors[`documents.${index}.${field}`] && (
      <small className="account-error">{errors[`documents.${index}.${field}`]}</small>
    );
  const renderCenterError = (field) =>
    errors[`center_details.${field}`] && (
      <small className="account-error">{errors[`center_details.${field}`]}</small>
    );

  return (
    <main className="verification-page">
      <header className="verification-heading">
        <span>
          <ShieldCheck size={18} /> TRUNG TÂM XÁC MINH
        </span>
        <h1>{isCenter ? 'Xác minh hồ sơ trung tâm' : 'Xác minh chuyên môn giáo viên'}</h1>
        <p>Nộp tài liệu để EduMatch thẩm định và cấp huy hiệu xác minh trên hồ sơ của bạn.</p>
      </header>
      {!(isCenter && status === 'unverified') && <section className={`verification-state is-${status}`}>
        <FileCheck2 size={24} />
        <div>
          <strong>{statusLabels[status]}</strong>
          <p>
            {status === 'pending'
              ? 'Hồ sơ đã được tiếp nhận. Bạn sẽ nhận thông báo khi có kết quả.'
              : status === 'verified'
                ? 'Huy hiệu xác minh đã được hiển thị trên hồ sơ của bạn.'
                : 'Chuẩn bị bằng cấp và hai mặt CCCD rõ nét, đầy đủ thông tin.'}
          </p>
        </div>
        <VerifiedBadge userId={user.id} />
      </section>}
      {error && (
        <div className="account-error" role="alert">
          {error}{' '}
          <button
            type="button"
            className="account-secondary"
            onClick={() => setRetry((v) => v + 1)}
          >
            Tải lại hồ sơ
          </button>
        </div>
      )}
      {loading && <p role="status">Đang tải hồ sơ xác minh...</p>}
      {canSubmit && (
        <form className="account-form verification-form" onSubmit={submit} noValidate>
          <div>
            <h2>{status === 'rejected' ? 'Bổ sung và nộp lại hồ sơ' : isCenter ? 'Thông tin xác minh doanh nghiệp' : 'Tài liệu xác minh'}</h2>
            {!isCenter && <p>JPG, PNG hoặc PDF; mỗi tệp tối đa 2 MB, tổng hồ sơ tối đa 7 MB. Tài liệu chỉ được bạn và quản trị viên có quyền xem.</p>}
          </div>
          <fieldset disabled={busy}>
            {isCenter && (
              <section className="verification-document verification-business-details">
                <div className="verification-document-heading">
                  <h3>Thông tin trung tâm và doanh nghiệp</h3>
                </div>
                <div className="account-grid">
                  <label className="account-field">
                    <span>Tên trung tâm đào tạo</span>
                    <input value={centerDetails.center_name} onChange={(event) => changeCenterDetail('center_name', event.target.value)} maxLength={160} />
                    {renderCenterError('center_name')}
                  </label>
                  <label className="account-field">
                    <span>Lĩnh vực đào tạo</span>
                    <input value={centerDetails.training_field} onChange={(event) => changeCenterDetail('training_field', event.target.value)} maxLength={200} />
                    {renderCenterError('training_field')}
                  </label>
                  <label className="account-field">
                    <span>Địa chỉ đào tạo</span>
                    <input value={centerDetails.training_address} onChange={(event) => changeCenterDetail('training_address', event.target.value)} maxLength={300} />
                    {renderCenterError('training_address')}
                  </label>
                  <label className="account-field">
                    <span>Tên công ty</span>
                    <input value={centerDetails.company_name} onChange={(event) => changeCenterDetail('company_name', event.target.value)} maxLength={160} />
                    {renderCenterError('company_name')}
                  </label>
                  <label className="account-field">
                    <span>Mã số thuế</span>
                    <input value={centerDetails.tax_code} onChange={(event) => changeCenterDetail('tax_code', event.target.value.replace(/\D/g, '').slice(0, 13))} inputMode="numeric" maxLength={13} />
                    {renderCenterError('tax_code')}
                  </label>
                  <label className="account-field">
                    <span>Địa chỉ công ty</span>
                    <input value={centerDetails.company_address} onChange={(event) => changeCenterDetail('company_address', event.target.value)} maxLength={300} />
                    {renderCenterError('company_address')}
                  </label>
                  <label className="account-field">
                    <span>Người đại diện liên hệ</span>
                    <input value={centerDetails.representative_name} onChange={(event) => changeCenterDetail('representative_name', event.target.value)} maxLength={120} />
                    {renderCenterError('representative_name')}
                  </label>
                  <label className="account-field">
                    <span>Số điện thoại liên hệ</span>
                    <input value={centerDetails.representative_phone} onChange={(event) => changeCenterDetail('representative_phone', event.target.value)} inputMode="tel" maxLength={15} />
                    {renderCenterError('representative_phone')}
                  </label>
                </div>
              </section>
            )}
            {documents.map((doc, index) => (
              <section className="verification-document" key={index}>
                <div className="verification-document-heading">
                  <h3>{isCenter ? 'Giấy chứng nhận thành lập doanh nghiệp' : `Tài liệu ${index + 1}`}</h3>
                  {index >= (isCenter ? 4 : 3) && (
                    <button
                      className="account-secondary"
                      type="button"
                      onClick={() =>
                        setDocuments((current) => current.filter((_, i) => i !== index))
                      }
                    >
                      <Trash2 size={14} /> Xóa
                    </button>
                  )}
                </div>
                {!isCenter && <div className="account-grid">
                  <label className="account-field">
                    <span>Loại tài liệu</span>
                    <select
                      value={doc.document_type}
                      disabled={busy || isCenter || (index > 0 && index < 3)}
                      onChange={(e) => change(index, 'document_type', e.target.value)}
                    >
                      {Object.entries(data.document_types)
                        .filter(([type]) =>
                          index >= (isCenter ? 4 : 3)
                            ? !type.startsWith('identity_')
                            : index === 0 && !isCenter
                              ? !type.startsWith('identity_')
                              : true
                        )
                        .map(([type, label]) => (
                          <option key={type} value={type}>
                            {label}
                          </option>
                        ))}
                    </select>
                    {renderError(index, 'document_type')}
                  </label>
                  <label className="account-field">
                    <span>Tên chứng chỉ / tài liệu</span>
                    <input
                      value={doc.document_name}
                      onChange={(e) => change(index, 'document_name', e.target.value)}
                      maxLength={200}
                      required
                    />
                    {renderError(index, 'document_name')}
                  </label>
                  <label className="account-field">
                    <span>Đơn vị cấp</span>
                    <input
                      value={doc.issuing_authority}
                      onChange={(e) => change(index, 'issuing_authority', e.target.value)}
                      maxLength={200}
                      required
                    />
                    {renderError(index, 'issuing_authority')}
                  </label>
                  <label className="account-field">
                    <span>Năm cấp</span>
                    <input
                      value={doc.issued_year}
                      onChange={(e) =>
                        change(index, 'issued_year', e.target.value.replace(/\D/g, '').slice(0, 4))
                      }
                      inputMode="numeric"
                      maxLength={4}
                      required
                    />
                    {renderError(index, 'issued_year')}
                  </label>
                </div>}
                <label className="account-field">
                  <span>{isCenter ? 'Ảnh hoặc tệp giấy chứng nhận thành lập doanh nghiệp' : 'Tệp tài liệu'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(e) => change(index, 'file', e.target.files?.[0] || null)}
                    required
                  />
                  {doc.file && (
                    <small>
                      {doc.file.name} · {(doc.file.size / 1024).toFixed(0)} KB
                    </small>
                  )}
                  {renderError(index, 'file')}
                </label>
              </section>
            ))}
          </fieldset>
          {isCenter && (
            <p className="verification-contact-note">
              Để bảo đảm hồ sơ chính xác, đội ngũ EduMatch có thể liên hệ với người đại diện qua số điện thoại đã cung cấp để đối chiếu thông tin hoặc hướng dẫn bổ sung. Kết quả sẽ được thông báo trên EduMatch ngay khi quá trình xác minh hoàn tất.
            </p>
          )}
          {errors.documents && (
            <p className="account-error" role="alert">
              {errors.documents}
            </p>
          )}
          <div className="account-actions">
            {!isCenter && documents.length < 8 && (
              <button
                className="account-secondary"
                type="button"
                disabled={busy}
                onClick={() =>
                  setDocuments((current) => [...current, emptyDocument('professional_certificate')])
                }
              >
                <FilePlus2 size={16} /> Thêm chứng chỉ
              </button>
            )}
            <button className="account-primary" type="submit" disabled={busy}>
              {busy ? 'Đang gửi hồ sơ...' : 'Gửi hồ sơ xét duyệt'}
            </button>
          </div>
        </form>
      )}
      {data && (
        <section className="verification-history">
          <h2>Lịch sử hồ sơ</h2>
          {data.requests.data.length ? (
            data.requests.data.map((record) => (
              <article key={record.id} className="verification-history-item">
                <div className="verification-document-heading">
                  <h3>Hồ sơ #{record.id}</h3>
                  <strong>{statusLabels[record.status]}</strong>
                </div>
                <p>
                  Nộp ngày {new Date(record.submitted_at).toLocaleString('vi-VN')}
                  {record.reviewed_at &&
                    ` · Xét duyệt ${new Date(record.reviewed_at).toLocaleString('vi-VN')}`}
                </p>
                {record.rejection_reason && (
                  <p className="verification-rejection" role="status">
                    <strong>Lý do cần bổ sung:</strong> {record.rejection_reason}
                  </p>
                )}
                <ul>
                  {record.documents.map((doc) => (
                    <li key={doc.id}>
                      <div>
                        <strong>{doc.document_name || doc.original_name}</strong>
                        <small>
                          {data.document_types[doc.document_type]} · {doc.issuing_authority} ·{' '}
                          {doc.issued_year}
                        </small>
                      </div>
                      <button
                        type="button"
                        className="account-secondary"
                        disabled={previewBusy}
                        onClick={() => openDocument(doc)}
                      >
                        Xem tài liệu
                      </button>
                    </li>
                  ))}
                </ul>
              </article>
            ))
          ) : (
            <p>Bạn chưa nộp hồ sơ xác minh.</p>
          )}
          {data.requests.last_page > 1 && (
            <div className="account-actions">
              <button
                className="account-secondary"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Trang trước
              </button>
              <span>
                Trang {page} / {data.requests.last_page}
              </span>
              <button
                className="account-secondary"
                disabled={page >= data.requests.last_page}
                onClick={() => setPage(page + 1)}
              >
                Trang sau
              </button>
            </div>
          )}
        </section>
      )}
      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview?.name}
        size="xl"
      >
        {preview &&
          (preview.type === 'application/pdf' ? (
            <Suspense fallback={<p role="status">Đang tải trình đọc PDF...</p>}>
              <PdfPreview key={preview.url} url={preview.url} title={preview.name} />
            </Suspense>
          ) : (
            <img src={preview.url} alt={preview.name} className="verification-preview" />
          ))}
      </Modal>
    </main>
  );
}
