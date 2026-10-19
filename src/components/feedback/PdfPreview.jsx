import { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

GlobalWorkerOptions.workerSrc = workerUrl;

export default function PdfPreview({ url, title }) {
  const [document, setDocument] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState('');
  const canvas = useRef(null);
  const container = useRef(null);
  useEffect(() => {
    let active = true;
    const task = getDocument({ url, isEvalSupported: false, useSystemFonts: true });
    task.promise
      .then((pdf) => {
        if (active) setDocument(pdf);
      })
      .catch(() => {
        if (active)
          setError('Không thể đọc PDF. Tệp có thể bị hỏng hoặc được bảo vệ bằng mật khẩu.');
      });
    return () => {
      active = false;
      task.destroy();
    };
  }, [url]);
  useEffect(() => {
    if (!document || !canvas.current) return;
    let active = true;
    let renderTask;
    document
      .getPage(pageNumber)
      .then((page) => {
        if (!active) return;
        const width = container.current?.clientWidth || 700;
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: Math.min(2, width / base.width) * zoom });
        canvas.current.width = viewport.width;
        canvas.current.height = viewport.height;
        renderTask = page.render({
          canvasContext: canvas.current.getContext('2d'),
          canvas: canvas.current,
          viewport,
        });
        return renderTask.promise;
      })
      .catch((failure) => {
        if (active && failure.name !== 'RenderingCancelledException')
          setError('Không thể hiển thị trang PDF.');
      });
    return () => {
      active = false;
      renderTask?.cancel();
    };
  }, [document, pageNumber, zoom]);
  return (
    <section aria-label={`Xem PDF: ${title}`} ref={container}>
      {error ? (
        <p role="alert" className="account-error">
          {error}
        </p>
      ) : !document ? (
        <p role="status">Đang tải PDF...</p>
      ) : (
        <div className="account-actions" style={{ marginBottom: 12 }}>
          <button
            type="button"
            className="account-secondary"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber(pageNumber - 1)}
          >
            Trang trước
          </button>
          <span>
            Trang {pageNumber} / {document.numPages}
          </span>
          <button
            type="button"
            className="account-secondary"
            disabled={pageNumber >= document.numPages}
            onClick={() => setPageNumber(pageNumber + 1)}
          >
            Trang sau
          </button>
          <label>
            Phóng to{' '}
            <select
              aria-label="Phóng to PDF"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            >
              <option value={1}>100%</option>
              <option value={1.5}>150%</option>
              <option value={2}>200%</option>
            </select>
          </label>
        </div>
      )}
      <div style={{ overflow: 'auto', maxHeight: '65vh', background: '#f2f4f3' }}>
        <canvas
          ref={canvas}
          aria-label={`Trang ${pageNumber} của ${title}`}
          style={{ display: 'block', maxWidth: zoom === 1 ? '100%' : undefined, margin: '0 auto' }}
        />
      </div>
    </section>
  );
}
