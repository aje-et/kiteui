// Base URL for API calls
const BASE_URL = 'https://kite-gw6e.onrender.com';
// const BASE_URL = 'http://127.0.0.1:5001/';

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Store trade configurations globally
    window.tradeConfigurations = [];
    
    // Set up event listeners for all buttons
    setupEventListeners();
    
    // Set up request token auto-fill from URL
    setupRequestTokenAutoFill();
});

// Function to set up all event listeners
function setupEventListeners() {
    // Check Status Button
    document.getElementById('statusBtn').addEventListener('click', handleStatusCheck);
    
    // Generate URL Button
    document.getElementById('urlBtn').addEventListener('click', handleUrlGeneration);
    
    // Generate Token Button
    document.getElementById('tokenBtn').addEventListener('click', handleTokenGeneration);
    
    // Dashboard Button
    document.getElementById('dashboardBtn').addEventListener('click', handleDashboardRequest);
    
    // Trade Config Button
    document.getElementById('tcBtn').addEventListener('click', handleTradeConfigRequest);
    
    // Update Configuration Button
    document.getElementById('updateConfigBtn').addEventListener('click', handleUpdateConfig);
}

// Function to extract URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Set up request token auto-fill from URL
function setupRequestTokenAutoFill() {
    const requestTokenInput = document.getElementById('requestToken');
    requestTokenInput.addEventListener('click', () => {
        if (!requestTokenInput.value) {
            const tokenFromUrl = getUrlParameter('request_token');
            if (tokenFromUrl) {
                requestTokenInput.value = tokenFromUrl;
            }
        }
    });
}

// Helper function to show loading state
function showLoading(loaderId, resultId) {
    document.getElementById(loaderId).style.display = 'block';
    document.getElementById(resultId).style.display = 'none';
}

// Helper function to show result
function showResult(loaderId, resultId, data, isError = false) {
    document.getElementById(loaderId).style.display = 'none';
    const resultElement = document.getElementById(resultId);
    resultElement.style.display = 'block';
    
    // Create a copy of the data to display, removing the URL if present
    const displayData = {...data};
    if (displayData.url) {
        displayData.url = '[URL hidden - use button to access]';
    }
    
    resultElement.textContent = JSON.stringify(displayData, null, 2);
    
    if (isError) {
        resultElement.classList.add('error');
        resultElement.classList.remove('success');
    } else {
        resultElement.classList.add('success');
        resultElement.classList.remove('error');
    }
}

