let controllers = {};
let rafId = null;
let buttonStates = {};
let stickTrails = {};

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
            
            // ボタン押下時のパーティクルエフェクト
            const stateKey = `${controller.index}-${index}`;
            if (!buttonStates[stateKey] && button.pressed) {
                const rect = buttonEl.getBoundingClientRect();
                if (window.particleSystem) {
                    window.particleSystem.createBurst(
                        rect.left + rect.width / 2,
                        rect.top + rect.height / 2
                    );
                }
            }
            buttonStates[stateKey] = button.pressed;
            
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
            
            // スティック軌跡の記録
            const trailKey = `${controller.index}-${i}`;
            if (!stickTrails[trailKey]) {
                stickTrails[trailKey] = [];
            }
            
            if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
                const rect = visualizer.getBoundingClientRect();
                const trailX = rect.left + rect.width / 2 + x * rect.width * 0.4;
                const trailY = rect.top + rect.height / 2 + y * rect.height * 0.4;
                
                if (window.particleSystem) {
                    window.particleSystem.createTrail(trailX, trailY, i === 0 ? '#00ff88' : '#ff00ff');
                }
            }
            
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

// 振動機能の実装
function vibrate(pattern, intensity = 0.5) {
    Object.values(controllers).forEach(controller => {
        if (controller.vibrationActuator) {
            switch (pattern) {
                case 'short':
                    controller.vibrationActuator.playEffect('dual-rumble', {
                        duration: 100,
                        weakMagnitude: intensity,
                        strongMagnitude: intensity
                    });
                    break;
                case 'long':
                    controller.vibrationActuator.playEffect('dual-rumble', {
                        duration: 500,
                        weakMagnitude: intensity,
                        strongMagnitude: intensity
                    });
                    break;
                case 'pulse':
                    let pulseCount = 0;
                    const pulseInterval = setInterval(() => {
                        controller.vibrationActuator.playEffect('dual-rumble', {
                            duration: 50,
                            weakMagnitude: intensity,
                            strongMagnitude: intensity
                        });
                        pulseCount++;
                        if (pulseCount >= 5) clearInterval(pulseInterval);
                    }, 100);
                    break;
                case 'wave':
                    let waveIntensity = 0;
                    const waveInterval = setInterval(() => {
                        waveIntensity += 0.1;
                        if (waveIntensity > 1) waveIntensity = 0;
                        controller.vibrationActuator.playEffect('dual-rumble', {
                            duration: 50,
                            weakMagnitude: waveIntensity * intensity,
                            strongMagnitude: waveIntensity * intensity
                        });
                    }, 50);
                    setTimeout(() => clearInterval(waveInterval), 2000);
                    break;
            }
        }
    });
}

function vibrateCustom(duration, intensity) {
    Object.values(controllers).forEach(controller => {
        if (controller.vibrationActuator) {
            controller.vibrationActuator.playEffect('dual-rumble', {
                duration: duration,
                weakMagnitude: intensity,
                strongMagnitude: intensity
            });
        }
    });
}

// 振動コントロールのイベントリスナー
document.querySelectorAll('.vibration-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const pattern = btn.dataset.pattern;
        vibrate(pattern);
    });
});

document.getElementById('vibration-intensity').addEventListener('input', (e) => {
    document.getElementById('intensity-value').textContent = e.target.value;
});

document.getElementById('vibration-duration').addEventListener('input', (e) => {
    document.getElementById('duration-value').textContent = e.target.value;
});

document.getElementById('custom-vibrate').addEventListener('click', () => {
    const intensity = document.getElementById('vibration-intensity').value / 100;
    const duration = parseInt(document.getElementById('vibration-duration').value);
    vibrateCustom(duration, intensity);
});