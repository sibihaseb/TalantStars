import { useState, useEffect } from 'react';

// Language configuration
export const LANGUAGES = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
} as const;

export type Language = keyof typeof LANGUAGES;

// Translation dictionary
export const translations = {
  en: {
    // Navigation
    home: 'Home',
    findTalent: 'Find Talent',
    browseJobs: 'Browse Jobs',
    postGigs: 'Post Gigs',
    howItWorks: 'How It Works',
    login: 'Login',
    signup: 'Sign Up',
    getStarted: 'Get Started',
    logout: 'Logout',
    dashboard: 'Dashboard',
    settings: 'Settings',
    profile: 'Profile',
    
    // Dashboard
    overview: 'Overview',
    applications: 'Applications',
    opportunities: 'Opportunities',
    analytics: 'Analytics',
    social: 'Social',
    calendar: 'Calendar',
    portfolio: 'Portfolio',
    messages: 'Messages',
    
    // Common actions
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    upload: 'Upload',
    download: 'Download',
    share: 'Share',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    
    // Profile
    completeProfile: 'Complete Profile',
    profileCompletion: 'Profile Completion',
    workExperience: 'Work Experience',
    skills: 'Skills',
    mainImage: 'Main Profile Image',
    selectMainImage: 'Select Main Image',
    cropImage: 'Crop Image',
    uploadImage: 'Upload Image',
    
    // Media
    mediaUpload: 'Media Upload',
    selectFiles: 'Select Files',
    dropFiles: 'Drop files here or click to select',
    supportedFormats: 'Supported formats',
    
    // Meeting requests
    meetingRequest: 'Meeting Request',
    sendMeetingRequest: 'Send Meeting Request',
    acceptMeeting: 'Accept Meeting',
    declineMeeting: 'Decline Meeting',
    scheduleMeeting: 'Schedule Meeting',
    
    // Language
    selectLanguage: 'Select Language',
    changeLanguage: 'Change Language',
    
    // Admin
    adminSettings: 'Admin Settings',
    openAISettings: 'OpenAI Settings',
    apiKey: 'API Key',
    
    // Success messages
    profileUpdated: 'Profile updated successfully',
    imageUploaded: 'Image uploaded successfully',
    meetingRequestSent: 'Meeting request sent successfully',
    settingsSaved: 'Settings saved successfully',
    
    // Error messages
    errorOccurred: 'An error occurred',
    uploadFailed: 'Upload failed',
    invalidFile: 'Invalid file format',
    fillRequired: 'Please fill all required fields',
  },
  es: {
    // Navigation
    home: 'Inicio',
    findTalent: 'Buscar Talento',
    browseJobs: 'Explorar Trabajos',
    postGigs: 'Publicar Trabajos',
    howItWorks: 'Cómo Funciona',
    login: 'Iniciar Sesión',
    signup: 'Registrarse',
    getStarted: 'Comenzar',
    logout: 'Cerrar Sesión',
    dashboard: 'Panel',
    settings: 'Configuración',
    profile: 'Perfil',
    
    // Dashboard
    overview: 'Resumen',
    applications: 'Aplicaciones',
    opportunities: 'Oportunidades',
    analytics: 'Análisis',
    social: 'Social',
    calendar: 'Calendario',
    portfolio: 'Portafolio',
    messages: 'Mensajes',
    
    // Common actions
    save: 'Guardar',
    cancel: 'Cancelar',
    submit: 'Enviar',
    edit: 'Editar',
    delete: 'Eliminar',
    view: 'Ver',
    upload: 'Subir',
    download: 'Descargar',
    share: 'Compartir',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    
    // Profile
    completeProfile: 'Completar Perfil',
    profileCompletion: 'Completar Perfil',
    workExperience: 'Experiencia Laboral',
    skills: 'Habilidades',
    mainImage: 'Imagen Principal del Perfil',
    selectMainImage: 'Seleccionar Imagen Principal',
    cropImage: 'Recortar Imagen',
    uploadImage: 'Subir Imagen',
    
    // Media
    mediaUpload: 'Subir Media',
    selectFiles: 'Seleccionar Archivos',
    dropFiles: 'Suelta archivos aquí o haz clic para seleccionar',
    supportedFormats: 'Formatos soportados',
    
    // Meeting requests
    meetingRequest: 'Solicitud de Reunión',
    sendMeetingRequest: 'Enviar Solicitud de Reunión',
    acceptMeeting: 'Aceptar Reunión',
    declineMeeting: 'Rechazar Reunión',
    scheduleMeeting: 'Programar Reunión',
    
    // Language
    selectLanguage: 'Seleccionar Idioma',
    changeLanguage: 'Cambiar Idioma',
    
    // Admin
    adminSettings: 'Configuración de Administrador',
    openAISettings: 'Configuración OpenAI',
    apiKey: 'Clave API',
    
    // Success messages
    profileUpdated: 'Perfil actualizado exitosamente',
    imageUploaded: 'Imagen subida exitosamente',
    meetingRequestSent: 'Solicitud de reunión enviada exitosamente',
    settingsSaved: 'Configuración guardada exitosamente',
    
    // Error messages
    errorOccurred: 'Ocurrió un error',
    uploadFailed: 'Falló la subida',
    invalidFile: 'Formato de archivo inválido',
    fillRequired: 'Por favor completa todos los campos requeridos',
  },
  fr: {
    // Navigation
    home: 'Accueil',
    findTalent: 'Trouver Talent',
    browseJobs: 'Parcourir Emplois',
    postGigs: 'Publier Missions',
    howItWorks: 'Comment Ça Marche',
    login: 'Connexion',
    signup: 'S\'inscrire',
    getStarted: 'Commencer',
    logout: 'Déconnexion',
    dashboard: 'Tableau de Bord',
    settings: 'Paramètres',
    profile: 'Profil',
    
    // Dashboard
    overview: 'Aperçu',
    applications: 'Candidatures',
    opportunities: 'Opportunités',
    analytics: 'Analyses',
    social: 'Social',
    calendar: 'Calendrier',
    portfolio: 'Portfolio',
    messages: 'Messages',
    
    // Common actions
    save: 'Enregistrer',
    cancel: 'Annuler',
    submit: 'Soumettre',
    edit: 'Modifier',
    delete: 'Supprimer',
    view: 'Voir',
    upload: 'Télécharger',
    download: 'Télécharger',
    share: 'Partager',
    search: 'Rechercher',
    filter: 'Filtrer',
    sort: 'Trier',
    
    // Profile
    completeProfile: 'Compléter le Profil',
    profileCompletion: 'Achèvement du Profil',
    workExperience: 'Expérience Professionnelle',
    skills: 'Compétences',
    mainImage: 'Image Principale du Profil',
    selectMainImage: 'Sélectionner l\'Image Principale',
    cropImage: 'Recadrer l\'Image',
    uploadImage: 'Télécharger l\'Image',
    
    // Media
    mediaUpload: 'Téléchargement de Média',
    selectFiles: 'Sélectionner des Fichiers',
    dropFiles: 'Déposez les fichiers ici ou cliquez pour sélectionner',
    supportedFormats: 'Formats supportés',
    
    // Meeting requests
    meetingRequest: 'Demande de Réunion',
    sendMeetingRequest: 'Envoyer Demande de Réunion',
    acceptMeeting: 'Accepter la Réunion',
    declineMeeting: 'Refuser la Réunion',
    scheduleMeeting: 'Programmer la Réunion',
    
    // Language
    selectLanguage: 'Sélectionner la Langue',
    changeLanguage: 'Changer la Langue',
    
    // Admin
    adminSettings: 'Paramètres Administrateur',
    openAISettings: 'Paramètres OpenAI',
    apiKey: 'Clé API',
    
    // Success messages
    profileUpdated: 'Profil mis à jour avec succès',
    imageUploaded: 'Image téléchargée avec succès',
    meetingRequestSent: 'Demande de réunion envoyée avec succès',
    settingsSaved: 'Paramètres enregistrés avec succès',
    
    // Error messages
    errorOccurred: 'Une erreur s\'est produite',
    uploadFailed: 'Échec du téléchargement',
    invalidFile: 'Format de fichier invalide',
    fillRequired: 'Veuillez remplir tous les champs requis',
  },
};

// Language context hook
export function useLanguage() {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && LANGUAGES[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return { language, changeLanguage, t, languages: LANGUAGES };
}