### English version README.md
---

### **Project Requirements: "AI-Powered Test Case Generator (Gemini 2.5 pro)"**  

#### **1. General Description**  
Develop a **web application** using FastAPI with HTML frontend that:  
1. Accepts **text requirements (SRS)** via:  
   - Text field (`<textarea>`).  
   - Uploaded **PDF file** (with text extraction).  
2. Uses **Gemini 2.5 pro API** to generate structured test cases.  
3. Allows users to:  
   - View results in a table.  
   - Filter test cases (positive/negative scenarios).  
   - Export data to **Excel/CSV**.  

---  

### **2. Functional Requirements**  

#### **2.1. Core Functionality**  
✅ **Data Input**  
- Text input (max **5000 characters**).  
- PDF upload (using `PyPDF2`/`pdfplumber`).  
- Validation: empty input prevention.  

✅ **Test Case Generation via Gemini 2.5 pro**  
- Prompt:  
  ```  
  Generate test cases from this text in the format:  
  1. Title.  
  2. Steps (numbered list).  
  3. Expected result.  
  4. Type (Positive/Negative).  
  ```  
- Parse AI response into structured data (JSON).  

✅ **Results Display**  
- Table with columns: *Title, Steps, Result, Type*.  
- Sort by test case type.  

✅ **Data Export**  
- CSV (via `pandas.to_csv`).  
- Excel (via `openpyxl`).  

#### **2.2. Additional Features**  
🔹 **Request History** (last 5 requests in `SQLite`).  
🔹 **Editable Prompt** (custom prompt template).  

---  

### **3. Non-Functional Requirements**  

#### **3.1. Interface**  
- **Frontend**: Pure HTML + CSS (no Bootstrap).  
- **UI Elements**:  
  - Text input/file upload form.  
  - **"Generate"** button.  
  - Results table.  
  - **"Export to CSV/Excel"** buttons.  

#### **3.2. Backend (FastAPI)**  
- **Endpoints**:  
  - `POST /generate` – process text/PDF, call Gemini API.  
  - `GET /export` – export data.  
- **PDF Processing**: Text extraction with error handling (e.g., corrupt PDF).  
- **Limits**:  
  - Text: 5000 characters.  
  - Gemini response timeout: 30 sec.  

#### **3.3. Security**  
- Gemini API key in `.env` (not in code).  
- Executable file upload prevention (if extending upload functionality).  

---  

### **4. Technology Stack**  
- **Backend**: FastAPI (Python).  
- **Frontend**: HTML/CSS.  
- **AI**: Gemini 2.5 pro API.  
- **PDF**: `pdfplumber`.  
- **Export**: `pandas`, `openpyxl`.  
- **Database**: SQLite (for history, optional).  

---  

### Русская версия README.md
---

### **Требования к проекту: "Генератор тест-кейсов на основе AI (Gemini 2.5 pro)"**  

#### **1. Общее описание**  
Разработать **веб-приложение** на FastAPI с HTML-фронтендом, которое:  
1. Принимает **текстовые требования (ТЗ)** через:  
   - Текстовое поле (`<textarea>`).  
   - Загруженный **PDF-файл** (с извлечением текста).  
2. Использует **Gemini 2.5 pro API** для генерации структурированных тест-кейсов.  
3. Позволяет:  
   - Просматривать результаты в таблице.  
   - Фильтровать тест-кейсы (позитивные/негативные).  
   - Экспортировать данные в **Excel/CSV**.  

---  

### **2. Функциональные требования**  

#### **2.1. Основной функционал**  
✅ **Ввод данных**  
- Текстовый ввод (макс. **5000 символов**).  
- Загрузка PDF (поддержка `PyPDF2`/`pdfplumber`).  
- Валидация: запрет на пустой ввод.  

✅ **Генерация тест-кейсов через Gemini 2.5 pro**  
- Промпт:  
  ```  
  На основе этого текста сгенерируй тест-кейсы в формате:  
  1. Название.  
  2. Шаги (нумерованный список).  
  3. Ожидаемый результат.  
  4. Тип (Позитивный/Негативный).  
  ```  
- Парсинг ответа AI в структурированные данные (JSON).  

✅ **Отображение результатов**  
- Таблица с колонками: *Название, Шаги, Результат, Тип*.  
- Сортировка по типу тест-кейса.  

✅ **Экспорт данных**  
- CSV (через `pandas.to_csv`).  
- Excel (через `openpyxl`).  

#### **2.2. Дополнительный функционал**  
🔹 **История запросов** (последние 5 запросов в `SQLite`).  
🔹 **Редактируемый промпт** (возможность настройки шаблона запроса).  

---  

### **3. Нефункциональные требования**  

#### **3.1. Интерфейс**  
- **Frontend**: Чистый HTML + CSS (без Bootstrap).  
- **Элементы UI**:  
  - Форма ввода текста/загрузки файла.  
  - Кнопка **"Сгенерировать"**.  
  - Таблица с результатами.  
  - Кнопки **"Экспорт в CSV/Excel"**.  

#### **3.2. Backend (FastAPI)**  
- **Роуты**:  
  - `POST /generate` – обработка текста/PDF, запрос к Gemini API.  
  - `GET /export` – экспорт данных.  
- **Обработка PDF**: Извлечение текста с обработкой ошибок (например, кривой PDF).  
- **Лимиты**:  
  - Текст: 5000 символов.  
  - Время ответа Gemini: таймаут 30 сек.  

#### **3.3. Безопасность**  
- Ключ Gemini в `.env` (не в коде).  
- Запрет на исполняемые файлы (если расширить функционал загрузки).  

---  

### **4. Технологический стек**  
- **Backend**: FastAPI (Python).  
- **Frontend**: HTML/CSS.  
- **AI**: Gemini 2.5 pro API.  
- **PDF**: `pdfplumber`.  
- **Экспорт**: `pandas`, `openpyxl`.  
- **База**: SQLite (для истории, опционально).  

---  
