// Global state
let currentQuestion = 0;
let personalInfo = {};
const totalQuestions = 12;

// Google Sheets Script URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxUkV_UN7MdOd-ArKdpnVuiQIHfNmAryzNUuKWcYA1WpGnVzKURrBCSANhpfx3-bqovIA/exec';

// Function to save risk assessment results to Google Sheets
async function saveAssessmentToGoogleSheets(result, answers) {
    if (!GOOGLE_SCRIPT_URL) {
        console.warn('Google Script URL not configured. Skipping save to sheets.');
        return;
    }

    try {
        // Get discovery form data if available
        const discoveryDataStr = sessionStorage.getItem('discoveryFormData');
        const discoveryData = discoveryDataStr ? JSON.parse(discoveryDataStr) : {};
        
        // Ensure we capture the checkbox value correctly
        const sendCopyValue = personalInfo.sendCopy === true || personalInfo.sendCopy === 'true';
        
        console.log('=== Sending Assessment Data ===');
        console.log('sendCopy checkbox value:', sendCopyValue);
        console.log('personalInfo.sendCopy:', personalInfo.sendCopy);
        console.log('Email:', discoveryData.email || personalInfo.email || '');
        
        const dataToSave = {
            name: discoveryData.name || personalInfo.name || '',
            age: discoveryData.age || '',
            email: discoveryData.email || personalInfo.email || '',
            phone: discoveryData.phone || personalInfo.phone || '',
            service: discoveryData.service || '',
            riskCapacity: result.riskCapacity,
            riskBehaviour: result.riskBehaviour,
            riskScore: result.finalScore,
            riskBucket: result.riskBucket,
            equityAllocation: result.allocation.equity,
            debtAllocation: result.allocation.debt,
            alternativesAllocation: result.allocation.alternatives,
            sendCopy: sendCopyValue, // Explicitly convert to boolean
            answers: answers || {},
            type: 'assessment',
            timestamp: new Date().toISOString()
        };
        
        console.log('Data being sent:', {
            email: dataToSave.email,
            sendCopy: dataToSave.sendCopy,
            hasAnswers: !!dataToSave.answers,
            answerKeys: Object.keys(dataToSave.answers || {})
        });

        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSave),
            mode: 'no-cors'
        });
        
        console.log('Risk assessment saved to Google Sheets');
    } catch (error) {
        console.error('Error saving assessment to Google Sheets:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializePersonalInfoForm();
    initializeAssessmentForm();
});

// Personal Info Form Handler
function initializePersonalInfoForm() {
    const form = document.getElementById('personalInfoForm');
    
    // Check if we have discovery form data from sessionStorage
    const discoveryData = sessionStorage.getItem('discoveryFormData');
    if (discoveryData) {
        try {
            const data = JSON.parse(discoveryData);
            // Pre-fill the form with discovery data
            document.getElementById('name').value = data.name || '';
            document.getElementById('phone').value = data.phone || '';
            document.getElementById('email').value = data.email || '';
            
            // Store for later use (but keep form visible so user can check the box)
            personalInfo = {
                name: data.name,
                phone: data.phone,
                email: data.email,
                sendCopy: false // Will be updated when form is submitted
            };
            
            // DON'T auto-submit - let user see the form and check the box if they want
            // The form will be visible and user can check the checkbox before proceeding
        } catch (e) {
            console.error('Error parsing discovery data:', e);
        }
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        personalInfo = {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            sendCopy: document.getElementById('sendCopy').checked
        };

        // Switch to assessment section
        document.getElementById('personalInfoSection').classList.remove('active');
        document.getElementById('assessmentSection').classList.add('active');
        
        // Show first question
        showQuestion(0);
    });
}

