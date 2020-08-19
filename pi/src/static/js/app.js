let width, height;
const numContainerPanels = 3;

let guiManager;

let primary_font;

const colors = {
    PRIMARY_RED: 'rgba(255, 26, 20, 0.8)',
    SECONDARY_RED: 'rgba(255, 26, 20, 0.2)',
    TERTIARY_RED: 'rgba(170, 0, 0, 0.2)',
    PRIMARY_PURPLE: 'rgba(255, 9, 255, 0.8)',
    SECONDARY_PURPLE: 'rgba(255, 9, 255, 0.2)',
    TERTIARY_PURPLE: 'rgba(200, 0, 190, 0.2)',
    PRIMARY_BLUE: 'rgba(0, 100, 255, 0.8)',
    SECONDARY_BLUE: 'rgba(0, 100, 255, 0.2)',
    TERTIARY_BLUE: 'rgba(0, 70, 200, 0.2)',
    TERTIARY_PURPLE: 'rgba(200, 0, 190, 0.2)',
    PRIMARY_WHITE: 'rgba(255, 255, 255, 0.8)',
    SECONDARY_WHITE: 'rgba(255, 255, 255, 0.1)',
    TERTIARY_WHITE: 'rgba(200, 200, 200, 0.2)',
    TEXT_COLOR: 'rgba(255, 255, 255, 1)',
    GOLD: 'rgba(224, 167, 8, 1)',
    WHITE: 'rgba(255, 255, 255, 1)',
    BLACK: 'RGBA(0, 0, 0, 1)',
};

const colorSchemes = {
    RED: {
        primary: colors.PRIMARY_RED,
        secondary: colors.SECONDARY_RED,
        tertiary: colors.TERTIARY_RED,
        contrast: colors.WHITE,
        text: colors.WHITE,
    },
    PURPLE: {
        primary: colors.PRIMARY_PURPLE,
        secondary: colors.SECONDARY_PURPLE,
        tertiary: colors.TERTIARY_PURPLE,
        contrast: colors.WHITE,
        text: colors.WHITE,
    },
    BLUE: {
        primary: colors.PRIMARY_BLUE,
        secondary: colors.SECONDARY_BLUE,
        tertiary: colors.TERTIARY_BLUE,
        contrast: colors.WHITE,
        text: colors.WHITE,
    },
    WHITE: {
        primary: colors.PRIMARY_WHITE,
        secondary: colors.SECONDARY_WHITE,
        tertiary: colors.TERTIARY_WHITE,
        contrast: colors.WHITE,
        text: colors.WHITE,
    }
};

class guiObject {
    constructor(x, y, width, height, callback) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;

        this._callback = callback;
    }

    _genXCoord(perc) {
        return this._x + (this._width * perc);
    }

    _genYCoord(perc) {
        return this._y + (this._height * perc);
    }

    _genWidth(perc) {
        return this._width * perc;
    }

    _genHeight(perc) {
        return this._height * perc;
    }

    isHovered() {
        if (mouseX >= this._x && mouseX <= (this._x + this._width) && mouseY >= this._y && mouseY <= (this._y + this._height)) {
            return true;
        }
        return false;
    }

    onClick() {
        if (this.isHovered()) {
            this._callback(this);
        }
    }

    // Both functions pass settings json object through each guiObject
    applySettings(settings) {} // Sends settings to back end to update config files
    updateSettings(settings) {} // Modifies settings on front end

    onPress() {}
    onRelease() {}

    update() {}
    draw() {}
}

// class guiGroup extends guiObject {
//     constructor(x, y, width, height) {
//         super(x, y, width, height, () => {});
//     }

//     // Both functions pass settings json object through each guiObject
//     applySettings(settings) { }     // Sends settings to back end to update config files
//     updateSettings(settings) { }    // Modifies settings on front end
// }

class SliderHandle {
    constructor(parent, x, y, w, h, color, inverted = false) {
        this._parent = parent;
        this._inverted = inverted;
        this._initY = y;
        this._x = x - (w / 2) + 2; // Account for both width of slider and width of line which is always 4
        this._y = y;
        this._w = w;
        this._h = h;

        this._color = color;

        this._isClicked = false;

        if (!inverted) this._parent.updatePosition(1);
    }

