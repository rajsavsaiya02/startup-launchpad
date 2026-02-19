import React, { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import {
  Upload,
  X,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon,
  Crop as CropIcon,
} from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../utils/cn"; // Assuming you have this utility
import { useToast } from "./Toast";

// Helper to create the cropped image
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/png");
  });
};

export function ImageUpload({ value, onChange, aspect = 1, className }) {
  const inputRef = useRef(null);
  const { addToast } = useToast();

  const [file, setFile] = useState(null); // File object
  const [previewUrl, setPreviewUrl] = useState(value); // URL for display
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null); // Source for cropper

  // Cropper State
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Cleanup object URLs to avoid memory leaks
  React.useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Sync with external value changes (e.g., from DB) if no local file selected
  React.useEffect(() => {
    if (!file && value) {
      setPreviewUrl(value);
    }
  }, [value, file]);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

      // Validation
      // Allow svg and ico specifically, plus standard images
      if (!selectedFile.type.startsWith("image/")) {
        addToast("Please select an image file", "error");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        // 5MB
        addToast("Image must be less than 5MB", "error");
        return;
      }

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result);
        setCropModalOpen(true);
      });
      reader.readAsDataURL(selectedFile);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

      // Create a file from blob
      // Use PNG to preserve transparency (vital for logos/favicons)
      const croppedFile = new File([croppedBlob], "image.png", {
        type: "image/png",
      });

      setFile(croppedFile);
      setPreviewUrl(URL.createObjectURL(croppedBlob));
      setCropModalOpen(false);

      // Pass file to parent
      onChange(croppedFile);
    } catch (e) {
      console.error(e);
      addToast("Failed to crop image", "error");
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setFile(null);
    setPreviewUrl(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ... (previous imports)

  // ... (ImageUpload component code)

  return (
    <div className={cn("relative", className)}>
      {/* Upload Trigger / Preview */}
      <div
        className={cn(
          "relative group overflow-visible transition-all duration-300",
          "rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50",
          "ring-4 ring-white dark:ring-surface-dark shadow-sm",
          previewUrl
            ? "h-32 w-32"
            : "h-32 w-32 border-2 border-dashed border-border-light dark:border-border-dark hover:border-primary/50 cursor-pointer",
        )}
        onClick={() => !previewUrl && inputRef.current?.click()}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="h-full w-full object-cover rounded-full"
          />
        ) : (
          <div className="text-center p-4">
            <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 text-primary group-hover:scale-110 transition-transform">
              <ImageIcon className="h-5 w-5" />
            </div>
            <p className="text-xs text-text-secondary font-medium group-hover:text-primary transition-colors">
              Upload
            </p>
          </div>
        )}

        {/* Actions Container - Ensure single render */}
        {previewUrl && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Edit (Bottom Right) */}
            <div className="absolute bottom-1 right-1 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                className="p-2 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-primary rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-md hover:scale-105 hover:text-primary flex items-center justify-center"
                title="Change Photo"
              >
                <Upload className="h-4 w-4" />
              </button>
            </div>

            {/* Delete (Top Right) */}
            <div className="absolute top-1 right-1 pointer-events-auto">
              <button
                onClick={handleClear}
                className="p-1.5 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-error rounded-full hover:bg-error hover:text-white transition-all shadow-md hover:scale-105 flex items-center justify-center"
                title="Remove Photo"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={onSelectFile}
        className="hidden"
      />

      {/* Crop Modal - Portaled to Body */}
      {cropModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-2xl max-w-lg w-full overflow-hidden relative z-10000">
              <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-white dark:bg-surface-dark">
                <h3 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
                  <CropIcon className="h-5 w-5 text-primary" /> Crop Image
                </h3>
                <button
                  onClick={() => setCropModalOpen(false)}
                  className="text-text-tertiary hover:text-text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative h-64 w-full bg-gray-900">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspect}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              <div className="px-6 py-4 space-y-4 bg-white dark:bg-surface-dark">
                <div className="flex items-center gap-4">
                  <ZoomOut className="h-4 w-4 text-text-tertiary" />
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(e.target.value)}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <ZoomIn className="h-4 w-4 text-text-tertiary" />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setCropModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSaveCrop}>
                    Save & Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
