const DEV_MODE = true; // Set to false for production!

// Global auth variables
let currentUser = null;

// Online counter variables
let currentOnlineCount = 0;
let lastUpdateTime = Date.now();
const LAUNCH_DATE = new Date('2024-06-20'); // Backdated launch date
const UPDATE_INTERVAL = 10000; // 30 seconds

// Calculate days since launch
function getDaysSinceLaunch() {
    const now = new Date();
    const diffTime = Math.abs(now - LAUNCH_DATE);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Get base range for current day
function getBaseRange() {
    const days = getDaysSinceLaunch();
    
    if (days <= 1) return { min: 200, max: 600 };
    if (days <= 2) return { min: 400, max: 900 };
    if (days <= 3) return { min: 600, max: 1200 };
    if (days <= 4) return { min: 800, max: 1500 };
    if (days <= 5) return { min: 1000, max: 1800 };
    if (days <= 6) return { min: 1200, max: 2000 };
    if (days <= 7) return { min: 1400, max: 2200 };
    if (days <= 14) return { min: 1500, max: 2800 }; // Week 2
    if (days <= 21) return { min: 2000, max: 3500 }; // Week 3
    if (days <= 28) return { min: 2500, max: 4500 }; // Week 4
    if (days <= 42) return { min: 3000, max: 6000 }; // Week 5-6
    if (days <= 56) return { min: 4000, max: 8000 }; // Week 7-8
    return { min: 5000, max: 10000 }; // Day 60+
}

// Get time-of-day multiplier
function getTimeMultiplier() {
    const now = new Date();
    const hour = now.getHours();
    
    // 12am-4am: 5% (dead quiet)
    if (hour >= 0 && hour < 4) return 0.05;
    // 4am-6am: 10% (early birds)
    if (hour >= 4 && hour < 6) return 0.10;
    // 6am-8am: 25% (wake up time)
    if (hour >= 6 && hour < 8) return 0.25;
    // 8am-2pm: 15% (school time - quiet)
    if (hour >= 8 && hour < 14) return 0.15;
    // 2pm-3pm: 40% (school ending)
    if (hour >= 14 && hour < 15) return 0.40;
    // 3pm-5pm: 70% (after school rush)
    if (hour >= 15 && hour < 17) return 0.70;
    // 5pm-9pm: 100% (PEAK TIME!)
    if (hour >= 17 && hour < 21) return 1.00;
    // 9pm-11pm: 50% (winding down)
    if (hour >= 21 && hour < 23) return 0.50;
    // 11pm-12am: 20% (night owls)
    return 0.20;
}

// Calculate online users with random fluctuation
function calculateOnlineUsers() {
    const baseRange = getBaseRange();
    const timeMultiplier = getTimeMultiplier();
    
    // Random fluctuation between 0.8 and 1.2 (±20%)
    const randomFluctuation = 0.8 + (Math.random() * 0.4);
    
    // Calculate the actual range based on time of day
    const minUsers = Math.floor(baseRange.min * timeMultiplier * randomFluctuation);
    const maxUsers = Math.floor(baseRange.max * timeMultiplier * randomFluctuation);
    
    // Get a random number within the range
    const users = Math.floor(minUsers + Math.random() * (maxUsers - minUsers));
    
    // Make sure we have at least 1 user (never show 0)
    return Math.max(1, users);
}

// Smooth transition between counts
function smoothTransition(from, to) {
    // Don't change too drastically - limit to ±15% change
    const maxChange = Math.floor(from * 0.15);
    const actualChange = to - from;
    
    if (Math.abs(actualChange) > maxChange) {
        if (actualChange > 0) {
            return from + maxChange;
        } else {
            return from - maxChange;
        }
    }
    
    return to;
}

// Update the online counter display
function updateOnlineCounter() {
    const newCount = calculateOnlineUsers();
    const smoothedCount = smoothTransition(currentOnlineCount, newCount);
    
    currentOnlineCount = smoothedCount;
    
    const countElement = document.getElementById('online-count');
    const pillElement = document.querySelector('.online-counter-pill');
    
    if (countElement) {
        // Add animation class
        pillElement.classList.add('animating');
        pillElement.classList.add('glowing');
        
        // Update the number with formatting
        countElement.textContent = currentOnlineCount.toLocaleString();
        
        // Remove animation classes after animation
        setTimeout(() => {
            pillElement.classList.remove('animating');
            pillElement.classList.remove('glowing');
        }, 500);
    }
}

// Main update function
function performUpdate() {
    updateOnlineCounter();
}

// Auth functions
function initializeAuth() {
    // DEV MODE: Skip auth completely
    if (DEV_MODE) {
        currentUser = { 
            displayName: 'Test User', 
            email: 'test@example.com',
            uid: 'dev-test-user' // Add a fake UID for Firebase
        };
        showApp();
        updateWelcomeMessage({ displayName: 'Test User' });
        console.log('🚀 DEV MODE: Skipping authentication');
        return; // Stop here, don't run real auth
    }
    
    // REAL AUTH: Everything below only runs if DEV_MODE is false
    // Check auth state
    window.onAuthStateChanged(window.firebaseAuth, (user) => {
        if (user) {
            // User is signed in
            currentUser = user;
            showApp();
            updateWelcomeMessage(user);
        } else {
            // User is signed out
            currentUser = null;
            showAuthScreen();
        }
    });

    // Sign in button click
    document.getElementById('google-signin-btn').addEventListener('click', signInWithGoogle);
}

function signInWithGoogle() {
    // In dev mode, this won't even be called
    window.signInWithPopup(window.firebaseAuth, window.firebaseProvider)
        .then((result) => {
            // Sign in successful
            currentUser = result.user;
            showApp();
            updateWelcomeMessage(result.user);
        })
        .catch((error) => {
            console.error('Sign in error:', error);
            alert('Sign in failed. Please try again.');
        });
}

function signOutUser() {
    // Handle dev mode sign out
    if (DEV_MODE) {
        currentUser = null;
        console.log('🚀 DEV MODE: Fake sign out');
        showAuthScreen();
        return;
    }
    
    // Real sign out
    window.signOut(window.firebaseAuth)
        .then(() => {
            // Sign out successful
            currentUser = null;
            showAuthScreen();
        })
        .catch((error) => {
            console.error('Sign out error:', error);
        });
}

// Firebase User Management Functions
async function createOrGetUser(user) {
    try {
        const userRef = window.firestoreDoc(window.firebaseDB, 'users', user.uid);
        const userSnap = await window.firestoreGetDoc(userRef);
        
        if (!userSnap.exists()) {
            // New user - create document
            console.log('Creating new user document');
            const newUserData = {
                email: user.email,
                displayName: user.displayName,
                boosts: 5, // Starting boosts
                hasUnlimitedBoosts: false,
                unlimitedBoostsExpiry: null,
                loginData: {
                    lastLogin: new Date(),
                    streak: 0,
                    claimedDays: [],
                    totalEarned: 0
                },
                createdAt: new Date()
            };
            
            await window.firestoreSetDoc(userRef, newUserData);
            currentUserDoc = userRef;
            
            // Set local variables
            userBoosts = newUserData.boosts;
            hasUnlimitedBoosts = newUserData.hasUnlimitedBoosts;
            
            return newUserData;
        } else {
            // Existing user
            console.log('Found existing user');
            currentUserDoc = userRef;
            const userData = userSnap.data();
            
            // Set local variables from Firebase
            userBoosts = userData.boosts || 5;
            hasUnlimitedBoosts = userData.hasUnlimitedBoosts || false;
            
            // Check unlimited boost expiry
            if (userData.unlimitedBoostsExpiry) {
                const expiry = userData.unlimitedBoostsExpiry.toDate();
                if (expiry < new Date()) {
                    // Expired
                    hasUnlimitedBoosts = false;
                    await window.firestoreUpdateDoc(userRef, {
                        hasUnlimitedBoosts: false,
                        unlimitedBoostsExpiry: null
                    });
                }
            }
            
            return userData;
        }
    } catch (error) {
        console.error('Error creating/getting user:', error);
        // Fallback to default values
        userBoosts = 5;
        hasUnlimitedBoosts = false;
        return null;
    }
}

async function updateUserBoosts(newBoostCount) {
    if (!currentUserDoc) return;
    
    try {
        await window.firestoreUpdateDoc(currentUserDoc, {
            boosts: newBoostCount
        });
        userBoosts = newBoostCount;
        updateBoostDisplay();
        updateDevBoostCount();
    } catch (error) {
        console.error('Error updating boosts:', error);
    }
}

async function showApp() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    
    // Create or get user from Firebase
    if (currentUser) {
        const userData = await createOrGetUser(currentUser);
        if (userData) {
            // Check for daily login bonus using Firebase data
            await checkDailyLoginFirebase(userData);
        }
    }
}

function showAuthScreen() {
    // In dev mode, immediately go back to app
    if (DEV_MODE) {
        console.log('🚀 DEV MODE: Bypassing auth screen');
        setTimeout(() => {
            currentUser = { displayName: 'Test User', email: 'test@example.com' };
            showApp();
            updateWelcomeMessage({ displayName: 'Test User' });
        }, 100);
        return;
    }
    
    // Normal auth screen display
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('notes-container').style.display = 'none';
}

function updateWelcomeMessage(user) {
    const subtitle = document.querySelector('.subtitle');
    const displayName = user.displayName || 'Student';
    subtitle.textContent = `Welcome back, ${displayName}!`;
}

let currentQuestion = 0;
let score = 0;
let answered = false;
let hintUsed = false;
let cheatUsed = false;
let selectedGrade = null;
let selectedSubject = null;
let selectedCategory = null;
let selectedQuizType = null;
let selectedTopic = null;
let selectedSet = 0;
let selectedQuizMode = 'normal';
let selectedPastPaperYear = null;
let selectedSession = null;
let selectedPaper = null;
let selectedRegion = null;
let timerInterval = null;
let timeRemaining = 5;
let userAnswers = [];
let suddenDeathTriesLeft = 0;
let currentTheme = 'dark';

// Boost system variables
let userBoosts = 2;
let hasUnlimitedBoosts = false;

// Daily bonus system variables
let currentStreak = 0;
let lastLoginDate = null;
let claimedDays = [];
let currentUserDoc = null; // Reference to user's Firestore document
let rewardCountdownInterval = null; // Store countdown timer interval

// Daily rewards configuration
const dailyRewards = {
    1: { type: 'boosts', amount: 100 },
    2: { type: 'boosts', amount: 5 },
    3: { type: 'boosts', amount: 10 },
    4: { type: 'mystery', min: 30, max: 50 },
    5: { type: 'boosts', amount: 10 },
    6: { type: 'boosts', amount: 5 },
    7: { type: 'boosts', amount: 25 },
    8: { type: 'boosts', amount: 10 },
    9: { type: 'mystery', min: 25, max: 45 },
    10: { type: 'boosts', amount: 10 },
    11: { type: 'boosts', amount: 10 },
    12: { type: 'boosts', amount: 10 },
    13: { type: 'mystery', min: 35, max: 60 },
    14: { type: 'boosts', amount: 50 },
    15: { type: 'boosts', amount: 15 },
    16: { type: 'boosts', amount: 15 },
    17: { type: 'mystery', min: 40, max: 70 },
    18: { type: 'boosts', amount: 15 },
    19: { type: 'boosts', amount: 15 },
    20: { type: 'boosts', amount: 15 },
    21: { type: 'boosts', amount: 75 },
    22: { type: 'boosts', amount: 20 },
    23: { type: 'mystery', min: 50, max: 80 },
    24: { type: 'boosts', amount: 20 },
    25: { type: 'boosts', amount: 20 },
    26: { type: 'mystery', min: 60, max: 100 },
    27: { type: 'boosts', amount: 20 },
    28: { type: 'boosts', amount: 100 },
    29: { type: 'mystery', min: 75, max: 125 },
    30: { type: 'special', boosts: 150, lite: true }
};

// KaTeX rendering function
function renderMath(text) {
    if (typeof katex === 'undefined') {
        console.warn('KaTeX not loaded, returning raw text');
        return text;
    }
    
    // Replace inline math $...$ with KaTeX rendering
    return text.replace(/\$([^$]+)\$/g, function(match, math) {
        try {
            return katex.renderToString(math, { throwOnError: false });
        } catch (e) {
            console.warn('KaTeX error:', e);
            return match;
        }
    });
}

// Function to apply KaTeX to all math in content
function applyMathRendering(content) {
    // Find all elements with math content and render them
    const mathElements = content.querySelectorAll('.math, .katex-math');
    mathElements.forEach(element => {
        if (typeof katex !== 'undefined') {
            try {
                katex.render(element.textContent, element, { throwOnError: false });
            } catch (e) {
                console.warn('KaTeX render error:', e);
            }
        }
    });
    
    // Also handle inline math in text content
    const textNodes = [];
    const walker = document.createTreeWalker(
        content,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    let node;
    while (node = walker.nextNode()) {
        if (node.nodeValue.includes('$')) {
            textNodes.push(node);
        }
    }
    
    textNodes.forEach(node => {
        if (node.nodeValue.includes('$')) {
            const rendered = renderMath(node.nodeValue);
            if (rendered !== node.nodeValue) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = rendered;
                while (tempDiv.firstChild) {
                    node.parentNode.insertBefore(tempDiv.firstChild, node);
                }
                node.parentNode.removeChild(node);
            }
        }
    });
}