    setY(y, useCallback = true) {
        if (y < this._initY) y = this._initY;
        else if (y > (this._initY + this._parent.height)) y = (this._initY + this._parent.height);
        this._y = y - this._h / 2;

        let newPos = 0;
        if (this._inverted)
            newPos = (y - this._initY) / this._parent.height;
        else
            newPos = 1 - (y - this._initY) / this._parent.height;

        if (useCallback) {
            newPos = Math.round(newPos * 100) / 100; // Round up to the nearest 10th
            if (this._parent.position != newPos) {
                this._parent.updatePosition(newPos);
            }
        }
    }

    isClicked() {
        if (mouseX >= this._x && mouseX <= (this._x + this._w) && mouseY >= this._y && mouseY <= (this._y + this._h)) {
            this._isClicked = true;
        }
    }

    onRelease() {
        this._isClicked = false;
    }

    update() {
        if (this._isClicked) {
            this.setY(mouseY);
        }
    }

    draw() {
        fill(this._color);
        rect(this._x, this._y, this._w, this._h);
    }
}

class Slider extends guiObject {
    constructor(x, y, height, callback, colorScheme, position,
        handleWidth, handleHeight) {
        super(x, y, 4, height, callback);
        this._position = position;

        this._colorScheme = colorScheme;

        this._sliderHandle = new SliderHandle(this, x, y, handleWidth, handleHeight, colorScheme.contrast, true);
    }

    onClick() {}

    onPress() {
        this._sliderHandle.isClicked();
    }

    onRelease() {
        this._sliderHandle.onRelease();
    }

    update() {
        this._sliderHandle.update();
    }

    updateSliderHandlePosition(pos) {
        if (this._sliderHandle != undefined)
            this._sliderHandle.setY(this._genYCoord(pos), false);
    }

    updatePosition(pos) {
        this._position = pos;

        this._callback(this);
    }

    draw() {
        //text('' + this.position, this._x, this._y - 15);
        push();
        noStroke();
        fill(this._colorScheme.primary);
        rect(this._x, this._y, 4, this.height);

        this._sliderHandle.draw();
        pop();
    }

    get height() {
        return this._height;
    }

    get position() {
        return this._position;
    }
}

class Button extends guiObject {
    constructor(customText, x, y, width, height, callback,
        colorScheme, textSize) {
        super(x, y, width, height, callback);

        this._colorScheme = colorScheme;

        this._text = customText;
        this._textSize = textSize;
    }

    draw() {
        push();
        stroke(this._colorScheme.primary);

        if (this.isHovered()) {
            fill(this._colorScheme.tertiary);
        } else {
            fill(this._colorScheme.secondary);
        }

        rect(this._x, this._y, this._width, this._height, 15);

        textAlign(CENTER, CENTER);
        textSize(this._textSize);
        fill(this._colorScheme.text);
        text(this._text, this._genXCoord(0.5), this._genYCoord(0.5));
        pop();
    }
}

class Switch extends guiObject {
    constructor(option0, option1, x, y, width, height, callback, colorScheme, textSize) {
        super(x, y, width, height, callback);

        this._colorScheme = colorScheme;
        this._textSize = textSize;

        this._currentOption = 0;
        this._option0 = option0;
        this._option1 = option1;
    }

    onClick() {
        if (this.isHovered()) {
            this._currentOption = (this._currentOption) ? 0 : 1;
            this._callback(this);
        }
    }

    draw() {
        push();

        if (this.isHovered()) {
            fill(this._colorScheme.tertiary);
        } else {
            fill(this._colorScheme.secondary);
        }
        stroke(this._colorScheme.primary);
        rect(this._x, this._y, this._width, this._height, 15);

        noStroke();
        fill(this._colorScheme.contrast);
        if (this._currentOption) {
            rect(this._x, this._y, this._width / 2, this._height, 15);
        } else {
            rect(this._genXCoord(0.5), this._y, this._width / 2, this._height, 15);
        }

        let t = (this._currentOption) ? this._option1 : this._option0;
        let x = this._x + ((this._currentOption) ? this._width * 0.6 : this._width * 0.2);

        fill(this._colorScheme.text);
        textSize(16);
        text(t, x, this._genYCoord(0.5));

        pop();
    }

    set currentOption(option) {
        this._currentOption = option;
    }

    get currentOption() {
        return this._currentOption;
    }
}

class Diagram extends guiObject {
    constructor(x, y, width, height, maxAngle = 45) {
        super(x, y, width, height, () => {});

        this._maxAngle = maxAngle;
        this._angle = 0;
    }

