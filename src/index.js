//  вспомогательные функции

//  проверка наличия подстроки в строке
function isMatching(full, chunk) {
    full = full.toLowerCase();
    chunk = chunk.toLowerCase();
    let resultIndexOf = full.indexOf(chunk);

    return resultIndexOf != -1;
}

// получить координаты
function getCoords(elem) {
    let box = elem.getBoundingClientRect();

    return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset
    };
}

// удаление элемента из DOM дерева
function deleteElem(elem) {
    elem.parentNode.removeChild(elem);
}

// vkApi
function vkApi(method, options) {
    if (!options.v) {
        options.v = '5.64';
    }

    return new Promise((resolve, reject) => {
        VK.api(method, options, data => {
            if (data.error) {
                reject(new Error(data.error.error_msg));
            } else {
                resolve(data.response);
            }
        });
    });
}
// vkInit
function vkInit() {
    return new Promise((resolve, reject) => {
        VK.init({
            apiId: 6066695
        });

        VK.Auth.login(data => {
            if (data.session) {
                resolve();
            } else {
                reject(new Error('Не удалось авторизоваться'));
            }
        }, 2);
    });
}

// сохраниение информации из элемента friend в объект
function pushInObject(elem) {
    let childrenElem = elem.children,
        pic = childrenElem[0].children,
        src = pic[0].getAttribute('src'),
        fullName = childrenElem[1].innerText,
        name = fullName.split(' ');

    return {
        first_name: name[0],
        last_name: name[1],
        photo_200: src
    }
}

// добавление блока friend в одну колонку + удаление из другой
// в какую колонку добавление, какой блок
function pushFriendInCol(column, friendDiv) {
    let cloneMovingBlock = friendDiv.cloneNode(true);

    // добавляем клонированный блок friend в правую колонку
    column.appendChild(cloneMovingBlock);
    cloneMovingBlock.style.position = 'relative';
    cloneMovingBlock.style.top = '0';
    cloneMovingBlock.style.left = '0';

    // удаляем перетаскиваемый блок friend
    deleteElem(friendDiv);
}

// шаблон друга
let template = `
{{#each items}}
    <div class="friend">
        <div class="friend__pic-wrapper">
            <img src="{{photo_200}}" class="friend__pic">
        </div>
        <div class="friend__name">{{first_name}} {{last_name}}</div>
        <div class="friend__plus plus">
            <div class="plus__ver"></div>
            <div class="plus__gor"></div>
        </div>
    </div>
{{/each}}
`;

let templateLeft = `
{{#each itemsRight}}
    <div class="friend">
        <div class="friend__pic-wrapper">
            <img src="{{photo_200}}" class="friend__pic">
        </div>
        <div class="friend__name">{{first_name}} {{last_name}}</div>
        <div class="friend__plus plus">
            <div class="plus__ver"></div>
            <div class="plus__gor"></div>
        </div>
    </div>
{{/each}}
`;

// инициализация переменных
let headerInfo = document.querySelector('#headerInfo');
let yourFriends = document.querySelector('#yourFriends');
let friendsInList = document.querySelector('#friendsInList');
let save = document.querySelector('#save');
let wrapper = document.querySelector('.container');
let templateFn = Handlebars.compile(template);
let templateRightFn = Handlebars.compile(templateLeft);
let friendsList = [];
let objectFriends = {};
let filterFriendsList = [];
let fullName = [];

let leftColFriends = document.getElementById('leftColFriends'),
    rightColFriends = document.getElementById('rightColFriends');

// инициализируем переменные для перетаскивания
let movingBlock;
let moveAt;

let storage = localStorage;

// после загрузки страницы (точка входа приложения)
new Promise(resolve => window.onload = resolve)
    .then(() => {
        // если в localStorage ничего нет
        return new Promise((resolve, reject) => {
            if (!localStorage.length) {
                resolve();
            } else { // если в localStorage сохранины данные
                let data = JSON.parse(storage.data);

                headerInfo.innerText = JSON.parse(storage.name);
                leftColFriends.innerHTML = templateFn(data);
                rightColFriends.innerHTML = templateRightFn(data);
                reject();
            }
        });
    })
    .then(() => vkInit()) // инициализировали приложение
    .then(() => vkApi('users.get', { name_case: 'gen' })) // запросили имя пользователя
    .then(response => { // вставили имя пользователя на страницу
        headerInfo.textContent = `Друзья ${response[0].first_name} ${response[0].last_name}`;
    })
    .then(() => vkApi('friends.get', { fields: 'photo_200' })) // запросили друзей пользователя ФИ + аватар
    .then(function (response) {
        leftColFriends.innerHTML = templateFn(response);

        // ответ сервера занесли в массив
        for (let i=0; i<response.items.length; i++) {
            friendsList[i] = response.items[i];
            fullName[i] = response.items[i].first_name + ' ' + response.items[i].last_name;
        }
    });
    // .catch(e => alert('Ошибка: ' + e.message));

