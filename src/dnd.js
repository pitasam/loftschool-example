/** Со звездочкой */
/**
 * Создать страницу с кнопкой
 * При нажатии на кнопку должен создаваться div со случайными размерами, цветом и позицией
 * Необходимо предоставить возможность перетаскивать созданные div при помощи drag and drop
 * Запрощено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/**
 * homeworkContainer - это контейнер для всех ваших домашних заданий
 * Если вы создаете новые html-элементы и добавляете их на страницу, то дабавляйте их только в этот контейнер
 *
 * @example
 * homeworkContainer.appendChild(...);
 */
let homeworkContainer = document.querySelector('#homework-container');
let counter = 0;

/**
 * Функция должна создавать и возвращать новый div с классом draggable-div и случайными размерами/цветом/позицией
 * Функция должна только создавать элемент и задвать ему случайные размер/позицию/цвет
 * Функция НЕ должна добавлять элемент на страницу
 *
 * @return {Element}
 */
function createDiv() {
    function getRandomColor() {
        let letters = '0123456789ABCDEF'.split('');
        let color = '#';

        for (let i = 0; i < 6; i++) {
            color += letters[Math.round(Math.random() * 15)];
        }

        return color;
    }

    function getRandomNumber(maxNumber) {
        let randomNumber = Math.round(Math.random() * maxNumber/2);

        return randomNumber + 'px';
    }

    let newDiv = document.createElement('DIV');

    counter++;
    newDiv.setAttribute('class', 'draggable-div');
    newDiv.setAttribute('id', 'draggable-div-' + counter);

    newDiv.style.position = 'absolute';
    newDiv.style.display = 'inline-block';

    newDiv.style.background = getRandomColor();
    newDiv.style.width = getRandomNumber(document.documentElement.clientWidth);
    newDiv.style.height = getRandomNumber(document.documentElement.clientHeight);
    newDiv.style.top = getRandomNumber(document.documentElement.clientWidth);
    newDiv.style.left = getRandomNumber(document.documentElement.clientHeight);

    return newDiv;
}

/**
 * Функция должна добавлять обработчики событий для перетаскивания элемента при помощи drag and drop
 *
 * @param {Element} target
 */
function addListeners(target) {
    let movingBlock;
    let moveFn;

    target.addEventListener('mousedown', function(e) {
        let offsetX = e.offsetX,
            offsetY = e.offsetY,
            downCurrentDiv = e.target,
            idDownCurrentDiv = downCurrentDiv.getAttribute('id');

        movingBlock = e.target;
        movingBlock.style.position = 'absolute';
        movingBlock.style.zIndex = '100';

        moveFn = function(e) {
            let upCurrentDiv = e.target,
                idUpCurrentDiv = upCurrentDiv.getAttribute('id');

            let moveX = e.clientX - offsetX;
            let moveY = e.clientY - offsetY;

            movingBlock.style.left = moveX + 'px';
            movingBlock.style.top = moveY + 'px';
        };

        document.addEventListener('mousemove', moveFn);
    });

    target.addEventListener('mouseup', function() {
        document.removeEventListener('mousemove', moveFn);
    });
}

let addDivButton = homeworkContainer.querySelector('#addDiv');

addDivButton.addEventListener('click', function() {
    // создать новый div
    let div = createDiv();

    //  console.log(div);
    // добавить на страницу
    homeworkContainer.appendChild(div);
    // назначить обработчики событий мыши для реализации d&d
    addListeners(div);
    // можно не назначать обработчики событий каждому div в отдельности, а использовать делегирование
    // или использовать HTML5 D&D - https://www.html5rocks.com/ru/tutorials/dnd/basics/
});

export {
    createDiv
};
