"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useAppStore } from "@/stores/app-store";
import { IMAGE_CONSTRAINTS } from "@/lib/constants";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_FILE_SIZE = IMAGE_CONSTRAINTS.maxFileSizeMB * 1024 * 1024;

const MONTH_NAMES = [
  "Cover",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type UploadState = {
  pageId: string;
  progress: "uploading" | "assigning" | "done" | "error";
  filename: string;
  error?: string;
};

export default function CalendarEditorPage() {
  const params = useParams();
  const id = params.id as string;
  const { currentProject, setCurrentProject, updatePage } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);
  const [uploads, setUploads] = useState<Map<string, UploadState>>(new Map());
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/calendars/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setCurrentProject(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, [id, setCurrentProject]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), toast.type === "error" ? 5000 : 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
  }, []);

  const uploadFileToPage = useCallback(
    async (file: File, pageId: string) => {
      // Client-side validation
      if (!ALLOWED_TYPES.includes(file.type)) {
        showToast(`${file.name}: Unsupported format. Use JPEG, PNG, WebP, or HEIC.`, "error");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        showToast(`${file.name}: File too large. Maximum ${IMAGE_CONSTRAINTS.maxFileSizeMB}MB.`, "error");
        return;
      }

      setUploads((prev) => {
        const next = new Map(prev);
        next.set(pageId, { pageId, progress: "uploading", filename: file.name });
        return next;
      });

      try {
        let storageKey: string;
        let publicUrl: string;

        // Try FormData upload (local mode) — if server returns JSON with uploadUrl, switch to presigned
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", id);

        const uploadRes = await fetch("/api/images/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const { data } = await uploadRes.json();
          storageKey = data.storageKey;
          publicUrl = data.publicUrl;
        } else {
          // Might be R2 mode — try JSON presign flow
          const presignRes = await fetch("/api/images/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: id,
              filename: file.name,
              mimeType: file.type,
              sizeBytes: file.size,
            }),
          });

          if (!presignRes.ok) {
            const err = await presignRes.json();
            throw new Error(err.error || "Upload failed");
          }

          const { data } = await presignRes.json();

          if (data.uploadUrl) {
            // R2 presigned URL flow — upload directly to R2
            const putRes = await fetch(data.uploadUrl, {
              method: "PUT",
              body: file,
              headers: { "Content-Type": file.type },
            });
            if (!putRes.ok) {
              throw new Error("Failed to upload to storage");
            }
          }

          storageKey = data.storageKey;
          publicUrl = data.publicUrl;
        }

        // Assign image to the page
        setUploads((prev) => {
          const next = new Map(prev);
          next.set(pageId, { pageId, progress: "assigning", filename: file.name });
          return next;
        });

        const patchRes = await fetch(`/api/calendars/${id}/pages/${pageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageKey: storageKey,
            imageUrl: publicUrl,
          }),
        });

        if (!patchRes.ok) {
          throw new Error("Failed to assign image to page");
        }

        const { data: updatedPage } = await patchRes.json();

        // Update local state
        updatePage(pageId, {
          imageKey: updatedPage.imageKey,
          imageUrl: updatedPage.imageUrl,
        });

        setUploads((prev) => {
          const next = new Map(prev);
          next.set(pageId, { pageId, progress: "done", filename: file.name });
          return next;
        });

        // Clear done state after a moment
        setTimeout(() => {
          setUploads((prev) => {
            const next = new Map(prev);
            next.delete(pageId);
            return next;
          });
        }, 1500);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setUploads((prev) => {
          const next = new Map(prev);
          next.set(pageId, { pageId, progress: "error", filename: file.name, error: message });
          return next;
        });
        showToast(`${file.name}: ${message}`, "error");

        setTimeout(() => {
          setUploads((prev) => {
            const next = new Map(prev);
            next.delete(pageId);
            return next;
          });
        }, 3000);
      }
    },
    [id, updatePage, showToast]
  );

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || !currentProject) return;
      const pages = currentProject.pages || [];

      // Assign files to empty pages in order, or to selected page
      const fileArray = Array.from(files);

      if (selectedPageIndex !== null && fileArray.length === 1) {
        // Single file → assign to selected page
        const page = pages.find((p) => p.monthIndex === selectedPageIndex);
        if (page) {
          uploadFileToPage(fileArray[0], page.id);
        }
      } else {
        // Multiple files → assign to empty pages in order
        const emptyPages = pages.filter((p) => !p.imageUrl);
        fileArray.forEach((file, i) => {
          if (i < emptyPages.length) {
            uploadFileToPage(file, emptyPages[i].id);
          } else {
            showToast(`${file.name}: No empty pages available`, "error");
          }
        });
      }
    },
    [currentProject, selectedPageIndex, uploadFileToPage, showToast]
  );

  const handlePageClick = useCallback(
    (monthIndex: number) => {
      const pages = currentProject?.pages || [];
      const page = pages.find((p) => p.monthIndex === monthIndex);
      if (!page) return;

      if (page.imageUrl) {
        // Already has image — select it (for replacement/removal)
        setSelectedPageIndex(monthIndex);
      } else {
        // Empty — open file picker targeting this page
        setSelectedPageIndex(monthIndex);
        fileInputRef.current?.click();
      }
    },
    [currentProject]
  );

  const handleRemoveImage = useCallback(
    async (pageId: string, imageKey: string | null) => {
      // Clear the image from the page
      const patchRes = await fetch(`/api/calendars/${id}/pages/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageKey: null, imageUrl: null }),
      });

      if (!patchRes.ok) {
        showToast("Failed to remove image", "error");
        return;
      }

      updatePage(pageId, { imageKey: null, imageUrl: null });

      // Best-effort delete from storage
      if (imageKey) {
        fetch(`/api/images/${encodeURIComponent(imageKey)}`, { method: "DELETE" }).catch(() => {});
      }

      showToast("Image removed", "success");
      setSelectedPageIndex(null);
    },
    [id, updatePage, showToast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDownloadPdf = useCallback(async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/calendars/${id}/export/print`, {
        method: "POST",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        showToast(json.error || "PDF export failed", "error");
        return;
      }

      // Open the PDF URL in a new tab for download
      window.open(json.data.pdfUrl, "_blank");
      showToast("PDF generated successfully", "success");
    } catch {
      showToast("PDF export failed", "error");
    } finally {
      setExporting(false);
    }
  }, [id, showToast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-rose-500" />
      </div>
    );
  }

  if (!currentProject) {
    return <div className="py-20 text-center text-stone-500">Calendar not found</div>;
  }

  const pages = currentProject.pages || [];
  const pagesWithPhotos = pages.filter((p) => p.imageUrl).length;
  const totalPages = pages.length;
  const selectedPage = selectedPageIndex !== null
    ? pages.find((p) => p.monthIndex === selectedPageIndex)
    : null;

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm">
        <a href="/app" className="text-stone-400 hover:text-rose-500 transition-all duration-200">
          Dashboard
        </a>
        <span className="text-rose-300">/</span>
        <span className="text-stone-600">{currentProject.title}</span>
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 font-[family-name:var(--font-heading)]">{currentProject.title}</h1>
          <p className="text-sm text-stone-500">
            {currentProject.calendarYear} &middot; {currentProject.paperSize}
          </p>
          {/* Progress indicator */}
          <div className="mt-2">
            <p className="mb-1 text-xs text-stone-500">
              {pagesWithPhotos} of {totalPages} pages have photos
            </p>
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-rose-500 transition-all duration-500"
                style={{ width: totalPages > 0 ? `${(pagesWithPhotos / totalPages) * 100}%` : "0%" }}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href={`/app/calendars/${id}/order`}
            className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-all duration-200"
          >
            Order Print
          </a>
          <button
            onClick={handleDownloadPdf}
            disabled={exporting}
            className="rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Image upload sidebar */}
        <div className="rounded-2xl bg-stone-50 p-4 shadow-sm">
          <h2 className="mb-3 font-medium text-stone-800">Images</h2>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`mb-4 rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
              dragOver
                ? "border-rose-400 bg-rose-50/60"
                : "border-rose-200 bg-rose-50/30"
            }`}
          >
            <svg className="mx-auto mb-2 h-8 w-8 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
            <p className="text-sm text-stone-500">
              {dragOver ? "Drop images here" : "Drag & drop images here"}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              JPEG, PNG, WebP, HEIC &middot; {IMAGE_CONSTRAINTS.maxFileSizeMB}MB max
            </p>
            <label
              htmlFor="image-upload"
              className="mt-3 inline-block cursor-pointer rounded-full bg-rose-500 px-4 py-1.5 text-xs text-white hover:bg-rose-600 transition-all duration-200"
            >
              Browse files
            </label>
            <input
              id="image-upload"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFileSelect(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {/* Selected page details */}
          {selectedPage && (
            <div className="rounded-xl border border-stone-200 bg-white p-3">
              <p className="mb-2 text-xs font-medium text-stone-500">
                {MONTH_NAMES[selectedPage.monthIndex]}
              </p>
              {selectedPage.imageUrl ? (
                <div>
                  <div
                    className="mb-2 aspect-[3/4] rounded-lg bg-stone-100"
                    style={{
                      backgroundImage: `url(${selectedPage.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedPageIndex(selectedPage.monthIndex);
                        fileInputRef.current?.click();
                      }}
                      className="flex-1 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-all duration-200"
                    >
                      Replace
                    </button>
                    <button
                      onClick={() => handleRemoveImage(selectedPage.id, selectedPage.imageKey)}
                      className="flex-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-lg border border-dashed border-stone-300 px-3 py-4 text-xs text-stone-500 hover:border-rose-300 hover:text-rose-500 transition-all duration-200"
                >
                  Click to add photo
                </button>
              )}
            </div>
          )}
        </div>

        {/* Page grid */}
        <div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pages.map((page) => {
              const uploadState = uploads.get(page.id);
              return (
                <button
                  key={page.id}
                  onClick={() => handlePageClick(page.monthIndex)}
                  className={`relative rounded-xl p-2 text-left shadow-sm transition-all duration-200 hover:shadow-md ${
                    selectedPageIndex === page.monthIndex
                      ? "ring-2 ring-rose-400 bg-white"
                      : "bg-white"
                  }`}
                >
                  <div
                    className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gradient-to-br from-rose-50 to-amber-50"
                    style={{
                      backgroundImage: page.imageUrl
                        ? `url(${page.imageUrl})`
                        : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* Upload progress overlay */}
                    {uploadState && uploadState.progress !== "done" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                        {uploadState.progress === "error" ? (
                          <div className="text-center">
                            <svg className="mx-auto h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                            <p className="mt-1 text-[10px] text-red-500">Failed</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-stone-200 border-t-rose-500" />
                            <p className="mt-1 text-[10px] text-stone-500">
                              {uploadState.progress === "uploading" ? "Uploading..." : "Saving..."}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status indicators */}
                    {!uploadState && page.imageUrl ? (
                      <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-400" />
                    ) : !uploadState && !page.imageUrl ? (
                      <svg className="absolute inset-0 m-auto h-6 w-6 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                      </svg>
                    ) : null}

                    {/* Done checkmark */}
                    {uploadState?.progress === "done" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-emerald-50/80">
                        <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 text-center text-xs font-medium text-stone-600">
                    {MONTH_NAMES[page.monthIndex]}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
