// Trade Configuration Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Store trade configurations globally
    window.tradeConfigurations = [];
    
    // Get Trade Configurations functionality
    document.getElementById('tcBtn').addEventListener('click', function() {
        const tcCodeInput = document.getElementById('tcCode');
        const tcCode = tcCodeInput.value;
        const tcLoader = document.getElementById('tcLoader');
        const tcResult = document.getElementById('tcResult');
        const tradeConfigsList = document.getElementById('tradeConfigsList');
        const updateConfigForm = document.getElementById('updateConfigForm');
        
        if (!tcCode) {
            alert('Please enter an access code');
            return;
        }
        
        // Clear the input field after getting its value
        tcCodeInput.value = '';
        
        tcLoader.style.display = 'block';
        tcResult.style.display = 'none';
        tradeConfigsList.style.display = 'none';
        updateConfigForm.style.display = 'none';
        
        fetch(`${BASE_URL}/api/trade_config?code=${tcCode}`)
            .then(response => response.json())
            .then(data => {
                tcLoader.style.display = 'none';
                tcResult.style.display = 'block';
                
                if (data.status === 'success' && data.trade_configurations && data.trade_configurations.length > 0) {
                    // Store configurations globally
                    window.tradeConfigurations = data.trade_configurations;
                    
                    // Display success message
                    tcResult.innerHTML = `<div class="success-message">Found ${window.tradeConfigurations.length} trade configurations</div>`;
                    
                    // Display trade configurations
                    displayTradeConfigurations(window.tradeConfigurations);
                    
                    // Populate the dropdown for updating
                    populateConfigDropdown(window.tradeConfigurations);
                    
                    // Show the trade configs list and update form
                    tradeConfigsList.style.display = 'block';
                    updateConfigForm.style.display = 'block';
                } else {
                    tcResult.innerHTML = `<div class="error-message">${data.message || 'No trade configurations found'}</div>`;
                }
            })
            .catch(error => {
                tcLoader.style.display = 'none';
                tcResult.style.display = 'block';
                tcResult.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
            });
    });
    
    // Update Configuration functionality
    document.getElementById('updateConfigBtn').addEventListener('click', function() {
        const configId = document.getElementById('configSelect').value;
        const rp = document.getElementById('updateRP').value;
        const quantity = document.getElementById('updateQuantity').value;
        const fixPoint = document.getElementById('updateFixPoint').value;
        const enabled = document.getElementById('updateEnabled').value;
        const updateConfigLoader = document.getElementById('updateConfigLoader');
        const updateConfigResult = document.getElementById('updateConfigResult');
        const tcCodeInput = document.getElementById('tcCode');
        const tcCode = tcCodeInput.value;
        
        if (!configId) {
            alert('Please select a configuration to update');
            return;
        }
        
        if (!tcCode) {
            alert('Please enter an access code');
            return;
        }
        
        // Clear the input field after getting its value
        tcCodeInput.value = '';
        
        updateConfigLoader.style.display = 'block';
        updateConfigResult.style.display = 'none';
        
        // Prepare the data for update
        const updateData = {
            _id: configId
        };
        
        if (rp) updateData.rp = parseFloat(rp);
        if (quantity) updateData.quantity = parseInt(quantity, 10);
        if (fixPoint) updateData.fix_point = fixPoint;
        if (enabled) updateData.enabled = enabled === 'true';
        
        // Make the API call to update the configuration
        fetch(`${BASE_URL}/api/trade_config?code=${tcCode}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        })
        .then(response => response.json())
        .then(data => {
            updateConfigLoader.style.display = 'none';
            updateConfigResult.style.display = 'block';
            
            if (data.status === 'success') {
                updateConfigResult.innerHTML = `<div class="success-message">${data.message}</div>`;
                
                // Update the local configuration and refresh the display
                if (data.trade_configuration) {
                    // Find and update the configuration in the global array
                    const index = window.tradeConfigurations.findIndex(c => c._id === configId);
                    if (index !== -1) {
                        window.tradeConfigurations[index] = data.trade_configuration;
                        
                        // Refresh the display
                        displayTradeConfigurations(window.tradeConfigurations);
                    }
                }
            } else {
                updateConfigResult.innerHTML = `<div class="error-message">${data.message}</div>`;
            }
        })
        .catch(error => {
            updateConfigLoader.style.display = 'none';
            updateConfigResult.style.display = 'block';
            updateConfigResult.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
        });
    });
});

// Function to display trade configurations as cards
function displayTradeConfigurations(configs) {
    const configCards = document.getElementById('configCards');
    configCards.innerHTML = '';
    
    configs.forEach(config => {
        const card = document.createElement('div');
        card.className = 'trade-card';
        
        // Format the card content
        let cardContent = `
            <h4>${config.tradingsymbol}</h4>
            <p>ID: <span class="tag-highlight">${config._id}</span></p>
            <p>RP: <strong>${config.rp}</strong></p>
            <p>Exchange: ${config.exchange || 'N/A'}</p>
            <p>Lot Size: ${config.lot_size || 'N/A'}</p>
            <p>Fix Point: ${config.fix_point || 'N/A'}</p>
            <p>Quantity: ${config.quantity || 'N/A'}</p>
            <p>Status: <span class="status ${config.enabled ? 'open' : 'cancelled'}">${config.enabled ? 'Enabled' : 'Disabled'}</span></p>
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
        
        // Get the last 4 digits of the ID
        const idString = config._id.toString();
        const last4Digits = idString.length > 4 ? idString.slice(-4) : idString;
        
        // Use tradingsymbol for display
        option.textContent = `${config.tradingsymbol} (${last4Digits})`;
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
        document.getElementById('updateQuantity').value = config.quantity || '';
        document.getElementById('updateFixPoint').value = config.fix_point || '';
        document.getElementById('updateEnabled').value = config.enabled ? 'true' : 'false';
    }
}