// Assessment Form Handler
function initializeAssessmentForm() {
    const form = document.getElementById('assessmentForm');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');

    nextBtn.addEventListener('click', () => {
        if (validateCurrentQuestion()) {
            if (currentQuestion < totalQuestions - 1) {
                showQuestion(currentQuestion + 1);
            }
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentQuestion > 0) {
            showQuestion(currentQuestion - 1);
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitAssessment();
    });

    // Update navigation buttons when question changes
    updateNavigationButtons();
}

function showQuestion(index) {
    // Hide all questions
    document.querySelectorAll('.question').forEach(q => {
        q.classList.remove('active');
    });

    // Show current question
    const questions = document.querySelectorAll('.question');
    if (questions[index]) {
        questions[index].classList.add('active');
        currentQuestion = index;
        updateProgress();
        updateNavigationButtons();
    }
}

function validateCurrentQuestion() {
    const activeQuestion = document.querySelector('.question.active');
    const radioInputs = activeQuestion.querySelectorAll('input[type="radio"]');
    const checked = Array.from(radioInputs).some(input => input.checked);
    
    if (!checked) {
        alert('Please select an option before proceeding.');
        return false;
    }
    return true;
}

function updateProgress() {
    const progress = ((currentQuestion + 1) / totalQuestions) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('currentQuestion').textContent = currentQuestion + 1;
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    // Show/hide previous button
    prevBtn.style.display = currentQuestion > 0 ? 'block' : 'none';

    // Show/hide next vs submit button
    if (currentQuestion === totalQuestions - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
}

// Risk Calculation Engine (Client-side)
class RiskAssessmentEngine {
    constructor() {
        // Risk Capacity Scoring Tables
        this.incomeStabilityScores = {
            'government_psu': 10,
            'large_mnc': 8,
            'stable_sme': 6,
            'startup_unstable': 4,
            'variable_freelance': 2
        };

        this.savingsRateScores = {
            'less_10': 2,
            '10_20': 5,
            '20_35': 8,
            'more_35': 10
        };

        this.emergencyFundScores = {
            'less_3': 2,
            '3_6': 5,
            '6_12': 8,
            'more_12': 10
        };

        this.dependentsScores = {
            '0': 10,
            '1': 8,
            '2': 6,
            '3_plus': 3
        };

        this.emiIncomeRatioScores = {
            'less_10': 10,
            '10_25': 7,
            '25_40': 4,
            'more_40': 2
        };

        this.jobReplaceabilityScores = {
            'less_2_months': 10,
            '3_4_months': 7,
            '6_plus_months': 3
        };

        this.investmentDurationScores = {
            'less_3': 2,
            '3_5': 5,
            '5_10': 8,
            'more_10': 10
        };

        this.goalFlexibilityScores = {
            'fixed': 3,
            'semi_flexible': 6,
            'fully_flexible': 10
        };

        // Risk Behaviour Scoring Tables
        this.budgetTrackingScores = {
            'none': 2,
            'occasional': 5,
            'strict': 10
        };

        this.investmentConsistencyScores = {
            'irregular': 3,
            'sometimes': 6,
            'consistent': 10
        };

        this.marketReactionScores = {
            'sold': 2,
            'held': 6,
            'added': 10
        };

        this.portfolioMonitoringScores = {
            'daily': 3,
            'monthly': 7,
            'periodic': 10
        };
    }

    calculateRiskCapacity(inputs) {
        // A1 - Income & Savings Strength (40%)
        const incomeStabilityScore = this.incomeStabilityScores[inputs.incomeStability] || 0;
        const savingsRateScore = this.savingsRateScores[inputs.savingsRate] || 0;
        const emergencyFundScore = this.emergencyFundScores[inputs.emergencyFund] || 0;
        const incomeScore = (incomeStabilityScore + savingsRateScore + emergencyFundScore) / 3;

        // A2 - Financial Responsibility Load (30%)
        const dependentsScore = this.dependentsScores[inputs.dependents] || 0;
        const emiRatioScore = this.emiIncomeRatioScores[inputs.emiIncomeRatio] || 0;
        const jobReplaceabilityScore = this.jobReplaceabilityScores[inputs.jobReplaceability] || 0;
        const liabilityScore = (dependentsScore + emiRatioScore + jobReplaceabilityScore) / 3;

        // A3 - Investment Horizon (30%)
        const investmentDurationScore = this.investmentDurationScores[inputs.investmentDuration] || 0;
        const goalFlexibilityScore = this.goalFlexibilityScores[inputs.goalFlexibility] || 0;
        const horizonScore = (investmentDurationScore + goalFlexibilityScore) / 2;

        // Final Risk Capacity
        const riskCapacity = (0.40 * incomeScore) + (0.30 * liabilityScore) + (0.30 * horizonScore);
        
        return {
            riskCapacity: Math.round(riskCapacity * 100) / 100,
            incomeScore: Math.round(incomeScore * 100) / 100,
            liabilityScore: Math.round(liabilityScore * 100) / 100,
            horizonScore: Math.round(horizonScore * 100) / 100,
            emergencyFundScore,
            investmentDurationScore,
            emiRatioScore
        };
    }

    calculateRiskBehaviour(inputs) {
        const budgetTrackingScore = this.budgetTrackingScores[inputs.budgetTracking] || 0;
        const investmentConsistencyScore = this.investmentConsistencyScores[inputs.investmentConsistency] || 0;
        const marketReactionScore = this.marketReactionScores[inputs.marketReaction] || 0;
        const portfolioMonitoringScore = this.portfolioMonitoringScores[inputs.portfolioMonitoring] || 0;

        const riskBehaviour = (budgetTrackingScore + investmentConsistencyScore + 
                              marketReactionScore + portfolioMonitoringScore) / 4;

        return Math.round(riskBehaviour * 100) / 100;
    }

    classifyRiskBucket(finalScore) {
        if (finalScore >= 1.0 && finalScore < 3.5) {
            return 'Risk Averse';
        } else if (finalScore >= 3.5 && finalScore < 6.0) {
            return 'Average';
        } else if (finalScore >= 6.0 && finalScore < 8.0) {
            return 'Above Average';
        } else {
            return 'High Risk Appetite';
        }
    }

    getAssetAllocation(riskBucket) {
        const allocations = {
            'Risk Averse': {
                equity: '10-30%',
                debt: '60-80%',
                alternatives: '5-10%'
            },
            'Average': {
                equity: '35-55%',
                debt: '35-55%',
                alternatives: '5-10%'
            },
            'Above Average': {
                equity: '60-75%',
                debt: '20-35%',
                alternatives: '5-10%'
            },
            'High Risk Appetite': {
                equity: '80-95%',
                debt: '5-15%',
                alternatives: '0-5%'
            }
        };
        return allocations[riskBucket] || allocations['Average'];
    }

    applyOverrides(riskBucket, finalScore, rcDetails) {
        const overrides = [];
        let adjustedBucket = riskBucket;
        let maxEquity = null;

        // Override 1: Emergency Fund < 3 months
        if (rcDetails.emergencyFundScore === 2) {
            if (adjustedBucket === 'High Risk Appetite' || adjustedBucket === 'Above Average') {
                adjustedBucket = 'Average';
                overrides.push('Emergency fund insufficient - downgraded to Average risk');
            }
        }

        // Override 2: Investment Duration < 3 years
        if (rcDetails.investmentDurationScore === 2) {
            maxEquity = 40;
            overrides.push('Short investment horizon - maximum equity capped at 40%');
        }

        // Override 3: EMI/Income Ratio > 40%
        if (rcDetails.emiRatioScore === 2) {
            const bucketOrder = ['Risk Averse', 'Average', 'Above Average', 'High Risk Appetite'];
            const currentIndex = bucketOrder.indexOf(adjustedBucket);
            if (currentIndex > 0) {
                adjustedBucket = bucketOrder[currentIndex - 1];
                overrides.push('High EMI burden - risk bucket downgraded by one level');
            }
        }

        return { adjustedBucket, maxEquity, overrides };
    }

    calculate(inputs) {
        const rcDetails = this.calculateRiskCapacity(inputs);
        const riskCapacity = rcDetails.riskCapacity;
        const riskBehaviour = this.calculateRiskBehaviour(inputs);
        
        // Final Score = MIN(RC, RB)
        const finalScore = Math.min(riskCapacity, riskBehaviour);
        const roundedFinalScore = Math.round(finalScore * 100) / 100;

        let riskBucket = this.classifyRiskBucket(roundedFinalScore);
        let allocation = this.getAssetAllocation(riskBucket);

        // Apply overrides
        const overrideResult = this.applyOverrides(riskBucket, roundedFinalScore, rcDetails);
        riskBucket = overrideResult.adjustedBucket;
        allocation = this.getAssetAllocation(riskBucket);

        // Apply max equity override if applicable
        if (overrideResult.maxEquity) {
            const equityRange = allocation.equity.split('-');
            const maxEquityValue = parseInt(equityRange[1].replace('%', ''));
            if (maxEquityValue > overrideResult.maxEquity) {
                allocation.equity = `10-${overrideResult.maxEquity}%`;
            }
        }

        return {
            riskCapacity: Math.round(riskCapacity * 100) / 100,
            riskBehaviour: Math.round(riskBehaviour * 100) / 100,
            finalScore: roundedFinalScore,
            riskBucket,
            allocation: {
                equity: allocation.equity,
                debt: allocation.debt,
                alternatives: allocation.alternatives
            },
            overrides: overrideResult.overrides
        };
    }
}

async function submitAssessment() {
    // Validate all questions
    const form = document.getElementById('assessmentForm');
    const formData = new FormData(form);
    
    const answers = {
        incomeStability: formData.get('incomeStability'),
        savingsRate: formData.get('savingsRate'),
        emergencyFund: formData.get('emergencyFund'),
        dependents: formData.get('dependents'),
        emiIncomeRatio: formData.get('emiIncomeRatio'),
        jobReplaceability: formData.get('jobReplaceability'),
        investmentDuration: formData.get('investmentDuration'),
        goalFlexibility: formData.get('goalFlexibility'),
        budgetTracking: formData.get('budgetTracking'),
        investmentConsistency: formData.get('investmentConsistency'),
        marketReaction: formData.get('marketReaction'),
        portfolioMonitoring: formData.get('portfolioMonitoring')
    };

    // Check if all answers are provided
    const missingAnswers = Object.values(answers).filter(v => !v);
    if (missingAnswers.length > 0) {
        alert('Please answer all questions before submitting.');
        return;
    }

    // Switch to results section
    document.getElementById('assessmentSection').classList.remove('active');
    document.getElementById('resultsSection').classList.add('active');
    
    // Show processing indicator
    document.getElementById('processingIndicator').style.display = 'block';
    document.getElementById('resultsContent').style.display = 'none';

    try {
        // Simulate processing delay (for UX)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Calculate results client-side
        const engine = new RiskAssessmentEngine();
        const result = engine.calculate(answers);
        
        // Save to Google Sheets
        saveAssessmentToGoogleSheets(result, answers);
        
        // Hide processing indicator
        document.getElementById('processingIndicator').style.display = 'none';
        
        // Display results
        displayResults(result);
        
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing your assessment. Please try again.');
        document.getElementById('processingIndicator').style.display = 'none';
    }
}

function displayResults(result) {
    // Update scores
    document.getElementById('riskCapacityScore').textContent = result.riskCapacity;
    document.getElementById('riskBehaviourScore').textContent = result.riskBehaviour;
    document.getElementById('finalScore').textContent = result.finalScore;
    
    // Update risk bucket
    document.getElementById('riskBucket').textContent = result.riskBucket;
    
    // Update allocations
    document.getElementById('equityAllocation').textContent = result.allocation.equity;
    document.getElementById('debtAllocation').textContent = result.allocation.debt;
    document.getElementById('alternativesAllocation').textContent = result.allocation.alternatives;
    
    // Update overrides
    const overridesSection = document.getElementById('overridesSection');
    const overridesList = document.getElementById('overridesList');
    
    if (result.overrides && result.overrides.length > 0) {
        overridesList.innerHTML = '';
        result.overrides.forEach(override => {
            const li = document.createElement('li');
            li.textContent = override;
            overridesList.appendChild(li);
        });
        overridesSection.style.display = 'block';
    } else {
        overridesSection.style.display = 'none';
    }
    
    // Show results content
    document.getElementById('resultsContent').style.display = 'block';
}