const generalQuestions = [
    {
        question: "Which process describes the movement of water molecules across a semi-permeable membrane from a region of high water concentration to a region of low water concentration?",
        options: [
            { text: "Active transport", correct: false, explanation: "Active transport requires energy and moves substances against their concentration gradient." },
            { text: "Osmosis", correct: true, explanation: "Correct! Osmosis is the passive movement of water across a semi-permeable membrane." },
            { text: "Diffusion", correct: false, explanation: "Diffusion refers to the movement of any particles from high to low concentration, not specifically water." },
            { text: "Endocytosis", correct: false, explanation: "Endocytosis is the process of cells taking in materials by engulfing them in vesicles." }
        ]
    },
    {
        question: "During DNA replication, which enzyme is responsible for unwinding the double helix?",
        options: [
            { text: "DNA polymerase", correct: false, explanation: "DNA polymerase synthesizes new DNA strands but doesn't unwind the helix." },
            { text: "RNA polymerase", correct: false, explanation: "RNA polymerase is involved in transcription, not DNA replication." },
            { text: "Helicase", correct: true, explanation: "Correct! Helicase unwinds the DNA double helix by breaking hydrogen bonds." },
            { text: "Ligase", correct: false, explanation: "Ligase joins DNA fragments together but doesn't unwind the helix." }
        ]
    },
    {
        question: "Which organelle is known as the 'powerhouse of the cell'?",
        options: [
            { text: "Nucleus", correct: false, explanation: "The nucleus controls cell activities and contains genetic material." },
            { text: "Mitochondrion", correct: true, explanation: "Correct! Mitochondria produce ATP through cellular respiration." },
            { text: "Chloroplast", correct: false, explanation: "Chloroplasts are responsible for photosynthesis in plant cells." },
            { text: "Ribosome", correct: false, explanation: "Ribosomes are responsible for protein synthesis." }
        ]
    },
    {
        question: "In meiosis, how many daughter cells are produced from one parent cell?",
        options: [
            { text: "Two diploid cells", correct: false, explanation: "Mitosis produces two diploid cells, not meiosis." },
            { text: "Two haploid cells", correct: false, explanation: "Meiosis produces four cells, not two." },
            { text: "Four diploid cells", correct: false, explanation: "Meiosis produces haploid cells, not diploid." },
            { text: "Four haploid cells", correct: true, explanation: "Correct! Meiosis produces four haploid daughter cells through two divisions." }
        ]
    },
    {
        question: "What is the primary function of the enzyme amylase?",
        options: [
            { text: "Break down proteins", correct: false, explanation: "Proteases break down proteins, not amylase." },
            { text: "Break down starch", correct: true, explanation: "Correct! Amylase breaks down starch into simpler sugars." },
            { text: "Break down lipids", correct: false, explanation: "Lipases break down lipids, not amylase." },
            { text: "Break down nucleic acids", correct: false, explanation: "Nucleases break down nucleic acids, not amylase." }
        ]
    },
    {
        question: "Where in the cell does photosynthesis take place?",
        options: [
            { text: "Mitochondria", correct: false, explanation: "Mitochondria are for cellular respiration, not photosynthesis." },
            { text: "Chloroplast", correct: true, explanation: "Correct! Chloroplasts contain chlorophyll to capture light energy." },
            { text: "Endoplasmic reticulum", correct: false, explanation: "ER is involved in protein and lipid synthesis." },
            { text: "Golgi apparatus", correct: false, explanation: "Golgi modifies and packages proteins and lipids." }
        ]
    },
    {
        question: "Which of the following is a prokaryotic organism?",
        options: [
            { text: "Amoeba proteus", correct: false, explanation: "Amoeba are eukaryotic protists." },
            { text: "Escherichia coli", correct: true, explanation: "Correct! E. coli is a prokaryotic bacterium." },
            { text: "Saccharomyces cerevisiae", correct: false, explanation: "Baker's yeast is a eukaryotic fungus." },
            { text: "Chlorella vulgaris", correct: false, explanation: "Chlorella is a eukaryotic green alga." }
        ]
    },
    {
        question: "What blood type is considered the universal donor?",
        options: [
            { text: "AB+", correct: false, explanation: "AB+ can receive from any, not donate to any unconditionally." },
            { text: "O-", correct: true, explanation: "Correct! O- has no A, B, or Rh antigens." },
            { text: "A+", correct: false, explanation: "A+ has A and Rh antigens, limiting recipients." },
            { text: "B-", correct: false, explanation: "B- has B antigens, so not universal donor." }
        ]
    },
    {
        question: "Which part of the nephron is primarily responsible for filtration of blood?",
        options: [
            { text: "Loop of Henle", correct: false, explanation: "Loop of Henle concentrates filtrate but doesn't filter." },
            { text: "Bowman's capsule", correct: true, explanation: "Correct! Bowman's capsule surrounds the glomerulus to filter plasma." },
            { text: "Proximal tubule", correct: false, explanation: "Proximal tubule reabsorbs filtrate, not initial filtration." },
            { text: "Collecting duct", correct: false, explanation: "Collecting duct adjusts final urine composition." }
        ]
    },
    {
        question: "According to the Hardy-Weinberg principle, allele frequencies in a population remain constant under all EXCEPT:",
        options: [
            { text: "No mutation", correct: false, explanation: "No mutation is one requirement for equilibrium." },
            { text: "Large population size", correct: false, explanation: "Large size prevents drift; needed for equilibrium." },
            { text: "Random mating", correct: false, explanation: "Random mating is required for HW equilibrium." },
            { text: "Natural selection", correct: true, explanation: "Correct! Natural selection changes allele frequencies." }
        ]
    },
    {
        question: "In PCR (Polymerase Chain Reaction), which temperature step is used for primer annealing?",
        options: [
            { text: "94°C", correct: false, explanation: "94°C is for denaturation of DNA strands." },
            { text: "72°C", correct: false, explanation: "72°C is for extension by DNA polymerase." },
            { text: "50-65°C", correct: true, explanation: "Correct! Primers anneal typically between 50°C and 65°C." },
            { text: "37°C", correct: false, explanation: "37°C is not used in standard PCR cycles." }
        ]
    },
    {
        question: "What type of enzyme inhibition can be overcome by increasing substrate concentration?",
        options: [
            { text: "Noncompetitive inhibition", correct: false, explanation: "Noncompetitive inhibition cannot be overcome by more substrate." },
            { text: "Uncompetitive inhibition", correct: false, explanation: "Uncompetitive inhibition also cannot be overcome by substrate." },
            { text: "Competitive inhibition", correct: true, explanation: "Correct! Competitive inhibitors compete with substrate at the active site." },
            { text: "Feedback inhibition", correct: false, explanation: "Feedback inhibition regulates pathways, not overcome by substrate." }
        ]
    },
    {
        question: "Approximately how many ATP molecules are produced per glucose molecule in aerobic respiration?",
        options: [
            { text: "2", correct: false, explanation: "2 ATP from glycolysis only; total is higher with aerobic respiration." },
            { text: "18", correct: false, explanation: "18 ATP is too low; total yield is around 30–38 ATP." },
            { text: "36", correct: true, explanation: "Correct! Aerobic respiration yields about 36 ATP per glucose." },
            { text: "100", correct: false, explanation: "100 ATP is an overestimate for typical eukaryotic cells." }
        ]
    },
    {
        question: "Which RNA type carries amino acids to the ribosome during translation?",
        options: [
            { text: "mRNA", correct: false, explanation: "mRNA carries the genetic code from DNA." },
            { text: "rRNA", correct: false, explanation: "rRNA forms the core of ribosome structure." },
            { text: "tRNA", correct: true, explanation: "Correct! tRNA transports amino acids to the ribosome." },
            { text: "snRNA", correct: false, explanation: "snRNA is involved in mRNA splicing." }
        ]
    },
    {
        question: "What are the main phases of the cell cycle in order?",
        options: [
            { text: "G1 → S → G2 → M", correct: true, explanation: "Correct! Cells go through G1, S, G2, then mitosis (M)." },
            { text: "S → G1 → G2 → M", correct: false, explanation: "Order is incorrect; G1 precedes S." },
            { text: "M → G1 → S → G2", correct: false, explanation: "M is last, not first." },
            { text: "G2 → S → G1 → M", correct: false, explanation: "Order is reversed." }
        ]
    },
    {
        question: "Which factor is NOT a limiting factor in photosynthesis?",
        options: [
            { text: "Light intensity", correct: false, explanation: "Light intensity influences photosynthetic rate." },
            { text: "Carbon dioxide concentration", correct: false, explanation: "CO₂ levels affect photosynthesis." },
            { text: "Temperature", correct: false, explanation: "Temperature affects enzyme activity in photosynthesis." },
            { text: "Soil pH", correct: true, explanation: "Correct! Soil pH affects root function, not the photosynthetic reaction directly." }
        ]
    },
    {
        question: "Which component of an antibody binds to antigens?",
        options: [
            { text: "Fc region", correct: false, explanation: "Fc region interacts with immune cells, not antigens." },
            { text: "Hinge region", correct: false, explanation: "Hinge allows flexibility but doesn't bind antigen." },
            { text: "Variable region", correct: true, explanation: "Correct! Variable regions of both heavy and light chains bind antigens." },
            { text: "Constant region", correct: false, explanation: "Constant region determines antibody class." }
        ]
    },
    {
        question: "What term describes the ecological succession that occurs after a volcanic eruption?",
        options: [
            { text: "Secondary succession", correct: false, explanation: "Secondary succession follows disturbance leaving soil intact." },
            { text: "Primary succession", correct: true, explanation: "Correct! Primary succession starts on bare rock with no soil." },
            { text: "Climax community", correct: false, explanation: "Climax community is the final stable community." },
            { text: "Pioneer species", correct: false, explanation: "Pioneer species are the first colonizers in primary succession." }
        ]
    },
    {
        question: "In a monohybrid cross of two heterozygous pea plants (Aa x Aa), what is the phenotypic ratio of the offspring?",
        options: [
            { text: "3:1", correct: true, explanation: "Correct! 3 show dominant trait, 1 recessive." },
            { text: "1:1", correct: false, explanation: "1:1 ratio arises in test crosses." },
            { text: "9:3:3:1", correct: false, explanation: "9:3:3:1 is for dihybrid crosses." },
            { text: "1:2:1", correct: false, explanation: "1:2:1 is the genotypic ratio, not phenotypic." }
        ]
    },
    {
        question: "Which trophic level do herbivores occupy in an ecosystem?",
        options: [
            { text: "Primary producers", correct: false, explanation: "Producers are autotrophs like plants." },
            { text: "Primary consumers", correct: true, explanation: "Correct! Herbivores eat producers as primary consumers." },
            { text: "Secondary consumers", correct: false, explanation: "Secondary consumers eat primary consumers." },
            { text: "Decomposers", correct: false, explanation: "Decomposers break down dead organic matter." }
        ]
    },
    {
        question: "Which law states that alleles of different genes assort independently during gamete formation?",
        options: [
            { text: "Law of Segregation", correct: false, explanation: "This law refers to separation of allele pairs." },
            { text: "Law of Independent Assortment", correct: true, explanation: "Correct! Alleles of different genes assort independently." },
            { text: "Law of Dominance", correct: false, explanation: "This law covers dominant/recessive allele interactions." },
            { text: "Law of Linkage", correct: false, explanation: "Linked genes do not assort independently." }
        ]
    },
    {
        question: "Where does transcription occur in eukaryotic cells?",
        options: [
            { text: "Cytoplasm", correct: false, explanation: "In eukaryotes, translation occurs in the cytoplasm." },
            { text: "Nucleus", correct: true, explanation: "Correct! Transcription of DNA to mRNA occurs in the nucleus." },
            { text: "Ribosome", correct: false, explanation: "Ribosomes are the site of translation." },
            { text: "Endoplasmic reticulum", correct: false, explanation: "ER is involved in protein processing." }
        ]
    },
    {
        question: "Which theory explains the origin of mitochondria and chloroplasts in eukaryotic cells?",
        options: [
            { text: "Cell theory", correct: false, explanation: "Cell theory describes basic properties of cells." },
            { text: "Endosymbiotic theory", correct: true, explanation: "Correct! Mitochondria and chloroplasts originated from prokaryotes." },
            { text: "Germ theory", correct: false, explanation: "Germ theory relates to disease-causing microbes." },
            { text: "Theory of spontaneous generation", correct: false, explanation: "This outdated theory suggested life arises from non-life." }
        ]
    },
    {
        question: "Which biome is characterized by permafrost and low biodiversity?",
        options: [
            { text: "Tundra", correct: true, explanation: "Correct! Tundra has permafrost and limited plant/animal life." },
            { text: "Rainforest", correct: false, explanation: "Rainforests have high biodiversity and no permafrost." },
            { text: "Savanna", correct: false, explanation: "Savannas are grasslands with seasonal rainfall." },
            { text: "Desert", correct: false, explanation: "Deserts are hot or cold but lack permafrost." }
        ]
    },
    {
        question: "What type of mutation results in a single amino acid change?",
        options: [
            { text: "Nonsense mutation", correct: false, explanation: "Nonsense mutations create a stop codon prematurely." },
            { text: "Frameshift mutation", correct: false, explanation: "Frameshifts shift the reading frame, altering many amino acids." },
            { text: "Missense mutation", correct: true, explanation: "Correct! Missense mutations swap one amino acid for another." },
            { text: "Silent mutation", correct: false, explanation: "Silent mutations do not change the amino acid sequence." }
        ]
    }
];

