export const BLOG_CATEGORIES = ['Blog', 'Research', 'Article', 'Notes'];

// Whitelists and normalizes admin-submitted writing fields before they hit Firestore.
export function sanitizeBlog(data = {}) {
  const tags = Array.isArray(data.tags)
    ? data.tags
    : String(data.tags || '').split(',');
  return {
    title: String(data.title || '').trim(),
    summary: String(data.summary || '').trim(),
    content: String(data.content || ''),
    category: BLOG_CATEGORIES.includes(data.category) ? data.category : BLOG_CATEGORIES[0],
    tags: tags.map(t => String(t).trim()).filter(Boolean),
    coverImageUrl: String(data.coverImageUrl || '').trim(),
    externalUrl: String(data.externalUrl || '').trim(),
    publishedAt: String(data.publishedAt || new Date().toISOString().slice(0, 10)),
    status: data.status === 'draft' ? 'draft' : 'published',
    updatedAt: new Date().toISOString(),
  };
}
