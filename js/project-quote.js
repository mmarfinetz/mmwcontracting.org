document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('projectQuoteForm');
    const quoteResult = document.getElementById('quoteResult');
    const projectType = document.getElementById('projectType');
    const remodelingSection = document.getElementById('renodelingSectionsize');
    const sewerSection = document.getElementById('sewerSection');
    const drainSection = document.getElementById('drainSection');

    projectType.addEventListener('change', function() {
        remodelingSection.classList.add('hidden');
        sewerSection.classList.add('hidden');
        drainSection.classList.add('hidden');

        switch (this.value) {
            case 'remodeling':
            case 'renovation':
                remodelingSection.classList.remove('hidden');
                break;
            case 'sewer':
                sewerSection.classList.remove('hidden');
                break;
            case 'drains':
                drainSection.classList.remove('hidden');
                break;
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const projectType = document.getElementById('projectType').value;
        const projectDescription = document.getElementById('projectDescription').value;
        let quote = 0;

        switch (projectType) {
            case 'remodeling':
            case 'renovation':
                const roomSize = parseFloat(document.getElementById('roomSize').value);
                quote = calculateRemodelingQuote(roomSize);
                break;
            case 'sewer':
                const sewerLength = parseFloat(document.getElementById('sewerLength').value);
                quote = calculateSewerQuote(sewerLength);
                break;
            case 'drains':
                const drainType = document.getElementById('drainType').value;
                const drainLength = parseFloat(document.getElementById('drainLength').value);
                quote = calculateDrainQuote(drainType, drainLength);
                break;
        }

        displayQuote(quote, projectType, projectDescription);
    });

    function calculateRemodelingQuote(roomSize) {
        const baseRate = 50; // $50 per square foot
        return Math.max(roomSize * baseRate, 1000); // Minimum $1000 charge
    }

    function calculateSewerQuote(length) {
        const baseRate = 100; // $100 per foot
        return Math.max(length * baseRate, 500); // Minimum $500 charge
    }

    function calculateDrainQuote(type, length) {
        let baseRate = type === 'french' ? 80 : 60; // $80 per foot for French drain, $60 for yard drain
        return Math.max(length * baseRate, 800); // Minimum $800 charge
    }

    function displayQuote(quote, projectType, description) {
        quoteResult.innerHTML = `
            <h3>Project Quote Estimate</h3>
            <p><strong>Project Type:</strong> ${projectType}</p>
            <p><strong>Description:</strong> ${description}</p>
            <p><strong>Estimated Quote:</strong> $${quote.toFixed(2)}</p>
            <p>Please note that this is a rough estimate. For a more accurate quote, please contact us directly.</p>
        `;
    }
});