const generalQuestionsSet2 = [
    {
        question: "Which organ system includes the heart and blood vessels?",
        options: [
            { text: "Digestive", correct: false, explanation: "The digestive system breaks down food." },
            { text: "Circulatory", correct: true, explanation: "Correct! The circulatory system transports blood." },
            { text: "Respiratory", correct: false, explanation: "The respiratory system handles breathing." },
            { text: "Nervous", correct: false, explanation: "The nervous system transmits signals." }
        ]
    },
    {
        question: "What molecule carries genetic information in cells?",
        options: [
            { text: "DNA", correct: true, explanation: "Correct! DNA stores genetic information." },
            { text: "RNA", correct: false, explanation: "RNA helps in protein synthesis." },
            { text: "Protein", correct: false, explanation: "Proteins perform functions but don't store genes." },
            { text: "Lipid", correct: false, explanation: "Lipids are fats and oils." }
        ]
    },
    {
        question: "What term describes animals that eat only plants?",
        options: [
            { text: "Carnivores", correct: false, explanation: "Carnivores eat other animals." },
            { text: "Omnivores", correct: false, explanation: "Omnivores eat plants and animals." },
            { text: "Herbivores", correct: true, explanation: "Correct! Herbivores consume only plants." },
            { text: "Decomposers", correct: false, explanation: "Decomposers break down dead matter." }
        ]
    }
];

const generalQuestionsSet3 = [
    {
        question: "What gas do animals exhale?",
        options: [
            { text: "Oxygen", correct: false, explanation: "Oxygen is inhaled by animals." },
            { text: "Carbon Dioxide", correct: true, explanation: "Correct! Carbon dioxide is a waste gas exhaled." },
            { text: "Nitrogen", correct: false, explanation: "Nitrogen is mostly inert." },
            { text: "Hydrogen", correct: false, explanation: "Hydrogen is not a major component of breath." }
        ]
    },
    {
        question: "Which organelle controls the cell's activities?",
        options: [
            { text: "Nucleus", correct: true, explanation: "Correct! The nucleus contains DNA." },
            { text: "Ribosome", correct: false, explanation: "Ribosomes synthesize proteins." },
            { text: "Cell wall", correct: false, explanation: "Cell walls provide structure." },
            { text: "Mitochondrion", correct: false, explanation: "Mitochondria produce energy." }
        ]
    },
    {
        question: "Which part of the plant anchors it in the soil?",
        options: [
            { text: "Leaf", correct: false, explanation: "Leaves capture light." },
            { text: "Stem", correct: false, explanation: "Stems support the plant." },
            { text: "Root", correct: true, explanation: "Correct! Roots anchor the plant." },
            { text: "Flower", correct: false, explanation: "Flowers are for reproduction." }
        ]
    }
];

const generalTips = [
    "Water follows solutes; osmosis equalizes concentrations.",
    "Helicase unwinds DNA ahead of the replication machinery.",
    "Mitochondria generate most of the cell's ATP.",
    "Meiosis produces gametes used in sexual reproduction.",
    "Amylase begins starch digestion in the mouth.",
    "Chloroplasts use chlorophyll to capture sunlight.",
    "Prokaryotes like E. coli lack a nuclear membrane.",
    "O-negative blood carries no A, B or Rh antigens.",
    "Bowman's capsule surrounds the glomerulus for filtration.",
    "Natural selection disrupts Hardy–Weinberg equilibrium.",
    "Primers bind during the annealing step of PCR.",
    "Extra substrate can overcome competitive inhibition.",
    "Most ATP comes from oxidative phosphorylation.",
    "tRNA uses anticodons to deliver amino acids.",
    "Interphase prepares the cell for mitosis.",
    "Light, CO₂ and temperature limit photosynthesis.",
    "Antigen specificity lies in the antibody's variable region.",
    "Primary succession starts on bare rock.",
    "Mendel observed a 3:1 ratio in monohybrid crosses.",
    "Primary consumers eat producers in food chains.",
    "Independent assortment occurs for genes on different chromosomes.",
    "Transcription happens inside the nucleus of eukaryotes.",
    "Mitochondria and chloroplasts descended from bacteria.",
    "Tundra soils remain frozen for much of the year.",
    "Missense mutations swap one amino acid for another."
];

// Function to load quiz questions from Firestore
async function loadQuizFromFirestore(grade, subject, setNumber) {
    try {
        console.log('Loading quiz from Firestore...', { grade, subject, setNumber });
        
        // Check if Firebase is loaded
        if (!window.firebaseDB) {
            console.error('Firebase DB not initialized');
            return null;
        }
        
        // Query for quiz document
        const quizzesRef = window.firestoreCollection(window.firebaseDB, 'quizzes');
        const q = window.firestoreQuery(
            quizzesRef,
            window.firestoreWhere('grade', '==', grade),
            window.firestoreWhere('subject', '==', subject),
            window.firestoreWhere('setNumber', '==', setNumber + 1) // Sets are 0-indexed in code, 1-indexed in DB
        );
        
        const querySnapshot = await window.firestoreGetDocs(q);
        
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data();
            console.log('Quiz found:', data);
            return data.questions || null;
        } else {
            console.log('No quiz found in Firestore for:', { grade, subject, setNumber });
            return null;
        }
    } catch (error) {
        console.error('Error loading quiz from Firestore:', error);
        return null;
    }
}

// Function to debug quiz data
async function debugQuizData() {
    try {
        if (!window.firebaseDB) {
            console.error('Firebase not initialized');
            return;
        }
        
        const quizzesRef = window.firestoreCollection(window.firebaseDB, 'quizzes');
        const allQuizzes = await window.firestoreGetDocs(quizzesRef);
        
        let debugHTML = `<div style="background: #1a1a1a; color: #00ff00; padding: 20px; margin: 20px 0; font-family: monospace; border: 2px solid #00ff00; border-radius: 8px;">
            <h3 style="color: #00ff00; margin-bottom: 15px;">🔍 QUIZ DEBUG INFO</h3>
            <p>Total quiz documents: ${allQuizzes.size}</p>`;
        
        if (allQuizzes.size > 0) {
            debugHTML += '<div style="margin-top: 15px;">';
            allQuizzes.forEach(doc => {
                const data = doc.data();
                debugHTML += `
                    <div style="border: 1px solid #444; padding: 10px; margin: 10px 0; background: #0a0a0a;">
                        <strong style="color: #ffff00;">Doc ID: ${doc.id}</strong><br>
                        <span style="color: #ff6600;">Fields:</span> ${Object.keys(data).join(', ')}<br>
                        <span style="color: #00ffff;">Grade:</span> ${data.grade} (${typeof data.grade})<br>
                        <span style="color: #00ffff;">Subject:</span> "${data.subject}"<br>
                        <span style="color: #00ffff;">Set Number:</span> ${data.setNumber}<br>
                        <span style="color: #00ffff;">Questions:</span> ${data.questions ? data.questions.length : 'N/A'}<br>
                        ${data.questions ? `<span style="color: #ff00ff;">First Question:</span> "${data.questions[0].question.substring(0, 50)}..."` : ''}
                    </div>`;
            });
            debugHTML += '</div>';
        } else {
            debugHTML += '<p style="color: #ff6666;">No quiz documents found in Firestore!</p>';
        }
        
        debugHTML += `
            <div style="margin-top: 20px; padding: 15px; background: #0f0f0f; border: 1px solid #333;">
                <h4 style="color: #ffff00;">Expected Quiz Structure:</h4>
                <pre style="color: #00ff00; font-size: 12px;">{
  grade: 12,              // NUMBER
  subject: "Maths",       // STRING
  setNumber: 1,           // NUMBER
  questions: [            // ARRAY
    {
      question: "...",
      options: [
        { text: "...", correct: true/false, explanation: "..." }
      ],
      hint: "..."
    }
  ]
}</pre>
            </div>
        </div>`;
        
        return debugHTML;
    } catch (error) {
        console.error('Error in debugQuizData:', error);
        return `<div style="background: #330000; color: #ff6666; padding: 20px;">Error: ${error.message}</div>`;
    }
}

const subjectQuestions = {
    'Maths': [
        {
            question: 'What is 5 + 3?',
            options: [
                { text: '7', correct: false, explanation: '7 is 5 + 2.' },
                { text: '8', correct: true, explanation: 'Correct! 5 plus 3 equals 8.' },
                { text: '9', correct: false, explanation: '9 is 6 + 3.' },
                { text: '10', correct: false, explanation: '10 is 5 + 5.' }
            ]
        }
    ],
    'Life Science': [
        {
            question: 'Which gas do plants absorb for photosynthesis?',
            options: [
                { text: 'Oxygen', correct: false, explanation: 'Plants release oxygen.' },
                { text: 'Carbon dioxide', correct: true, explanation: 'Correct! Plants absorb CO₂.' },
                { text: 'Nitrogen', correct: false, explanation: 'Nitrogen is abundant but not used directly.' },
                { text: 'Helium', correct: false, explanation: 'Helium is not involved in photosynthesis.' }
            ]
        }
    ],
    'Physics': [
        {
            question: 'What is the unit of force?',
            options: [
                { text: 'Newton', correct: true, explanation: 'Correct! Force is measured in newtons.' },
                { text: 'Joule', correct: false, explanation: 'Joule is the unit of energy.' },
                { text: 'Pascal', correct: false, explanation: 'Pascal is the unit of pressure.' },
                { text: 'Watt', correct: false, explanation: 'Watt is the unit of power.' }
            ]
        }
    ],
    'Chemistry': [
        {
            question: 'What is the chemical symbol for water?',
            options: [
                { text: 'O2', correct: false, explanation: 'O₂ is oxygen gas.' },
                { text: 'H2O', correct: true, explanation: 'Correct! H₂O represents water.' },
                { text: 'CO2', correct: false, explanation: 'CO₂ is carbon dioxide.' },
                { text: 'NaCl', correct: false, explanation: 'NaCl is table salt.' }
            ]
        }
    ],
    'English': [
        {
            question: 'Which word is a verb?',
            options: [
                { text: 'Run', correct: true, explanation: 'Correct! Run is an action word.' },
                { text: 'Blue', correct: false, explanation: 'Blue is an adjective.' },
                { text: 'Quickly', correct: false, explanation: 'Quickly is an adverb.' },
                { text: 'Dog', correct: false, explanation: 'Dog is a noun.' }
            ]
        }
    ]
};

const subjectQuestionsSet2 = {
    'Maths': [
        {
            question: 'What is 9 - 4?',
            options: [
                { text: '3', correct: false, explanation: '3 is 7 - 4.' },
                { text: '4', correct: false, explanation: '4 is 8 - 4.' },
                { text: '5', correct: true, explanation: 'Correct! 9 minus 4 equals 5.' },
                { text: '6', correct: false, explanation: '6 is 10 - 4.' }
            ]
        }
    ],
    'Life Science': generalQuestionsSet2,
    'Physics': [
        {
            question: 'What is the acceleration due to gravity on Earth?',
            options: [
                { text: '9.8 m/s²', correct: true, explanation: 'Correct! Gravity accelerates at about 9.8 m/s².' },
                { text: '5 m/s²', correct: false, explanation: '5 m/s² is too low.' },
                { text: '12 m/s²', correct: false, explanation: '12 m/s² is too high.' },
                { text: '15 m/s²', correct: false, explanation: '15 m/s² is incorrect.' }
            ]
        }
    ],
    'Chemistry': [
        {
            question: 'What is NaCl commonly known as?',
            options: [
                { text: 'Baking soda', correct: false, explanation: 'Baking soda is sodium bicarbonate.' },
                { text: 'Vinegar', correct: false, explanation: 'Vinegar is acetic acid.' },
                { text: 'Table salt', correct: true, explanation: 'Correct! NaCl is table salt.' },
                { text: 'Sugar', correct: false, explanation: 'Sugar is sucrose.' }
            ]
        }
    ],
    'English': [
        {
            question: 'Which word is an adjective?',
            options: [
                { text: 'Happy', correct: true, explanation: 'Correct! Happy describes a noun.' },
                { text: 'Run', correct: false, explanation: 'Run is a verb.' },
                { text: 'Slowly', correct: false, explanation: 'Slowly is an adverb.' },
                { text: 'Dog', correct: false, explanation: 'Dog is a noun.' }
            ]
        }
    ]
};

const subjectQuestionsSet3 = {
    'Maths': [
        {
            question: 'What is 6 × 7?',
            options: [
                { text: '36', correct: false, explanation: '36 is 6 × 6.' },
                { text: '42', correct: true, explanation: 'Correct! 6 times 7 equals 42.' },
                { text: '40', correct: false, explanation: '40 is 5 × 8.' },
                { text: '48', correct: false, explanation: '48 is 6 × 8.' }
            ]
        }
    ],
    'Life Science': generalQuestionsSet3,
    'Physics': [
        {
            question: 'Which form of energy is stored in a stretched spring?',
            options: [
                { text: 'Kinetic', correct: false, explanation: 'Kinetic energy is due to motion.' },
                { text: 'Chemical', correct: false, explanation: 'Chemical energy is in bonds.' },
                { text: 'Potential', correct: true, explanation: 'Correct! A stretched spring stores potential energy.' },
                { text: 'Thermal', correct: false, explanation: 'Thermal energy relates to temperature.' }
            ]
        }
    ],
    'Chemistry': [
        {
            question: 'How many hydrogen atoms are in one molecule of methane (CH4)?',
            options: [
                { text: '2', correct: false, explanation: 'Methane has more than two hydrogens.' },
                { text: '3', correct: false, explanation: 'Three is incorrect.' },
                { text: '4', correct: true, explanation: 'Correct! CH₄ has four hydrogen atoms.' },
                { text: '5', correct: false, explanation: 'There are only four hydrogens.' }
            ]
        }
    ],
    'English': [
        {
            question: "Choose the correct plural of 'child'.",
            options: [
                { text: 'Childs', correct: false, explanation: 'Childs is incorrect.' },
                { text: 'Children', correct: true, explanation: 'Correct! Children is the plural of child.' },
                { text: 'Childes', correct: false, explanation: 'Childes is incorrect.' },
                { text: 'Childies', correct: false, explanation: 'Childies is not standard.' }
            ]
        }
    ]
};

