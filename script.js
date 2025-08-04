let controllers = {};
let rafId = null;

function connectHandler(e) {
    const gamepad = e.gamepad;
    controllers[gamepad.index] = gamepad;
    
    updateConnectionStatus();
    updateControllerDisplay();
    
    if (!rafId) {
        rafId = requestAnimationFrame(updateLoop);
    }
}

function disconnectHandler(e) {
    delete controllers[e.gamepad.index];
    
    updateConnectionStatus();
    updateControllerDisplay();
    
    if (Object.keys(controllers).length === 0 && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
}

function updateConnectionStatus() {
    const statusEl = document.getElementById('connection-status');
    const countEl = document.getElementById('controller-count');
    const count = Object.keys(controllers).length;
    
    if (count > 0) {
        statusEl.textContent = 'コントローラーが接続されています';
        statusEl.className = 'status-message connected';
        countEl.textContent = `接続数: ${count}`;
    } else {
        statusEl.textContent = 'コントローラーが接続されていません';
        statusEl.className = 'status-message';
        countEl.textContent = '';
    }
}

function updateControllerDisplay() {
    const container = document.getElementById('controllers-container');
    container.innerHTML = '';
    
    Object.values(controllers).forEach(controller => {
        const controllerDiv = createControllerElement(controller);
        container.appendChild(controllerDiv);
    });
}

function createControllerElement(controller) {
    const div = document.createElement('div');
    div.className = 'controller';
    div.id = `controller-${controller.index}`;
    
    const header = document.createElement('h3');
    header.textContent = `コントローラー ${controller.index + 1}: ${controller.id}`;
    div.appendChild(header);
    
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'buttons-section';
    buttonsDiv.innerHTML = '<h4>ボタン</h4>';
    const buttonsGrid = document.createElement('div');
    buttonsGrid.className = 'buttons-grid';
    buttonsGrid.id = `buttons-${controller.index}`;
    buttonsDiv.appendChild(buttonsGrid);
    div.appendChild(buttonsDiv);
    
    const axesDiv = document.createElement('div');
    axesDiv.className = 'axes-section';
    axesDiv.innerHTML = '<h4>アナログスティック</h4>';
    const axesContainer = document.createElement('div');
    axesContainer.className = 'axes-container';
    axesContainer.id = `axes-${controller.index}`;
    axesDiv.appendChild(axesContainer);
    div.appendChild(axesDiv);
    
    return div;
}

function updateLoop() {
    const gamepads = navigator.getGamepads();
    
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            controllers[i] = gamepads[i];
            updateController(gamepads[i]);
        }
    }
    
    rafId = requestAnimationFrame(updateLoop);
}

function updateController(controller) {
    const buttonsGrid = document.getElementById(`buttons-${controller.index}`);
    if (buttonsGrid) {
        buttonsGrid.innerHTML = '';
        controller.buttons.forEach((button, index) => {
            const buttonEl = document.createElement('div');
            buttonEl.className = `button ${button.pressed ? 'pressed' : ''}`;
            buttonEl.textContent = `B${index}`;
            if (button.value > 0 && button.value < 1) {
                buttonEl.style.opacity = button.value;
            }
            buttonsGrid.appendChild(buttonEl);
        });
    }
    
    const axesContainer = document.getElementById(`axes-${controller.index}`);
    if (axesContainer) {
        axesContainer.innerHTML = '';
        
        for (let i = 0; i < controller.axes.length; i += 2) {
            const stickDiv = document.createElement('div');
            stickDiv.className = 'stick-container';
            
            const label = document.createElement('div');
            label.className = 'stick-label';
            label.textContent = i === 0 ? '左スティック' : '右スティック';
            stickDiv.appendChild(label);
            
            const visualizer = document.createElement('div');
            visualizer.className = 'stick-visualizer';
            
            const dot = document.createElement('div');
            dot.className = 'stick-dot';
            
            const x = controller.axes[i] || 0;
            const y = controller.axes[i + 1] || 0;
            
            dot.style.left = `${50 + x * 40}%`;
            dot.style.top = `${50 + y * 40}%`;
            
            visualizer.appendChild(dot);
            stickDiv.appendChild(visualizer);
            
            const values = document.createElement('div');
            values.className = 'stick-values';
            values.textContent = `X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}`;
            stickDiv.appendChild(values);
            
            axesContainer.appendChild(stickDiv);
        }
    }
}

function scanForControllers() {
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            controllers[i] = gamepads[i];
        }
    }
    updateConnectionStatus();
    updateControllerDisplay();
    
    if (Object.keys(controllers).length > 0 && !rafId) {
        rafId = requestAnimationFrame(updateLoop);
    }
}

window.addEventListener('gamepadconnected', connectHandler);
window.addEventListener('gamepaddisconnected', disconnectHandler);

setInterval(scanForControllers, 1000);

scanForControllers();