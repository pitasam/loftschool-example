/**
 * ДЗ 7.2 - Создать редактор cookie с возможностью фильтрации
 *
 * На странице должна быть таблица со списком имеющихся cookie:
 * - имя
 * - значение
 * - удалить (при нажатии на кнопку, выбранная cookie удаляется из браузера и таблицы)
 *
 * На странице должна быть форма для добавления новой cookie:
 * - имя
 * - значение
 * - добавить (при нажатии на кнопку, в браузер и таблицу добавляется новая cookie с указанным именем и значением)
 *
 * Если добавляется cookie с именем уже существующией cookie, то ее значение в браузере и таблице должно быть обновлено
 *
 * На странице должно быть текстовое поле для фильтрации cookie
 * В таблице должны быть только те cookie, в имени или значении которых есть введенное значение
 * Если в поле фильтра пусто, то должны выводиться все доступные cookie
 * Если дабавляемая cookie не соответсвует фильтру, то она должна быть добавлена только в браузер, но не в таблицу
 * Если добавляется cookie, с именем уже существующией cookie и ее новое значение не соответствует фильтру,
 * то ее значение должно быть обновлено в браузере, а из таблицы cookie должна быть удалена
 *
 * Для более подробной информации можно изучить код тестов
 *
 * Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/**
 * homeworkContainer - это контейнер для всех ваших домашних заданий
 * Если вы создаете новые html-элементы и добавляете их на страницу, то дабавляйте их только в этот контейнер
 *
 * @example
 * homeworkContainer.appendChild(...);
 */
let homeworkContainer = document.querySelector('#homework-container');
let filterNameInput = homeworkContainer.querySelector('#filter-name-input');
let addNameInput = homeworkContainer.querySelector('#add-name-input');
let addValueInput = homeworkContainer.querySelector('#add-value-input');
let addButton = homeworkContainer.querySelector('#add-button');
let listTable = homeworkContainer.querySelector('#list-table tbody');
let objCookie = {};

//  создать куку
function createCookie(name, value) {
    document.cookie = name + '=' + value;
}

//  удалить куку
function deleteCookie(name, withoutObj = 0) {
    let d = new Date(0);

    document.cookie = name +'=; ' + 'expires=' + d;

    if (!withoutObj) {
        delete objCookie[name];
    }
}

//  разрешение ситуации с уже существующим именем куки
function checkDoubleCookie(name, value, withoutObj = 0) {
    let namesCookie = document.getElementsByClassName('nameCookie');
    let valueCookie = document.getElementsByClassName('valueCookie');

    for (let i=0; i<namesCookie.length; i++) {
        if (namesCookie[i].textContent == name) {

            valueCookie[i].textContent = value;

            if (!withoutObj) {
                objCookie[name] = value;
            }

            return true;
        }
    }

    return false;
}

//  добавление куки в таблицу
function addCookieInTable(name, value, withoutObj = 0) {
    let tr = document.createElement('tr');

    tr.innerHTML = '<td class="nameCookie">' +
        name +
        '</td><td class="valueCookie">' +
        value +
        '</td><td><button class="button">Удалить</button></td>';

    listTable.appendChild(tr);
    if (!withoutObj) {
        objCookie[name] = value;
    }
}

//
//  вспомогательные функции

//  проверка наличия подстроки в строке
function isMatching(full, chunk) {
    full = full.toLowerCase();
    chunk = chunk.toLowerCase();
    let resultIndexOf = full.indexOf(chunk);

    return resultIndexOf != -1;
}

//  удаление всех детей у родителя
function deleteTextNodesRecursive(where) {
    let childNodes = where.childNodes;

    for (let i = childNodes.length - 1; i >= 0; i--) {
        if (childNodes[i].nodeType === 1) {
            where.removeChild(childNodes[i]);
        } else {
            deleteTextNodesRecursive(childNodes[i]);
        }
    }
}

//  события

//  фильтрация по поиску
filterNameInput.addEventListener('keyup', function(e) {
    //  удаляем все дочерние элементы tbody
    deleteTextNodesRecursive(listTable, 1);

    //  сравниваем строку с подстрокой (если true, добавляем в таблицу)
    for (let prop in objCookie) {
        if (isMatching(prop, e.target.value) || isMatching(objCookie[prop], e.target.value)) {
            addCookieInTable(prop, objCookie[prop], 1);
        }
    }
});

//  добавить куку по нажатии на кнопку
addButton.addEventListener('click', () => {
    let nameCookie = addNameInput.value;
    let valueCookie = addValueInput.value;

    //  если фильтр активен
    if (filterNameInput.value == '') {
        createCookie(nameCookie, valueCookie);

        if (!checkDoubleCookie(nameCookie, valueCookie)) {
            addCookieInTable(nameCookie, valueCookie);
        }
    } else {
        //  сравниваем строку с подстрокой (если true, добавляем в таблицу)
        if (isMatching(nameCookie, filterNameInput.value) || isMatching(valueCookie, filterNameInput.value)) {
            addCookieInTable(nameCookie, valueCookie);
        }

        createCookie(nameCookie, valueCookie);
        objCookie[nameCookie] = valueCookie;
    }
});

//  удаление куки
listTable.addEventListener('click', function (e) {
    e.preventDefault();

    let currentButton = e.target;
    let classTarget = currentButton.getAttribute('class');

    if (classTarget === 'button') {
        let currentTr = currentButton.parentNode.parentNode;
        let childrenTr = currentTr.children;

        listTable.removeChild(currentTr);

        for (let childNode of childrenTr) {

            if (childNode.getAttribute('class') == 'nameCookie') {
                deleteCookie(childNode.textContent);
            }
        }
    }
});