const questionsByGradeSubject = {
    12: {
        'Maths': [subjectQuestions['Maths'], subjectQuestionsSet2['Maths'], subjectQuestionsSet3['Maths']],
        'Life Science': [generalQuestions, generalQuestionsSet2, generalQuestionsSet3],
        'Physics': [subjectQuestions['Physics'], subjectQuestionsSet2['Physics'], subjectQuestionsSet3['Physics']],
        'Chemistry': [subjectQuestions['Chemistry'], subjectQuestionsSet2['Chemistry'], subjectQuestionsSet3['Chemistry']],
        'English': [subjectQuestions['English'], subjectQuestionsSet2['English'], subjectQuestionsSet3['English']]
    },
    11: {
        'Maths': [subjectQuestions['Maths'], subjectQuestionsSet2['Maths'], subjectQuestionsSet3['Maths']],
        'Life Science': [generalQuestions, generalQuestionsSet2, generalQuestionsSet3],
        'Physics': [subjectQuestions['Physics'], subjectQuestionsSet2['Physics'], subjectQuestionsSet3['Physics']],
        'Chemistry': [subjectQuestions['Chemistry'], subjectQuestionsSet2['Chemistry'], subjectQuestionsSet3['Chemistry']],
        'English': [subjectQuestions['English'], subjectQuestionsSet2['English'], subjectQuestionsSet3['English']]
    },
    10: {
        'Maths': [subjectQuestions['Maths'], subjectQuestionsSet2['Maths'], subjectQuestionsSet3['Maths']],
        'Life Science': [generalQuestions, generalQuestionsSet2, generalQuestionsSet3],
        'Physics': [subjectQuestions['Physics'], subjectQuestionsSet2['Physics'], subjectQuestionsSet3['Physics']],
        'Chemistry': [subjectQuestions['Chemistry'], subjectQuestionsSet2['Chemistry'], subjectQuestionsSet3['Chemistry']],
        'English': [subjectQuestions['English'], subjectQuestionsSet2['English'], subjectQuestionsSet3['English']]
    },
    9: {
        'Maths': [subjectQuestions['Maths'], subjectQuestionsSet2['Maths'], subjectQuestionsSet3['Maths']],
        'English': [subjectQuestions['English'], subjectQuestionsSet2['English'], subjectQuestionsSet3['English']]
    },
    8: {
        'Maths': [subjectQuestions['Maths'], subjectQuestionsSet2['Maths'], subjectQuestionsSet3['Maths']],
        'English': [subjectQuestions['English'], subjectQuestionsSet2['English'], subjectQuestionsSet3['English']]
    }
};

// Function to load available categories from Firestore
async function loadAvailableCategories(grade, subject) {
    try {
        if (!window.firebaseDB) {
            console.error('Firebase not initialized');
            return [];
        }
        
        console.log('Loading categories for:', { grade, subject });
        
        const notesRef = window.firestoreCollection(window.firebaseDB, 'notes');
        const subjectKey = subject.toLowerCase().replace(/\s+/g, '');
        const prefix = `grade${grade}-${subjectKey}-`;
        
        // Query for all documents that start with this prefix
        const q = window.firestoreQuery(
            notesRef,
            window.firestoreWhere('__name__', '>=', prefix),
            window.firestoreWhere('__name__', '<', prefix + '\uf8ff')
        );
        
        const querySnapshot = await window.firestoreGetDocs(q);
        const categories = [];
        
        console.log('Found documents:', querySnapshot.size);
        
        querySnapshot.forEach(doc => {
            const data = doc.data();
            console.log('Document data:', data);
            if (data.category && !categories.includes(data.category)) {
                categories.push(data.category);
            }
        });
        
        console.log('Available categories:', categories);
        return categories;
    } catch (error) {
        console.error('Error loading categories:', error);
        return [];
    }
}

// Function to load available topics from Firestore (now includes category)
async function loadAvailableTopics(grade, subject, category) {
    try {
        if (!window.firebaseDB) {
            console.error('Firebase not initialized');
            return [];
        }
        
        console.log('Loading topics for:', { grade, subject, category });
        
        const subjectKey = subject.toLowerCase().replace(/\s+/g, '');
        const categoryKey = category.toLowerCase().replace(/\s+/g, '');
        const docId = `grade${grade}-${subjectKey}-${categoryKey}`;
        
        const docRef = window.firestoreDoc(window.firebaseDB, 'notes', docId);
        const docSnap = await window.firestoreGetDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('Document found:', data);
            return Object.keys(data.topics || {});
        } else {
            console.log('No document found for:', docId);
            return [];
        }
    } catch (error) {
        console.error('Error loading topics:', error);
        return [];
    }
}

// Function to load notes from Firestore (now includes category)
async function loadNotesFromFirestore(grade, subject, category, topic) {
    try {
        console.log('Loading notes from Firestore:', { grade, subject, category, topic });
        
        // Check if Firebase is loaded
        if (!window.firebaseDB) {
            console.error('Firebase DB not initialized');
            throw new Error('Firebase not initialized');
        }
        
        const subjectKey = subject.toLowerCase().replace(/\s+/g, '');
        const categoryKey = category.toLowerCase().replace(/\s+/g, '');
        const docId = `grade${grade}-${subjectKey}-${categoryKey}`;
        
        console.log('Looking for document:', docId);
        
        const docRef = window.firestoreDoc(window.firebaseDB, 'notes', docId);
        const docSnap = await window.firestoreGetDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('Document found:', data);
            
            const topicData = data.topics[topic];
            
            if (topicData) {
                return {
                    topic: topic,
                    content: topicData.content
                };
            }
        }
        
        console.log('No document or topic found');
        return {
            topic: topic,
            content: '<p class="lead-text">We are working on it! Notes for this topic will be available soon.</p>'
        };
    } catch (error) {
        console.error('Error loading notes from Firestore:', error);
        
        return {
            topic: topic,
            content: '<p class="lead-text">Error loading notes. Please try again later.</p>'
        };
    }
}

// Keep the old getNoteData function as a fallback
const notesByGradeSubject = {
    12: {
        'Life Science': {
            topic: 'Cell Biology',
            content: `
                <section class="note-section">
                    <p class="lead-text">Cell biology, also known as cytology, is the branch of biology that studies the structure, function, and behavior of cells. All living organisms are composed of cells, which serve as the fundamental units of life. The cell theory, developed in the mid-19th century by Matthias Schleiden, Theodor Schwann, and Rudolf Virchow, established three fundamental principles: all living things are composed of one or more cells, the cell is the basic unit of life, and all cells arise from pre-existing cells. This theory revolutionized our understanding of life and laid the foundation for modern biological sciences.</p>
                </section>
                <section class="note-section">
                    <h2>Historical Development and Significance</h2>
                    <p>The discovery of cells was made possible by the invention of the microscope in the 17th century. Robert Hooke first observed and named cells in 1665 while examining cork tissue, though he was actually observing the cell walls of dead plant cells. Antonie van Leeuwenhoek, using more advanced microscopes of his own design, was the first to observe living cells, including bacteria, protozoa, and blood cells. The development of cell theory took nearly two centuries of observations and experiments, culminating in our modern understanding that cells are not just structural units but also functional units that carry out all the processes necessary for life. This understanding has profound implications for medicine, biotechnology, and our comprehension of evolution, as all life shares common cellular features that point to a universal common ancestor.</p>
                </section>
                <section class="note-section">
                    <h2>Prokaryotic Cells: The Ancient Life Forms</h2>
                    <p>Prokaryotic cells represent the oldest and most abundant form of life on Earth, having existed for approximately 3.5 billion years. These cells lack a membrane-bound nucleus and other membrane-enclosed organelles, distinguishing them from the more complex eukaryotic cells. The genetic material in prokaryotes consists of a single, circular chromosome located in a region called the nucleoid, which is not separated from the cytoplasm by a nuclear membrane.</p>
                    <div class="key-points">
                        <div class="point">Cell size typically ranges from 0.1 to 5.0 micrometers in diameter</div>
                        <div class="point">Ribosomes in prokaryotes are 70S, smaller than eukaryotic ribosomes</div>
                        <div class="point">Many prokaryotes possess flagella for movement</div>
                    </div>
                </section>
            `
        }
    }
};

function getNoteData(grade, subject) {
    if (notesByGradeSubject[grade] && notesByGradeSubject[grade][subject]) {
        return notesByGradeSubject[grade][subject];
    }
    return { topic: subject + ' Notes', content: `<p class="lead-text">Notes for Grade ${grade} ${subject} will be available soon.</p>` };
}

// NEW: Past Paper Content Loading System - UPDATED FOR NEW STRUCTURE
async function generatePastPaperContent() {
    try {
        // Build the path to the paper file
        const gradeFolder = `grade${selectedGrade}`;
        const subjectFolder = selectedSubject.toLowerCase().replace(/\s+/g, '');
        const regionFolder = selectedRegion.toLowerCase().replace(/\s+/g, '');
        const sessionFolder = selectedSession.toLowerCase();
        const paperFile = `paper${selectedPaper}.js`;
        
        const scriptPath = `pastpapers/${gradeFolder}/${subjectFolder}/${selectedPastPaperYear}/${regionFolder}/${sessionFolder}/${paperFile}`;
        
        console.log('Loading paper from:', scriptPath);
        
        // Try to load the script dynamically
        const script = document.createElement('script');
        script.src = scriptPath;
        
        return new Promise((resolve) => {
            script.onload = () => {
                // Call the generatePaper function from the loaded file
                if (typeof generatePaper === 'function') {
                    resolve(generatePaper());
                } else {
                    resolve(getDefaultPaperContent());
                }
            };
            
            script.onerror = () => {
                console.log('Paper not found:', scriptPath);
                resolve(getDefaultPaperContent());
            };
            
            document.head.appendChild(script);
        });
    } catch (error) {
        console.error('Error loading paper:', error);
        return getDefaultPaperContent();
    }
}

// Default content when paper doesn't exist
function getDefaultPaperContent() {
    return `
        <section class="note-section">
            <p class="lead-text">Grade ${selectedGrade} ${selectedSubject} - ${selectedPastPaperYear} ${selectedSession} - Paper ${selectedPaper}</p>
            <div class="exam-info">
                <strong>Status:</strong> We are working on adding this paper, if it exists.
            </div>
        </section>
        
        <section class="note-section">
            <h2>Past Paper Information</h2>
            <p>This specific past paper is not yet available in our collection. We're continuously adding new papers.</p>
            
            <div class="key-points">
                <div class="point">Check back soon for updates</div>
                <div class="point">Try other available papers for ${selectedSubject}</div>
                <div class="point">Use our Paperman Quiz feature to practice</div>
            </div>
        </section>
    `;
}

// Function to toggle answers for demo
function toggleAnswer(answerId) {
    const answer = document.getElementById(answerId);
    const isHidden = !answer.classList.contains('revealed') && !answer.classList.contains('shown') && !answer.classList.contains('active');
    
    if (isHidden) {
        answer.classList.add('revealed', 'shown', 'active');
    } else {
        answer.classList.remove('revealed', 'shown', 'active');
    }
}

// NEW: Reveal answer function with smooth animation and KaTeX support
function revealAnswer(answerId) {
    const answerBox = document.getElementById(answerId);
    const button = answerBox.previousElementSibling;
    
    if (answerBox.style.display === 'none') {
        // Show answer with animation
        answerBox.style.display = 'block';
        answerBox.style.opacity = '0';
        answerBox.style.transform = 'translateY(-10px)';
        
        // Apply KaTeX rendering to the revealed content
        applyMathRendering(answerBox);
        
        // Trigger animation
        setTimeout(() => {
            answerBox.style.transition = 'all 0.4s ease';
            answerBox.style.opacity = '1';
            answerBox.style.transform = 'translateY(0)';
        }, 10);
        
        button.textContent = 'Hide Answer';
        button.classList.add('revealed');
    } else {
        // Hide answer
        answerBox.style.opacity = '0';
        answerBox.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            answerBox.style.display = 'none';
        }, 400);
        
        button.textContent = 'Reveal Answer';
        button.classList.remove('revealed');
    }
}

function selectGrade(grade) {
    selectedGrade = grade;
    const gradeSection = document.getElementById('grade-selection');
    const subjectSection = document.getElementById('subject-selection');
    const subjectButtons = document.getElementById('subject-buttons');

    const subjects = grade >= 10
        ? ['Maths', 'Life Science', 'Physics', 'Chemistry', 'English']
        : ['Maths', 'English'];

    subjectButtons.innerHTML = '';
    subjects.forEach(sub => {
        const btn = document.createElement('button');
        btn.textContent = sub;
        btn.className = 'selection-button';
        btn.onclick = function() { selectSubject(sub); };
        subjectButtons.appendChild(btn);
    });

    gradeSection.style.display = 'none';
    subjectSection.style.display = 'block';
    document.querySelector('.subtitle').textContent = `Grade ${grade} - Select Subject`;
}

// MODIFIED: selectSubject now goes to quiz type selection first
function selectSubject(subject) {
    selectedSubject = subject;
    document.getElementById('subject-selection').style.display = 'none';
    document.getElementById('quiz-type-selection').style.display = 'block';
    document.querySelector('.subtitle').textContent = `Grade ${selectedGrade} ${subject}`;
}

