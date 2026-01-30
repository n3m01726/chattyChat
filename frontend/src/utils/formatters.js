// utils/formatters.js
export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Formate un timestamp ISO en heure locale (HH:MM)
 * @param {string} timestamp - ISO timestamp
 * @param {string} timezone - IANA timezone (optionnel)
 * @returns {string} - Heure formatée (ex: "14:32")
 */
export const formatTime = (timestamp, timezone = null) => {
  if (!timestamp) return '';
  
  const options = {
    hour: '2-digit',
    minute: '2-digit'
  };
  
  if (timezone) {
    options.timeZone = timezone;
  }
  
  return new Date(timestamp).toLocaleTimeString('fr-FR', options);
};

/**
 * Formate une liste d'utilisateurs en train d'écrire
 * @param {Set} users - Set de pseudos
 * @returns {string} - Texte formaté
 */
export const formatTypingUsers = (users) => {
  const count = users.size;
  if (count === 0) return '';
  
  const userList = Array.from(users).join(', ');
  const verb = count === 1 ? 'est' : 'sont';
  return `${userList} ${verb} en train d'écrire...`;
};

/**
 * Génère une couleur unique basée sur une chaîne (pseudo)
 * @param {string} str - String à hasher
 * @returns {string} - Couleur hex (ex: "#3498db")
 */
export const stringToColor = (str) => {
  if (!str) return '#999';
  
  // Hash simple de la chaîne
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Palette de couleurs vives et lisibles
  const colors = [
    '#e74c3c', // Rouge
    '#3498db', // Bleu
    '#2ecc71', // Vert
    '#f39c12', // Orange
    '#9b59b6', // Violet
    '#1abc9c', // Turquoise
    '#e67e22', // Orange foncé
    '#34495e', // Gris-bleu
    '#16a085', // Vert sarcelle
    '#c0392b', // Rouge bordeaux
    '#8e44ad', // Violet foncé
    '#27ae60', // Vert foncé
    '#2980b9', // Bleu foncé
    '#d35400', // Orange brûlé
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Récupère les initiales d'un pseudo (max 2 caractères)
 * @param {string} username - Pseudo
 * @returns {string} - Initiales (ex: "JD" pour "John Doe")
 */
export const getInitials = (username) => {
  if (!username) return '?';
  
  const words = username.trim().split(/\s+/);
  
  if (words.length === 1) {
    // Un seul mot : prendre les 2 premières lettres
    return username.slice(0, 2).toUpperCase();
  }
  
  // Plusieurs mots : prendre la première lettre de chaque
  return words
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();
};