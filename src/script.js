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

// vk
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

// инициализация переменных
let friendsContainer = document.getElementById('friends');

let templateFn = Handlebars.compile(template);
let friendsList = [];
let objRight = {items: ''};
let objLeft = {items: ''};
let filterFriendsList = [];
let rightFriendsList = [];
let leftFriendsList = [];
let fullName = [];
let responseFriends;


new Promise(resolve => window.onload = resolve)
    .then(() => vkInit()) // инициализировали приложение
    .then(() => vkApi('users.get', {name_case: 'gen'})) // запросили имя пользователя
    .then(response => { // вставили имя пользователя на страницу
        headerInfo.textContent = `Друзья ${response[0].first_name} ${response[0].last_name}`;
    })
    .then(() => vkApi('friends.get', {fields: 'photo_200'})) // запросили друзей пользователя ФИ + аватар
    .then(function (response) {
        friends.innerHTML = templateFn(response);


        // ответ сервера занесли в массив
        for (let i=0; i<response.items.length; i++){
        //console.log(response.items[i]);
        friendsList[i] = response.items[i];
        fullName[i] = response.items[i].first_name + ' ' + response.items[i].last_name;
        }
    })
    .catch(e => alert('Ошибка: ' + e.message));


// фильтр input левый
yourFriends.addEventListener('keyup', function(e){
    //let friendDivs = document.getElementsByClassName('friend');

    let friendsColLeft = document.getElementById('friends'),
        friendDivs = friendsColLeft.children;

    console.log('friendDivs');
    console.log(friendDivs);
    //deleteTextNodesRecursive(friendsContainer);
    filterFriendsList = [];

    // сравниваем строку с подстрокой (если true, добавляем в колонку)
    for (let i=0; i<friendDivs.length; i++){
        if(isMatching(friendDivs[i].innerText, e.target.value)){
            // //console.log(isMatching(fullName[i], e.target.value));
            // filterFriendsList.push(responseFriends.items[i]);
            // //console.log(friendsList[i]);
            friendDivs[i].style.display = 'flex';
        } else {
            friendDivs[i].style.display = 'none';
        }
    }

    // objRight.items = filterFriendsList;
    // friends.innerHTML = templateFn(objRight);
});

// фильтр input правый
friendsInList.addEventListener('keyup', function(e){
    //let friendDivs = document.getElementsByClassName('friend');

    let friendsColRight = document.getElementById('friendsColRight'),
        friendDivs = friendsColRight.children;

    console.log('friendDivs');
    console.log(friendDivs);
    //deleteTextNodesRecursive(friendsContainer);
    filterFriendsList = [];

    // сравниваем строку с подстрокой (если true, добавляем в колонку)
    for (let i=0; i<friendDivs.length; i++){
        if(isMatching(friendDivs[i].innerText, e.target.value)){
            // //console.log(isMatching(fullName[i], e.target.value));
            // filterFriendsList.push(responseFriends.items[i]);
            // //console.log(friendsList[i]);
            friendDivs[i].style.display = 'flex';
        } else {
            friendDivs[i].style.display = 'none';
        }
    }

    // objRight.items = filterFriendsList;
    // friends.innerHTML = templateFn(objRight);
});

let movingBlock;
let friendsColRight = document.getElementById('friendsColRight');
let moveAt;