// Handle status check
async function handleStatusCheck() {
    showLoading('statusLoader', 'statusResult');
    
    try {
        const response = await fetch(BASE_URL + '/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        // Check if response status is error and pass the appropriate isError flag
        const isError = data.status === 'error';
        showResult('statusLoader', 'statusResult', data, isError);
    } catch (error) {
        showResult('statusLoader', 'statusResult', { status: 'error', message: error.message }, true);
    }
}

// Handle URL generation
async function handleUrlGeneration() {
    showLoading('urlLoader', 'urlResult');
    
    const codeInput = document.getElementById('urlCode');
    const code = codeInput.value.trim();
    if (!code) {
        showResult('urlLoader', 'urlResult', { status: 'error', message: 'Access code is required' }, true);
        return;
    }
    
    // Clear the input field after getting its value
    codeInput.value = '';
    
    try {
        const response = await fetch(`${BASE_URL}/api/url?code=${encodeURIComponent(code)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        
        // Check if response status is error and pass the appropriate isError flag
        const isError = data.status === 'error';
        showResult('urlLoader', 'urlResult', data, isError);
        
        // If there's a URL, create a button below the result
        if (data.status === 'success' && data.url) {
            const resultElement = document.getElementById('urlResult');
            
            // Create a button for opening the URL
            const openUrlButton = document.createElement('button');
            openUrlButton.textContent = 'Open Login URL';
            openUrlButton.style.marginTop = '15px';
            openUrlButton.style.backgroundColor = 'var(--success-color)';
            
            // Set the click handler to open the URL in the same tab
            openUrlButton.addEventListener('click', () => {
                window.location.href = data.url;
            });
            
            // Add the button below the result
            resultElement.appendChild(document.createElement('br'));
            resultElement.appendChild(openUrlButton);
        }
    } catch (error) {
        showResult('urlLoader', 'urlResult', { status: 'error', message: error.message }, true);
    }
}

// Handle token generation
async function handleTokenGeneration() {
    showLoading('tokenLoader', 'tokenResult');
    
    const codeInput = document.getElementById('tokenCode');
    const code = codeInput.value.trim();
    const requestTokenInput = document.getElementById('requestToken');
    const requestToken = requestTokenInput.value.trim();
    
    if (!code) {
        showResult('tokenLoader', 'tokenResult', { status: 'error', message: 'Access code is required' }, true);
        return;
    }
    
    if (!requestToken) {
        showResult('tokenLoader', 'tokenResult', { status: 'error', message: 'Request token is required' }, true);
        return;
    }
    
    // Clear the input fields after getting their values
    codeInput.value = '';
    requestTokenInput.value = '';
    
    try {
        const response = await fetch(`${BASE_URL}/api/token?code=${encodeURIComponent(code)}&request_token=${encodeURIComponent(requestToken)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        // Check if response status is error and pass the appropriate isError flag
        const isError = data.status === 'error';
        showResult('tokenLoader', 'tokenResult', data, isError);
    } catch (error) {
        showResult('tokenLoader', 'tokenResult', { status: 'error', message: error.message }, true);
    }
}

// Handle dashboard request
async function handleDashboardRequest() {
    showLoading('dashboardLoader', 'dashboardResult');
    showLoading('dashboardLoader', 'dashboardContent');
    
    const codeInput = document.getElementById('dashboardCode');
    const code = codeInput.value.trim();
    
    if (!code) {
        showResult('dashboardLoader', 'dashboardResult', { status: 'error', message: 'Access code is required' }, true);
        return;
    }
    
    // Clear the input field after getting its value
    codeInput.value = '';
    
    try {
        const response = await fetch(`${BASE_URL}/api/dashboard?code=${encodeURIComponent(code)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // Hide the loader and result div
            document.getElementById('dashboardLoader').style.display = 'none';
            document.getElementById('dashboardResult').style.display = 'none';
            
            // Display the dashboard data
            displayDashboard(data);
            
            // Show dashboard content
            document.getElementById('dashboardContent').style.display = 'block';
            
            // Add success message
            const statusElement = document.createElement('div');
            statusElement.className = 'success-message';
            statusElement.textContent = 'Dashboard data loaded successfully';
            document.getElementById('dashboardContent').prepend(statusElement);
            
            // Make success message disappear after 2 seconds
            setTimeout(() => {
                statusElement.remove();
            }, 2000);
        } else {
            document.getElementById('dashboardLoader').style.display = 'none';
            showResult('dashboardLoader', 'dashboardResult', data, true);
        }
    } catch (error) {
        document.getElementById('dashboardLoader').style.display = 'none';
        showResult('dashboardLoader', 'dashboardResult', { status: 'error', message: error.message }, true);
    }
}

// Function to display dashboard data
function displayDashboard(data) {
    console.log('Dashboard data received:', data);
    
    const ordersContainer = document.getElementById('ordersContainer');
    const positionsContainer = document.getElementById('positionsContainer');
    
    // Clear previous content
    ordersContainer.innerHTML = '';
    positionsContainer.innerHTML = '';
    
    // Display orders (filter out CANCELLED orders)
    if (data.orders) {
        console.log('Orders data:', data.orders);
        
        // Ensure orders is an array
        let ordersArray = Array.isArray(data.orders) ? data.orders : [];
        
        // Filter out orders with status 'CANCELLED'
        const filteredOrders = ordersArray.filter(order => order.status !== 'CANCELLED');
        console.log('Filtered orders:', filteredOrders);
        
        if (filteredOrders.length > 0) {
            filteredOrders.forEach(order => {
                const orderCard = document.createElement('div');
                orderCard.className = `trade-card ${order.transaction_type.toLowerCase()}`;
                
                // Display the order timestamp as is since it's already in IST
                let orderTime = order.order_timestamp || 'N/A';
                
                orderCard.innerHTML = `
                    <h4>${order.tradingsymbol}</h4>
                    <p><strong>${order.transaction_type}</strong> @ ₹${order.price}</p>
                    ${order.tag ? `<p class="tag-highlight">${order.tag}</p>` : ''}
                    <p>Time: ${orderTime || 'N/A'}</p>
                    <span class="status ${order.status.toLowerCase()}">${order.status}</span>
                `;
                
                ordersContainer.appendChild(orderCard);
            });
        } else {
            ordersContainer.innerHTML = '<p>No active orders found</p>';
        }
    } else {
        ordersContainer.innerHTML = '<p>No orders found</p>';
    }
    
    // Display positions - handle nested structure from Kite API
    if (data.positions) {
        console.log('Positions data:', data.positions);
        
        // Check if positions is an object with day, net properties (Kite API structure)
        let positionsArray = [];
        if (data.positions.net && Array.isArray(data.positions.net)) {
            positionsArray = data.positions.net;
            console.log('Using positions.net array');
        } else if (Array.isArray(data.positions)) {
            positionsArray = data.positions;
            console.log('Using positions array directly');
        }
        
        if (positionsArray.length > 0) {
            positionsArray.forEach(position => {
                const positionCard = document.createElement('div');
                positionCard.className = 'trade-card';
                
                // Determine if it's a buy or sell position based on quantity
                if (position.quantity > 0) {
                    positionCard.classList.add('buy');
                } else if (position.quantity < 0) {
                    positionCard.classList.add('sell');
                }
                
                positionCard.innerHTML = `
                    <h4>${position.tradingsymbol}</h4>
                    <p>Avg Price: ₹${position.average_price}</p>
                    <p>Quantity: ${position.quantity}</p>
                    <p>Last Price: ₹${position.last_price}</p>
                    <p>P&L: ₹${position.pnl}</p>
                `;
                
                positionsContainer.appendChild(positionCard);
            });
        } else {
            positionsContainer.innerHTML = '<p>No positions found</p>';
        }
    } else {
        positionsContainer.innerHTML = '<p>No positions found</p>';
    }
}

// Handle trade configuration request
async function handleTradeConfigRequest() {
    showLoading('tcLoader', 'tcResult');
    
    const tcCodeInput = document.getElementById('tcCode');
    const tcCode = tcCodeInput.value.trim();
    const tradeConfigsList = document.getElementById('tradeConfigsList');
    const updateConfigForm = document.getElementById('updateConfigForm');
    
    if (!tcCode) {
        showResult('tcLoader', 'tcResult', { status: 'error', message: 'Access code is required' }, true);
        return;
    }
    
    // Clear the input field after getting its value
    tcCodeInput.value = '';
    
    // Hide related containers
    tradeConfigsList.style.display = 'none';
    updateConfigForm.style.display = 'none';
    
    try {
        const response = await fetch(`${BASE_URL}/api/trade_config?code=${encodeURIComponent(tcCode)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        
        if (data.status === 'success' && data.trade_configurations && data.trade_configurations.length > 0) {
            // Store configurations globally
            window.tradeConfigurations = data.trade_configurations;
            
            // Hide the loader and result div
            document.getElementById('tcLoader').style.display = 'none';
            document.getElementById('tcResult').style.display = 'none';
            
            // Display trade configurations
            displayTradeConfigurations(window.tradeConfigurations);
            
            // Populate the dropdown for updating
            populateConfigDropdown(window.tradeConfigurations);
            
            // Show the trade configs list and update form
            tradeConfigsList.style.display = 'block';
            updateConfigForm.style.display = 'block';
            
            // Add a temporary success message at the top of the trade configs list
            const statusElement = document.createElement('div');
            statusElement.className = 'success-message';
            statusElement.textContent = `Found ${window.tradeConfigurations.length} trade configurations`;
            tradeConfigsList.prepend(statusElement);
            
            // Make success message disappear after 2 seconds
            setTimeout(() => {
                statusElement.remove();
            }, 2000);
        } else {
            showResult('tcLoader', 'tcResult', { 
                status: 'error', 
                message: data.message || 'No trade configurations found' 
            }, true);
        }
    } catch (error) {
        showResult('tcLoader', 'tcResult', { 
            status: 'error', 
            message: error.message 
        }, true);
    }
}

// Handle update configuration
async function handleUpdateConfig() {
    showLoading('updateConfigLoader', 'updateConfigResult');
    
    const configId = document.getElementById('configSelect').value;
    const rp = document.getElementById('updateRP').value.trim();
    const executionSide = document.getElementById('updateExecutionSide').value;
    const fixPoint = document.getElementById('updateFixPoint').value.trim();
    const stepPoint = document.getElementById('updateStepPoint').value.trim();
    const initiateTradeAtZero = document.getElementById('updateInitiateTradeAtZero').value;
    const quantity = document.getElementById('updateQuantity').value.trim();
    const enabled = document.getElementById('updateEnabled').value;
    const tcCodeInput = document.getElementById('tcCode');
    const tcCode = tcCodeInput.value.trim();
    
    if (!configId) {
        showResult('updateConfigLoader', 'updateConfigResult', { status: 'error', message: 'Configuration ID is required' }, true);
        return;
    }
    
    if (!tcCode) {
        showResult('updateConfigLoader', 'updateConfigResult', { status: 'error', message: 'Access code is required' }, true);
        return;
    }
    
    // Clear the input field after getting its value
    tcCodeInput.value = '';
    
    // Prepare the data for update
    const updateData = {
        _id: configId
    };
    
    if (rp) updateData.rp = parseFloat(rp);
    if (executionSide) updateData.execution_side = executionSide;
    if (fixPoint) updateData.fix_point = parseFloat(fixPoint);
    if (stepPoint) updateData.step_point = parseFloat(stepPoint);
    if (initiateTradeAtZero) updateData.initiate_trade_at_zero = initiateTradeAtZero === 'true';
    if (quantity) updateData.quantity = parseInt(quantity, 10);
    if (enabled) updateData.enabled = enabled === 'true';
    
    try {
        const response = await fetch(`${BASE_URL}/api/trade_config?code=${encodeURIComponent(tcCode)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // Hide the loader and result div
            document.getElementById('updateConfigLoader').style.display = 'none';
            document.getElementById('updateConfigResult').style.display = 'none';
            
            // Update the local configuration and refresh the display
            if (data.trade_configuration) {
                // Find and update the configuration in the global array
                const index = window.tradeConfigurations.findIndex(c => c._id === configId);
                if (index !== -1) {
                    window.tradeConfigurations[index] = data.trade_configuration;
                    
                    // Refresh the display
                    displayTradeConfigurations(window.tradeConfigurations);
                    
                    // Get the configs container
                    const configCards = document.getElementById('configCards');
                    
                    // Add a temporary success message at the top of the config cards
                    const statusElement = document.createElement('div');
                    statusElement.className = 'success-message';
                    statusElement.textContent = data.message || 'Configuration updated successfully';
                    configCards.prepend(statusElement);
                    
                    // Make success message disappear after 2 seconds
                    setTimeout(() => {
                        statusElement.remove();
                    }, 2000);
                }
            }
        } else {
            showResult('updateConfigLoader', 'updateConfigResult', {
                status: 'error',
                message: data.message
            }, true);
        }
    } catch (error) {
        showResult('updateConfigLoader', 'updateConfigResult', {
            status: 'error',
            message: error.message
        }, true);
    }
}

// Function to display trade configurations as cards
function displayTradeConfigurations(configs) {
    const configCards = document.getElementById('configCards');
    configCards.innerHTML = '';
    
    configs.forEach(config => {
        const card = document.createElement('div');
        card.className = 'trade-card';
        
        // Format the card content
        let cardContent = `
            <p><span class="tag-highlight">${config.tradingsymbol} : ${config.exchange || 'N/A'}</span></p>
            <p>Lot Size: ${config.lot_size || 'N/A'}</p>
            <p>Quantity: ${config.quantity || 'N/A'}</p>
            <p>RP: <strong>${config.rp}</strong></p>
            <p>Execution Side: ${config.execution_side || 'N/A'}</p>
            <p>Fix Point: ${config.fix_point || 'N/A'}</p>
            <p>Step Point: ${config.step_point || 'N/A'}</p>
            <p>Strategy: ${config.strategy || 'N/A'}</p>
            <p>Initiate Trade At Zero: ${config.initiate_trade_at_zero ? 'Yes' : 'No'}</p>
            <p><span class="status ${config.enabled ? 'open' : 'cancelled'}">${config.enabled ? 'Enabled' : 'Disabled'}</span></p>
        `;
        
        card.innerHTML = cardContent;
        configCards.appendChild(card);
    });
}

// Function to populate the configuration dropdown
function populateConfigDropdown(configs) {
    const configSelect = document.getElementById('configSelect');
    configSelect.innerHTML = '';
    
    configs.forEach(config => {
        const option = document.createElement('option');
        option.value = config._id;
        
        // Use tradingsymbol for display
        option.textContent = `${config.tradingsymbol} (${config.strategy})`;
        configSelect.appendChild(option);
    });
    
    // Set initial values for the selected configuration
    if (configs.length > 0) {
        updateFormForSelectedConfig(configs[0]._id);
    }
    
    // Add change event listener
    configSelect.addEventListener('change', function() {
        updateFormForSelectedConfig(this.value);
    });
}

// Function to update form fields based on selected configuration
function updateFormForSelectedConfig(configId) {
    const config = window.tradeConfigurations.find(c => c._id === configId);
    if (config) {
        document.getElementById('updateRP').value = config.rp || '';
        document.getElementById('updateExecutionSide').value = config.execution_side || 'buy_sell_both';
        document.getElementById('updateFixPoint').value = config.fix_point || '';
        document.getElementById('updateStepPoint').value = config.step_point || '';
        document.getElementById('updateInitiateTradeAtZero').value = config.initiate_trade_at_zero ? 'true' : 'false';
        document.getElementById('updateQuantity').value = config.quantity || '';
        document.getElementById('updateEnabled').value = config.enabled ? 'true' : 'false';
    }
}

// End of file