// фильтр input левый
yourFriends.addEventListener('keyup', function(e) {
    let friendDivs = leftColFriends.children;

    filterFriendsList = [];

    // сравниваем строку с подстрокой (если true - отображаем, если false - скрываем)
    for (let i=0; i<friendDivs.length; i++) {
        if (isMatching(friendDivs[i].innerText, e.target.value)) {
            friendDivs[i].style.display = 'flex';
        } else {
            friendDivs[i].style.display = 'none';
        }
    }
});

// фильтр input правый
friendsInList.addEventListener('keyup', function(e) {
    let friendDivs = rightColFriends.children;

    filterFriendsList = [];

    // сравниваем строку с подстрокой (если true - отображаем, если false - скрываем)
    for (let i=0; i<friendDivs.length; i++) {
        if (isMatching(friendDivs[i].innerText, e.target.value)) {
            friendDivs[i].style.display = 'flex';
        } else {
            friendDivs[i].style.display = 'none';
        }
    }
});

// перетаскивание
wrapper.addEventListener('mousedown', function(e) {
    let friendDiv = e.target.closest('.friend'),
        plus = e.target.closest('.plus');

    // клик по плюсу
    if (plus) {
        let plusParent = plus.parentNode,
            friendsCol = plusParent.parentNode,
            idFriendsCol = friendsCol.getAttribute('id');

        // левая колонка друзей
        if (idFriendsCol == 'leftColFriends') {
            pushFriendInCol(rightColFriends, friendDiv);
        } else {
        // правая колонка друзей
            pushFriendInCol(leftColFriends, friendDiv);
        }
    } else {
    // клик вне плюса
        // клик на блоке friend
        if (friendDiv) {
            let movingFriend = e.target.closest('.friend');
            let coords = getCoords(movingFriend);
            let shiftX = e.pageX - coords.left;
            let shiftY = e.pageY - coords.top;

            // убираем drag картинки по умолчанию
            movingFriend.ondragstart = function() {
                return false;
            };
            movingBlock = movingFriend;
            movingBlock.style.position = 'absolute';
            movingBlock.style.zIndex = '100';

            moveAt = function(e) {
                movingFriend.style.left = e.pageX - shiftX + 'px';
                movingFriend.style.top = e.pageY - shiftY + 'px';
            };
            moveAt(e);

            document.addEventListener('mousemove', moveAt);
        }
    }
});

wrapper.addEventListener('mouseup', function(e) {
    let plus = e.target.closest('.plus');

    // клик произошел не на плюсе
    if (!plus) {
        if (e.target.closest('.friend')) {
            let coordRightColFriends = rightColFriends.getBoundingClientRect(),
                coordLeftColFriends = leftColFriends.getBoundingClientRect();

            if (e.pageX > coordRightColFriends.left &&
                e.pageX < coordRightColFriends.right &&
                e.pageY > coordRightColFriends.top &&
                e.pageY < coordRightColFriends.bottom) {

                pushFriendInCol(rightColFriends, movingBlock);

            } else if (e.pageX > coordLeftColFriends.left &&
                e.pageX < coordLeftColFriends.right &&
                e.pageY > coordLeftColFriends.top &&
                e.pageY < coordLeftColFriends.bottom) {

                pushFriendInCol(leftColFriends, movingBlock);

            } else {
                movingBlock.style.position = 'relative';
                movingBlock.style.top = '0';
                movingBlock.style.left = '0';
            }

            document.removeEventListener('mousemove', moveAt);
        }
    }
});

// кнопка сохранить
save.addEventListener('click', function (e) {
    e.preventDefault();

    let leftArray =[],
        rightArray =[];

    let leftFriends = leftColFriends.children,
        rightFriends = rightColFriends.children;

    for (let i=0; i<leftFriends.length; i++) {
        let obj = pushInObject(leftFriends[i]);

        leftArray.push(obj);
    }

    for (let i=0; i<rightFriends.length; i++) {
        let obj = pushInObject(rightFriends[i]);

        rightArray.push(obj);
    }

    // запись в объект
    objectFriends.items = leftArray;
    objectFriends.itemsRight = rightArray;

    storage.data = JSON.stringify(objectFriends);
    storage.name = JSON.stringify(headerInfo.innerText);
});