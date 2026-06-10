export interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
  label: string;
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length === 0) {
    return { score: 0, feedback: ['Ingresa una contraseña'], color: 'bg-gray-300', label: '' };
  }

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Mínimo 8 caracteres');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Una letra minúscula');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Una letra mayúscula');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Un número');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Un carácter especial (!@#$%^&*)');
  }

  let color = 'bg-red-500';
  let label = 'Muy débil';

  if (score >= 5) {
    color = 'bg-green-500';
    label = 'Muy fuerte';
  } else if (score >= 4) {
    color = 'bg-blue-500';
    label = 'Fuerte';
  } else if (score >= 3) {
    color = 'bg-yellow-500';
    label = 'Media';
  } else if (score >= 2) {
    color = 'bg-orange-500';
    label = 'Débil';
  }

  return { score, feedback, color, label };
};