function showGradeSelection() {
    document.getElementById('subject-selection').style.display = 'none';
    document.getElementById('quiz-type-selection').style.display = 'none';
    document.getElementById('category-selection').style.display = 'none';
    document.getElementById('set-selection').style.display = 'none';
    document.getElementById('topic-selection').style.display = 'none';
    document.getElementById('past-paper-year-selection').style.display = 'none';
    document.getElementById('region-selection').style.display = 'none';
    document.getElementById('session-selection').style.display = 'none';
    document.getElementById('paper-selection').style.display = 'none';
    document.getElementById('grade-selection').style.display = 'block';
    document.querySelector('.subtitle').textContent = 'Select Grade';
    selectedSubject = null;
    selectedCategory = null;
    selectedQuizType = null;
    selectedSet = 0;
    selectedTopic = null;
    selectedPastPaperYear = null;
    selectedRegion = null;
    selectedSession = null;
    selectedPaper = null;
}

function showSubjectSelection() {
    document.getElementById('quiz-type-selection').style.display = 'none';
    document.getElementById('category-selection').style.display = 'none';
    document.getElementById('set-selection').style.display = 'none';
    document.getElementById('topic-selection').style.display = 'none';
    document.getElementById('past-paper-year-selection').style.display = 'none';
    document.getElementById('region-selection').style.display = 'none';
    document.getElementById('session-selection').style.display = 'none';
    document.getElementById('paper-selection').style.display = 'none';
    document.getElementById('subject-selection').style.display = 'block';
    document.querySelector('.subtitle').textContent = `Grade ${selectedGrade} - Select Subject`;
    selectedCategory = null;
    selectedQuizType = null;
    selectedSet = 0;
    selectedTopic = null;
    selectedPastPaperYear = null;
    selectedRegion = null;
    selectedSession = null;
    selectedPaper = null;
}

function showQuizTypeSelection() {
    document.getElementById('set-selection').style.display = 'none';
    document.getElementById('quiz-mode-selection').style.display = 'none';
    document.getElementById('category-selection').style.display = 'none';
    document.getElementById('topic-selection').style.display = 'none';
    document.getElementById('past-paper-year-selection').style.display = 'none';
    document.getElementById('region-selection').style.display = 'none';
    document.getElementById('session-selection').style.display = 'none';
    document.getElementById('paper-selection').style.display = 'none';
    document.getElementById('quiz-type-selection').style.display = 'block';
    document.querySelector('.subtitle').textContent = `Grade ${selectedGrade} ${selectedSubject}`;
    selectedCategory = null;
    selectedSet = 0;
    selectedTopic = null;
    selectedPastPaperYear = null;
    selectedRegion = null;
    selectedSession = null;
    selectedPaper = null;
}

function selectQuizType(type) {
    selectedQuizType = type;

    if (type === 'paperman-quiz') {
        showQuizModeSelection();
    } else if (type === 'past-paper') {
        alert('Past Paper Based Quiz - Coming Soon!');
    } else if (type === 'paperman-notes') {
        showCategorySelection();
    } else if (type === 'past-papers') {
        showPastPaperYearSelection();
    }
}

// Show past paper year selection
function showPastPaperYearSelection() {
    document.getElementById('quiz-type-selection').style.display = 'none';
    document.getElementById('region-selection').style.display = 'none';
    document.getElementById('session-selection').style.display = 'none';
    document.getElementById('paper-selection').style.display = 'none';
    document.getElementById('past-paper-year-selection').style.display = 'block';
    document.querySelector('.subtitle').textContent = `Grade ${selectedGrade} ${selectedSubject} - Past Papers`;
}

// Updated: Select past paper year now goes to region selection
function selectPastPaperYear(year) {
    selectedPastPaperYear = year;
    showRegionSelection();
}

// Show region selection
function showRegionSelection() {
    document.getElementById('past-paper-year-selection').style.display = 'none';
    document.getElementById('region-selection').style.display = 'block';
    document.querySelector('.subtitle').textContent = `Grade ${selectedGrade} ${selectedSubject} - ${selectedPastPaperYear}`;
}

// Select region
function selectRegion(region) {
    selectedRegion = region;
    showSessionSelection();
}

// NEW: Show session selection
function showSessionSelection() {
    document.getElementById('region-selection').style.display = 'none';
    document.getElementById('paper-selection').style.display = 'none';
    document.getElementById('session-selection').style.display = 'block';
    document.querySelector('.subtitle').textContent = `Grade ${selectedGrade} ${selectedSubject} - ${selectedPastPaperYear} ${selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)}`;
}

// NEW: Select session function
function selectSession(session) {
    selectedSession = session;
    showPaperSelection();
}

// NEW: Show paper selection with dynamic papers
function showPaperSelection() {
    document.getElementById('session-selection').style.display = 'none';
    document.getElementById('paper-selection').style.display = 'block';
    document.querySelector('.subtitle').textContent = `Grade ${selectedGrade} ${selectedSubject} - ${selectedPastPaperYear} ${selectedSession}`;
    
    const paperButtons = document.getElementById('paper-buttons');
    paperButtons.innerHTML = '';
    
    // Dynamic paper count based on subject
    const paperCount = selectedSubject === 'English' ? 3 : 2;
    
    for (let i = 1; i <= paperCount; i++) {
        const btn = document.createElement('button');
        btn.textContent = `Paper ${i}`;
        btn.className = 'selection-button';
        btn.onclick = function() { selectPaper(i); };
        paperButtons.appendChild(btn);
    }
}

// NEW: Select paper and show content
function selectPaper(paperNumber) {
    selectedPaper = paperNumber;
    showPastPaperContent();
}

// NEW: Show past paper content (reusing notes container) - UPDATED TO BE ASYNC
async function showPastPaperContent() {
    // Show loading state
    const noteBody = document.getElementById('note-body');
    noteBody.innerHTML = '<p class="lead-text">Loading past paper...</p>';
    
    // Generate content using new system
    const content = await generatePastPaperContent();
    
    // Update all display elements (reusing notes container)
    document.getElementById('notes-title').textContent = `${selectedSubject} - Paper ${selectedPaper}`;
    document.getElementById('notes-subtitle').textContent = `Grade ${selectedGrade} Past Paper`;
    document.getElementById('breadcrumb-grade').textContent = `Grade ${selectedGrade}`;
    document.getElementById('breadcrumb-subject').textContent = selectedSubject;
    document.getElementById('breadcrumb-category').textContent = `${selectedPastPaperYear} ${selectedSession}`;
    document.getElementById('breadcrumb-topic').textContent = `Paper ${selectedPaper}`;
    
    // Set the content
    noteBody.innerHTML = content;
    
    // Apply KaTeX rendering to the content
    applyMathRendering(noteBody);
    
    // Hide quiz container and selection screens
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('paper-selection').style.display = 'none';
    
    // Show notes container
    const notesContainer = document.getElementById('notes-container');
    notesContainer.style.display = 'block';
    notesContainer.classList.add('show');
    
    // Switch body class
    document.body.classList.remove('quiz-view');
    document.body.classList.add('notes-view');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Show category selection screen
async function showCategorySelection() {
    document.getElementById('quiz-type-selection').style.display = 'none';
    document.getElementById('topic-selection').style.display = 'none';
    document.getElementById('category-selection').style.display = 'block';
    document.querySelector('.subtitle').textContent = `Grade ${selectedGrade} ${selectedSubject} - Select Category`;
    
    const categoryButtons = document.getElementById('category-buttons');
    categoryButtons.innerHTML = '<p class="lead-text">Loading categories...</p>';
    
    console.log('showCategorySelection - Loading categories for:', selectedGrade, selectedSubject);
    
    // Load available categories from Firestore
    const categories = await loadAvailableCategories(selectedGrade, selectedSubject);
    
    console.log('showCategorySelection - Categories found:', categories);
    
    if (categories.length === 0) {
        categoryButtons.innerHTML = `
            <p class="lead-text">No categories found for Grade ${selectedGrade} ${selectedSubject}</p>
            <button class="back-button" onclick="showQuizTypeSelection()">Back</button>
        `;
        return;
    }
    
    // Create buttons for each category
    categoryButtons.innerHTML = '';
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.textContent = category;
        btn.className = 'selection-button';
        btn.onclick = function() { 
            selectCategory(category);
        };
        categoryButtons.appendChild(btn);
    });
}

// Select category function
function selectCategory(category) {
    selectedCategory = category;
    showTopicSelection();
}

// Function to show topic selection screen (now uses categories)
async function showTopicSelection() {
    // Make sure we're in the quiz container, not notes container
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('notes-container').style.display = 'none';
    
    document.getElementById('category-selection').style.display = 'none';
    document.getElementById('topic-selection').style.display = 'block';
    document.querySelector('.subtitle').textContent = `Grade ${selectedGrade} ${selectedSubject} - ${selectedCategory}`;
    
    const topicButtons = document.getElementById('topic-buttons');
    
    topicButtons.innerHTML = '<p class="lead-text">Loading topics...</p>';
    
    console.log('showTopicSelection - Loading topics for:', selectedGrade, selectedSubject, selectedCategory);
    
    // Load available topics from Firestore using category
    const topics = await loadAvailableTopics(selectedGrade, selectedSubject, selectedCategory);
    
    console.log('showTopicSelection - Topics found:', topics);
    
    if (topics.length === 0) {
        topicButtons.innerHTML = `
            <p class="lead-text">No topics found for Grade ${selectedGrade} ${selectedSubject} - ${selectedCategory}</p>
        `;
        return;
    }
    
    // If only one topic, go directly to it
    if (topics.length === 1) {
        console.log('Only one topic found, going directly to:', topics[0]);
        selectedTopic = topics[0];
        showNotes();
        return;
    }
    
    // Create buttons for each topic
    topicButtons.innerHTML = '';
    topics.forEach(topic => {
        const btn = document.createElement('button');
        btn.textContent = topic;
        btn.className = 'selection-button';
        btn.onclick = function() { 
            selectedTopic = topic;
            showNotes();
        };
        topicButtons.appendChild(btn);
    });
}

function showQuizModeSelection() {
    document.getElementById('quiz-type-selection').style.display = 'none';
    document.getElementById('set-selection').style.display = 'none';
    document.getElementById('quiz-mode-selection').style.display = 'block';
    document.querySelector('.subtitle').textContent = `Grade ${selectedGrade} ${selectedSubject} - Select Mode`;
    selectedQuizMode = 'normal';
    updateModeSelection('normal');
}

function selectQuizMode(mode) {
    selectedQuizMode = mode;
    updateModeSelection(mode);
}

