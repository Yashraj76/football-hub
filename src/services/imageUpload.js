// ============================================
// IMAGE UPLOAD SERVICE — Free Image Hosting
// ============================================
// Supports:
// 1. Cloudinary Unsigned Upload (25GB Free monthly)
// 2. ImgBB Direct API (Free anonymous/keyed upload)
// 3. Fallback direct image URL & Base64 preview

const CLOUDINARY_CONFIG = {
  // Configured default or customizable via Admin settings
  cloudName: 'dq7c5o99v', // free demo cloud or user can replace with own
  uploadPreset: 'football_hub', 
};

/**
 * Upload an image file to Cloudinary using unsigned upload preset
 * @param {File} file 
 * @returns {Promise<string>} Public URL of uploaded image
 */
export async function uploadToCloudinary(file, customCloudName, customPreset) {
  const cloudName = customCloudName || localStorage.getItem('cloudinary_cloud_name') || CLOUDINARY_CONFIG.cloudName;
  const uploadPreset = customPreset || localStorage.getItem('cloudinary_preset') || CLOUDINARY_CONFIG.uploadPreset;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Cloudinary upload failed');
  }

  const data = await response.json();
  return data.secure_url;
}

/**
 * Upload image to ImgBB (Fallback free image hosting)
 * @param {File} file 
 * @param {string} apiKey (optional, defaults to stored or fallback)
 * @returns {Promise<string>}
 */
export async function uploadToImgBB(file, apiKey = '6d207e02198a847aa5fb3ac505b1ec43') {
  const key = localStorage.getItem('imgbb_api_key') || apiKey;
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('ImgBB upload failed');
  }

  const data = await response.json();
  return data.data.url;
}

/**
 * Universal Image Uploader: Tries Cloudinary -> ImgBB -> Base64 data URL
 * @param {File} file 
 * @returns {Promise<string>}
 */
export async function uploadImage(file) {
  // 1. Try Cloudinary
  try {
    return await uploadToCloudinary(file);
  } catch (err) {
    console.warn('Cloudinary upload fallback to ImgBB / local:', err);
  }

  // 2. Try ImgBB
  try {
    return await uploadToImgBB(file);
  } catch (err) {
    console.warn('ImgBB upload fallback to Base64:', err);
  }

  // 3. Fallback: Convert to Base64 Data URL so user is never blocked
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Create a reusable Image Picker Modal / Input component
 */
export function createImagePicker({ currentUrl = '', onSelect, label = 'Upload Image' }) {
  const container = document.createElement('div');
  container.className = 'image-picker-container';
  container.style.cssText = 'display:flex;flex-direction:column;gap:var(--space-2);';

  container.innerHTML = `
    <label style="font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-secondary);">${label}</label>
    <div style="display:flex;gap:var(--space-3);align-items:center;flex-wrap:wrap;">
      <div id="img-preview" style="width:64px;height:64px;border-radius:var(--radius-lg);background:var(--bg-tertiary);border:2px dashed var(--border-primary);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;">
        ${currentUrl ? `<img src="${currentUrl}" style="width:100%;height:100%;object-fit:cover;" />` : '<span style="font-size:1.5rem;">📷</span>'}
      </div>
      <div style="flex:1;min-width:200px;display:flex;flex-direction:column;gap:var(--space-2);">
        <div style="display:flex;gap:var(--space-2);">
          <input type="file" id="file-input" accept="image/*" style="display:none;" />
          <button type="button" class="btn btn-secondary btn-sm" id="upload-btn">📁 Choose File</button>
          <button type="button" class="btn btn-ghost btn-sm" id="url-mode-btn">🔗 Enter URL</button>
        </div>
        <input type="url" id="url-input" class="input" placeholder="Or paste image URL (https://...)" value="${currentUrl}" style="font-size:var(--text-xs);padding:var(--space-2);" />
        <div id="upload-status" style="font-size:var(--text-xs);color:var(--text-tertiary);"></div>
      </div>
    </div>
  `;

  const fileInput = container.querySelector('#file-input');
  const uploadBtn = container.querySelector('#upload-btn');
  const urlInput = container.querySelector('#url-input');
  const preview = container.querySelector('#img-preview');
  const status = container.querySelector('#upload-status');

  uploadBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    status.textContent = '⏳ Uploading image...';
    status.style.color = 'var(--accent-amber)';

    try {
      const url = await uploadImage(file);
      urlInput.value = url;
      preview.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;" />`;
      status.textContent = '✅ Image uploaded successfully!';
      status.style.color = 'var(--accent-green)';
      if (onSelect) onSelect(url);
    } catch (error) {
      status.textContent = '❌ Upload failed: ' + error.message;
      status.style.color = 'var(--accent-red)';
    }
  });

  urlInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (val) {
      preview.innerHTML = `<img src="${val}" onerror="this.src=''" style="width:100%;height:100%;object-fit:cover;" />`;
      if (onSelect) onSelect(val);
    } else {
      preview.innerHTML = '<span style="font-size:1.5rem;">📷</span>';
      if (onSelect) onSelect('');
    }
  });

  return container;
}
