document.addEventListener('DOMContentLoaded', () => {
    const startQuoteBtn = document.getElementById('start-quote');
    const quoteForm = document.getElementById('quote-form');
    const materialSelect = document.getElementById('material');
    const areaSelect = document.getElementById('area');
    const conditionCheck = document.getElementById('needs-scrubbing');
    const sizeInput = document.getElementById('size');
    const calculateBtn = document.getElementById('calculate-quote');
    const result = document.getElementById('result');

    startQuoteBtn.addEventListener('click', () => {
        startQuoteBtn.style.display = 'none';
        quoteForm.style.display = 'block';
    });

    materialSelect.addEventListener('change', () => {
        document.getElementById('area-selection').style.display = 'block';
    });

    areaSelect.addEventListener('change', () => {
        document.getElementById('condition-selection').style.display = 'block';
    });

    conditionCheck.addEventListener('change', () => {
        document.getElementById('size-input').style.display = 'block';
        calculateBtn.style.display = 'block';
    });

    calculateBtn.addEventListener('click', calculateQuote);

    function calculateQuote() {
        const material = materialSelect.value;
        const area = areaSelect.value;
        const needsScrubbing = conditionCheck.checked;
        const size = parseFloat(sizeInput.value);

        let baseRate = 0;
        switch(material) {
            case 'vinyl':
            case 'wood':
                baseRate = 0.30;
                break;
            case 'brick':
            case 'concrete':
                baseRate = 0.35;
                break;
            case 'gutter':
                baseRate = 1.00;
                break;
        }

        let totalCost = baseRate * size;

        if (needsScrubbing) {
            totalCost *= 1.5; // 50% increase for scrubbing
        }

        if (area === 'deck') {
            totalCost *= 1.2; // 20% increase for decks due to complexity
        }

        result.textContent = `Estimated Quote: $${totalCost.toFixed(2)}`;
    }
});