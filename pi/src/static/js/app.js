let width, height;
const numContainers = 3;

let guiManager;
let containers = [];

let primary_font;

const colors = {
    PRIMARY_RED: 'rgba(255, 26, 20, 0.8)',
    SECONDARY_RED: 'rgba(255, 26, 20, 0.2)',
    TERTIARY_RED: 'rgba(170, 0, 0, 0.2)',
    TEXT_COLOR: 'rgba(255, 255, 255, 1)',
    WHITE: 'rgba(255, 255, 255, 1)'
};

class SliderHandle {
    constructor(parent, x, y, w, h, color, inverted=false) {
        this._parent = parent;
        this._inverted = inverted;
        this._initY = y;
        this._x = x - (w / 2) + 2;  // Account for both width of slider and width of line which is always 4
        this._y = y;
        this._w = w;
        this._h = h;

        this._color = color;

        this._isClicked = false;

        if (!inverted) this._parent.updatePosition(1);
    }

    setY(y) {
        if ((y >= this._initY) && (y <= (this._initY + this._parent.height))) {
            this._y = y - this._h / 2;

            let newPos = 0;
            if (this._inverted) 
                newPos = (y - this._initY) / this._parent.height;
            else
                newPos = 1 - (y - this._initY) / this._parent.height;

            newPos = Math.round(newPos * 100) / 100; // Round up to the nearest 10th
            if (this._parent.position != newPos)
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
    constructor(index, x, y, height, position,
                handleWidth, handleHeight, handleColor, bgColor) {
        this._index = index;
        this._x = x;
        this._y = y;
        this._height = height;
        this._position = position;
        
        this._bgColor = bgColor;

        this._sliderHandle = new SliderHandle(this, x, y, handleWidth, handleHeight, handleColor);
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
        setContainerPosition(this);
    }

    draw() {
        //text('' + this.position, this._x, this._y - 15);
        push();
        noStroke();
        fill(this._bgColor);
        rect(this._x, this._y, 4, this.height);

        this._sliderHandle.draw();
        pop();
    }

    get index() {
        return this._index;
    }

    get height() {
        return this._height;
    }

    get position() {
        return this._position;
    }
}

class Button {
    constructor(customText, x, y, width, height, onClick, 
                pColor, sColor, borderColor, 
                textColor, textSize) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._onClick = onClick;

        this._pColor = pColor;
        this._borderColor = borderColor;
        this._sColor = sColor;
        this._color = pColor;
        this._textColor = textColor;

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
            this._onClick();
        }
    }

    update() {
        if (this.isHovered()) {
            this._color = this._sColor;
        } else {
            this._color = this._pColor;
        }
    }

    draw() {
        push();
        stroke(this._borderColor);
        fill(this._color);
        rect(this._x, this._y, this._width, this._height, 15);

        textAlign(CENTER, CENTER);
        textSize(this._textSize);
        fill(this._textColor);
        text(this._text, this._x + (this._width / 2), this._y + (this._height / 2));
        pop();
    }
}

class Switch {
    constructor(option0, option1, x, y, width, height, 
                pColor, sColor, borderColor, 
                textColor, textSize) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        
        this._pColor = pColor;
        this._sColor = sColor;
        this._borderColor = borderColor;
        this._textColor = textColor;
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
        if (this.isHovered())
            this._currentOption = (this._currentOption) ? 0 : 1;
    }

    update() {
        
    }

    draw() {
        push();

        if (this.isHovered()) {
            fill(this._sColor);
        } else {
            fill(this._pColor);
        }
        stroke(this._borderColor);
        rect(this._x, this._y, this._width, this._height, 15);

        noStroke();
        fill(colors.WHITE);
        if (this._currentOption) {
            rect(this._x, this._y, this._width / 2, this._height, 15);
        } else {
            rect(this._x + (this._width * 0.5), this._y, this._width / 2, this._height, 15);
        }

        let t = (this._currentOption) ? this._option1 : this._option0;
        let x = this._x + ((this._currentOption) ? this._width * 0.6 : this._width * 0.2);

        fill(this._textColor);
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

    createCustomSlider(index, x, y, height, position = 0.0,
                        handleWidth = 50, handleHeight = 20, handleColor=colors.WHITE, bgColor=colors.PRIMARY_RED) {
        this._sliders.push(new Slider(index, x, y, height, position, handleWidth, handleHeight, handleColor, bgColor));
    }

    createCustomButton(customText, x, y, width, height, onClick, 
                        pColor=colors.SECONDARY_RED, sColor=colors.TERTIARY_RED, borderColor=colors.PRIMARY_RED, 
                        textColor=colors.TEXT_COLOR, textSize=30) {
        this._buttons.push(new Button(customText, x, y, width, height, onClick, pColor, sColor, borderColor, textColor, textSize));
    }

    createCustomSwitch(option0, option1, x, y, width, height, 
                        pColor=colors.SECONDARY_RED, sColor=colors.TERTIARY_RED, borderColor=colors.PRIMARY_RED, 
                        textColor=colors.TEXT_COLOR, textSize=16) {
        this._switches.push(new Switch(option0, option1, x, y, width, height, pColor, sColor, borderColor, textColor, textSize));
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

class Container {
    constructor(index, x, y, width, height, color, borderColor) {
        this._index = index;
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._color = color;
        this._borderColor = borderColor;
        
        guiManager.createCustomSlider(index, this._x + (this._width * 0.15), this._y + (this._height * 0.05), this._height * 0.9);
        guiManager.createCustomButton('feed', this._x + (this._width * 0.5), this._y + (this._height * 0.85), this._width * 0.4, this._height * 0.1, () => {

        });
        guiManager.createCustomSwitch('Big', 'Small', this._x + (this._width * 0.3), this._y + (this._height * 0.25), 
                                        this._width * 0.4, (this._width * 0.25) * 0.5);
    }

    update() {
        
    }

    draw() {
        // Rectangle
        push();
        fill(this._color);
        strokeWeight(4);
        stroke(this._borderColor);

        rect(this._x, this._y, this._width, this._height, 15);
        pop();

        //Text
        push();
        textAlign(RIGHT, TOP);
        //textFont(primary_font);
        fill(colors.TEXT_COLOR);
        textSize(52);
        text("Dog0", this._x + (this._width * 0.8), this._y + (this._height * 0.05));

        textAlign(LEFT, TOP);
        textSize(18);
        text("Food Type: ", this._x + (this._width * 0.3), this._y + (this._height * 0.2));
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

    for (let i = 0; i < numContainers; ++i) {
        containers.push(new Container(i, i * (width * 0.25) + 35, height * 0.15, width * 0.23, height * 0.7, colors.SECONDARY_RED, colors.PRIMARY_RED));
    }

    frameRate(120);
    textFont('Consolas');
}

function draw() {
    background(50, 50, 68);

    containers.forEach(container => {
        container.update();
    });

    guiManager.update();

    containers.forEach(container => {
        container.draw();
    });

    guiManager.draw();
}

function feed() {
    fetch('/feed/');
}

function setContainerPosition(slider) {
    index = slider.index;
    position = slider.position;
    
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
