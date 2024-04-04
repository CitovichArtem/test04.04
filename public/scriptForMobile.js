//! ИНИЦИАЛИЗАЦИЯ и ЗАГРУЗКА РЕСУРСОВ
const canvas = document.getElementById('gameCanvas');

const width = canvas.style.width = '100%';
const height = canvas.style.height = '100%';
const pw = canvas.offsetWidth;
const ph = canvas.offsetHeight;
const ctx = canvas.getContext('2d');

ctx.font = '10px Montserrat';
const activeColor = '#ffffff', disabledColor = "#ff0000";
const pageWidth = document.documentElement.scrollWidth;
const pageHeight = document.documentElement.scrollHeight;
console.log( 'высота: ' + height + ', ширина: ' + width);
console.log( 'высота: ' + ph + ', ширина: ' + pw);
let selectedCharacter = '', timerInterval, multiplier = 1;
function formatNum(num) {
    const suffixes = ['', 'K', 'M', 'B', 'T', 'q', 'Q', 's', 'S' ];
    const suffixNum = Math.floor(('' + num).length / 3);
    let shortNum = parseFloat((suffixNum != 0 ? (num / Math.pow(1000, suffixNum)) : num).toPrecision(3));
    if (shortNum % 1 != 0) {
        shortNum = shortNum.toFixed(1);
    }
    return shortNum + suffixes[suffixNum];
}

const images = {
    "Мошенник": new Image(),
    "Суперкоп": new Image()
};
const ACTIONS = {
    'Способ': 'range1',
    'Найти': 'range2',
    'Наказать': 'range3'
};

images["Мошенник"].src = '../images/красный_мошенник360.png';
images["Суперкоп"].src = '../images/синий_коп360.png';

let characters = {
    "Мошенник": { energy: 10, stars: 0, isHavingPeoples: false, image: images["Мошенник"], needStars: 3, multiplier: 1},
    "Суперкоп": { energy: 10, stars: 0, isHavingPeoples: false, image: images["Суперкоп"], needStars: 3, multiplier: 1 }
};

Promise.all(Object.values(images).map(image => new Promise(resolve => {
    image.onload = resolve;
}))).then(() => {
    gameLoop();
});

//! Отрисовка элементов интерфейса
function drawButton(x, y, width, height, text, isDisabled) {
    ctx.save();
    const cornerRadius = 23;
    const borderOffset = 3;
    const fillColor = isDisabled ? disabledColor : activeColor;

    ctx.strokeStyle = fillColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + cornerRadius + borderOffset, y + borderOffset);
    ctx.arcTo(x + width - borderOffset, y + borderOffset, x + width - borderOffset, y + height - borderOffset, cornerRadius);
    ctx.arcTo(x + width - borderOffset, y + height - borderOffset, x + borderOffset, y + height - borderOffset, cornerRadius);
    ctx.arcTo(x + borderOffset, y + height - borderOffset, x + borderOffset, y + borderOffset, cornerRadius);
    ctx.arcTo(x + borderOffset, y + borderOffset, x + width - borderOffset, y + borderOffset, cornerRadius);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = fillColor;
    ctx.font = isDisabled ? '18px Montserrat' : '20px Montserrat';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width / 2, y + height / 2);

    ctx.restore();
}

function drawCharacterSelectionButtons() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    ctx.drawImage(characters['Суперкоп'].image, 430, 250);
    ctx.drawImage(characters['Мошенник'].image, 30, 255);
    MyText('ВЫБЕРИ СВОЕГО ПЕРСОНАЖА', pw*0.1, ph*0.1, '#ffffff', 10, 'Montserrat');
    drawButton(175, 150, 200, 50, 'Мошенник');
    drawButton(425, 150, 200, 50, 'Суперкоп');
}

function drawCharacterInterface(character) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    MyText(`Энергия: ${formatNum(character.energy)} / 10`, 20, 30, '#ffffff', 20, 'Montserrat');
    MyText(`Звезды: ${formatNum(character.stars)}`, 20, 60, '#ffffff', 20, 'Montserrat');

    const buttons = [
        { x: 200, y: 150, width: 400, height: 50, text: `${selectedCharacter === 'Мошенник' ? 'Улучшить способ аферы' : 'Улучшить способ поимки'} ${formatNum(character.needStars)}`, isDisabled: (character.stars < character.needStars) },
        { x: 50, y: 500, width: 200, height: 50, text: 'Выйти в меню', isDisabled: false },
        { x: 200, y: 250, width: 400, height: 50, text: selectedCharacter === 'Мошенник' ? 'Найти очередную лохушку-жертву' : 'Найти очередного негодяя', isDisabled: (character.energy <= 0 || characters[selectedCharacter].isHavingPeoples) },
        { x: 200, y: 350, width: 400, height: 50, text: selectedCharacter === 'Мошенник' ? 'Облапошить по полной жертву' : 'Наказать по полной негодяя', isDisabled: (character.energy <= 0 || !characters[selectedCharacter].isHavingPeoples)}
    ];

    buttons.forEach(button => {
        drawButton(button.x, button.y, button.width, button.height, button.text, button.isDisabled);
    });

    ctx.strokeStyle = '#018a8a';    
    ctx.font = '20px Montserrat';
    ctx.strokeText(selectedCharacter === 'Мошенник' ? 'ВРЕМЯ ОТЖАТЬ ВСЕ ДЕНЬГИ У СТАРУШЕК' : 'ВРЕМЯ НАКАЗАТЬ ВСЕХ МОШЕННИКОВ', 190, 120);
    MyText(selectedCharacter === 'Мошенник' ? 'ВРЕМЯ ОТЖАТЬ ВСЕ ДЕНЬГИ У СТАРУШЕК' : 'ВРЕМЯ НАКАЗАТЬ ВСЕХ МОШЕННИКОВ', 190, 120, '#ffffff', 20, 'Montserrat');
    
    ctx.drawImage(character.image, 580, 400, 200, 200);
}

