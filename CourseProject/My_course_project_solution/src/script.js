var questions = new Map();
var userAnswers = new Map();

window.onload = init;

function init() {
    fillDefaultQuestions();
}

// Вопросы по умолчанию
function fillDefaultQuestions() {
    questions.set("Какой город является столицой Беларуси?", new Map([
        ["Гомель", false],
        ["Москва", false],
        ["Киев", false],
        ["Минск", true]]));
    questions.set("Кто основал компанию Microsoft?", new Map([
        ["Гейб Ньюэлл", false],
        ["Билл Гейтс", true],
        ["Пол Аллен", true],
        ["Майк Харрингтон", false]]));
    questions.set("Что из перечисленного является частями тела?", new Map([
        ["Руки", true],
        ["Ботинки", false],
        ["Ноги", true],
        ["Носки", false]]));
    questions.set("Что из перечисленного является предметом одежды?", new Map([
        ["Майка", true],
        ["Кошелек", false],
        ["Ключи", false],
        ["Кофта", true]]));
    questions.set("Какие из перечисленных компаний являются производителями автомобилей?", new Map([
        ["Mercedes-Benz", true],
        ["PepsiCo", false],
        ["BMW AG", true],
        ["Volvo Cars", true]]));
}

// Создание и добавление пользовательского вопроса
function addQuestion() {
    var questionName = prompt("Введите текст вопроса:");
    if (questionName && questionName.trim().length !== 0) {
        var answers = getAnswers();
        if (answers === undefined) {
            return;
        }
        var rightAnswers = getRightAnswers(answers);
        if (rightAnswers && rightAnswers.size !== 0) {
            questions.set(questionName, rightAnswers);
        }
    } else {
        alert("Вы не ввели текст вопроса. Попробуйте добавить вопрос заново");
    }
}

// Получение варианта ответа при создании вопроса
function getAnswers() {
    var answers = new Set();
    for (var i = 1; i < 5; i++) {
        var answerElement = prompt("Введите текст " + i + " варианта ответа");
        if (answerElement && answerElement.trim().length !== 0) {
            answers.add(answerElement);
        } else {
            alert("Вы не ввели текст " + i + " варианта ответа. Попробуйте добавить вопрос заново");
            return;
        }
    }
    return answers;
}

// Получение правильных вариантов ответов при создании вопроса
function getRightAnswers(answers) {
    var rightAnswers = new Map();
    var numbersRightAnswer = prompt("Введите номера правильных ответов через запятую." +
        " Нумерация начинается с 1");
    if (numbersRightAnswer) {
        if (isInputAnswersCorrect(numbersRightAnswer.split(",")) === false) {
            alert("Поле может содержать только уникальные цифры 1, 2, 3, 4, разделенные запятой." +
                " Попробуйте добавить вопрос заново");
            return;
        }
        numbersRightAnswer = numbersRightAnswer.split(",");
        var i = 1;
        for (var answer of answers) {
            if (numbersRightAnswer.includes(i.toString())) {
                rightAnswers.set(answer, true);
            } else {
                rightAnswers.set(answer, false);
            }
            i++;
        }
    } else {
        alert("Вы не ввели правильные варианты ответа. Попробуйте добавить вопрос заново");
    }
    return rightAnswers;
}

// Проверка валидности данных в поле правильных ответов при создании вопроса
function isInputAnswersCorrect(answer) {
    var uniqueValues = new Set(answer);
    return /^([1-4]|[1-4],[1-4]|[1-4],[1-4],[1-4]|[1-4],[1-4],[1-4],[1-4])$/.test(answer)
        && answer.length === uniqueValues.size;
}

// Инициирование начала теста
function startTest() {
    document.getElementById('addQuestion').setAttribute("disabled", "disabled");
    document.getElementById('startTest').setAttribute("disabled", "disabled");
    document.getElementById('testBody').innerHTML = getQuestionOutput();
}

// Вывод всех вопросов и вариантов ответов для прохождения теста
function getQuestionOutput() {
    var html = "<p>";
    var questionId = 0;
    for (var [questionName, answerNames] of questions) {
        var answerId = 0;
        html += "<p><b>" + (questionId + 1) + ". " + questionName + "</b></p>";
        for (var [answer, isRight] of answerNames) {
            html += "<input type='checkbox' onchange=\"addUserAnswer(" + questionId +
                "," + answerId + ")\"/>" + answer + "<br>";
            answerId++;
        }
        questionId++;
    }
    html += "</p><p><button onclick=\"checkTest()\">Отправить</button></p>";
    return html;
}

// Добавление вариантов ответов для прохождения теста
function addUserAnswer(questionId, answerId) {
    if (userAnswers.has(questionId)) {
        var answerIds = userAnswers.get(questionId);
        if (answerIds.has(answerId)) {
            answerIds.delete(answerId);
            if (answerIds.size === 0) {
                userAnswers.delete(questionId);
            }
        } else {
            answerIds.add(answerId);
        }
    } else {
        userAnswers.set(questionId, new Set([answerId]));
    }
}

// Проверка теста
function checkTest() {
    if (userAnswers.size === questions.size) {
        var wrongAnswers = getWrongAnswers();
        printResultTest(wrongAnswers);
    } else {
        alert("Все вопросы должны иметь хотя бы один выбранный вариант ответа." +
            " Проверьте правильность заполнения");
    }
}

// Получение неправильных ответов при прохождении теста
function getWrongAnswers() {
    var wrongAnswers = new Set();
    var questionId = 0;
    for (var [questionName, answerNames] of questions) {
        var answerId = 0;
        for (var [answer, isRight] of answerNames) {
            if (isRight && !userAnswers.get(questionId).has(answerId)) {
                wrongAnswers.add((questionId + 1) + ". " + questionName);
            } else if (!isRight && userAnswers.get(questionId).has(answerId)) {
                wrongAnswers.add((questionId + 1) + ". " + questionName);
            }
            answerId++;
        }
        questionId++;
    }
    return wrongAnswers;
}

// Вывод результата тестирования
function printResultTest(wrongAnswers) {
    var result = questions.size - wrongAnswers.size;
    var resultText = "\nВаш результат " + result + " из " + questions.size;
    if (questions.size === result) {
        alert(resultText + ". Вы молодец!");
    } else {
        alert("Вы неправильно ответили на вопросы:\n" +
            ('\n ') + Array.from(wrongAnswers).join('\n ') + ('\n') + resultText);
    }
}
