export const NAME_REGEX = /^[a-zA-Z\s]{2,50}$/;
export const PHONE_REGIX = /^[6-9]\d{9}$/;
export const EMAIL_CHECK = (email) => {
  // --- Start of Email Validation ---

  // List of common valid TLDs (you can expand this list as needed)
  const validTlds = ['com', 'org', 'net', 'edu', 'gov', 'info', 'biz', 'co', 'us', 'io', 'in'];

  // General email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/; // Ensures at least two characters in the TLD
  if (!emailRegex.test(email)) {
    return false; // Invalid email
  }

  // Extract the TLD from the email
  const tld = email.split('.').pop().toLowerCase();

  // Check if the TLD is in the list of valid TLDs
  if (!validTlds.includes(tld)) {
    return false; // Invalid email
  }
  const doubleOrInvalidTldRegex = /(\.\w{2,63}){2,}$/i; // Matches double TLDs or overly long TLDs
  if (doubleOrInvalidTldRegex.test(email)) {
    return false; // Invalid email
  }

  // If all validations pass
  return true; // Valid email
  // --- End of Email Validation ---
};