    draw() {
        push();
        fill(colors.GOLD);
        text(round(this._maxAngle - this._angle) + '°', this._genXCoord(0.1), this._genYCoord(0.7));
        translate(this._x, this._y);
        rotate(radians(45));
        stroke(colors.GOLD);
        strokeWeight(3);
        let temp = this._height * Math.tan(radians(90 - this._maxAngle));
        line(0, 0, this._width - temp, 0);
        line(0, 0, 0, this._height);
        line(0, this._height, this._width, this._height);

        translate(this._width - temp, 0);
        rotate(radians(-(this._angle)));
        line(0, 0, temp, this._height);
        pop();
    }

    updatePosition(pos) {
        this._angle = pos * this._maxAngle;
    }

    get position() {
        return this._position;
    }
}

class ContainerPanel extends guiObject {
    constructor(index, x, y, width, height, colorScheme) {
        super(x, y, width, height, () => {});

        this._index = index;
        this._colorScheme = colorScheme;
        this._dogName = '';

        this._foodAmount = guiManager.createCustomInput('', this._genXCoord(0.3), this._genYCoord(0.45), this._genWidth(0.2), this._colorScheme);

        this._diagram = new Diagram(this._genXCoord(0.5), this._genYCoord(0.58), this._genWidth(0.25), this._genHeight(0.1), 50);

        this._positionSlider = guiManager.createCustomSlider(this._genXCoord(0.15), this._genYCoord(0.05), this._genHeight(0.9), s => {
            setContainerPanelPosition(index, s.position);
        }, this._colorScheme);

        this._feedButton = guiManager.createCustomButton('feed', this._genXCoord(0.5), this._genYCoord(0.85), this._genWidth(0.4), this._genHeight(0.1), b => {
            feed(this._index);
        }, this._colorScheme);

        this._foodSwitch = guiManager.createCustomSwitch('Big', 'Small', this._genXCoord(0.3), this._genYCoord(0.25),
            this._genWidth(0.4), this._genWidth(0.25) * 0.5, s => {}, this._colorScheme);
    }

    applySettings(settings) {
        settings.containers[this._index].food_amount = this._foodAmount.value();
        settings.containers[this._index].food_type = this._foodSwitch.currentOption;
    }

    updateSettings(settings) {
        this._foodSwitch.currentOption = settings.containers[this._index].food_type;
        this._foodAmount.value(settings.containers[this._index].food_amount);
        this._dogName = settings.containers[this._index].name;
    }

    update() {
        fetch(`/get-container-position/?index=${this._index}`)
        .then(res => res.json())
        .then(data => {
            // if (data.position != this._positionSlider.position) {
            //     this._positionSlider.updateSliderHandlePosition(data.position)
            // }
            if (data.position != this._diagram.position) {
                this._diagram.updatePosition(data.position)
            }
        });
    }

    draw() {
        // Rectangle
        push();
        fill(this._colorScheme.secondary);
        strokeWeight(4);
        stroke(this._colorScheme.primary);

        rect(this._x, this._y, this._width, this._height, 15);
        pop();

        //Text
        push();
        textAlign(RIGHT, TOP);
        //textFont(primary_font);
        fill(this._colorScheme.text);
        textSize(52);
        text(this._dogName, this._x + (this._width * 0.8), this._y + (this._height * 0.05));

        textAlign(LEFT, TOP);
        textSize(18);
        text("Food Type: ", this._x + (this._width * 0.3), this._y + (this._height * 0.2));

        textSize(18);
        text('Food Amount: ', this._x + (this._width * 0.3), this._y + (this._height * 0.4));
        text('grams', this._x + (this._width * 0.575), this._y + (this._height * 0.47));
        pop();

        this._diagram.draw();
    }
}

