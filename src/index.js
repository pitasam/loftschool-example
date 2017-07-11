let map;
let balloon;
let placemark;
let coords;
let BalloonContentLayout;
let clusterer;
let address;
let geoObjects = [];

// если в localStorage что-то есть
// создаем плэйсмарки и заносим в кластер
function isLS() {
    // если в localStorage что-то есть
    if (localStorage.length) {
        let storageKey = [];

        // получаем все ключи localStorage'а
        for (let i = 0; i < localStorage.length; i++) {
            storageKey[i] = localStorage.key(i);
        }

        // из ключей делаем координаты
        let points = storageKey.map(function (coord) {
            let coords = coord.split(',');

            return [+coords[0], +coords[1]];
        });

        // создаем плэйсмарки и добавляем в geoObjects
        for (let i = 0; i < points.length; i++) {
            placemark = setPlacemark(points[i]);
            geoObjects[i] = placemark;
        }

        // добавляем плэйсмарки в кластер
        clusterer.add(geoObjects);
        map.setBounds(clusterer.getBounds(), {
            checkZoomRange: true
        });
    }
}

// новая метка
function setPlacemark(coordsPlacemark) {
    let coordsString = coordsPlacemark.toString();
    let place;
    let address;
    let review;

    // данные для балуна кластера
    if (localStorage[coordsString]) {
        let storage = JSON.parse(localStorage[coordsString]);

        place = storage[0].place;
        address = storage[0].address;
        review = storage[0].comment;
    }

    // создаем плэйсмарку
    placemark = new ymaps.Placemark(coordsPlacemark, {
        balloonContentPlace: place,
        balloonContentAddress: address,
        balloonContentReviews: review,
        balloonContentCoords: coordsPlacemark
    },
        {
            balloonPanelMaxMapArea: 0,
            balloonContentLayout: BalloonContentLayout,
            balloonCloseButton: false,
            clustererBalloonCloseButton: true,
            hideIconOnBalloonOpen: false
        }
    );

    // добавляем событие на плэйсмарку
    placemark.events.add('click', function (e) {
        // берем координаты плэйсмарки
        coords = e.originalEvent.target.geometry.getCoordinates();
    });

    return placemark;
}

function clearInput() {
    let input = document.querySelectorAll('.review__input');

    for (let i=0; i<input.length; i++) {
        input[i].value = '';
    }
}

function setCommentsInLS(coords, address, name, place, comment) {
    let array;
    let balloonValues = {
        'address': address,
        'name': name,
        'place': place,
        'comment': comment,
        'coords': coords
    };

    if (!localStorage[coords.toString()]) {
        localStorage[coords.toString()] = JSON.stringify([]);
    }

    array = JSON.parse(localStorage[coords.toString()]);

    array.push(balloonValues);
    localStorage[coords.toString()] = JSON.stringify(array);
}

function setCommentsInDiv(name, place, comment) {
    let reviews = document.getElementById('reviews');
    let nameSpan = document.createElement('span');
    let placeSpan = document.createElement('span');
    let commentDiv = document.createElement('div');
    let commentWrapper = document.createElement('div');

    placeSpan.setAttribute('style', 'color:red; margin-left:10px');

    nameSpan.innerHTML = name;
    placeSpan.innerHTML = place;
    commentDiv.innerHTML = comment;
    commentWrapper.appendChild(nameSpan);
    commentWrapper.appendChild(placeSpan);
    commentWrapper.appendChild(commentDiv);
    reviews.appendChild(commentWrapper);
}

// получение адреса
function geocode(coords) {
    return ymaps.geocode(coords, { kind: 'house' }).then(result => {
        let firstGeoObject = result.geoObjects.get(0);

        address = [
            // Название населенного пункта или вышестоящее административно-территориальное образование.
            firstGeoObject.getCountry(), firstGeoObject.getAddressLine()
            // Получаем путь до топонима, если метод вернул null, запрашиваем наименование здания.
        ].filter(Boolean).join(', ');

        return address;
    })
}

