const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
// Serve main website files (for discovery form)
app.use(express.static(path.join(__dirname, '..')));

// Initialize Database
const db = new sqlite3.Database('./risk_assessments.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

function initializeDatabase() {
    // Create clients table for discovery form + risk assessment data
    db.run(`
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            service TEXT,
            risk_capacity REAL,
            risk_behaviour REAL,
            final_score REAL,
            risk_bucket TEXT,
            equity_allocation TEXT,
            debt_allocation TEXT,
            alternatives_allocation TEXT,
            overrides TEXT,
            assessment_answers TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating clients table:', err.message);
        } else {
            console.log('Clients table initialized');
        }
    });

    // Keep old assessments table for backward compatibility
    db.run(`
        CREATE TABLE IF NOT EXISTS assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            risk_capacity REAL,
            risk_behaviour REAL,
            final_score REAL,
            risk_bucket TEXT,
            equity_allocation TEXT,
            debt_allocation TEXT,
            alternatives_allocation TEXT,
            overrides TEXT,
            raw_inputs TEXT
        )
    `, (err) => {
        if (err) {
            console.error('Error creating assessments table:', err.message);
        } else {
            console.log('Database initialized');
        }
    });
}

// Risk Calculation Engine
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

// API Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Discovery form submission
app.post('/api/discovery', (req, res) => {
    try {
        const { name, age, phone, email, service } = req.body;

        if (!name || !age || !phone || !email || !service) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Insert or update client record
        db.run(
            `INSERT INTO clients (name, age, phone, email, service)
             VALUES (?, ?, ?, ?, ?)`,
            [name, age, phone, email, service],
            function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to save discovery form' });
                }

                res.json({
                    success: true,
                    clientId: this.lastID
                });
            }
        );
    } catch (error) {
        console.error('Discovery form error:', error);
        res.status(500).json({ error: 'Failed to process discovery form' });
    }
});

// Update client with risk assessment results
app.post('/api/assess', (req, res) => {
    try {
        const { personalInfo, answers } = req.body;

        // Validate inputs
        if (!personalInfo || !answers) {
            return res.status(400).json({ error: 'Missing required data' });
        }

        if (!personalInfo.name || !personalInfo.phone || !personalInfo.email) {
            return res.status(400).json({ error: 'Missing personal information' });
        }

        // Calculate risk assessment
        const engine = new RiskAssessmentEngine();
        const result = engine.calculate(answers);

        // Try to find existing client by email
        db.get(
            `SELECT id FROM clients WHERE email = ?`,
            [personalInfo.email],
            (err, row) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }

                if (row) {
                    // Update existing client with risk assessment
                    db.run(
                        `UPDATE clients SET
                            risk_capacity = ?,
                            risk_behaviour = ?,
                            final_score = ?,
                            risk_bucket = ?,
                            equity_allocation = ?,
                            debt_allocation = ?,
                            alternatives_allocation = ?,
                            overrides = ?,
                            assessment_answers = ?,
                            updated_at = CURRENT_TIMESTAMP
                         WHERE id = ?`,
                        [
                            result.riskCapacity,
                            result.riskBehaviour,
                            result.finalScore,
                            result.riskBucket,
                            result.allocation.equity,
                            result.allocation.debt,
                            result.allocation.alternatives,
                            JSON.stringify(result.overrides),
                            JSON.stringify(answers),
                            row.id
                        ],
                        function(updateErr) {
                            if (updateErr) {
                                console.error('Update error:', updateErr);
                                return res.status(500).json({ error: 'Failed to update client' });
                            }

                            res.json({
                                ...result,
                                clientId: row.id
                            });
                        }
                    );
                } else {
                    // Create new client record
                    db.run(
                        `INSERT INTO clients (
                            name, phone, email, risk_capacity, risk_behaviour, final_score,
                            risk_bucket, equity_allocation, debt_allocation, alternatives_allocation,
                            overrides, assessment_answers
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            personalInfo.name,
                            personalInfo.phone,
                            personalInfo.email,
                            result.riskCapacity,
                            result.riskBehaviour,
                            result.finalScore,
                            result.riskBucket,
                            result.allocation.equity,
                            result.allocation.debt,
                            result.allocation.alternatives,
                            JSON.stringify(result.overrides),
                            JSON.stringify(answers)
                        ],
                        function(insertErr) {
                            if (insertErr) {
                                console.error('Insert error:', insertErr);
                                return res.status(500).json({ error: 'Failed to save client' });
                            }

                            res.json({
                                ...result,
                                clientId: this.lastID
                            });
                        }
                    );
                }
            }
        );
    } catch (error) {
        console.error('Assessment error:', error);
        res.status(500).json({ error: 'Assessment calculation failed' });
    }
});

// Get all clients (admin view)
app.get('/api/clients', (req, res) => {
    db.all(
        `SELECT * FROM clients ORDER BY created_at DESC`,
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch clients' });
            }
            res.json(rows);
        }
    );
});

app.post('/api/assess', (req, res) => {
    try {
        const { personalInfo, answers } = req.body;

        // Validate inputs
        if (!personalInfo || !answers) {
            return res.status(400).json({ error: 'Missing required data' });
        }

        if (!personalInfo.name || !personalInfo.phone || !personalInfo.email) {
            return res.status(400).json({ error: 'Missing personal information' });
        }

        // Calculate risk assessment
        const engine = new RiskAssessmentEngine();
        const result = engine.calculate(answers);

        // Store in database
        db.run(
            `INSERT INTO assessments (
                name, phone, email, risk_capacity, risk_behaviour, final_score,
                risk_bucket, equity_allocation, debt_allocation, alternatives_allocation,
                overrides, raw_inputs
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                personalInfo.name,
                personalInfo.phone,
                personalInfo.email,
                result.riskCapacity,
                result.riskBehaviour,
                result.finalScore,
                result.riskBucket,
                result.allocation.equity,
                result.allocation.debt,
                result.allocation.alternatives,
                JSON.stringify(result.overrides),
                JSON.stringify({ personalInfo, answers })
            ],
            function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to save assessment' });
                }

                // Return result with assessment ID
                res.json({
                    ...result,
                    assessmentId: this.lastID
                });
            }
        );
    } catch (error) {
        console.error('Assessment error:', error);
        res.status(500).json({ error: 'Assessment calculation failed' });
    }
});

app.get('/api/assessments', (req, res) => {
    db.all('SELECT * FROM assessments ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch assessments' });
        }
        res.json(rows);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Risk Assessment Server running on http://localhost:${PORT}`);
});


