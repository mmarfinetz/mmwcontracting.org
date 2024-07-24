document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('powerwashingQuoteForm');
    const quoteResult = document.getElementById('quoteResult');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const squareFootage = parseFloat(document.getElementById('squareFootage').value);
        const surfaceType = document.getElementById('surfaceType').value;
        const dirtLevel = document.getElementById('dirtLevel').value;

        const quote = calculateQuote(squareFootage, surfaceType, dirtLevel);
        displayQuote(quote);
    });

    function calculateQuote(squareFootage, surfaceType, dirtLevel) {
        let baseRate = 0.10; // $0.10 per square foot base rate

        // Adjust rate based on surface type
        switch (surfaceType) {
            case 'concrete':
                baseRate *= 1.0;
                break;
            case 'wood':
                baseRate *= 1.2;
                break;
            case 'brick':
                baseRate *= 1.3;
                break;
            case 'vinyl':
                baseRate *= 1.1;
                break;
        }

        // Adjust rate based on dirt level
        switch (dirtLevel) {
            case 'light':
                baseRate *= 1.0;
                break;
            case 'medium':
                baseRate *= 1.2;
                break;
            case 'heavy':
                baseRate *= 1.5;
                break;
        }

        let totalCost = squareFootage * baseRate;

        // Add a minimum charge
        const minimumCharge = 100;
        totalCost = Math.max(totalCost, minimumCharge);

        // Round to two decimal places
        return Math.round(totalCost * 100) / 100;
    }

    function displayQuote(quote) {
        quoteResult.innerHTML = `Estimated Quote: $${quote}`;
    }
});