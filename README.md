# Application Modernization Test Automation Framework

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/downloads/)
[![Playwright](https://img.shields.io/badge/Playwright-1.40.0-green.svg)](https://playwright.dev/)
[![pytest](https://img.shields.io/badge/pytest-7.4.3-orange.svg)](https://pytest.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive end-to-end test automation framework built with Playwright and Python for testing application modernization workflows including document generation, epic & stories creation, and technical specification generation.

## Table of Contents
- [About](#about)
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Contributing](#contributing)
- [License](#license)

## About

### Overview
This framework provides robust testing capabilities for an application modernization platform that helps organizations analyze, design, and modernize their legacy applications. Built using the Page Object Model (POM) design pattern with Behavior Driven Development (BDD) approach, it ensures comprehensive coverage of critical business workflows.

### Architecture
The framework follows a modular architecture with clear separation of concerns:


### Technology Stack
- **Python 3.8+** - Core programming language
- **Playwright** - Cross-browser automation framework
- **pytest** - Testing framework with extensive plugin ecosystem
- **pytest-bdd** - Behavior Driven Development support
- **Allure** - Advanced test reporting and analytics
- **Gherkin** - Business-readable test specifications

### Key Design Principles
- **Page Object Model**: Encapsulates page interactions for maintainability
- **BDD Approach**: Business-readable test scenarios using Gherkin syntax
- **Modular Design**: Reusable components and utilities
- **Environment Agnostic**: Configurable for multiple test environments
- **Comprehensive Reporting**: Detailed test analytics with Allure integration

## Installation

### Prerequisites
Ensure you have the following installed on your system:
- **Python 3.8 or higher** ([Download Python](https://www.python.org/downloads/))
- **Node.js 16+** (required for Playwright browser installation)
- **Git** for version control

### Step-by-Step Setup

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd application-modernization-automation_v2


# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate


pip install -r requirements.txt

# Install all browsers (Chromium, Firefox, WebKit)
playwright install

# Or install specific browser
playwright install chromium


# configs/environments/dev.py
BASE_URL = "https://dev.app-modernization.com"
TIMEOUT = 30000
HEADLESS = True


# Run a simple test to verify setup
pytest tests/features/app_modern/app_modern_flows.feature::test_application_discovery --headed


# Run all tests
pytest tests/

# Run specific feature file
pytest tests/features/app_modern/app_modern_flows.feature

# Run specific scenario
pytest tests/features/app_modern/app_modern_flows.feature -k "SpecDesign Generation"



# Run priority 1 tests
pytest -m "p1_flow"

# Run smoke tests
pytest -m "smoke"

# Run regression suite
pytest -m "regression"

# Combine tags
pytest -m "p1_flow and not slow"


# Run in specific browser
pytest --browser=chromium  # Options: chromium, firefox, webkit

# Run in headed mode (visible browser)
pytest --headed

# Run with specific environment
pytest --env=staging

# Run with custom timeout
pytest --timeout=60000



# Run tests in parallel (requires pytest-xdist)
pytest -n auto  # Auto-detect CPU cores
pytest -n 4     # Use 4 parallel workers



# Generate and serve Allure report
pytest --alluredir=reports/allure-results
allure serve reports/allure-results

# Generate static Allure report
allure generate reports/allure-results -o reports/allure-report --clean



# Run with debug output
pytest -s -v tests/features/app_modern/app_modern_flows.feature

# Run with Playwright debug mode
PWDEBUG=1 pytest tests/features/app_modern/app_modern_flows.feature

# Enable screenshot capture on failure
pytest --screenshot=on

# Enable video recording
pytest --video=on

2. Set Up Development Environment

# Create development branch
git checkout -b feature/your-feature-name

# Install development dependencies
pip install -r requirements-dev.txt

# Install pre-commit hooks
pre-commit install


MIT License

Copyright (c) 2024 Application Modernization Test Framework Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.




## Dependencies File

```text::requirements.txt::requirements.txt
# Core testing framework
playwright==1.40.0
pytest==7.4.3
pytest-playwright==0.4.3
pytest-bdd==7.0.0

# Reporting and documentation
allure-pytest==2.13.2
pytest-html==4.1.1

# Utilities and data handling
python-dotenv==1.0.0
pydantic==2.5.0
requests==2.31.0
jsonschema==4.20.0
faker==20.1.0

# Development dependencies (optional)
black==23.11.0
flake8==6.1.0
mypy==1.7.0
pytest-cov==4.1.0
pytest-mock==3.12.0
pre-commit==3.5.0


# 1. Add `__pycache__/` to `.gitignore`

In your project root, create or edit the file:

**.gitignore**
pycache/
*.pyc
*.pyo


Save the file.  
Git will stop tracking these files in future commits.

---

### 2. Remove already-tracked `__pycache__` from Git

If Git already tracked them, simply ignoring doesn't remove them. Run:

```sh
git rm -r --cached __pycache__
git rm -r --cached *.pyc

git commit -m "Remove pycache files and update .gitignore"