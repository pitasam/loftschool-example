/* ДЗ 3 - работа с массивами и объеектами */

/*
 Задача 1:
 Напишите аналог встроенного метода forEach для работы с массивами
 */
function forEach(array, fn) {
    for (let i = 0; i < array.length; i++) {
        fn(array[i], i, array);
    }
}

/*
 Задача 2:
 Напишите аналог встроенного метода map для работы с массивами
 */
function map(array, fn) {
    let arrayCopy = [];

    for (let i = 0; i < array.length; i++) {
        arrayCopy[i] = fn(array[i], i, array);
    }

    return arrayCopy;
}

/*
 Задача 3:
 Напишите аналог встроенного метода reduce для работы с массивами
 */
function reduce(array, fn, initial) {
    let result = array[0];
    let start = 1;

    if (initial) {
        result = initial;
        start = 0;
    }
    for (let i = start; i < array.length; i++) {
        result = fn(result, array[i], i, array);
    }

    return result;
}

/*
 Задача 4:
 Функция принимает объект и имя свойства, которое необходиом удалить из объекта
 Функция должна удалить указанное свойство из указанного объекта
 */
function deleteProperty(obj, prop) {
    delete obj[prop];
}

/*
 Задача 5:
 Функция принимает объект и имя свойства и возвращает true или false
 Функция должна проверить существует ли укзаанное свойство в указанном объекте
 */
function hasProperty(obj, prop) {
    return obj.hasOwnProperty(prop);
}

/*
 Задача 6:
 Функция должна получить все перечисляемые свойства объекта и вернуть их в виде массива
 */
function getEnumProps(obj) {
    return Object.keys(obj);
}

/*
 Задача 7:
 Функция должна перебрать все свойства объекта, преобразовать их имена в верхний регистра и вернуть в виде массива
 */
function upperProps(obj) {
    let arrayKeys = Object.keys(obj);

    for (let i=0; i<arrayKeys.length; i++) {
        arrayKeys[i] = arrayKeys[i].toUpperCase();
    }

    return arrayKeys;
}

/*
 Задача 8 *:
 Напишите аналог встроенного метода slice для работы с массивами
 */
function slice(array, from, to) {
    let newArray = [];

    if (arguments.length === 1) {
        return array;
    }

    if (from<(-array.length)) {
        from = 0;
    }
    if (to>array.length) {
        to = array.length;
    }

    //  если передается третий аргумент
    if (arguments.length == 3) {
        if (to >= 0) {
            for (let i=from; i<to; i++) {
                newArray.push(array[i]);
            }
        } else {
            for (let i=from; i<(array.length + to); i++) {
                newArray.push(array[i]);
            }
        }
        console.log(newArray);
        return newArray;
    }

    //  если НЕ передается третий аргумент
    for (let i=from; i<array.length; i++) {
        newArray.push(array[i]);
    }
    console.log(newArray);
    return newArray;
}

/*
 Задача 9 *:
 Функция принимает объект и должна вернуть Proxy для этого объекта
 Proxy должен перехватывать все попытки записи значений свойств и возводить это значение в квадрат
 */
function createProxy(obj) {
    return new Proxy(obj, {
        set (target, prop, value) {
            value *= value;
            target[prop] = value;
            return true;
        }
    })
}

export {
    forEach,
    map,
    reduce,
    deleteProperty,
    hasProperty,
    getEnumProps,
    upperProps,
    slice,
    createProxy
};