function updateModeSelection(mode) {
    const cards = document.querySelectorAll('.quiz-mode-card');
    cards.forEach(card => {
        if (card.dataset.mode === mode) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

function showSetSelection() {
    document.getElementById('quiz-mode-selection').style.display = 'none';
    document.getElementById('set-selection').style.display = 'block';
    document.querySelector('.subtitle').textContent = `Grade ${selectedGrade} ${selectedSubject} - Select Set`;
}

function continueAfterMode() {
    showSetSelection();
}

function selectSet(index) {
    selectedSet = index;
    startQuiz();
}

async function startQuiz() {
    currentQuestion = 0;
    score = 0;
    answered = false;
    hintUsed = false;
    cheatUsed = false;
    if (selectedQuizMode === 'sudden') {
        suddenDeathTriesLeft = 3;
    } else {
        suddenDeathTriesLeft = 0;
    }
    userAnswers = [];

    // Try to load questions from Firestore first
    const firestoreQuestions = await loadQuizFromFirestore(selectedGrade, selectedSubject, selectedSet);
    
    if (firestoreQuestions && firestoreQuestions.length > 0) {
        console.log('Using questions from Firestore');
        questions = firestoreQuestions;
        // Extract hints from questions
        tips = firestoreQuestions.map(q => q.hint || 'No hint available');
    } else {
        console.log('Using hardcoded questions (Firestore empty or error)');
        // Fall back to hardcoded questions
        if (
            questionsByGradeSubject[selectedGrade] &&
            questionsByGradeSubject[selectedGrade][selectedSubject]
        ) {
            const sets = questionsByGradeSubject[selectedGrade][selectedSubject];
            questions = sets[selectedSet] || sets[0];
            tips = tipsByGradeSubject[selectedGrade][selectedSubject];
        } else {
            questions = generalQuestions;
            tips = generalTips;
        }
    }

    // Show debug info if no questions found
    if (!questions || questions.length === 0) {
        const debugInfo = await debugQuizData();
        const quizScreen = document.getElementById('quiz-screen');
        // Save original content
        const originalContent = quizScreen.innerHTML;
        quizScreen.innerHTML = `
            <div class="quiz-content">
                <h2>No Questions Available</h2>
                ${debugInfo}
                <button class="back-button" onclick="goBackFromQuizDebug()">Back</button>
            </div>`;
        document.getElementById('selection-screen').style.display = 'none';
        document.getElementById('quiz-screen').style.display = 'block';
        return;
    }

    document.getElementById('selection-screen').style.display = 'none';
    document.getElementById('results-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    document.querySelector('.progress-bar').style.display = 'block';

    const modeIndicator = document.getElementById('modeIndicator');
    modeIndicator.className = `quiz-mode-indicator ${selectedQuizMode}`;
    const modeNames = {
        normal: 'Normal Mode',
        rapid: 'Rapid Fire Mode',
        sudden: 'Sudden Death Mode'
    };
    modeIndicator.textContent = modeNames[selectedQuizMode] || 'Quiz Mode';

    if (selectedQuizMode === 'rapid') {
        document.getElementById('timerBar').style.display = 'block';
    } else {
        document.getElementById('timerBar').style.display = 'none';
    }

    if (selectedQuizMode === 'rapid' || selectedQuizMode === 'sudden') {
        document.querySelector('.hint-button').style.display = 'none';
    } else {
        document.querySelector('.hint-button').style.display = 'flex';
    }

    if (selectedQuizMode === 'normal') {
        document.querySelector('.cheat-button').style.display = 'flex';
    } else {
        document.querySelector('.cheat-button').style.display = 'none';
    }

    document.querySelector('.subtitle').textContent = `Grade ${selectedGrade} ${selectedSubject} - Paperman Quiz`;

    loadQuestion();
}

// Function to go back from quiz debug screen
function goBackFromQuizDebug() {
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('selection-screen').style.display = 'block';
    document.querySelector('.progress-bar').style.display = 'none';
    showSetSelection();
}

// Updated showNotes function to use categories
async function showNotes() {
    console.log('showNotes called with:', { 
        grade: selectedGrade, 
        subject: selectedSubject, 
        category: selectedCategory,
        topic: selectedTopic 
    });
    
    // Make sure the notes container exists
    const notesContainer = document.getElementById('notes-container');
    const noteBody = document.getElementById('note-body');
    
    if (!notesContainer || !noteBody) {
        console.error('Notes container elements not found!');
        alert('Error: Notes display not available. Please refresh the page.');
        return;
    }
    
    // Show loading message
    noteBody.innerHTML = '<p class="lead-text">Loading notes...</p>';
    
    // Load notes from Firestore using category
    const data = await loadNotesFromFirestore(selectedGrade, selectedSubject, selectedCategory, selectedTopic);
    
    // Update all the display elements
    document.getElementById('notes-title').textContent = data.topic;
    document.getElementById('notes-subtitle').textContent = `Grade ${selectedGrade} ${selectedSubject} - Notes`;
    document.getElementById('breadcrumb-grade').textContent = `Grade ${selectedGrade}`;
    document.getElementById('breadcrumb-subject').textContent = selectedSubject;
    document.getElementById('breadcrumb-category').textContent = selectedCategory;
    document.getElementById('breadcrumb-topic').textContent = data.topic;
    
    // Set the content
    noteBody.innerHTML = data.content;
    
    // Apply KaTeX rendering to the notes content
    applyMathRendering(noteBody);

    // Hide quiz container and selection screens
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('topic-selection').style.display = 'none';
    
    // Show notes container
    notesContainer.style.display = 'block';
    notesContainer.classList.add('show');
    
    // Switch body class from quiz to notes view
    document.body.classList.remove('quiz-view');
    document.body.classList.add('notes-view');
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    stopRapidFireTimer();
}

// Updated backToTopics to handle past papers
function backToTopics() {
    // Hide notes container
    const notesContainer = document.getElementById('notes-container');
    notesContainer.style.display = 'none';
    notesContainer.classList.remove('show');
    
    // Switch body class back to quiz view
    document.body.classList.remove('notes-view');
    document.body.classList.add('quiz-view');
    
    // Show quiz container
    document.getElementById('quiz-container').style.display = 'block';
    
    // Determine where to go back based on what was selected
    if (selectedPaper) {
        // Coming from past paper content - go back to paper selection
        showPaperSelection();
        selectedPaper = null;
    } else if (selectedTopic) {
        // Coming from notes - go back to topic selection
        showTopicSelection();
        selectedTopic = null;
    }
    
    stopRapidFireTimer();
}

function showHint() {
    if (hintUsed || answered) return;

    hintUsed = true;
    const hintBox = document.getElementById('hintBox');
    const hintText = hintBox.querySelector('.hint-text');
    const hintButton = document.querySelector('.hint-button');

    hintText.textContent = tips[currentQuestion];
    hintBox.classList.add('show');
    hintButton.classList.add('used');
}

function useCheat() {
    if (cheatUsed || answered) return;

    cheatUsed = true;
    const options = document.querySelectorAll('.option');
    const incorrectOptions = Array.from(options).filter(option => option.dataset.correct !== 'true' && !option.classList.contains('removed'));
    if (incorrectOptions.length > 0) {
        const toRemove = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
        toRemove.classList.add('removed', 'disabled');
        toRemove.onclick = null;
    }
    const cheatButton = document.querySelector('.cheat-button');
    cheatButton.classList.add('used');
}

function checkAnswer(selectedOption) {
    if (answered) return;

    answered = true;
    const options = document.querySelectorAll('.option');

    const selectedIndex = Array.from(options).indexOf(selectedOption);
    userAnswers[currentQuestion] = selectedIndex;
    
    // Clear timer for rapid fire mode
    if (selectedQuizMode === 'rapid' && timerInterval) {
        clearInterval(timerInterval);
    }

    // Disable all options
    options.forEach(option => {
        option.classList.add('disabled');
        option.onclick = null;
    });
    
    // Mark the selected option and show its explanation
    selectedOption.classList.add('selected');
    
    if (selectedOption.dataset.correct === 'true') {
        selectedOption.classList.add('correct');
        score++;
    } else {
        selectedOption.classList.add('incorrect');
        options.forEach(option => {
            if (option.dataset.correct === 'true') {
                option.classList.add('correct');
            }
        });

        if (selectedQuizMode === 'sudden') {
            setTimeout(() => {
                showResults(true);
            }, 1500);
            return;
        }
    }

    if (selectedQuizMode !== 'normal') {
        document.querySelectorAll('.explanation').forEach(exp => exp.style.display = 'none');
    }

    document.querySelector('.next-button').classList.add('show');

    // Show boost button after answer is selected
document.querySelector('.boost-button').classList.add('show');
}



function nextQuestion() {
    if (selectedQuizMode === 'rapid' && timerInterval) {
        clearInterval(timerInterval);
    }
    currentQuestion++;
    answered = false;
    hintUsed = false;
    cheatUsed = false;

    if (currentQuestion < questions.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function loadQuestion() {
    const question = questions[currentQuestion];
    const questionEl = document.querySelector('.question h2');
    const optionsEl = document.querySelector('.options');
    const questionNumberEl = document.querySelector('.question-number');
    const progressFill = document.querySelector('.progress-fill');
    const hintBox = document.getElementById('hintBox');
    const hintButton = document.querySelector('.hint-button');
    const cheatButton = document.querySelector('.cheat-button');

    questionNumberEl.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
    questionEl.textContent = question.question;
    progressFill.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
    hintBox.classList.remove('show');
    hintButton.classList.remove('used');
    hintUsed = false;
    cheatButton.classList.remove('used');
    cheatUsed = false;

    if (selectedQuizMode === 'rapid') {
        startRapidFireTimer();
    }

    optionsEl.innerHTML = '';
    question.options.forEach((option, index) => {
        const optionEl = document.createElement('div');
        optionEl.className = 'option';
        optionEl.dataset.correct = option.correct;
        optionEl.onclick = function() { checkAnswer(this); };
        
        optionEl.innerHTML = `
            <div class="option-content">
                <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                <span class="option-text">${option.text}</span>
            </div>
            <div class="explanation">${option.explanation}</div>
        `;
        
        optionsEl.appendChild(optionEl);
    });

    if (userAnswers[currentQuestion] !== undefined) {
        answered = true;
        const options = document.querySelectorAll('.option');
        options.forEach(option => {
            option.classList.add('disabled');
            option.onclick = null;
        });
        const selected = options[userAnswers[currentQuestion]];
        selected.classList.add('selected');
        if (selected.dataset.correct === 'true') {
            selected.classList.add('correct');
        } else {
            selected.classList.add('incorrect');
            options.forEach(option => {
                if (option.dataset.correct === 'true') {
                    option.classList.add('correct');
                }
            });
        }
        document.querySelector('.next-button').classList.add('show');
    } else {
        answered = false;
        document.querySelector('.next-button').classList.remove('show');
    }

    // Hide boost button when loading new question
document.querySelector('.boost-button').classList.remove('show');
const boostBox = document.getElementById('quiz-boost-box');
if (boostBox) boostBox.classList.remove('show');
}


function startRapidFireTimer() {
    clearInterval(timerInterval);
    timeRemaining = 5;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            timeUp();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const fill = document.getElementById('timerFill');
    const text = document.getElementById('timerText');
    const percent = (timeRemaining / 5) * 100;
    fill.style.width = percent + '%';
    text.textContent = timeRemaining + 's';
}

function stopRapidFireTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function timeUp() {
    if (!answered) {
        answered = true;
        const options = document.querySelectorAll('.option');
        options.forEach(option => {
            option.classList.add('disabled');
            option.onclick = null;
            if (option.dataset.correct === 'true') {
                option.classList.add('correct');
            } else {
                option.classList.add('incorrect');
            }
        });
        document.querySelector('.next-button').classList.add('show');
    }
}

function showResults(suddenDeathEnd = false) {
    const quizScreen = document.getElementById('quiz-screen');
    const resultsScreen = document.getElementById('results-screen');
    const percentage = Math.round((score / questions.length) * 100);

    quizScreen.style.display = 'none';
    document.querySelector('.progress-bar').style.display = 'none';

    if (suddenDeathEnd) {
        resultsScreen.className = 'quiz-content game-over-screen';
        const tryAgainButton = suddenDeathTriesLeft > 0
            ? `<button class="retry-button" onclick="retrySuddenDeath()">Try Again (${suddenDeathTriesLeft} left)</button>`
            : '';
        resultsScreen.innerHTML = `
            <div class="game-over">
                <div class="skull">💀</div>
                <h1>GAME OVER</h1>
                ${tryAgainButton}
                <button class="menu-button" onclick="goToMainMenu()">Main Menu</button>
            </div>`;
        resultsScreen.style.display = 'flex';
        return;
    }

    resultsScreen.className = 'quiz-content';
    let titleText = 'Quiz Complete';
    let totalQuestions = questions.length;

    resultsScreen.innerHTML = `
        <div class="results-container" style="text-align: center; padding: 40px 0;">
            <div class="results-score">
                <h2 style="font-size: 48px; margin-bottom: 8px; font-weight: 300; color: var(--text-primary);">${percentage}%</h2>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
            <p style="font-size: 16px; color: var(--text-secondary); margin: 24px 0 12px;">${titleText}</p>
            <p style="font-size: 14px; margin-bottom: 40px; color: var(--text-tertiary);">You scored ${score} out of ${totalQuestions}</p>

            <button class="snapshot-button" onclick="showSnapshot()" title="Save your results">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 7h2l2-3h6l2 3h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/>
                    <circle cx="12" cy="13" r="3"/>
                </svg>
            </button>

            <div class="results-actions">
                <button class="retry-button" onclick="retryQuiz()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.99988C16.9706 2.99988 21 7.02931 21 11.9999C21 16.9704 16.9706 20.9999 12 20.9999C7.02944 20.9999 3 16.9704 3 11.9999C3 9.17261 4.30367 6.64983 6.34267 4.99988" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                        <path d="M3 4.49988H7V8.49988" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                    </svg>
                    <span>Retry Quiz</span>
                </button>

                <div class="secondary-actions">
                    <button class="topics-button" onclick="viewAllTopics()">
                        <svg width="20" height="20" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                            <path d="M960 1024H640c-35.344 0-64-28.656-64-64V640c0-35.344 28.656-64 64-64h320c35.344 0 64 28.656 64 64v320c0 35.344-28.656 64-64 64zm0-384H640v320h320V640zm0-192H640c-35.344 0-64-28.656-64-64V64c0-35.344 28.656-64 64-64h320c35.344 0 64 28.656 64 64v320c0 35.344-28.656 64-64 64zm0-384H640v320h320V64zm-576 960H64c-35.344 0-64-28.656-64-64V640c0-35.344 28.656-64 64-64h320c35.344 0 64 28.656 64 64v320c0 35.344-28.656 64-64 64zm0-384H64v320h320V640zm0-192H64c-35.344 0-64-28.656-64-64V64C0 28.656 28.656 0 64 0h320c35.344 0 64 28.656 64 64v320c0 35.344-28.656 64-64 64zm0-384H64v320h320V64z"/>
                        </svg>
                        <span>View All Topics</span>
                    </button>

                    <button class="menu-button" onclick="goToMainMenu()">
                        <svg width="20" height="20" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                            <polyline fill="none" stroke="currentColor" stroke-width="2" stroke-miterlimit="10" points="3,17 16,4 29,17"/>
                            <polyline fill="none" stroke="currentColor" stroke-width="2" stroke-miterlimit="10" points="6,14 6,27 13,27 13,17 19,17 19,27 26,27 26,14"/>
                        </svg>
                        <span>Main Menu</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    resultsScreen.style.display = 'block';
}

function retryQuiz() {
    currentQuestion = 0;
    score = 0;
    answered = false;
    hintUsed = false;
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    userAnswers = [];

    document.getElementById('results-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    document.querySelector('.progress-bar').style.display = 'block';

    loadQuestion();
}

function retrySuddenDeath() {
    if (suddenDeathTriesLeft > 0) {
        suddenDeathTriesLeft--;
    }
    retryQuiz();
}

function viewAllTopics() {
    document.getElementById('results-screen').style.display = 'none';
    document.getElementById('selection-screen').style.display = 'block';
    
    // Ensure body is in quiz view
    document.body.classList.remove('notes-view');
    document.body.classList.add('quiz-view');
    
    selectedTopic = null;
    showSetSelection();
    stopRapidFireTimer();
}

function goToMainMenu() {
    document.getElementById('results-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'none';
    document.querySelector('.progress-bar').style.display = 'none';
    document.getElementById('selection-screen').style.display = 'block';
    document.getElementById('topic-selection').style.display = 'none';
    document.getElementById('category-selection').style.display = 'none';
    document.getElementById('past-paper-year-selection').style.display = 'none';
    document.getElementById('region-selection').style.display = 'none';
    document.getElementById('session-selection').style.display = 'none';
    document.getElementById('paper-selection').style.display = 'none';
    document.getElementById('notes-container').style.display = 'none';
    
    // Ensure body is in quiz view
    document.body.classList.remove('notes-view');
    document.body.classList.add('quiz-view');
    
    showGradeSelection();
    stopRapidFireTimer();
}

function captureResults() {
    const results = document.getElementById('results-screen');
    html2canvas(results).then(canvas => {
        const link = document.createElement('a');
        link.download = 'results.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

// Grade calculation for snapshot view
function calculateGrade(percentage) {
    if (percentage >= 90) return { grade: 'A+', color: '#00ff00' };
    if (percentage >= 80) return { grade: 'A', color: '#66ff33' };
    if (percentage >= 70) return { grade: 'B', color: '#ccff33' };
    if (percentage >= 60) return { grade: 'C', color: '#FFFF00' };
    if (percentage >= 50) return { grade: 'D', color: '#FF9900' };
    if (percentage >= 40) return { grade: 'E', color: '#ff6600' };
    if (percentage >= 30) return { grade: 'F', color: '#ff3300' };
    return { grade: 'F-', color: '#ff0000' };
}

// Show snapshot overlay
function showSnapshot() {
    const snapshotView = document.getElementById('snapshot-view');
    const topicNameEl = snapshotView.querySelector('.topic-name');
    const gradeEl = snapshotView.querySelector('.grade');
    const percentageEl = snapshotView.querySelector('.big-percentage');
    const breakdownEl = snapshotView.querySelector('.score-breakdown');
    const gradeCircle = snapshotView.querySelector('.grade-circle');

    const total = questions.length;
    const percentage = Math.round((score / total) * 100);
    const info = calculateGrade(percentage);

    topicNameEl.textContent = selectedSubject ? `${selectedSubject} Quiz` : 'Paperman Quiz';
    gradeEl.textContent = info.grade;
    percentageEl.textContent = percentage + '%';
    breakdownEl.textContent = `${score} out of ${total} correct`;
    gradeCircle.style.setProperty('--grade-color', info.color);

    snapshotView.style.display = 'flex';
    snapshotView.style.opacity = '0';
    setTimeout(() => {
        snapshotView.style.transition = 'opacity 0.3s ease';
        snapshotView.style.opacity = '1';
    }, 10);
}

// Hide snapshot overlay
function hideSnapshot() {
    const snapshotView = document.getElementById('snapshot-view');
    snapshotView.style.opacity = '0';
    setTimeout(() => {
        snapshotView.style.display = 'none';
    }, 300);
}

document.getElementById('close-snapshot').addEventListener('click', hideSnapshot);
document.getElementById('snapshot-view').addEventListener('click', (e) => {
    if (e.target === document.getElementById('snapshot-view')) {
        hideSnapshot();
    }
});

function toggleTheme() {
    const body = document.body;
    
    // Save current view state
    const isNotesView = body.classList.contains('notes-view');

    if (currentTheme === 'dark') {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        currentTheme = 'light';
    } else if (currentTheme === 'light') {
        body.classList.remove('light-theme');
        body.classList.add('hacker-theme');
        currentTheme = 'hacker';
    } else if (currentTheme === 'hacker') {
        body.classList.remove('hacker-theme');
        body.classList.add('ruby-theme');
        currentTheme = 'ruby';
    } else if (currentTheme === 'ruby') {
        body.classList.remove('ruby-theme');
        body.classList.add('cloudy-theme');
        currentTheme = 'cloudy';
    } else if (currentTheme === 'cloudy') {
        body.classList.remove('cloudy-theme');
        body.classList.add('kitty-theme');
        currentTheme = 'kitty';
    } else if (currentTheme === 'kitty') {
        body.classList.remove('kitty-theme');
        body.classList.add('astro-theme');
        currentTheme = 'astro';
    } else if (currentTheme === 'astro') {
        body.classList.remove('astro-theme');
        body.classList.add('cyberpunk-theme');
        currentTheme = 'cyberpunk';
    } else {
        body.classList.remove('cyberpunk-theme');
        body.classList.add('dark-theme');
        currentTheme = 'dark';
    }
    
    // Restore view state
    if (isNotesView) {
        body.classList.add('notes-view');
    } else {
        body.classList.add('quiz-view');
    }
    
    localStorage.setItem('theme', currentTheme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;

    if (savedTheme) {
        currentTheme = savedTheme;
    }
    
    // Remove all theme classes first
    body.classList.remove('dark-theme', 'light-theme', 'hacker-theme', 'ruby-theme', 'cloudy-theme', 'kitty-theme', 'astro-theme', 'cyberpunk-theme');
    
    // Apply the current theme
    if (currentTheme === 'light') {
        body.classList.add('light-theme');
    } else if (currentTheme === 'hacker') {
        body.classList.add('hacker-theme');
    } else if (currentTheme === 'ruby') {
        body.classList.add('ruby-theme');
    } else if (currentTheme === 'cloudy') {
        body.classList.add('cloudy-theme');
    } else if (currentTheme === 'kitty') {
        body.classList.add('kitty-theme');
    } else if (currentTheme === 'astro') {
        body.classList.add('astro-theme');
    } else if (currentTheme === 'cyberpunk') {
        body.classList.add('cyberpunk-theme');
    } else {
        body.classList.add('dark-theme');
        currentTheme = 'dark'; // Default to dark if invalid theme
    }
    
    // Maintain quiz-view or notes-view class
    if (!body.classList.contains('notes-view')) {
        body.classList.add('quiz-view');
    }
}

// Initialize the quiz
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.subtitle').textContent = 'Select Grade';
    loadTheme();
    
    // Set initial body class
    document.body.classList.add('quiz-view');

    // Initialize authentication
    initializeAuth();
    
    // Debug: Check if all required elements exist
    const requiredElements = [
        'quiz-container',
        'notes-container',
        'note-body',
        'notes-title',
        'notes-subtitle',
        'breadcrumb-grade',
        'breadcrumb-subject',
        'breadcrumb-category',
        'breadcrumb-topic'
    ];
    
    let missingElements = [];
    requiredElements.forEach(id => {
        if (!document.getElementById(id)) {
            missingElements.push(id);
        }
    });
    
    if (missingElements.length > 0) {
        console.error('Missing required elements:', missingElements);
        console.log('This may cause display issues!');
    } else {
        console.log('All required elements found ✓');
    }
    
    // Check if KaTeX is loaded
    if (typeof katex !== 'undefined') {
        console.log('✅ KaTeX loaded successfully');
    } else {
        console.warn('⚠️ KaTeX not loaded - math rendering disabled');
    }

    // Initialize online counter
    currentOnlineCount = calculateOnlineUsers();
    const countElement = document.getElementById('online-count');
    if (countElement) {
        countElement.textContent = currentOnlineCount.toLocaleString();
    }
    
    // Update every 30 seconds
    setInterval(performUpdate, UPDATE_INTERVAL);

     // Initialize dev panel
    showDevPanel();
}); // This closes the DOMContentLoaded

// Also update when page becomes visible (user returns to tab)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        updateOnlineCounter();
    }
});

const tipsByGradeSubject = {
    12: {
        'Maths': ['Add the numbers.'],
        'Life Science': generalTips,
        'Physics': ['Named after Isaac Newton.'],
        'Chemistry': ['Water is hydrogen and oxygen.'],
        'English': ['A verb expresses action.']
    },
    11: {
        'Maths': ['Add the numbers.'],
        'Life Science': generalTips,
        'Physics': ['Named after Isaac Newton.'],
        'Chemistry': ['Water is hydrogen and oxygen.'],
        'English': ['A verb expresses action.']
    },
    10: {
        'Maths': ['Add the numbers.'],
        'Life Science': generalTips,
        'Physics': ['Named after Isaac Newton.'],
        'Chemistry': ['Water is hydrogen and oxygen.'],
        'English': ['A verb expresses action.']
    },
    9: {
        'Maths': ['Add the numbers.'],
        'English': ['A verb expresses action.']
    },
    8: {
        'Maths': ['Add the numbers.'],
        'English': ['A verb expresses action.']
    }
};

// ============================================
// BOOST SYSTEM FUNCTIONS
// ============================================

function updateBoostDisplay() {
    const boostCountEl = document.getElementById('boost-count');
    const boostTextEl = document.querySelector('.boost-text');
    
    if (hasUnlimitedBoosts) {
        boostTextEl.innerHTML = '<span id="boost-count">UNLIMITED</span> Boosts';
    } else {
        boostTextEl.innerHTML = `<span id="boost-count">${userBoosts}</span> boosts left`;
    }
    
    // Also update dev panel if visible
    updateDevBoostCount();
}

// Dev panel functions
function showDevPanel() {
    if (DEV_MODE) {
        document.getElementById('dev-panel').style.display = 'block';
        updateDevBoostCount();
        // Update streak display in dev panel
        const devStreakCount = document.getElementById('dev-streak-count');
        if (devStreakCount) {
            devStreakCount.textContent = currentStreak;
        }
        document.getElementById('dev-streak-input').value = currentStreak;
    }
}

function toggleDevPanel() {
    const panel = document.getElementById('dev-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function updateDevBoostCount() {
    const devCount = document.getElementById('dev-boost-count');
    if (devCount) {
        devCount.textContent = hasUnlimitedBoosts ? 'UNLIMITED' : userBoosts;
    }
}

async function refillBoosts() {
    if (!hasUnlimitedBoosts) {
        userBoosts += 5;
        updateBoostDisplay();
        updateDevBoostCount();
        console.log('🚀 DEV MODE: Added 5 boosts. Total:', userBoosts);
        
        // Update Firebase
        if (currentUserDoc) {
            await updateUserBoosts(userBoosts);
        }
    }
}

// Modal functions
function showNoBoostsModal() {
    document.getElementById('no-boosts-modal').style.display = 'flex';
}

function closeNoBoostsModal() {
    document.getElementById('no-boosts-modal').style.display = 'none';
}

// Firebase-based daily login check
async function checkDailyLoginFirebase(userData) {
    if (!currentUserDoc) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    
    const loginData = userData.loginData || {
        lastLogin: null,
        streak: 0,
        claimedDays: [],
        totalEarned: 0
    };
    
    // Convert Firestore timestamp to Date if needed
    let lastLogin = null;
    if (loginData.lastLogin) {
        lastLogin = loginData.lastLogin.toDate ? loginData.lastLogin.toDate() : new Date(loginData.lastLogin);
        lastLogin.setHours(0, 0, 0, 0);
    }
    
    currentStreak = loginData.streak || 0;
    claimedDays = loginData.claimedDays || [];

    // If it's a brand new user (streak is 0), set it to 1
if (currentStreak === 0) {
    currentStreak = 1;
}
    
    // Check if it's a new day
    if (!lastLogin || lastLogin.getTime() !== today.getTime()) {
        // Calculate days difference
        let newStreak = 1;
        
        if (lastLogin) {
            const diffTime = today.getTime() - lastLogin.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                // Continue streak
                newStreak = currentStreak + 1;
            } else {
                // Reset streak
                newStreak = 1;
                claimedDays = [];
            }
        }
        
        currentStreak = newStreak;
        
        // Update Firebase
        try {
            await window.firestoreUpdateDoc(currentUserDoc, {
                'loginData.lastLogin': today,
                'loginData.streak': currentStreak,
                'loginData.claimedDays': claimedDays
            });
            
            // Show daily bonus if not claimed
            if (!claimedDays.includes(currentStreak)) {
                showDailyBonus();
            }
        } catch (error) {
            console.error('Error updating login data:', error);
        }
    }
    
    updateStreakDisplay();
}

// Daily Login Bonus Functions
function checkDailyLogin() {
    const today = new Date().toDateString();
    const savedData = localStorage.getItem('dailyLoginData');
    
    if (savedData) {
        const data = JSON.parse(savedData);
        lastLoginDate = data.lastLogin;
        currentStreak = data.streak || 0;
        claimedDays = data.claimedDays || [];
        
        // Check if it's a new day
        if (lastLoginDate !== today) {
            // Check if streak continues or resets
            const lastDate = new Date(lastLoginDate);
            const todayDate = new Date(today);
            const diffTime = Math.abs(todayDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                // Continue streak
                currentStreak++;
            } else {
                // Reset streak
                currentStreak = 1;
                claimedDays = [];
            }
            
            // Update last login
            lastLoginDate = today;
            saveLoginData();
            
            // Show daily bonus modal
            if (!claimedDays.includes(currentStreak)) {
                showDailyBonus();
            }
        }
    } else {
        // First time login
        currentStreak = 1;
        lastLoginDate = today;
        claimedDays = [];
        saveLoginData();
        showDailyBonus();
    }
    
    updateStreakDisplay();
}

function saveLoginData() {
    const data = {
        lastLogin: lastLoginDate,
        streak: currentStreak,
        claimedDays: claimedDays
    };
    localStorage.setItem('dailyLoginData', JSON.stringify(data));
}

function updateStreakDisplay() {
    const streakDisplay = document.getElementById('streak-display');
    const streakText = document.getElementById('streak-text');
    
    console.log('Updating streak display. Current streak:', currentStreak);
    
    if (currentStreak > 0) {
        streakDisplay.style.display = 'block';
        streakText.textContent = `Day ${currentStreak} 🔥`;
    }
    
    // Update dev panel streak count
    const devStreakCount = document.getElementById('dev-streak-count');
    if (devStreakCount) {
        devStreakCount.textContent = currentStreak;
    }
}

// Dev streak management functions
async function setDevStreak() {
    const input = document.getElementById('dev-streak-input');
    const newStreak = parseInt(input.value);
    
    if (newStreak >= 0 && newStreak <= 30) {
        currentStreak = newStreak;
        
        // Update display
        updateStreakDisplay();
        document.getElementById('dev-streak-count').textContent = newStreak;
        
        // Clear claimed days if resetting
        if (newStreak === 0) {
            claimedDays = [];
        } else {
            // Mark all days up to current as claimed (optional)
            // claimedDays = Array.from({length: newStreak - 1}, (_, i) => i + 1);
        }
        
        // Update Firebase if connected
        if (currentUserDoc) {
            try {
                await window.firestoreUpdateDoc(currentUserDoc, {
                    'loginData.streak': currentStreak,
                    'loginData.claimedDays': claimedDays
                });
            } catch (error) {
                console.error('Error updating dev streak in Firebase:', error);
            }
        }
        
        console.log(`🚀 DEV MODE: Set streak to Day ${newStreak}`);
        
        // Show the daily bonus modal for testing
        if (newStreak > 0 && !claimedDays.includes(newStreak)) {
            showDailyBonus();
        }
    }
}

async function jumpToDay(day) {
    document.getElementById('dev-streak-input').value = day;
    await setDevStreak();
}

async function resetCalendar() {
    if (confirm('Reset calendar? This will clear all claimed days and reset streak to 1.')) {
        // Reset all values
        currentStreak = 1;
        claimedDays = [];
        
        // Update displays
        updateStreakDisplay();
        document.getElementById('dev-streak-count').textContent = 1;
        document.getElementById('dev-streak-input').value = 1;
        
        // Update Firebase if connected
        if (currentUserDoc) {
            try {
                await window.firestoreUpdateDoc(currentUserDoc, {
                    'loginData.streak': 1,
                    'loginData.claimedDays': []
                });
            } catch (error) {
                console.error('Error resetting calendar in Firebase:', error);
            }
        }
        
        console.log('🔄 DEV MODE: Calendar reset! Streak: 1, Claimed days: []');
        
        // Close rewards overview if open
        document.getElementById('rewards-overview-modal').style.display = 'none';
        
        // Show daily bonus for day 1
        showDailyBonus();
    }
}

function showDailyBonus() {
    const modal = document.getElementById('daily-bonus-modal');
    const daySpan = document.getElementById('current-day');
    const streakSpan = document.getElementById('streak-count');
    
    daySpan.textContent = currentStreak;
    streakSpan.textContent = currentStreak;
    
    // Show appropriate reward display
    const reward = dailyRewards[currentStreak] || { type: 'boosts', amount: 5 };
    displayReward(reward);
    
    modal.style.display = 'flex';
    
    // Create floating particles
    const particlesContainer = modal.querySelector('.particles-container');
    particlesContainer.innerHTML = ''; // Clear existing particles

    // Create 50 particles
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size between 2-6px
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random horizontal position
        particle.style.left = Math.random() * 100 + '%';
        
// Random animation duration between 3-6s (FASTER)
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        
        // Random delay
        particle.style.animationDelay = Math.random() * 10 + 's';
        
        particlesContainer.appendChild(particle);
    }
}

function displayReward(reward) {
    // Hide all reward displays
    document.getElementById('reward-regular').style.display = 'none';
    document.getElementById('mystery-box').style.display = 'none';
    document.getElementById('special-reward').style.display = 'none';
    
    if (reward.type === 'boosts') {
        document.getElementById('reward-regular').style.display = 'block';
        document.getElementById('boost-number').textContent = reward.amount;
    } else if (reward.type === 'mystery') {
        document.getElementById('mystery-box').style.display = 'block';
        // Store mystery box range for later
        window.currentMysteryBox = reward;
    } else if (reward.type === 'special') {
        document.getElementById('special-reward').style.display = 'block';
    }
}

function claimDailyBonus() {
    const reward = dailyRewards[currentStreak] || { type: 'boosts', amount: 5 };
    
    if (reward.type === 'mystery' && window.currentMysteryBox) {
        // Start spinning animation
        const spinner = document.getElementById('box-spinner');
        spinner.classList.add('spinning');
        
        // Calculate random amount
        const min = window.currentMysteryBox.min;
        const max = window.currentMysteryBox.max;
        const amount = Math.floor(Math.random() * (max - min + 1)) + min;
        
        // After spin animation, show result
setTimeout(() => {
    spinner.classList.remove('spinning');
    document.getElementById('mystery-box').style.display = 'none';
    document.getElementById('reward-regular').style.display = 'block';
    document.getElementById('boost-number').textContent = amount;
    
    // Store mystery box amount for Firebase
    window.lastMysteryAmount = amount;
    
    // Give the reward after showing
    setTimeout(() => {
        userBoosts += amount;
        finishClaim();
    }, 1000);
}, 2000);
    } else if (reward.type === 'special') {
        userBoosts += reward.boosts;
        hasUnlimitedBoosts = true;
        // Set expiry for 7 days
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);
        localStorage.setItem('liteExpiry', expiryDate.toISOString());
        finishClaim();
    } else {
        userBoosts += reward.amount;
        finishClaim();
    }
}

async function finishClaim() {
    claimedDays.push(currentStreak);
    
    // Update Firebase
    if (currentUserDoc) {
        try {
// Calculate total earned (including current claim)
let totalEarned = 0;
const previousData = await window.firestoreGetDoc(currentUserDoc);
if (previousData.exists()) {
    totalEarned = previousData.data().loginData?.totalEarned || 0;
}

// Add current reward
const currentReward = dailyRewards[currentStreak];
if (currentReward.type === 'boosts') {
    totalEarned += currentReward.amount;
} else if (currentReward.type === 'special') {
    totalEarned += currentReward.boosts;
} else if (currentReward.type === 'mystery' && window.lastMysteryAmount) {
    totalEarned += window.lastMysteryAmount;
    window.lastMysteryAmount = null; // Clear it
}
            
            await window.firestoreUpdateDoc(currentUserDoc, {
                boosts: userBoosts,
                hasUnlimitedBoosts: hasUnlimitedBoosts,
                'loginData.claimedDays': claimedDays,
                'loginData.totalEarned': totalEarned
            });
            
            // If special reward (day 30), set expiry
            if (hasUnlimitedBoosts) {
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 7);
                await window.firestoreUpdateDoc(currentUserDoc, {
                    unlimitedBoostsExpiry: expiryDate
                });
            }
        } catch (error) {
            console.error('Error updating claim data:', error);
        }
    }
    
    updateBoostDisplay();
    updateStreakDisplay();
    document.getElementById('daily-bonus-modal').style.display = 'none';
    
    // Show success modal
    const currentReward = dailyRewards[currentStreak];
    let boostAmount = 0;

    if (currentReward.type === 'boosts') {
        boostAmount = currentReward.amount;
    } else if (currentReward.type === 'special') {
        boostAmount = currentReward.boosts;
    } else if (currentReward.type === 'mystery' && window.lastMysteryAmount) {
        boostAmount = window.lastMysteryAmount;
    }

    if (boostAmount > 0) {
        document.getElementById('success-boost-amount').textContent = boostAmount;
        document.getElementById('boost-success-modal').style.display = 'flex';
        
        // Auto-hide after 2 seconds
        setTimeout(() => {
            document.getElementById('boost-success-modal').style.display = 'none';
        }, 2000);
    }
}

// Countdown timer for next reward
function startRewardCountdown() {
    function updateCountdown() {
        const now = new Date();
        
        // Get current time in SAST (UTC+2)
        const sastOffset = 2 * 60; // 2 hours in minutes
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
        const sastTime = new Date(utcTime + (sastOffset * 60000));
        
        // Calculate midnight SAST
        const midnight = new Date(sastTime);
        midnight.setHours(24, 0, 0, 0);
        
        // Calculate time difference
        const diff = midnight - sastTime;
        
        if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            const display = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            const countdownEl = document.getElementById('next-reward-countdown');
            if (countdownEl) {
                countdownEl.textContent = display;
            }
        }
    }
    
    // Update immediately
    updateCountdown();
    
    // Update every second
    return setInterval(updateCountdown, 1000);
}

// Rewards Overview Functions
async function showRewardsOverview() {
    const modal = document.getElementById('rewards-overview-modal');
    const calendar = document.getElementById('rewards-calendar');
    
    // Clear calendar
    calendar.innerHTML = '';
    
    // Generate all 30 days
    for (let day = 1; day <= 30; day++) {
        const dayEl = createDayElement(day);
        calendar.appendChild(dayEl);
    }
    
    // Start countdown timer
    if (rewardCountdownInterval) {
        clearInterval(rewardCountdownInterval);
    }
    rewardCountdownInterval = startRewardCountdown();
    
    modal.style.display = 'flex';
}

function createDayElement(day) {
    const reward = dailyRewards[day];
    const div = document.createElement('div');
    div.className = 'reward-day';
    
    // Add status classes
    if (claimedDays.includes(day)) {
        div.classList.add('claimed');
    } else if (day === currentStreak) {
        div.classList.add('current');
    }
    
    // Add milestone class for week ends
    if ([7, 14, 21, 28, 30].includes(day)) {
        div.classList.add('milestone');
    }
    
    // Create content
    let rewardDisplay = '';
    let typeDisplay = '';
    
if (reward.type === 'boosts') {
        let brainFilter = '';
        if (claimedDays.includes(day)) {
            // Green for claimed days
            brainFilter = 'brightness(0) saturate(100%) invert(68%) sepia(99%) saturate(1404%) hue-rotate(86deg) brightness(123%) contrast(129%)';
        } else if (day > currentStreak) {
            // Pink for future days
            brainFilter = 'brightness(0) saturate(100%) invert(72%) sepia(51%) saturate(3460%) hue-rotate(295deg) brightness(101%) contrast(101%)';
        } else {
            // White for current/unclaimed past days
            brainFilter = 'invert(1)';
        }
        rewardDisplay = `<img src="/brain-icon.svg" width="24" height="24" alt="Brain" style="filter: ${brainFilter};">`;
        typeDisplay = reward.amount + ' Boosts';
    } else if (reward.type === 'mystery') {
        rewardDisplay = '<span class="mystery-icon">🎁</span>';
        typeDisplay = `${reward.min}-${reward.max}`;
    } else if (reward.type === 'special') {
        rewardDisplay = '🏆';
        typeDisplay = 'SPECIAL';
    }
    
    div.innerHTML = `
        <span class="day-number">Day ${day}</span>
        <span class="day-reward">${rewardDisplay}</span>
        <span class="day-type">${typeDisplay}</span>
    `;
    
    // Add click handler to show details
    div.addEventListener('click', () => showDayDetails(day));
    
    return div;
}

function showDayDetails(day) {
    const reward = dailyRewards[day];
    let message = `Day ${day}: `;
    
    if (reward.type === 'boosts') {
        message += `${reward.amount} boosts`;
    } else if (reward.type === 'mystery') {
        message += `Mystery Box (${reward.min}-${reward.max} boosts)`;
    } else if (reward.type === 'special') {
        message += `${reward.boosts} boosts + 1 Week LITE Tier!`;
    }
    
    if ([7, 14, 21, 28].includes(day)) {
        message += ' ⭐ Week Complete!';
    } else if (day === 30) {
        message += ' 🏆 Login Champion!';
    }
    
    console.log(message); // You could show a tooltip instead
}

function closeRewardsOverview() {
    document.getElementById('rewards-overview-modal').style.display = 'none';
    // Clear countdown timer
    if (rewardCountdownInterval) {
        clearInterval(rewardCountdownInterval);
        rewardCountdownInterval = null;
    }
}

// Add click handler for streak display
document.addEventListener('DOMContentLoaded', function() {
    const streakDisplay = document.getElementById('streak-display');
    if (streakDisplay) {
        streakDisplay.addEventListener('click', function() {
            showRewardsOverview();
        });
    }
});

function useBoost(context) {
    // Check if user has boosts
    if (!hasUnlimitedBoosts && userBoosts <= 0) {
        showNoBoostsModal();
        return false;
    }
    
// Deduct boost if not unlimited
if (!hasUnlimitedBoosts) {
    userBoosts--;
    updateBoostDisplay();
    // Update Firebase
    updateUserBoosts(userBoosts);
}
    return true;
}

// Function for quiz boost
function showQuizBoost() {
    if (!useBoost('quiz')) return;
    
    const boostBox = document.getElementById('quiz-boost-box');
    boostBox.classList.add('show');
    boostBox.innerHTML = `
        <div class="boost-content">
            <strong>PaperBrain Explanation:</strong> Extra info coming soon
        </div>
    `;
}

// Function for past paper boost (called from past paper JS files)
function usePaperbrainBoost(questionId) {
    console.log('Boost clicked for question:', questionId); // Debug log
    
    if (!useBoost('pastpaper')) return;
    
    const boostBox = document.getElementById(`boost-${questionId}`);
    console.log('Boost box found:', boostBox); // Debug log
    
    if (boostBox) {
        // Show the boost box
        boostBox.style.display = 'block';
        
        // Add a show animation
        boostBox.style.opacity = '0';
        boostBox.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            boostBox.style.transition = 'all 0.4s ease';
            boostBox.style.opacity = '1';
            boostBox.style.transform = 'translateY(0)';
        }, 10);
        
        // IMPORTANT BOOST FEATURE
        
    } else {
        console.error('Boost box not found for question:', questionId);
    }
}

// Offline handling
window.addEventListener('online', function() {
    console.log('Back online - syncing with Firebase');
    // Could add sync logic here if needed
});

window.addEventListener('offline', function() {
    console.log('Gone offline - using cached data');
});

// Handle Firebase errors gracefully
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ', msg, '\nURL: ', url, '\nLine: ', lineNo);
    // Don't break the app if Firebase fails
    return false;
};

// Initialize boost display on page load
document.addEventListener('DOMContentLoaded', function() {
    updateBoostDisplay();
    showDevPanel(); // Show dev panel if in dev mode
});
