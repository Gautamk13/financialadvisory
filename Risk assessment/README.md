# Objective Risk Assessment Model

A fully objective, rule-based risk assessment engine that classifies investors into risk categories using measurable financial and behavioral inputs. RIA compliant, deterministic, and auditable.

## Features

- **Deterministic Calculations**: Same input → same output
- **MCQ-Based Interface**: No typing required, all answers via multiple choice
- **Record Keeping**: All assessments stored in SQLite database
- **Override Rules**: Automatic risk bucket adjustments based on hard constraints
- **Asset Allocation Guidance**: Equity, Debt, and Gold/Alternatives ranges

## Installation

1. Install Node.js (v14 or higher)

2. Install dependencies:
```bash
npm install
```

## Running the Application

Start the server:
```bash
npm start
```

The application will be available at: `http://localhost:3000`

## Usage

1. Enter personal information (Name, Phone, Email)
2. Answer 12 multiple-choice questions covering:
   - Risk Capacity (8 questions)
   - Risk Behaviour (4 questions)
3. View your risk assessment results including:
   - Risk Capacity Score (1-10)
   - Risk Behaviour Score (1-10)
   - Final Risk Score (1-10)
   - Risk Bucket classification
   - Recommended asset allocation ranges

## Database

All assessments are stored in `risk_assessments.db` (SQLite database). The database includes:
- Personal information
- All raw inputs
- Calculated scores
- Final risk bucket and allocations
- Override warnings

## API Endpoints

- `POST /api/assess` - Submit assessment and get results
- `GET /api/assessments` - Retrieve all stored assessments

## Model Specifications

See the technical specification document for complete details on:
- Risk Capacity calculation (40% Income, 30% Liability, 30% Horizon)
- Risk Behaviour calculation (equal weighted)
- Final Score = MIN(Risk Capacity, Risk Behaviour)
- Risk Bucket classification
- Asset Allocation ranges
- Override rules


