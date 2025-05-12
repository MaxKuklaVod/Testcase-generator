import PyPDF2
import pdfplumber
import re
import json
from typing import List, Dict, Optional


# --- PDF Processing ---
def extract_text_from_pdf_pypdf2(file_stream) -> Optional[str]:
    """Извлекает текст из PDF с помощью PyPDF2."""
    try:
        pdf_reader = PyPDF2.PdfReader(file_stream)
        text = ""
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text += page.extract_text()
        return text
    except Exception as e:
        print(f"Error extracting text with PyPDF2: {e}")
        return None


def extract_text_from_pdf_pdfplumber(file_stream) -> Optional[str]:
    """Извлекает текст из PDF с помощью pdfplumber."""
    try:
        text = ""
        with pdfplumber.open(file_stream) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text
    except Exception as e:
        print(f"Error extracting text with pdfplumber: {e}")
        return None


def extract_text_from_pdf(file_stream) -> Optional[str]:
    """Пытается извлечь текст из PDF, используя сначала pdfplumber, затем PyPDF2."""
    # pdfplumber обычно лучше, но может потребовать больше зависимостей (для некоторых PDF)
    # PyPDF2 более легковесный
    file_stream.seek(0)  # Важно сбросить указатель файла перед повторным чтением
    text = extract_text_from_pdf_pdfplumber(file_stream)
    if text and text.strip():
        return text

    print("pdfplumber failed or returned empty text, trying PyPDF2...")
    file_stream.seek(0)  # Сброс указателя для PyPDF2
    text = extract_text_from_pdf_pypdf2(file_stream)
    return text


# --- Gemini Response Parsing ---
DEFAULT_PROMPT_TEMPLATE = """
На основе этого текста сгенерируй тест-кейсы.
Каждый тест-кейс должен быть четко структурирован и включать:
1. Название: <Краткое и ясное название тест-кейса>
2. Шаги:
   1. <Первый шаг>
   2. <Второй шаг>
   ...
3. Ожидаемый результат: <Что должно произойти после выполнения шагов>
4. Тип: <Позитивный или Негативный>

Вот текст требований:
---
{requirements_text}
---

Пожалуйста, предоставь ответ только в виде списка тест-кейсов, без лишних вступлений или заключений.
Каждый тест-кейс должен начинаться с "1. Название:"
"""


def parse_gemini_response(text_response: str) -> List[Dict[str, str]]:
    """
    Парсит текстовый ответ от Gemini в структурированные тест-кейсы.
    Предполагается, что Gemini следует запрошенному формату.
    """
    test_cases = []
    # Разделяем ответ на отдельные тест-кейсы.
    # Ищем паттерн, который начинает каждый тест-кейс, например, "1. Название:"
    # или просто "Название:" если нумерация не строгая.
    # Используем lookahead (?=...) чтобы не потреблять разделитель
    raw_cases = re.split(r"(?=\b(?:[0-9]+\.\s*)?Название:)", text_response.strip())

    for case_text in raw_cases:
        case_text = case_text.strip()
        if not case_text:
            continue

        name = ""
        steps_str = ""
        expected_result = ""
        test_type = ""

        # Извлекаем Название
        name_match = re.search(
            r"(?:[0-9]+\.\s*)?Название:\s*(.+)", case_text, re.IGNORECASE
        )
        if name_match:
            name = name_match.group(1).strip()

        # Извлекаем Шаги


        # Извлекаем Шаги
        # Шаги могут быть многострочными и нумерованными
        steps_match = re.search(
            r'Шаги:\s*\n((?:\s*\d+\.\s*(?:(?!Ожидаемый результат:|Тип:)[\s\S])+(?:\n|$))+)',
            case_text,
            re.IGNORECASE
        )
        if steps_match:
            steps_str = steps_match.group(1).strip()
        else:  # Попробуем найти шаги без строгой нумерации
            steps_match_alt = re.search(
                r'Шаги:\s*\n([\s\S]+?)(?=\s*\n\s*(?:Ожидаемый результат:|Тип:|$))',
                case_text,
                re.IGNORECASE
            )
            if steps_match_alt:
                steps_str = steps_match_alt.group(1).strip()

        # Извлекаем Ожидаемый результат
        er_match = re.search(r"Ожидаемый результат:\s*(.+)", case_text, re.IGNORECASE)
        if er_match:
            expected_result = er_match.group(1).strip()
            # Убираем "Тип:" если он захватился
            if "Тип:" in expected_result:
                expected_result = expected_result.split("Тип:")[0].strip()

        # Извлекаем Тип
        type_match = re.search(
            r"Тип:\s*(Позитивный|Негативный)", case_text, re.IGNORECASE
        )
        if type_match:
            test_type = type_match.group(1).strip().capitalize()

        # Если какой-то из ключевых элементов не найден, но текст есть,
        # это может быть неполный тест-кейс или мусор. Проверяем наличие названия.
        if name:
            test_cases.append(
                {
                    "Название": name,
                    "Шаги": steps_str,  # Сохраняем как строку, форматирование будет на фронте
                    "Ожидаемый результат": expected_result,
                    "Тип": (
                        test_type
                        if test_type in ["Позитивный", "Негативный"]
                        else "Не определен"
                    ),
                }
            )
        elif (
            case_text and len(case_text) > 20
        ):  # Если есть какой-то текст, но не распарсился как надо
            print(f"Could not parse block: {case_text[:100]}...")

    return test_cases

# --- (Опционально) SQLite History ---
# Функции для работы с базой данных будут здесь, если решим добавить историю
# async def init_db(): ...
# async def add_history_entry(): ...
# async def get_history(): ...
