/**
 * Input validation utilities
 */

export function validateUsername(username: string): string | null {
  if (username.length < 3) {
    return "Username must be at least 3 characters";
  }
  if (username.length > 30) {
    return "Username must be less than 30 characters";
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return "Username can only contain letters, numbers, hyphens, and underscores";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (password.length > 100) {
    return "Password is too long";
  }
  // Require at least one letter and one number
  if (!/[a-zA-Z]/.test(password)) {
    return "Password must contain at least one letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email) return null; // Email is optional
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  return null;
}

export function validateFullName(name: string): string | null {
  if (name.length < 2) {
    return "Name must be at least 2 characters";
  }
  if (name.length > 100) {
    return "Name is too long";
  }
  return null;
}

export function validateBirthDate(dateString: string): string | null {
  const date = new Date(dateString);
  const now = new Date();
  
  // Check if valid date
  if (isNaN(date.getTime())) {
    return "Please enter a valid date";
  }
  
  // Check if in the future
  if (date > now) {
    return "Birth date cannot be in the future";
  }
  
  // Check if too far in the past (before 1900)
  const minDate = new Date("1900-01-01");
  if (date < minDate) {
    return "Birth date must be after 1900";
  }
  
  // Check if realistic age (< 150 years)
  const age = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (age > 150) {
    return "Please enter a valid birth date";
  }
  
  return null;
}

export function validateInviteCode(code: string): string | null {
  if (!code || code.trim().length === 0) {
    return "Invite code is required";
  }
  if (code.length < 5) {
    return "Invalid invite code format";
  }
  return null;
}
