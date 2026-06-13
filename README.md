# Paradigm Portal

## Table of Contents

1. [About The Project](#about-the-project)
   - [Programs](#programs)
   - [Built With](#built-with)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Project Structure](#project-structure)

## About The Project

This project is a great example of how you can build basically anything by combining multiple paradigms into a single system. The project combines imperative, logical, functional and
object-oriented programming all into a fully functioning webpage!

The main features include:

- Calculating the GPA for up to 8 classes
- Converting common metric and imperial units
- Adding, saving and deleting tasks/notes for efficient management
- Calculating task priority depending on urgency, difficulty and remaining days
- Producing study recommendations based on certain rules
- Tracking budget by monitoring expenses and incomes
- Rendering CV and downloading a configurable resume as PDF

### Programs 

These are the 7 programs and what type of paradigm was used for all of them:

- GPA Calculator (Python) - Imperative
- Metric Converter (Python) - Imperative
- Task Manager (Java) - Object-Oriented
- Priority Calculator (Java) - Object-Oriented 
- Academic Recommender (Prolog) - Logical 
- Budget Tracker (Elm) - Functional 
- CV Generator (JavaScript) - Imperative 

### Built With

![HTML](https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-20232A?style=for-the-badge&logo=javascript&logoColor=F7DF1E)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Elm](https://img.shields.io/badge/Elm-1293D8?style=for-the-badge&logo=elm&logoColor=white)
![Prolog](https://img.shields.io/badge/Prolog-74283C?style=for-the-badge)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)

Also other additional tools were used for integration like PyScript, TeaVM, Tau Prolog and html2pdf.

## Installation

Clone the repository:

```bash
git clone https://github.com/Armand0-Jesus/ParadigmPortal.git
cd ParadigmPortal
```
For utilizing the webpage and entering it by command: (NOTE: Python 3 needs to be installed)

```bash
python -m http.server 8000
```
Open `http://localhost:8000` in a browser of your choice

There are also avaible extensions that help for viewing webpages like Live Server. 

**FINAL NOTE**: Elm, Java 17 and Maven should be installed if you will work with modifying and rebuilding their respective source modules.

## Usage

Use the navigation buttons at the top of the page to move between seven programs.

- **GPA Calculator:** Enter the courses with the grade and amount of credits and get your GPA.
- **Metric Converter:** Select one of the metrics, enter a number and convert the value.
- **Task Manager:** Add tasks and remove them when they are no longer needed, or just for using them like notes.
- **Priority Calculator:** Enter information of task and receive a low, medium or high priority.
- **Academic Recommender:** Select the current academic conditions and run the rule recommending engine.
- **Budget Tracker:** Add income and expense entries for updating the balance.
- **CV Generator:** Enable or disable ntries and use Download PDF to export the visible resume.


## Project Structure

```text
.
|-- assets/
|   |-- css/                    # Shared styles for webpage
|   |-- generated/              # Compiled output for Elm and TeaVM
|   `-- js/                     # Modules for browser integration
|-- modules/
|   |-- academic_recommender/   # Prolog recommender (using Tau Prolog from JavaScript)
|   |-- budget_tracker/         # Elm budget tracker
|   |-- cv_generator/           # CV data with HTML renderer and PDF export
|   |-- gpa_calculator/         # Python GPA calculator
|   |-- metric_converter/       # Python unit converter
|   |-- priority_calculator/    # Java priority calculator
|   `-- task_manager/           # Java task manager
|-- scripts/                    # Java web build script
|-- index.html                  # Main page of application
`-- README.md
```
