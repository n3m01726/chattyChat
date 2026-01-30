// services/uploadService.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer le dossier uploads à la racine du backend
const uploadsDir = path.join(__dirname, '..', '..', 'uploads'); // Remonter de 2 niveaux depuis services/
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom unique : timestamp-random-extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Filtrer les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/mov', 'video/avi'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Formats acceptés : JPEG, PNG, GIF, WebP'), false);
  }
};

// Configuration multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

/**
 * Service de gestion des uploads
 */
class UploadService {
  /**
   * Middleware multer pour un seul fichier
   */
  single(fieldName) {
    return upload.single(fieldName);
  }

  /**
   * Récupère l'URL publique d'un fichier uploadé
   */
  getFileUrl(filename) {
    return `/uploads/${filename}`;
  }

  /**
   * Supprime un fichier uploadé
   */
  deleteFile(filename) {
    if (!filename) return;
    
    const filePath = path.join(uploadsDir, path.basename(filename));
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Fichier supprimé: ${filename}`);
    }
  }

  /**
   * Supprime l'ancienne image lors d'une mise à jour
   */
  replaceFile(oldUrl, newFilename) {
    if (oldUrl) {
      // Extraire le nom du fichier de l'URL
      const oldFilename = path.basename(oldUrl);
      this.deleteFile(oldFilename);
    }
    return this.getFileUrl(newFilename);
  }
}

module.exports = new UploadService();