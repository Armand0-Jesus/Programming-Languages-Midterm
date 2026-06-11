"""Python GPA module executed in browser via PyScript."""

# pyright: reportMissingImports=false

try:
    from pyscript import document, when
except ImportError:
    document = None

    def when(*_args, **_kwargs):
        def decorator(func):
            return func

        return decorator


MAX_CLASSES = 8

LETTER_GRADE_POINTS = {
    "A": 4.0,
    "B": 3.0,
    "C": 2.0,
    "D": 1.0,
    "F": 0.0,
}


def percentage_to_grade_points(score):
    if score >= 90:
        return 4.0
    if score >= 80:
        return 3.0
    if score >= 70:
        return 2.0
    if score >= 60:
        return 1.0
    return 0.0


def calculate_credit_gpa(grades_with_credits):
    total_credits = sum(credits for _, credits in grades_with_credits)
    if total_credits <= 0:
        raise ValueError("La suma de creditos debe ser mayor que 0.")

    weighted_sum = sum(grade_points * credits for grade_points, credits in grades_with_credits)
    return weighted_sum / total_credits


def get_document():
    if document is None:
        raise RuntimeError("PyScript document no esta disponible.")
    return document


def parse_grade_points(raw_text, field_name):
    text = (raw_text or "").strip()
    if text == "":
        raise ValueError(f"Falta valor en {field_name}.")

    letter = text.upper()
    if letter in LETTER_GRADE_POINTS:
        return LETTER_GRADE_POINTS[letter]

    try:
        score = float(text)
    except ValueError as exc:
        raise ValueError(f"{field_name} debe ser A, B, C, D, F o numerica.") from exc

    if not 0 <= score <= 100:
        raise ValueError(f"{field_name} debe estar entre 0 y 100 si es numerica.")

    return percentage_to_grade_points(score)


def parse_credits(raw_text, field_name):
    text = (raw_text or "").strip()
    if text == "":
        raise ValueError(f"Falta valor en {field_name}.")

    try:
        credits = int(text)
    except ValueError as exc:
        raise ValueError(f"{field_name} debe ser un entero positivo.") from exc

    if credits <= 0:
        raise ValueError(f"{field_name} debe ser mayor que 0.")

    return credits


def collect_grade_rows():
    doc = get_document()
    rows = []

    for idx in range(1, MAX_CLASSES + 1):
        grade_text = doc.querySelector(f"#gpa-grade-{idx}").value
        credits_text = doc.querySelector(f"#gpa-credits-{idx}").value

        if grade_text.strip() == "" and credits_text.strip() == "":
            continue

        grade_points = parse_grade_points(grade_text, f"Nota {idx}")
        credits = parse_credits(credits_text, f"Creditos {idx}")

        rows.append((grade_points, credits))

    if not rows:
        raise ValueError("Ingresa al menos una clase con nota y creditos.")

    return rows


def show_gpa_message(message, is_error=False):
    result = get_document().querySelector("#gpa-result")
    result.textContent = message
    result.classList.toggle("is-error", is_error)


@when("click", "#gpa-calc-btn")
def on_calculate_click(_event):
    try:
        rows = collect_grade_rows()
        gpa = calculate_credit_gpa(rows)
        show_gpa_message(f"GPA final: {gpa:.2f} / 4.00")
    except (ValueError, RuntimeError) as error:
        show_gpa_message(f"Error: {error}", is_error=True)
