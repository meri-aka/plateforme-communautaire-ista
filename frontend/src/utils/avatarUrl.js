/**
 * Resolves a user avatar to a full, displayable URL.
 *
 * Handles three cases:
 *  1. No avatar → generates a nice initials avatar via ui-avatars.com
 *  2. Relative path (e.g. "avatars/abc.jpg") → prepends backend storage URL
 *  3. Already a full URL → returned as-is
 *
 * @param {object|null} user  – object with optional `.avatar` and `.name` fields
 * @param {number}      size  – pixel size hint passed to ui-avatars fallback
 * @returns {string} A fully-qualified image URL safe to use in <img src>
 */
export function resolveAvatar(user, size = 128) {
  if (!user?.avatar) {
    const name = encodeURIComponent(user?.name ?? 'U');
    return `https://ui-avatars.com/api/?name=${name}&background=7BB342&color=fff&bold=true&size=${size}`;
  }

  // Relative path stored locally (e.g. "avatars/xyz.jpg")
  if (!user.avatar.startsWith('http')) {
    return `http://localhost:8000/storage/${user.avatar}`;
  }

  return user.avatar;
}