class SettingsPanel extends guiObject {
    constructor(x, y, width, height, colorScheme = colorSchemes.WHITE) {
        super(x, y, width, height, () => {});
        this._colorScheme = colorScheme;

        this._feedingTime = guiManager.createCustomInput('', this._genXCoord(0.25), this._genYCoord(0.25),
            this._genWidth(0.3), this._colorScheme);

        this._amPmSwitch = guiManager.createCustomSwitch('am', 'pm', this._genXCoord(0.57), this._genYCoord(0.25),
            this._genWidth(0.18), this._genHeight(0.059), s => {

            }, this._colorScheme);

        this._autoFeedSwitch = guiManager.createCustomSwitch('on', 'off', this._genXCoord(0.3), this._genYCoord(0.45),
            this._genWidth(0.4), this._genWidth(0.25) * 0.5, s => {

            }, this._colorScheme);

        this._dogNames = [];
        for (let i = 0; i < numContainerPanels; i++) {
            this._dogNames.push(guiManager.createCustomInput('dog0', this._genXCoord((i + 1) * 0.25) - (this._width * 0.123), this._genYCoord(0.67),
                this._genWidth(0.2), this._colorScheme));
        }

        this._feedAllButton = guiManager.createCustomButton('feed all', this._genXCoord(0.5), this._genYCoord(0.85),
            this._genWidth(0.35), this._genHeight(0.1), b => {
                feed(-1);
            }, this._colorScheme);

        this._applyButton = guiManager.createCustomButton('apply', this._genXCoord(0.1), this._genYCoord(0.85),
            this._genWidth(0.35), this._genHeight(0.1), b => {
                applySettings();
            }, this._colorScheme);
    }

    applySettings(settings) {
        settings.feeding_time = this._feedingTime.value().concat(this._amPmSwitch.currentOption == 0 ? 'AM' : 'PM');    // Concatanate AM or PM
        settings.auto_feed = this._autoFeedSwitch.currentOption;

        for (let i = 0; i < this._dogNames.length; i++) {
            settings.containers[i].name = this._dogNames[i].value();
        }
    }

    updateSettings(settings) {
        // Cut off AM/PM part of the time string as to not confuse the user. Also, set the AM/PM switch
        if (settings.feeding_time.substr(settings.feeding_time.length - 2, 2).toUpperCase() == 'AM' 
                || settings.feeding_time.substr(settings.feeding_time.length - 2, 2).toUpperCase() == 'PM') {
            this._amPmSwitch.currentOption = settings.feeding_time.substr(settings.feeding_time.length - 2, 2).toUpperCase() == 'AM' ? 0 : 1;
            settings.feeding_time = settings.feeding_time.slice(0, settings.feeding_time.length - 2);
        }

        this._feedingTime.value(settings.feeding_time);
        this._autoFeedSwitch.currentOption = settings.auto_feed;

        for (let i = 0; i < this._dogNames.length; i++) {
            this._dogNames[i].value(settings.containers[i].name);
        }
    }

    draw() {
        push();

        stroke(this._colorScheme.primary);
        strokeWeight(4);
        fill(this._colorScheme.secondary);
        rect(this._x, this._y, this._width, this._height, 15);

        noStroke();
        fill(this._colorScheme.text);
        textAlign(CENTER, TOP);
        textSize(50);
        text('Settings', this._genXCoord(0.5), this._genYCoord(0.05));

        fill(this._colorScheme.text);
        textAlign(LEFT, TOP);
        textSize(18);
        text('Feeding Time: ', this._genXCoord(0.25), this._genYCoord(0.2));

        fill(this._colorScheme.text);
        textAlign(LEFT, TOP);
        textSize(18);
        text('Auto-Feed: ', this._genXCoord(0.3), this._genYCoord(0.4));

        fill(this._colorScheme.text);
        textAlign(CENTER, TOP);
        textSize(18);
        text('Dog Names: ', this._genXCoord(0.48), this._genYCoord(0.6));

        pop();
    }
}

class GuiManager {
    constructor() {
        this._guiObjects = [];
    }

    applySettings(settings) {
        this._guiObjects.forEach(obj => {
            obj.applySettings(settings);
        });
    }

    updateSettings(settings) {
        this._guiObjects.forEach(obj => {
            obj.updateSettings(settings);
        })
    }

    update() {
        this._guiObjects.forEach(obj => {
            obj.update();
        });
    }

    draw() {
        this._guiObjects.forEach(obj => {
            obj.draw();
        });
    }

    createCustomSlider(x, y, height, callback, colorScheme = colorSchemes.RED, position = 0.0,
        handleWidth = 50, handleHeight = 20) {

        let slider = new Slider(x, y, height, callback, colorScheme, position, handleWidth, handleHeight);
        this._guiObjects.push(slider);
        return slider;
    }

    createCustomButton(customText, x, y, width, height, callback,
        colorScheme = colorSchemes.RED, textSize = 30) {

        let button = new Button(customText, x, y, width, height, callback, colorScheme, textSize);
        this._guiObjects.push(button);
        return button;
    }

