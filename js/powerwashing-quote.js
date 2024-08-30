document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded. Initializing quote generator.');

    const form = document.getElementById('powerwashingQuoteForm');
    const quoteResult = document.getElementById('quoteResult');
    const openFormButton = document.getElementById('open-form');

    if (!form || !quoteResult || !openFormButton) {
        console.error('One or more required elements not found. Please check the HTML.');
        return;
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted. Calculating quote.');

        try {
            const squareFootage = parseFloat(document.getElementById('squareFootage').value);
            const surfaceType = document.getElementById('surfaceType').value;
            const dirtLevel = document.getElementById('dirtLevel').value;

            if (isNaN(squareFootage) || squareFootage <= 0) {
                throw new Error('Invalid square footage');
            }

            const quote = calculateQuote(squareFootage, surfaceType, dirtLevel);
            displayQuote(quote);
            
            // Show the "Proceed with Quote" button
            openFormButton.style.display = 'block';
            console.log('Quote calculated and displayed. "Proceed with Quote" button shown.');
        } catch (error) {
            console.error('Error in quote calculation:', error);
            quoteResult.innerHTML = 'An error occurred while calculating the quote. Please try again.';
        }
    });

    openFormButton.addEventListener('click', function() {
        console.log('Opening Google Form.');
        window.open('https://docs.google.com/forms/d/e/1FAIpQLSehqD8aocZMKJeyBHpI7CK4lf4PXTRceu8arXhf3qZn34LrOA/viewform', '_blank');
    });

    function calculateQuote(squareFootage, surfaceType, dirtLevel) {
        console.log('Calculating quote for:', { squareFootage, surfaceType, dirtLevel });
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

    console.log('Quote generator initialization complete.');
});