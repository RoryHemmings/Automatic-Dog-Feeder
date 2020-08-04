let width, height;
const numContainerPanels = 3;

let guiManager;
let containerPanels = [];

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
    SECONDARY_WHITE: 'rgba(255, 255, 255, 0.2)',
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

    setY(y) {
        if (y < this._initY) y = this._initY;
        else if (y > (this._initY + this._parent.height)) y = (this._initY + this._parent.height);
        this._y = y - this._h / 2;

        let newPos = 0;
        if (this._inverted)
            newPos = (y - this._initY) / this._parent.height;
        else
            newPos = 1 - (y - this._initY) / this._parent.height;

        newPos = Math.round(newPos * 100) / 100; // Round up to the nearest 10th
        if (this._parent.position != newPos) {
            this._parent.updatePosition(newPos);
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

class Slider {
    constructor(x, y, height, callback, colorScheme, position,
        handleWidth, handleHeight) {
        this._x = x;
        this._y = y;
        this._height = height;
        this._callback = callback;
        this._position = position;

        this._colorScheme = colorScheme;

        this._sliderHandle = new SliderHandle(this, x, y, handleWidth, handleHeight, colorScheme.contrast);
    }

    onClick() {
        this._sliderHandle.isClicked();
    }

    onRelease() {
        this._sliderHandle.onRelease();
    }

    update() {
        this._sliderHandle.update();
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


class Button {
    constructor(customText, x, y, width, height, callback,
        colorScheme, textSize) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._callback = callback;

        this._colorScheme = colorScheme;

        this._text = customText;
        this._textSize = textSize;
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

    update() {

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
        text(this._text, this._x + (this._width / 2), this._y + (this._height / 2));
        pop();
    }
}

class Switch {
    constructor(option0, option1, x, y, width, height, callback, colorScheme, textSize) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._callback = callback;

        this._colorScheme = colorScheme;
        this._textSize = textSize;

        this._currentOption = 0;
        this._option0 = option0;
        this._option1 = option1;
    }

    isHovered() {
        if (mouseX >= this._x && mouseX <= (this._x + this._width) && mouseY >= this._y && mouseY <= (this._y + this._height)) {
            return true;
        }
        return false;
    }

    onClick() {
        if (this.isHovered()) {
            this._currentOption = (this._currentOption) ? 0 : 1;
            this._callback(this);
        }
    }

    update() {

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
            rect(this._x + (this._width * 0.5), this._y, this._width / 2, this._height, 15);
        }

        let t = (this._currentOption) ? this._option1 : this._option0;
        let x = this._x + ((this._currentOption) ? this._width * 0.6 : this._width * 0.2);

        fill(this._colorScheme.text);
        textSize(16);
        text(t, x, this._y + (this._height * 0.5));

        pop();
    }

    set currentOption(option) {
        this._currentOption = option;
    }

    get currentOption() {
        return this._currentOption;
    }
}

class GuiManager {
    constructor() {
        this._sliders = [];
        this._buttons = [];
        this._switches = [];
    }

    update() {
        this._buttons.forEach(b => {
            b.update();
        })

        this._sliders.forEach(s => {
            s.update();
        });

        this._switches.forEach(s => {
            s.update();
        });
    }

    draw() {
        this._buttons.forEach(b => {
            b.draw();
        })

        this._sliders.forEach(s => {
            s.draw();
        });

        this._switches.forEach(s => {
            s.draw();
        })
    }

    createCustomSlider(x, y, height, callback, colorScheme = colorSchemes.RED, position = 0.0,
        handleWidth = 50, handleHeight = 20) {

        let slider = new Slider(x, y, height, callback, colorScheme, position, handleWidth, handleHeight);
        this._sliders.push(slider);
        return slider;
    }

    createCustomButton(customText, x, y, width, height, callback,
        colorScheme = colorSchemes.RED, textSize = 30) {

        let button = new Button(customText, x, y, width, height, callback, colorScheme, textSize);
        this._buttons.push(button);
        return button;
    }

    createCustomSwitch(option0, option1, x, y, width, height, callback,
        colorScheme = colorSchemes.RED, textSize = 16) {

        let s = new Switch(option0, option1, x, y, width, height, callback, colorScheme, textSize);
        this._switches.push(s);
        return s;
    }

    createCustomInput(x, y, size, colorScheme = colorSchemes.RED) {
        let temp = createInput('');
        temp.style(genInputStyleString(colorScheme));
        temp.size(size);
        temp.position(x, y);
    }

    onClick() {
        this._buttons.forEach(b => {
            b.onClick();
        });

        this._switches.forEach(s => {
            s.onClick();
        })
    }

    onPress() {
        this._sliders.forEach(s => {
            s.onClick();
        });
    }

    onRelease() {
        this._sliders.forEach(s => {
            s.onRelease();
        });
    }
}

class Diagram {
    constructor(x, y, width, height, maxAngle = 45) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;

        this._maxAngle = maxAngle;
        this._angle = 0;
    }

    updatePosition(pos) {
        this._angle = pos * this._maxAngle;
    }

    update() {

    }

    draw() {
        push();
        fill(colors.GOLD);
        text(round(this._maxAngle - this._angle) + '°', this._x - this._width * 0.1, this._y + this._height * 0.7);
        translate(this._x, this._y);
        rotate(radians(45));
        stroke(colors.GOLD);
        strokeWeight(3);
        let temp = this._height * Math.tan(radians(90 - this._maxAngle));
        line(0, 0, this._width - temp, 0);
        line(0, 0, 0, this._height);
        line(0, this._height, this._width, this._height);

        translate(this._width - temp, 0);
        rotate(radians(-(this._maxAngle - this._angle)));
        line(0, 0, temp, this._height);
        pop();
    }

    get position() {
        return this._position;
    }
}

class ContainerPanel {
    constructor(index, x, y, width, height, colorScheme) {
        this._index = index;
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;

        this._colorScheme = colorScheme;

        this._foodAmount = guiManager.createCustomInput(this._x + (this._width * 0.3), this._y + (this._height * 0.45), this._width * 0.2, this._colorScheme);

        this._diagram = new Diagram(this._x + (this._width * 0.5), this._y + (this._height * 0.58), this._width * 0.25, this._height * 0.1, 50);

        this._positionSlider = guiManager.createCustomSlider(this._x + (this._width * 0.15), this._y + (this._height * 0.05), this._height * 0.9, s => {
            this._diagram.updatePosition(s.position);
            setContainerPanelPosition(index, s.position);
        }, this._colorScheme);

        this._feedButton = guiManager.createCustomButton('feed', this._x + (this._width * 0.5), this._y + (this._height * 0.85), this._width * 0.4, this._height * 0.1, b => {
            console.log('button');
        }, this._colorScheme);

        this._foodSwitch = guiManager.createCustomSwitch('Big', 'Small', this._x + (this._width * 0.3), this._y + (this._height * 0.25),
            this._width * 0.4, (this._width * 0.25) * 0.5, s => {
                console.log('switch');
            }, this._colorScheme);
    }

    update() {
        this._diagram.update();
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
        text("Dog0", this._x + (this._width * 0.8), this._y + (this._height * 0.05));

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

class SettingsPanel {
    constructor(x, y, width, height, colorScheme = colorSchemes.WHITE) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._colorScheme = colorScheme;

        this._alarmTime = guiManager.createCustomInput(this._genXCoord(0.23), this._genYCoord(0.25),
            this._genWidth(0.3), this._colorScheme);

        this._amPmSwitch = guiManager.createCustomSwitch('am', 'pm', this._genXCoord(0.58), this._genYCoord(0.25), this._genWidth(0.2), this._genHeight(0.059), s => {

        }, this._colorScheme);

        this._feedAllButton = guiManager.createCustomButton('feed all', this._genXCoord(0.5), this._genYCoord(0.85),
            this._genWidth(0.35), this._genHeight(0.1), b => {

            }, this._colorScheme);

        this._applyButton = guiManager.createCustomButton('apply', this._genXCoord(0.1), this._genYCoord(0.85),
            this._genWidth(0.35), this._genHeight(0.1), b => {

            }, this._colorScheme);
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

    update() {

    }

    draw() {
        push();
        stroke(this._colorScheme.primary);
        fill(this._colorScheme.secondary);
        rect(this._x, this._y, this._width, this._height, 15);

        fill(this._colorScheme.text);
        textAlign(CENTER, TOP);
        textSize(50);
        text('Settings', this._x + (this._width * 0.5), this._y + (this._height * 0.05));


        pop();
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
        containerPanels.push(new ContainerPanel(i, (i * objectWidth) + (spacing * (i + 1)), height * 0.15, objectWidth, height * 0.7, cs[i]));
    }

    settingsPanel = new SettingsPanel((objectWidth * (numObjects - 1) + (spacing * numObjects)), height * 0.15, objectWidth, height * 0.7);

    frameRate(120);
    textFont('Consolas');
}

function draw() {
    background(50, 50, 68);

    containerPanels.forEach(containerPanel => {
        containerPanel.update();
    });
    settingsPanel.update();
    guiManager.update();

    containerPanels.forEach(containerPanel => {
        containerPanel.draw();
    });
    settingsPanel.draw();
    guiManager.draw();
}

function feed() {
    fetch('/feed/');
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