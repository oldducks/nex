/**
 * Formats a phone number string into a readable Thai format.
 * Standard Thai mobile: 0XX-XXX-XXXX
 * Standard Thai landline: 0X-XXX-XXXX
 * 
 * @param phone The raw phone number string
 * @returns Formatted phone number string
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // 10 digits (Mobile): 0XX-XXX-XXXX
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // 9 digits (Landline): 0X-XXX-XXXX
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
  }

  // Fallback for other lengths: block into 4-digit groups from the end
  // (matches common Thai preference for 4-digit grouping at the end)
  if (cleaned.length > 0) {
    const groups = [];
    let i = cleaned.length;
    while (i > 0) {
      const start = Math.max(0, i - 4);
      groups.unshift(cleaned.slice(start, i));
      i = start;
    }
    return groups.join('-');
  }

  return phone;
}