document.addEventListener('mousedown', function(e) {
    let friendDiv = e.target.closest('.friend');
    let plus = e.target.closest('.plus');

    if(plus){
        let parentPlus = plus.parentNode,
            friendsCol = parentPlus.parentNode,
            idFriendsCol = friendsCol.getAttribute('id');
        console.log('parentPlus');
        console.log(parentPlus);
        console.log('idFriendsCol');
        console.log(idFriendsCol);
        console.log('1111');
        console.log(idFriendsCol == 'friends');

        if(idFriendsCol == 'friends'){
            let cloneMovingBlock = friendDiv.cloneNode(true);
            friendsColRight.appendChild(cloneMovingBlock);
            cloneMovingBlock.style.position = 'relative';
            cloneMovingBlock.style.top = '0';
            cloneMovingBlock.style.left = '0';
            //rightFriendsList.push(movingBlock);
            deleteElem(friendDiv);
        } else {
            let cloneMovingBlock = friendDiv.cloneNode(true);
            friends.appendChild(cloneMovingBlock);
            cloneMovingBlock.style.position = 'relative';
            cloneMovingBlock.style.top = '0';
            cloneMovingBlock.style.left = '0';
            //rightFriendsList.push(movingBlock);
            deleteElem(friendDiv);
        }


    } else {
        if(friendDiv){
            let movingFriend = e.target.closest('.friend');
            let coords = getCoords(movingFriend);
            let shiftX = e.pageX - coords.left;
            let shiftY = e.pageY - coords.top;


            movingFriend.ondragstart = function() {
                return false;
            };
            movingBlock = movingFriend;
            movingBlock.style.position = 'absolute';
            movingBlock.style.zIndex = '100';
            //document.body.appendChild(movingFriend);

            moveAt = function(e) {
                movingFriend.style.left = e.pageX - shiftX + 'px';
                movingFriend.style.top = e.pageY - shiftY + 'px';
            };
            moveAt(e);

            document.addEventListener('mousemove', moveAt);
        }
    }

});

document.addEventListener('mouseup', function(e) {
    console.log('!!!!!!!!!!!!!!!!!');
    console.log(e);
    let plus = e.target.closest('.plus');

    if(!plus){
        if (e.target.closest('.friend')){
            let coordRightColFriends = friendsColRight.getBoundingClientRect();
            let coordLeftColFriends = friends.getBoundingClientRect();
            if (e.pageX > coordRightColFriends.left && e.pageX < coordRightColFriends.right && e.pageY > coordRightColFriends.top && e.pageY < coordRightColFriends.bottom){
                console.log('00000000000000');
                console.log(typeof movingBlock);

                let cloneMovingBlock = movingBlock.cloneNode(true);

                friendsColRight.appendChild(cloneMovingBlock);

                cloneMovingBlock.style.position = 'relative';
                cloneMovingBlock.style.top = '0';
                cloneMovingBlock.style.left = '0';

                // movingBlock.style.position = 'relative';
                // movingBlock.style.top = '0';
                // movingBlock.style.left = '0';


                // let el = document.createElement("div");
                // el.innerHTML = "<h1>Dfcz!!!!</h1>";
                // console.log(typeof el);
                //
                // friendsColRight.appendChild(el);

                rightFriendsList.push(movingBlock);
                deleteElem(movingBlock);

            } else if(e.pageX > coordLeftColFriends.left && e.pageX < coordLeftColFriends.right && e.pageY > coordLeftColFriends.top && e.pageY < coordLeftColFriends.bottom){
                let cloneMovingBlock = movingBlock.cloneNode(true);

                friends.appendChild(cloneMovingBlock);

                cloneMovingBlock.style.position = 'relative';
                cloneMovingBlock.style.top = '0';
                cloneMovingBlock.style.left = '0';

                //rightFriendsList.push(movingBlock);
                deleteElem(movingBlock);
            } else {
                movingBlock.style.position = 'relative';
                movingBlock.style.top = '0';
                movingBlock.style.left = '0';
            }

            document.removeEventListener('mousemove', moveAt);
        }
    }


});


let storage = localStorage;
save.addEventListener('click', function (e) {
    e.preventDefault();

    let leftColFriend = document.getElementById('friends'),
        rightColFriend = document.getElementById('friendsColRight'),
        leftFriends = leftColFriend.children,
        rightFriends = rightColFriend.children;

    console.log(leftFriends);
    console.log(rightFriends);

    storage.friends = JSON.stringify(
        leftFriends
    );
    // console.log('storage.friends.leftFriends');
    // console.log(storage.friends.leftFriends);
    let data = JSON.parse(storage.friends);
    console.log('data');
    console.log(data);
});