    createCustomSwitch(option0, option1, x, y, width, height, callback,
        colorScheme = colorSchemes.RED, textSize = 16) {

        let s = new Switch(option0, option1, x, y, width, height, callback, colorScheme, textSize);
        this._guiObjects.push(s);
        return s;
    }

    createCustomInput(initText, x, y, size, colorScheme = colorSchemes.RED) {
        let temp = createInput(initText);
        temp.style(genInputStyleString(colorScheme));
        temp.size(size);
        temp.position(x, y);
        return temp;
    }

    onClick() {
        this._guiObjects.forEach(obj => {
            obj.onClick();
        })
    }

    onPress() {
        this._guiObjects.forEach(obj => {
            obj.onPress();
        });
    }

    onRelease() {
        this._guiObjects.forEach(obj => {
            obj.onRelease();
        });
    }

    addGuiObject(obj) {
        this._guiObjects.push(obj);
    }
}

function preload() {
    //primary_font = loadFont('gtr.tff');
}

function setup() {
    width = window.innerWidth;
    height = window.innerHeight;
    createCanvas(width, height);

    guiManager = new GuiManager();

    let cs = [colorSchemes.RED, colorSchemes.PURPLE, colorSchemes.BLUE];
    const numObjects = numContainerPanels + 1; // containerPanels + 1 settings panel
    const objectWidthPerc = 0.23;
    const objectWidth = width * objectWidthPerc; // 23% of width
    const spacing = width * ((1 - (objectWidthPerc * numObjects)) / (numObjects + 1)); // Remaining space divided by number of spaces

    for (let i = 0; i < numContainerPanels; ++i) {
        guiManager.addGuiObject(new ContainerPanel(i, (i * objectWidth) + (spacing * (i + 1)), height * 0.15, objectWidth, height * 0.7, cs[i]));
    }

    guiManager.addGuiObject(new SettingsPanel((objectWidth * (numObjects - 1) + (spacing * numObjects)), height * 0.15, objectWidth, height * 0.7));

    frameRate(120);
    textFont('Consolas');
    getSettings();
}

function draw() {
    background(50, 50, 68);

    guiManager.update();
    guiManager.draw();
}

function genInputStyleString(scheme) {
    ret = '';
    ret += 'border-radius: 12px;';
    ret += 'height: 40px;';
    ret += 'border-width: 1px;';
    ret += 'border-style: solid;';
    ret += 'border-width: 1px;';
    ret += 'outline: none;';
    ret += 'padding: 0px 10px;';
    ret += `color: ${scheme.text};`;
    ret += `background-color: ${scheme.secondary};`;
    ret += `border-color: ${scheme.primary};`;
    return ret;
}

function setContainerPanelPosition(index, position) {
    const req = `/set-container-position/?index=${index}&position=${position}`;
    fetch(req);
}

function mouseClicked() {
    guiManager.onClick();
}

function mousePressed() {
    guiManager.onPress();
}

function mouseReleased() {
    guiManager.onRelease();
}

function feed(index) {
    fetch(`/feed/${index}`)
    // .then(res => res.json())
    // .then(data => {
    //     console.log(data);
    // });
}

function checkValidity(settings) {
    // Replace all spaces for consistancy
    settings.feeding_time.replace(/\s/g, '');

    if (settings.feeding_time.length > 7) return false;

    // If feeding_time doesn't have a 0 in the front, then add one
    if (settings.feeding_time.length != 7) {
        settings.feeding_time = '0'.concat(settings.feeding_time);
    }

    let hour = Number(settings.feeding_time.substr(0, 2));
    let minute = Number(settings.feeding_time.substr(3, 2));
    if (!(hour >= 0 && hour <= 12) || !(minute >= 0 && minute <= 59))
        return false;

    return true;
}

function applySettings() {
    let settings = {
        containers: [{}, {}, {}]
    };

    guiManager.applySettings(settings);

    if (!checkValidity(settings)) {
        alert("Settings are not valid");
        return;
    }

    fetch('/update-settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
    }).then(res => {
        if (res.status == 200) {
            getSettings();
        }
    });
}

function getSettings() {
    fetch('/get-settings')
        .then(res => res.json())
        .then(settings => {
            guiManager.updateSettings(settings);
        });
}