// точка входа
new Promise(resolve => window.onload = resolve)
    .then(() => new Promise(resolve => ymaps.ready(resolve)))
    .then(() => {
        // Создает экземпляр карты и привязывает его к созданному контейнеру
        map = new ymaps.Map('map', {
            center: [55.650625, 37.62708],
            zoom: 11,
            controls: []
        }, {
            searchControlProvider: 'yandex#search'
        });

        // Создаем собственный макет с информацией о выбранном геообъекте.
        let customItemContentLayout = ymaps.templateLayoutFactory.createClass(
            '<img src="src/close.png" class="balloon__close" id="close" style="width: 15px; height: 15px; display: inline-block; float: right">' +
            // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
            '<h2 class="balloon__header" id="placeCor">{{ properties.balloonContentPlace|raw }}</h2>' +
            '<a href="#" class="balloon__body" id="addressCor">{{ properties.balloonContentAddress|raw }}</a> <br>' +
            '<div class="balloon__footer" id="reviewsCor">{{ properties.balloonContentReviews|raw }}</div>' +
            '<div class="balloon__coords" id="coords" style="display: none;">{{ properties.balloonContentCoords|raw }}</div>'
            ,
            {
                build: function () {
                    // Сначала вызываем метод build родительского класса.
                    BalloonContentLayout.superclass.build.call(this);

                    let addressCor = document.getElementById('addressCor');
                    let close = document.getElementById('close');

                    addressCor.addEventListener('click', this.openBalloon);
                    close.addEventListener('click', this.closeHeandler);
                },

                clear: function () {
                    let addressCor = document.getElementById('addressCor');
                    let close = document.getElementById('close');

                    addressCor.removeEventListener('click', this.openBalloon);
                    close.removeEventListener('click', this.closeHeandler);

                    BalloonContentLayout.superclass.clear.call(this);
                },

                closeHeandler: function () {
                    // закрываем балун
                    map.balloon.close();
                },

                openBalloon: function (e) {
                    e.preventDefault();
                    let coordPlacemarkString = document.getElementById('coords').innerText;
                    let coordPlacemark = coordPlacemarkString.split(',');

                    // по координатам плэйсмарки открываем балун
                    coords = coordPlacemark;
                    map.balloon.close();
                    map.balloon.open(coords);
                }
            }
        );

        // создаем макет балуна
        BalloonContentLayout = ymaps.templateLayoutFactory.createClass(
            '<div class="balloon__header" style="width: 100%; padding: 3px 5px;">' +
            '<div class="balloon__title" id="place" style="width: 90%; display: inline-block; font-size: 11px; height: 25px; line-height: 1.2;"></div>' +
            '<img src="src/close.png" class="balloon__close" id="close" style="width: 15px; height: 15px; display: inline-block; float: right"></div>' +
            '</div>' +
            '<div class="balloon__review review" style="padding: 5px">' +
            '<div class="review__result" id="reviews" style="display: block; margin-bottom: 5px; box-sizing: border-box; border: 1px solid lightgrey; height: 150px; overflow: scroll; width: 350px;"></div>' +
            '<div class="review__title">Ваш отзыв</div>' +
            '<input type="text" title="" class="review__input" id="reviewName" style="display: block; width: 100%; margin-bottom: 5px; box-sizing: border-box">' +
            '<input type="text" title="" class="review__input" id="reviewPlace" style="display: block; width: 100%; margin-bottom: 5px; box-sizing: border-box">' +
            '<textarea title="" class="review__input" id="reviewNew" style="display: block; width: 100%; margin-bottom: 5px; box-sizing: border-box"></textarea>' +
            '<button class="review__button button" id="button" style="float: right;">Добавить</button>' +
            '</div>',
            {

                build: function () {
                    // Сначала вызываем метод build родительского класса.
                    BalloonContentLayout.superclass.build.call(this);
                    // А затем выполняем дополнительные действия.
                    let button = document.getElementById('button');
                    let close = document.getElementById('close');
                    let place = document.getElementById('place');
                    let resGeocode = geocode(coords);

                    // получение адресса и вставка в шапку
                    resGeocode.then(res => {
                        address = res;
                        place.innerText = address;
                    });

                    let coordsString = coords.toString();

                    // заполнение балуна контентом
                    if (localStorage[coordsString]) {
                        let storage = JSON.parse(localStorage[coordsString]);

                        for (let i=0; i<storage.length; i++) {
                            setCommentsInDiv(
                                storage[i].name,
                                storage[i].place,
                                storage[i].comment
                            );
                        }
                    }

                    button.addEventListener('click', this.setPlacemark);
                    close.addEventListener('click', this.closeHeandler);
                },

                // Аналогично переопределяем функцию clear, чтобы снять
                // прослушивание клика при удалении макета с карты.
                clear: function () {
                    let button = document.getElementById('button');
                    let close = document.getElementById('close');

                    button.removeEventListener('click', this.setPlacemark);
                    close.removeEventListener('click', this.closeHeandler);
                    BalloonContentLayout.superclass.clear.call(this);
                },

                closeHeandler: function () {
                    map.balloon.close();
                },

                setPlacemark: function () {
                    let inputs = document.querySelectorAll('.review__input');
                    let inputContent = [];
                    let flag = false;

                    // если в LS нет по данному ключу значения
                    if (!localStorage[coords.toString()]) {
                        flag = true;
                    }

                    for (let i=0; i<inputs.length; i++) {
                        inputContent[i] = inputs[i].value;
                    }

                    // вставляем данные в LS
                    setCommentsInLS(coords, address, inputContent[0], inputContent[1], inputContent[2]);

                    // вставляем данные в балун
                    setCommentsInDiv(inputContent[0], inputContent[1], inputContent[2]);

                    // добавляем плэйсмарку
                    placemark = setPlacemark(coords);

                    // добавляем плэйсмарку
                    if (flag) {
                        clusterer.add(placemark);
                    }

                    // чистим инпуты
                    clearInput();
                }
            });

        // создаем балун
        balloon = new ymaps.Balloon(map);

        // создаём кластер
        clusterer = new ymaps.Clusterer({
            clusterDisableClickZoom: true,
            clusterBalloonContentLayout: 'cluster#balloonCarousel',
            clusterBalloonItemContentLayout: customItemContentLayout,
            clusterBalloonCycling: false,
            clusterBalloonPagerType: 'marker',
            clusterBalloonPagerSize: 5
        });

        // если в localStorage что-то есть
        // создаем плэйсмарки и заносим в кластер
        isLS();

        // задаем карте опции для балуна
        map.options.set({
            balloonContentLayout: BalloonContentLayout,
            balloonPanelMaxMapArea: 0,
            balloonCloseButton: false
        });

        // добавляем кластер на карту
        map.geoObjects.add(clusterer);

        // клик по карте
        map.events.add('click', function (e) {
            // получаем координаты
            coords = e.get('coords');

            // открываем балун в полученных координатах
            map.balloon.open(coords);
        });
    });
