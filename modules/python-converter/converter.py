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


def fahrenheit_to_celsius(fahrenheit):
    return (fahrenheit - 32) * 5 / 9


def pounds_to_kilograms(pounds):
    return pounds * 0.45359237


def feet_to_meters(feet):
    return feet * 0.3048


def gallons_to_liters(gallons):
    return gallons * 3.785411784


def get_document():
    if document is None:
        raise RuntimeError("PyScript document no esta disponible.")
    return document


def parse_input_value():
    raw_value = (get_document().querySelector("#converter-input").value or "").strip()
    if raw_value == "":
        raise ValueError("Ingresa un valor para convertir.")

    try:
        return float(raw_value)
    except ValueError as exc:
        raise ValueError("El valor de entrada debe ser numerico.") from exc


def convert_selected_value(converter_type, value):
    if converter_type == "fahrenheit_to_celsius":
        result = fahrenheit_to_celsius(value)
        return f"{value:.2f} F son {result:.2f} C."

    if converter_type == "pounds_to_kilograms":
        result = pounds_to_kilograms(value)
        return f"{value:.2f} libras son {result:.2f} kg."

    if converter_type == "feet_to_meters":
        result = feet_to_meters(value)
        return f"{value:.2f} pies son {result:.2f} metros."

    if converter_type == "gallons_to_liters":
        result = gallons_to_liters(value)
        return f"{value:.2f} galones son {result:.2f} litros."

    raise ValueError("Tipo de conversion no soportado.")


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
