"""Python converter module executed in browser via PyScript."""

# pyright: reportMissingImports=false

try:
    from pyscript import document, when
except ImportError:
    document = None

    def when(*_args, **_kwargs):
        def decorator(func):
            return func

        return decorator


def celsius_to_fahrenheit(celsius):
    return (celsius * 9 / 5) + 32


def kilograms_to_pounds(kilograms):
    return kilograms / 0.45359237


def meters_to_feet_inches(meters):
    total_feet = meters / 0.3048
    feet = int(total_feet)
    inches = round((total_feet - feet) * 12)
    return f"{feet}.{inches:02d}"


def liters_to_gallons(liters):
    return liters / 3.785411784


def get_document():
    if document is None:
        raise RuntimeError("PyScript document is not available.")
    return document


def parse_input_value():
    raw_value = (get_document().querySelector("#converter-input").value or "").strip()
    if raw_value == "":
        raise ValueError("Enter a value to convert.")

    try:
        return float(raw_value)
    except ValueError as exc:
        raise ValueError("The input value must be numeric.") from exc


def convert_selected_value(converter_type, value):
    if converter_type == "celsius_to_fahrenheit":
        result = celsius_to_fahrenheit(value)
        return f"{value:.2f} C is {result:.2f} F."

    if converter_type == "kilograms_to_pounds":
        result = kilograms_to_pounds(value)
        return f"{value:.2f} kg is {result:.2f} pounds."

    if converter_type == "meters_to_feet_inches":
        result = meters_to_feet_inches(value)
        return f"{value:.2f} meters is {result} feet."

    if converter_type == "liters_to_gallons":
        result = liters_to_gallons(value)
        return f"{value:.2f} liters is {result:.2f} gallons."

    raise ValueError("Unsupported conversion type.")


def show_converter_message(message, is_error=False):
    result = get_document().querySelector("#converter-result")
    result.textContent = message
    result.classList.toggle("is-error", is_error)


@when("click", "#converter-run-btn")
def on_convert_click(_event):
    try:
        converter_type = get_document().querySelector("#converter-type").value
        value = parse_input_value()
        message = convert_selected_value(converter_type, value)
        show_converter_message(message)
    except (ValueError, RuntimeError) as error:
        show_converter_message(f"Error: {error}", is_error=True)
