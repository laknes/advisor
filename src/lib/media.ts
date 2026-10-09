export function getAnalysisMediaSrc(mediaUrl?: string | null) {
  if (!mediaUrl) return '';

  if (mediaUrl.startsWith('/uploads/analyses/')) {
    return mediaUrl.replace('/uploads/analyses/', '/api/uploads/analyses/');
  }

  return mediaUrl;
}

export function getValidationMessage(errors: unknown) {
  if (!errors || typeof errors !== 'object') return '';

  for (const [field, value] of Object.entries(errors)) {
    if (Array.isArray(value)) {
      const first = value.find((item) => typeof item === 'string' && item.trim().length > 0);
      if (first) return `${field}: ${first}`;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      return `${field}: ${value}`;
    }
  }

  return '';
}