function MyText(text, x, y, color, fontsize, font) {
    ctx.fillStyle = color;
    ctx.font = `${fontsize}px ${font}`;
    ctx.fillText(text, x, y);
}

function startEnergyRecoveryTimer(character) {
    timerInterval = setInterval(() => {
        if (character.energy < 10) {
            character.energy++;
            console.log(`Энергия восстановлена. Текущее значение: ${character.energy}`);
            draw();
        } else {
            clearInterval(timerInterval);
            console.log('Энергия полностью восстановлена.');
        }
    }, 10000); // 10 секунд
}

const draw = () => {
    if (!selectedCharacter) {
        drawCharacterSelectionButtons();
    } else {
        const character = characters[selectedCharacter];
        drawCharacterInterface(character);
    }
}

const handleCharacterSelection = (x) => {
    if (x >= 175 && x <= 375) {
        selectedCharacter = 'Мошенник';
        console.log('Выбран мошенник');
    } else if (x >= 425 && x <= 625) {
        selectedCharacter = 'Суперкоп';
        console.log('Выбран суперкоп');
    }
    if (selectedCharacter) {
        startEnergyRecoveryTimer(characters[selectedCharacter]);
        console.log(selectedCharacter);
    }
}

const handleMenuExit = () => {
    selectedCharacter = '';
    clearInterval(timerInterval); 
    draw(); 
    console.log('Выход в меню');
}

const getActionByRange = (y, isHavingPeoples) => {
    if (y >= 150 && y <= 200 && characters[selectedCharacter].stars >= characters[selectedCharacter].needStars) {
        return ACTIONS['Способ'];
    } else if (y >= 250 && y <= 300 && !isHavingPeoples) {
        return ACTIONS['Найти'];
    } else if (y >= 350 && y <= 400 && isHavingPeoples) {
        return ACTIONS['Наказать'];
    }
}

const handleCharacterAction = (y) => {
    const actionType = getActionByRange(y, characters[selectedCharacter].isHavingPeoples);
    if (actionType) {
        console.log(`Действие ${selectedCharacter.toLowerCase()}: ${actionType}`);
    }
    ActionHandler(selectedCharacter, actionType);
}

const ActionHandler = (selectedCharacter, actionType) => {
    const character = characters[selectedCharacter];
    switch (actionType) {
        case ACTIONS['Способ']:
            character.stars -= character.needStars;
            character.multiplier *= 2;
            character.needStars *= 3;
            character.energy = 10;
            console.log('Обнулили звёзды. Заполнили Энергию. повысили множитель и порог: ' + character.multiplier + ' , ' + character.needStars);
            break;
        case ACTIONS['Найти']:
            if (character.energy > 0) {
                character.energy--;
                character.isHavingPeoples = true;
            }
            break;
        case ACTIONS['Наказать']:
            if (character.energy > 0) {
                character.energy--;
                character.stars += character.multiplier;
                character.isHavingPeoples = false;
            }
            break;
        default:
            console.log('Ошибка с типом действия ' + selectedCharacter + ' ' + actionType);
    }
}

canvas.addEventListener('click', (event) => {
    const x = event.clientX - canvas.getBoundingClientRect().left;
    const y = event.clientY - canvas.getBoundingClientRect().top;

    switch (true) {
        case !selectedCharacter && y >= 150 && y <= 200:
            handleCharacterSelection(x);
            break;
        case selectedCharacter && x >= 50 && x <= 250 && y >= 500 && y <= 550:
            handleMenuExit();
            break;
        case selectedCharacter && x >= 200 && x <= 600:
            handleCharacterAction(y);
            break;
    }
});

// Пример обработчика событий touch для мобильных устройств
canvas.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    const x = touch.clientX - canvas.getBoundingClientRect().left;
    const y = touch.clientY - canvas.getBoundingClientRect().top;

    switch (true) {
        case !selectedCharacter && y >= 150 && y <= 200:
            handleCharacterSelection(x);
            break;
        case selectedCharacter && x >= 50 && x <= 250 && y >= 500 && y <= 550:
            handleMenuExit();
            break;
        case selectedCharacter && x >= 200 && x <= 600:
            handleCharacterAction(y);
            break;
    }
});

const gameLoop = () => {
    draw();
    requestAnimationFrame(gameLoop);
};

gameLoop();
